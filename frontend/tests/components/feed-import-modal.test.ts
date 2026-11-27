import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { FeedImport } from '$lib/state/FeedImport.svelte';
import { NetworkError } from '$lib/services/ApiService';
import type { FeedImportState } from '$lib/types/feed';
import { renderWithContext } from './helpers/context';
import FeedImportModalContext from './helpers/FeedImportModalContext.svelte';
import { feedImportEntry, feedImportState } from '../unit/helpers/factories';

const GENERIC_ERROR = 'Something went wrong with the import. Please try again.';
const NETWORK_ERROR = 'Connection problem. Please check your connection and try again.';
const RATE_LIMITED = 'Too many imports. Please try again later.';

function mockUpload(state: FeedImportState) {
	return vi.spyOn(FeedImport.prototype, 'upload').mockImplementation(async function (this: FeedImport) {
		this.state = state;
		return { ok: true, status: 200 };
	});
}

async function openPreview(user: ReturnType<typeof userEvent.setup>, state: FeedImportState): Promise<void> {
	vi.spyOn(FeedImport.prototype, 'refresh').mockResolvedValue(false);
	mockUpload(state);
	renderWithContext(FeedImportModalContext);
	await user.upload(await screen.findByLabelText('Select File'), new File(['<opml/>'], 'feeds.opml'));
}

function mockRunningImport(processedAt: (call: number) => number) {
	let call = 0;
	return vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(async function (this: FeedImport) {
		this.state = feedImportState({ stage: 'running', total: 500, processed: processedAt(call++) });
		return true;
	});
}

afterEach(() => {
	vi.useRealTimers();
});

describe('FeedImportModal', () => {
	it('counts the selected feeds in singular and plural', async () => {
		const user = userEvent.setup();
		await openPreview(user, feedImportState({ feeds: [feedImportEntry(), feedImportEntry({ url: 'https://b.test/feed', title: 'B feed' })] }));

		expect(await screen.findByText('2 selected')).toBeInTheDocument();

		await user.click(screen.getByRole('checkbox', { name: 'B feed' }));

		expect(await screen.findByText('1 selected')).toBeInTheDocument();
	});

	it('stops polling once the feed import store is destroyed mid-import', async () => {
		vi.useFakeTimers();
		const refresh = vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(async function (this: FeedImport) {
			this.state = feedImportState({ stage: 'running', total: 2, processed: 1 });
			return true;
		});

		const { unmount } = renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(0);
		expect(refresh).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1000);
		expect(refresh).toHaveBeenCalledTimes(2);

		unmount();
		await vi.advanceTimersByTimeAsync(10000);

		expect(refresh).toHaveBeenCalledTimes(2);
	});

	it('does not start polling when the feed import store is destroyed before the first refresh resolves', async () => {
		vi.useFakeTimers();
		let resolveFirst: (found: boolean) => void = () => {};
		const refresh = vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(function (this: FeedImport) {
			this.state = feedImportState({ stage: 'running', total: 2, processed: 1 });
			return new Promise<boolean>((resolve) => {
				resolveFirst = resolve;
			});
		});

		const { unmount } = renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(0);
		expect(refresh).toHaveBeenCalledTimes(1);

		unmount();
		resolveFirst(true);
		await vi.advanceTimersByTimeAsync(10000);

		expect(refresh).toHaveBeenCalledTimes(1);
	});

	it('keeps polling in the background after the modal is closed mid-import', async () => {
		vi.useFakeTimers();
		const refresh = mockRunningImport((call) => call);

		renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(1000);
		screen.getByRole('button').click();
		await vi.advanceTimersByTimeAsync(0);
		expect(screen.queryByRole('progressbar')).toBeNull();

		const calls = refresh.mock.calls.length;
		await vi.advanceTimersByTimeAsync(3000);

		expect(refresh.mock.calls.length).toBeGreaterThan(calls);
	});

	it('keeps polling past the stall timeout while the import makes progress', async () => {
		vi.useFakeTimers();
		const refresh = mockRunningImport((call) => Math.min(call, 499));

		renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(400000);
		const calls = refresh.mock.calls.length;
		await vi.advanceTimersByTimeAsync(1000);

		expect(refresh.mock.calls.length).toBeGreaterThan(calls);
		expect(screen.queryByText(GENERIC_ERROR)).toBeNull();
		expect(screen.getByText(/Importing feeds\.\.\./)).toBeInTheDocument();
	});

	it('stops polling and shows an error once the import makes no progress for 5 minutes', async () => {
		vi.useFakeTimers();
		const refresh = mockRunningImport(() => 10);

		renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(200000);
		expect(screen.queryByText(GENERIC_ERROR)).toBeNull();

		await vi.advanceTimersByTimeAsync(101000);
		expect(screen.getByRole('alert')).toHaveTextContent(GENERIC_ERROR);

		const calls = refresh.mock.calls.length;
		await vi.advanceTimersByTimeAsync(10000);
		expect(refresh).toHaveBeenCalledTimes(calls);
	});

	it('offers to import another file once the import has stalled', async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		vi.useFakeTimers();
		mockRunningImport(() => 10);

		renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(301000);
		await user.click(screen.getByRole('button', { name: 'Import another file' }));

		expect(screen.getByText(/Choose the OPML file/)).toBeInTheDocument();
		expect(screen.queryByText(GENERIC_ERROR)).toBeNull();
	});

	it('shows the failed view when polling gets an unreadable response', async () => {
		vi.useFakeTimers();
		let call = 0;
		const refresh = vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(async function (this: FeedImport) {
			if (call++ === 1) throw new SyntaxError('Unexpected token <');
			this.state = feedImportState({ stage: 'running', total: 4, processed: 1 });
			return true;
		});

		renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(1000);
		await vi.advanceTimersByTimeAsync(10000);

		expect(screen.getByRole('alert')).toHaveTextContent(GENERIC_ERROR);
		expect(screen.getByRole('button', { name: 'Import another file' })).toBeInTheDocument();
		expect(refresh).toHaveBeenCalledTimes(2);
	});

	it('shows the result when a long import finishes', async () => {
		vi.useFakeTimers();
		let call = 0;
		vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(async function (this: FeedImport) {
			const finished = call > 350;
			this.state = feedImportState({ stage: finished ? 'finished' : 'running', total: 500, processed: finished ? 500 : call });
			call++;
			return true;
		});

		renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(360000);

		expect(screen.getByText('Added (0)')).toBeInTheDocument();
		expect(screen.queryByText(GENERIC_ERROR)).toBeNull();
	});

	it('shows an error with a retry button when the first state request fails', async () => {
		const user = userEvent.setup();
		const refresh = vi
			.spyOn(FeedImport.prototype, 'refresh')
			.mockRejectedValueOnce(new NetworkError(new Error('offline')))
			.mockResolvedValueOnce(false);

		renderWithContext(FeedImportModalContext);

		await user.click(await screen.findByRole('button', { name: 'Try again' }));

		expect(await screen.findByText(/Choose the OPML file/)).toBeInTheDocument();
		expect(screen.queryByText(GENERIC_ERROR)).toBeNull();
		expect(refresh).toHaveBeenCalledTimes(2);
	});

	it('switches to the progress view when an upload hits an import that is already running', async () => {
		const user = userEvent.setup();
		vi.spyOn(FeedImport.prototype, 'refresh')
			.mockResolvedValueOnce(false)
			.mockImplementation(async function (this: FeedImport) {
				this.state = feedImportState({ stage: 'running', total: 4, processed: 1 });
				return true;
			});
		vi.spyOn(FeedImport.prototype, 'upload').mockResolvedValue({ ok: false, status: 409 });

		renderWithContext(FeedImportModalContext);
		const file = new File(['<opml/>'], 'feeds.opml', { type: 'text/xml' });
		await user.upload(await screen.findByLabelText('Select File'), file);

		expect(await screen.findByText('Importing feeds... 1 of 4')).toBeInTheDocument();
		expect(screen.getByText('An import is already running.')).toBeInTheDocument();
	});

	it('clears the already-running message once that import finishes', async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		vi.useFakeTimers();
		let call = 0;
		vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(async function (this: FeedImport) {
			if (call++ === 0) return false;
			const finished = call > 3;
			this.state = feedImportState({ stage: finished ? 'finished' : 'running', total: 4, processed: finished ? 4 : 1 });
			return true;
		});
		vi.spyOn(FeedImport.prototype, 'upload').mockResolvedValue({ ok: false, status: 409 });

		renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(0);
		const file = new File(['<opml/>'], 'feeds.opml', { type: 'text/xml' });
		await user.upload(screen.getByLabelText('Select File'), file);

		expect(screen.getByText('An import is already running.')).toBeInTheDocument();

		await vi.advanceTimersByTimeAsync(5000);

		expect(screen.getByText('Added (0)')).toBeInTheDocument();
		expect(screen.queryByText('An import is already running.')).toBeNull();
	});

	it('shows a spinner instead of an empty body until the first state request returns', async () => {
		let resolveFirst: (found: boolean) => void = () => {};
		vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(() => new Promise<boolean>((resolve) => (resolveFirst = resolve)));

		const { container } = renderWithContext(FeedImportModalContext);

		expect(container.querySelector('.animate-spin')).not.toBeNull();
		resolveFirst(false);
		expect(await screen.findByText(/Choose the OPML file/)).toBeInTheDocument();
		expect(container.querySelector('.animate-spin')).toBeNull();
	});

	it('sends a single select request when Import is clicked twice', async () => {
		const user = userEvent.setup();
		await openPreview(user, feedImportState({ feeds: [feedImportEntry()] }));
		let resolveSelect: (res: { ok: boolean; status: number }) => void = () => {};
		const select = vi.spyOn(FeedImport.prototype, 'select').mockImplementation(() => new Promise((resolve) => (resolveSelect = resolve)));

		const button = await screen.findByRole('button', { name: 'Import' });
		await user.click(button);
		expect(button).toBeDisabled();
		await user.click(button);
		resolveSelect({ ok: false, status: 409 });

		expect(select).toHaveBeenCalledTimes(1);
	});

	it('shows the rate-limit message and keeps the selection when select gets a 429', async () => {
		const user = userEvent.setup();
		await openPreview(user, feedImportState({ feeds: [feedImportEntry()] }));
		vi.spyOn(FeedImport.prototype, 'select').mockResolvedValue({ ok: false, status: 429 });

		await user.click(await screen.findByRole('button', { name: 'Import' }));

		expect(await screen.findByText(RATE_LIMITED)).toBeInTheDocument();
		expect(screen.getByRole('checkbox', { name: 'A feed' })).toBeChecked();
	});

	it('shows a connection error in the modal when select fails on the network', async () => {
		const user = userEvent.setup();
		await openPreview(user, feedImportState({ feeds: [feedImportEntry()] }));
		vi.spyOn(FeedImport.prototype, 'select').mockRejectedValue(new NetworkError(new TypeError('offline')));

		await user.click(await screen.findByRole('button', { name: 'Import' }));

		expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Import' })).toBeEnabled();
	});

	it('shows a connection error and no selected file when the upload fails on the network', async () => {
		const user = userEvent.setup();
		vi.spyOn(FeedImport.prototype, 'refresh').mockResolvedValue(false);
		vi.spyOn(FeedImport.prototype, 'upload').mockRejectedValue(new NetworkError(new TypeError('offline')));

		renderWithContext(FeedImportModalContext);
		await user.upload(await screen.findByLabelText('Select File'), new File(['<opml/>'], 'feeds.opml'));

		expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument();
		expect(screen.queryByText('feeds.opml')).toBeNull();
	});

	it('disables the file input while the upload is in flight', async () => {
		const user = userEvent.setup();
		vi.spyOn(FeedImport.prototype, 'refresh').mockResolvedValue(false);
		let resolveUpload: (res: { ok: boolean; status: number }) => void = () => {};
		vi.spyOn(FeedImport.prototype, 'upload').mockImplementation(() => new Promise((resolve) => (resolveUpload = resolve)));

		renderWithContext(FeedImportModalContext);
		const input = await screen.findByLabelText<HTMLInputElement>('Select File');
		await user.upload(input, new File(['<opml/>'], 'feeds.opml'));
		expect(input).toBeDisabled();

		resolveUpload({ ok: false, status: 422 });

		await vi.waitFor(() => expect(input).toBeEnabled());
	});

	it('does not show the file as selected when the server rejects it', async () => {
		const user = userEvent.setup();
		vi.spyOn(FeedImport.prototype, 'refresh').mockResolvedValue(false);
		vi.spyOn(FeedImport.prototype, 'upload').mockResolvedValue({ ok: false, status: 422 });

		renderWithContext(FeedImportModalContext);
		const input = await screen.findByLabelText<HTMLInputElement>('Select File');
		await user.upload(input, new File(['<opml/>'], 'feeds.opml'));

		expect(await screen.findByRole('alert')).toHaveTextContent(/This file couldn't be read/);
		expect(screen.queryByText('feeds.opml')).toBeNull();
		expect(screen.queryByText(/Processing/)).toBeNull();
		expect(input.value).toBe('');
	});

	it('shows a connection error while polling fails and clears it once polling recovers', async () => {
		vi.useFakeTimers();
		let call = 0;
		vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(async function (this: FeedImport) {
			if (call++ === 1) throw new NetworkError(new TypeError('offline'));
			this.state = feedImportState({ stage: 'running', total: 4, processed: call });
			return true;
		});

		renderWithContext(FeedImportModalContext);
		await vi.advanceTimersByTimeAsync(1000);
		expect(screen.getByText(NETWORK_ERROR)).toBeInTheDocument();

		await vi.advanceTimersByTimeAsync(2000);
		expect(screen.queryByText(NETWORK_ERROR)).toBeNull();
		expect(screen.getByRole('progressbar', { name: /Importing feeds/ })).toHaveAttribute('aria-valuenow', '75');
	});

	it('names each checkbox after its feed and toggles it from the title, but not for subscribed feeds', async () => {
		const user = userEvent.setup();
		await openPreview(user, feedImportState({ feeds: [
			feedImportEntry({ url: 'https://a.test/feed', title: 'A feed' }),
			feedImportEntry({ url: 'https://b.test/feed', title: '' }),
			feedImportEntry({ url: 'https://c.test/feed', title: 'C feed', already_subscribed: true })
		] }));

		const first = await screen.findByRole('checkbox', { name: 'A feed' });
		await user.click(screen.getByText('A feed'));
		expect(first).not.toBeChecked();
		await user.click(screen.getByText('https://a.test/feed'));
		expect(first).toBeChecked();

		expect(screen.getByRole('checkbox', { name: 'https://b.test/feed' })).toBeChecked();

		const subscribed = screen.getByRole('checkbox', { name: 'C feed' });
		await user.click(screen.getByText('C feed'));
		expect(subscribed).not.toBeChecked();
	});

	it('explains that every feed is already subscribed and hides the select toggle', async () => {
		const user = userEvent.setup();
		await openPreview(user, feedImportState({ feeds: [feedImportEntry({ already_subscribed: true })] }));

		expect(await screen.findByText(/already subscribed to every feed/)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Select (all|none)/ })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Import' })).toBeNull();

		await user.click(screen.getByRole('button', { name: 'Import another file' }));

		expect(screen.getByText(/Choose the OPML file/)).toBeInTheDocument();
	});

	it('lists feeds over the subscription limit as failed with their reason', async () => {
		vi.spyOn(FeedImport.prototype, 'refresh').mockImplementation(async function (this: FeedImport) {
			this.state = feedImportState({
				stage: 'finished',
				total: 2,
				processed: 2,
				feeds: [feedImportEntry({ status: 'subscribed', url: 'https://a.test' }), feedImportEntry({ status: 'limit_reached', url: 'https://b.test' })]
			});
			return true;
		});

		renderWithContext(FeedImportModalContext);

		expect(await screen.findByText('Added (1)')).toBeInTheDocument();
		expect(screen.getByText("Didn't work (1)")).toBeInTheDocument();
		expect(screen.getByText('Subscription limit reached')).toBeInTheDocument();
	});
});
