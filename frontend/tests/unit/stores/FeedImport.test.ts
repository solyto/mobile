import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeedImport } from '$lib/state/FeedImport.svelte';
import { RateLimitedError, NetworkError } from '$lib/services/ApiService';
import type ApiService from '$lib/services/ApiService';
import type { Auth } from '$lib/state/Auth.svelte';
import type { Feeds } from '$lib/state/Feeds.svelte';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import type { Translation } from '$lib/state/Translation.svelte';
import type { FeedImportState } from '$lib/types/feed';
import { apiRoutes } from '$lib/config/apiRoutes';
import { api, auth, resetStoreMocks } from '../setup/storeMocks';
import { feedImportEntry, feedImportState } from '../helpers/factories';

let feeds: { load: ReturnType<typeof vi.fn> };
let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

const ts = {
	get: {
		feeds: {
			import_finished_singular: '1 added',
			import_finished_plural: '{n} added',
			import_error_generic: 'generic error'
		}
	}
};

function store(): FeedImport {
	return new FeedImport(
		auth as unknown as Auth,
		api as unknown as ApiService,
		feeds as unknown as Feeds,
		notifications as unknown as UiNotifications,
		ts as unknown as Translation
	);
}

beforeEach(() => {
	resetStoreMocks();
	feeds = { load: vi.fn().mockResolvedValue(undefined) };
	notifications = { success: vi.fn(), error: vi.fn() };
});

afterEach(() => {
	vi.useRealTimers();
});

describe('FeedImport store', () => {
	describe('upload', () => {
		it('sends the file as FormData through postWithStatus to importStart', async () => {
			const state = feedImportState();
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: state } });
			const file = new File(['<opml/>'], 'feeds.opml', { type: 'text/x-opml' });
			const s = store();

			const res = await s.upload(file);

			expect(api.postWithStatus).toHaveBeenCalledTimes(1);
			const [endpoint, body] = api.postWithStatus.mock.calls[0];
			expect(endpoint).toBe(apiRoutes.feeds.importStart);
			expect(body).toBeInstanceOf(FormData);
			expect((body as FormData).get('file')).toBeInstanceOf(File);
			expect(((body as FormData).get('file') as File).name).toBe('feeds.opml');
			expect(res).toEqual({ ok: true, status: 200 });
			expect(s.state).toEqual(state);
		});

		it.each([422, 409])('passes a %d to the caller and keeps the state', async (status) => {
			api.postWithStatus.mockResolvedValue({ ok: false, status, data: null });
			const s = store();

			const res = await s.upload(new File([''], 'feeds.opml'));

			expect(res).toEqual({ ok: false, status });
			expect(s.state).toBeNull();
		});

		it('turns a thrown RateLimitedError into a 429', async () => {
			api.postWithStatus.mockRejectedValue(new RateLimitedError(3600, null));

			const res = await store().upload(new File([''], 'feeds.opml'));

			expect(res).toEqual({ ok: false, status: 429 });
		});

		it('rethrows any other error', async () => {
			api.postWithStatus.mockRejectedValue(new NetworkError(new TypeError('offline')));

			await expect(store().upload(new File([''], 'feeds.opml'))).rejects.toBeInstanceOf(NetworkError);
		});
	});

	describe('select', () => {
		it('posts the urls to importSelect and stores the new state', async () => {
			const state = feedImportState({ stage: 'running', feeds: [feedImportEntry({ url: 'https://example.com/feed.xml', status: 'pending' })] });
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: state } });
			const s = store();

			const res = await s.select(['https://example.com/feed.xml']);

			expect(api.postWithStatus).toHaveBeenCalledWith(apiRoutes.feeds.importSelect, { urls: ['https://example.com/feed.xml'] });
			expect(res).toEqual({ ok: true, status: 200 });
			expect(s.state).toEqual(state);
		});

		it('passes a failed status to the caller', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 409, data: null });

			expect(await store().select(['https://example.com/feed.xml'])).toEqual({ ok: false, status: 409 });
		});

		it('turns a thrown RateLimitedError into a 429', async () => {
			api.postWithStatus.mockRejectedValue(new RateLimitedError(60, null));

			expect(await store().select(['https://example.com/feed.xml'])).toEqual({ ok: false, status: 429 });
		});
	});

	describe('refresh', () => {
		it('reloads the feeds once when the stage goes from running to finished', async () => {
			const s = store();
			api.get.mockResolvedValueOnce({ data: feedImportState({ stage: 'running' }) });
			api.get.mockResolvedValueOnce({ data: feedImportState({ stage: 'finished' }) });
			api.get.mockResolvedValueOnce({ data: feedImportState({ stage: 'finished' }) });

			await s.refresh();
			await s.refresh();
			await s.refresh();

			expect(api.get).toHaveBeenCalledWith(apiRoutes.feeds.importState, null);
			expect(feeds.load).toHaveBeenCalledTimes(1);
		});

		it('does not reload the feeds when the import is finished from the start', async () => {
			const s = store();
			api.get.mockResolvedValue({ data: feedImportState({ stage: 'finished' }) });

			expect(await s.refresh()).toBe(true);
			expect(s.state?.stage).toBe('finished');
			expect(feeds.load).not.toHaveBeenCalled();
		});

		it('reports a missing state and keeps the previous one', async () => {
			const s = store();
			api.get.mockResolvedValueOnce({ data: feedImportState({ stage: 'running' }) });
			await s.refresh();

			api.get.mockResolvedValueOnce(null);

			expect(await s.refresh()).toBe(false);
			expect(s.state?.stage).toBe('running');
		});
	});

	describe('polling', () => {
		function running(processed: number): { data: FeedImportState } {
			return { data: feedImportState({ stage: 'running', total: 10, processed }) };
		}

		async function startedStore(): Promise<FeedImport> {
			const s = store();
			api.get.mockResolvedValueOnce(running(0));
			await s.refresh();
			api.get.mockClear();
			return s;
		}

		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('runs a single poller however often it is started', async () => {
			const s = await startedStore();
			api.get.mockResolvedValue(running(1));

			s.startPolling();
			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);
			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);

			expect(api.get).toHaveBeenCalledTimes(2);
			expect(s.polling).toBe(true);
		});

		it('stops once the import finishes and announces the added feeds while the modal is closed', async () => {
			const s = await startedStore();
			api.get.mockResolvedValueOnce(running(1));
			api.get.mockResolvedValueOnce({
				data: feedImportState({ stage: 'finished', total: 3, processed: 3, feeds: [feedImportEntry({ status: 'subscribed' }), feedImportEntry({ status: 'subscribed' }), feedImportEntry({ status: 'limit_reached' })] })
			});

			s.startPolling();
			await vi.advanceTimersByTimeAsync(2000);
			await vi.advanceTimersByTimeAsync(10000);

			expect(api.get).toHaveBeenCalledTimes(2);
			expect(s.polling).toBe(false);
			expect(feeds.load).toHaveBeenCalledTimes(1);
			expect(notifications.success).toHaveBeenCalledWith('2 added');
		});

		it('does not announce the finish while the modal is open', async () => {
			const s = await startedStore();
			s.modalOpen = true;
			api.get.mockResolvedValueOnce({ data: feedImportState({ stage: 'finished' }) });

			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);

			expect(s.polling).toBe(false);
			expect(notifications.success).not.toHaveBeenCalled();
		});

		it('stops for good when destroyed, even with a request in flight', async () => {
			const s = await startedStore();
			let resolve: (value: { data: FeedImportState }) => void = () => {};
			api.get.mockImplementationOnce(() => new Promise((r) => (resolve = r)));

			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);
			s.destroy();
			resolve(running(1));
			await vi.advanceTimersByTimeAsync(10000);
			s.startPolling();
			await vi.advanceTimersByTimeAsync(10000);

			expect(api.get).toHaveBeenCalledTimes(1);
			expect(s.polling).toBe(false);
		});

		it('backs off on network errors, reports them, and clears the error once a poll succeeds', async () => {
			const s = await startedStore();
			api.get.mockRejectedValueOnce(new NetworkError(new TypeError('offline')));
			api.get.mockRejectedValueOnce(new NetworkError(new TypeError('offline')));
			api.get.mockResolvedValue(running(2));

			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);
			expect(s.pollError).toBe('network');

			await vi.advanceTimersByTimeAsync(1999);
			expect(api.get).toHaveBeenCalledTimes(1);
			await vi.advanceTimersByTimeAsync(1);
			expect(api.get).toHaveBeenCalledTimes(2);

			await vi.advanceTimersByTimeAsync(4000);
			expect(api.get).toHaveBeenCalledTimes(3);
			expect(s.pollError).toBeNull();
			expect(s.polling).toBe(true);
		});

		it('backs off on error responses like on network errors, and clears the error once a poll succeeds', async () => {
			const s = await startedStore();
			api.get.mockResolvedValueOnce(null);
			api.get.mockResolvedValueOnce(null);
			api.get.mockResolvedValue(running(2));

			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);
			expect(s.pollError).toBe('network');

			await vi.advanceTimersByTimeAsync(1999);
			expect(api.get).toHaveBeenCalledTimes(1);
			await vi.advanceTimersByTimeAsync(1);
			expect(api.get).toHaveBeenCalledTimes(2);

			await vi.advanceTimersByTimeAsync(4000);
			expect(api.get).toHaveBeenCalledTimes(3);
			expect(s.pollError).toBeNull();
			expect(s.polling).toBe(true);
		});

		it('reports a rate limit and waits at least as long as the server asks, up to the cap', async () => {
			const s = await startedStore();
			api.get.mockRejectedValueOnce(new RateLimitedError(3600, null));
			api.get.mockResolvedValue(running(2));

			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);
			expect(s.pollError).toBe('rate_limited');

			await vi.advanceTimersByTimeAsync(FeedImport.MAX_POLL_INTERVAL_MS - 1);
			expect(api.get).toHaveBeenCalledTimes(1);
			await vi.advanceTimersByTimeAsync(1);
			expect(api.get).toHaveBeenCalledTimes(2);
		});

		it('waits as long as the server asks when that is longer than the back-off', async () => {
			const s = await startedStore();
			api.get.mockRejectedValueOnce(new RateLimitedError(5, null));
			api.get.mockResolvedValue(running(2));

			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);

			await vi.advanceTimersByTimeAsync(4999);
			expect(api.get).toHaveBeenCalledTimes(1);
			await vi.advanceTimersByTimeAsync(1);
			expect(api.get).toHaveBeenCalledTimes(2);
		});

		it('gives up and reports it when the import makes no progress for 5 minutes', async () => {
			const s = await startedStore();
			api.get.mockResolvedValue(running(0));

			s.startPolling();
			await vi.advanceTimersByTimeAsync(FeedImport.POLL_TIMEOUT_MS + 1000);
			const calls = api.get.mock.calls.length;
			await vi.advanceTimersByTimeAsync(10000);

			expect(api.get).toHaveBeenCalledTimes(calls);
			expect(s.stalled).toBe(true);
			expect(s.polling).toBe(false);
			expect(notifications.error).toHaveBeenCalledWith('generic error');
		});

		it('treats an unexpected poll error as a stall instead of rethrowing it', async () => {
			const s = await startedStore();
			api.get.mockRejectedValueOnce(new SyntaxError('Unexpected token <'));

			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);
			await vi.advanceTimersByTimeAsync(10000);

			expect(api.get).toHaveBeenCalledTimes(1);
			expect(s.stalled).toBe(true);
			expect(s.polling).toBe(false);
			expect(s.pollError).toBeNull();
			expect(notifications.error).toHaveBeenCalledWith('generic error');
		});

		it('does not report a stall for an error that arrives after it was destroyed', async () => {
			const s = await startedStore();
			let reject: (error: Error) => void = () => {};
			api.get.mockImplementationOnce(() => new Promise((_, r) => (reject = r)));

			s.startPolling();
			await vi.advanceTimersByTimeAsync(1000);
			s.destroy();
			reject(new SyntaxError('Unexpected token <'));
			await vi.advanceTimersByTimeAsync(1000);

			expect(s.stalled).toBe(false);
			expect(notifications.error).not.toHaveBeenCalled();
		});

		it('resumes polling on load only when an import is running', async () => {
			const idle = store();
			api.get.mockResolvedValueOnce({ data: feedImportState({ stage: 'finished' }) });
			await idle.resume();
			expect(idle.polling).toBe(false);

			const busy = store();
			api.get.mockResolvedValueOnce(running(1));
			await busy.resume();
			expect(busy.polling).toBe(true);
			busy.destroy();
		});
	});

	it('reset clears the state', async () => {
		const s = store();
		api.get.mockResolvedValue({ data: feedImportState() });
		await s.refresh();

		s.reset();

		expect(s.state).toBeNull();
	});
});
