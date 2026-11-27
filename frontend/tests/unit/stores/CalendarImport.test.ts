import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CalendarImport } from '$lib/state/CalendarImport.svelte';
import { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import type ApiService from '$lib/services/ApiService';
import type { Auth } from '$lib/state/Auth.svelte';
import type { Calendars } from '$lib/state/Calendars.svelte';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import type { Translation } from '$lib/state/Translation.svelte';
import type { ImportState } from '$lib/types/calendar';
import { apiRoutes } from '$lib/config/apiRoutes';
import { api, auth, resetStoreMocks } from '../setup/storeMocks';
import { calendarImportState } from '../helpers/factories';

let calendars: { loadCalendars: ReturnType<typeof vi.fn>; loadEvents: ReturnType<typeof vi.fn> };
let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

const ts = { get: { calendar: { import_success: 'imported', import_error: 'failed' } } };

const file = new File(['BEGIN:VCALENDAR'], 'holidays.ics', { type: 'text/calendar' });

function store(): CalendarImport {
	return new CalendarImport(
		auth as unknown as Auth,
		api as unknown as ApiService,
		calendars as unknown as Calendars,
		notifications as unknown as UiNotifications,
		ts as unknown as Translation
	);
}

async function running(s: CalendarImport): Promise<void> {
	api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
	await s.importFile(file, { type: 'new', name: 'Holidays', color: null });
}

function stateResponse(overrides: Partial<ImportState>): { data: ImportState } {
	return { data: calendarImportState(overrides) };
}

beforeEach(() => {
	resetStoreMocks();
	calendars = { loadCalendars: vi.fn().mockResolvedValue(undefined), loadEvents: vi.fn().mockResolvedValue(undefined) };
	notifications = { success: vi.fn(), error: vi.fn() };
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('CalendarImport store', () => {
	describe('importFile', () => {
		it('posts the file and the target to the file import route', async () => {
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
			const s = store();

			const error = await s.importFile(file, { type: 'existing', calendarId: 4 });

			expect(error).toBeNull();
			const [endpoint, body] = api.postWithStatus.mock.calls[0];
			expect(endpoint).toBe(apiRoutes.calendars.startFileImport);
			expect((body as FormData).get('file')).toBeInstanceOf(File);
			expect((body as FormData).get('calendar_id')).toBe('4');
			expect(s.state?.stage).toBe('started');
			expect(s.state?.source).toBe('file');
			expect(s.polling).toBe(true);
			s.destroy();
		});

		it('takes the initial state from the response', async () => {
			const initial = calendarImportState({ stage: 'calendars', events_count: 0 });
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: initial } });
			const s = store();

			await s.importFile(file, { type: 'new', name: '', color: null });

			expect(s.state).toEqual(initial);
			s.destroy();
		});

		it.each([
			[422, 'invalid_file'],
			[403, 'calendar_forbidden'],
			[404, 'calendar_not_found'],
			[409, 'already_running']
		])('maps a %d to %s and does not poll', async (status, expected) => {
			api.postWithStatus.mockResolvedValue({ ok: false, status, data: null });
			const s = store();

			expect(await s.importFile(file, { type: 'new', name: 'Holidays', color: null })).toBe(expected);
			expect(s.state).toBeNull();
			expect(s.polling).toBe(false);
		});

		it('maps a thrown RateLimitedError and NetworkError', async () => {
			const s = store();

			api.postWithStatus.mockRejectedValueOnce(new RateLimitedError(60, null));
			expect(await s.importFile(file, { type: 'new', name: '', color: null })).toBe('rate_limited');

			api.postWithStatus.mockRejectedValueOnce(new NetworkError(new TypeError('offline')));
			expect(await s.importFile(file, { type: 'new', name: '', color: null })).toBe('generic');
		});
	});

	describe('CalDAV import', () => {
		it('shows progress right after the login step and polls until the account calendars are ready to pick', async () => {
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
			api.get.mockResolvedValueOnce(stateResponse({ stage: 'select', source: 'caldav', calendars: ['Work'] }));
			const s = store();

			await s.startCaldavImport({ url: 'https://dav.test', username: 'me', secret: 'x' });

			expect(api.postWithStatus).toHaveBeenCalledWith(apiRoutes.calendars.startImport, { url: 'https://dav.test', username: 'me', secret: 'x' });
			expect(s.service.view(s.state, s.awaitingState)).toBe('progress');
			expect(s.polling).toBe(true);

			await vi.advanceTimersByTimeAsync(5000);

			expect(api.get).toHaveBeenCalledTimes(1);
			expect(s.state?.stage).toBe('select');
			expect(s.service.view(s.state, s.awaitingState)).toBe('select');
			expect(s.polling).toBe(false);
		});

		it('shows progress right after the select step and keeps polling while the import runs', async () => {
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
			api.get.mockResolvedValue(stateResponse({ stage: 'calendars', source: 'caldav' }));
			const s = store();

			await s.selectCaldavCalendars(['Work']);

			expect(s.service.view(s.state, s.awaitingState)).toBe('progress');

			await vi.advanceTimersByTimeAsync(3000);

			expect(api.get).toHaveBeenCalledTimes(3);
			expect(s.service.view(s.state, s.awaitingState)).toBe('progress');
			expect(s.polling).toBe(true);
			s.destroy();
		});

		it('stops polling and offers the form again when the server reports an abandoned login step', async () => {
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
			api.get.mockResolvedValue(stateResponse({ stage: 'started', source: 'caldav' }));
			const s = store();

			await s.startCaldavImport({ url: 'https://dav.test', username: 'me', secret: 'x' });
			await vi.advanceTimersByTimeAsync(3000);

			expect(api.get).toHaveBeenCalledTimes(1);
			expect(s.service.view(s.state, s.awaitingState)).toBe('start');
			expect(s.polling).toBe(false);
		});

		it('sends the picked calendars and reports a running import', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 409, data: null });
			const s = store();

			expect(await s.selectCaldavCalendars(['Work'])).toBe('already_running');
			expect(api.postWithStatus).toHaveBeenCalledWith(apiRoutes.calendars.selectImportCalendars, { calendars: ['Work'] });
		});

		it('maps other CalDAV failures to the generic error', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 422, data: null });

			expect(await store().startCaldavImport({ url: '', username: '', secret: '' })).toBe('generic');
		});
	});

	describe('polling', () => {
		it('reloads calendars and events once the import finishes and keeps the result for the open modal', async () => {
			const s = store();
			s.importModal = true;
			await running(s);
			api.get.mockResolvedValueOnce(stateResponse({ stage: 'events', events_done: 4 }));
			api.get.mockResolvedValueOnce(stateResponse({ stage: 'finished', events_done: 9, events_skipped: 1 }));

			await vi.advanceTimersByTimeAsync(10000);

			expect(api.get).toHaveBeenCalledTimes(2);
			expect(api.get).toHaveBeenCalledWith(apiRoutes.calendars.getImportState, null);
			expect(calendars.loadCalendars).toHaveBeenCalledTimes(1);
			expect(calendars.loadEvents).toHaveBeenCalledTimes(1);
			expect(s.state?.stage).toBe('finished');
			expect(notifications.success).not.toHaveBeenCalled();
		});

		it('announces a finished import while the modal is closed and forgets it', async () => {
			const s = store();
			await running(s);
			api.get.mockResolvedValue(stateResponse({ stage: 'finished' }));

			await vi.advanceTimersByTimeAsync(1000);

			expect(notifications.success).toHaveBeenCalledWith('imported');
			expect(s.state).toBeNull();
		});

		it('stops on a failed import and announces it while the modal is closed', async () => {
			const s = store();
			await running(s);
			api.get.mockResolvedValue(stateResponse({ stage: 'failed' }));

			await vi.advanceTimersByTimeAsync(3000);

			expect(api.get).toHaveBeenCalledTimes(1);
			expect(notifications.error).toHaveBeenCalledWith('failed');
			expect(calendars.loadCalendars).not.toHaveBeenCalled();
		});

		it('keeps polling through network errors', async () => {
			const s = store();
			s.importModal = true;
			await running(s);
			api.get.mockRejectedValueOnce(new NetworkError(new TypeError('offline')));
			api.get.mockResolvedValueOnce(stateResponse({ stage: 'finished' }));

			await vi.advanceTimersByTimeAsync(2000);

			expect(s.state?.stage).toBe('finished');
		});

		it('gives up after five minutes without progress', async () => {
			const s = store();
			s.importModal = true;
			await running(s);
			api.get.mockResolvedValue(stateResponse({ stage: 'events', events_done: 3 }));

			await vi.advanceTimersByTimeAsync(CalendarImport.STALL_TIMEOUT_MS + 2000);

			expect(s.stalled).toBe(true);
			expect(s.polling).toBe(false);
		});

		it('stops when destroyed', async () => {
			const s = store();
			await running(s);
			s.destroy();

			await vi.advanceTimersByTimeAsync(5000);

			expect(api.get).not.toHaveBeenCalled();
		});
	});

	describe('open and close', () => {
		it('forgets a finished or failed import from an earlier session', async () => {
			api.get.mockResolvedValue(stateResponse({ stage: 'failed' }));
			const s = store();

			await s.open();

			expect(s.importModal).toBe(true);
			expect(s.state).toBeNull();
			expect(s.polling).toBe(false);
		});

		it('resumes polling for an import that is still running', async () => {
			api.get.mockResolvedValue(stateResponse({ stage: 'events' }));
			const s = store();

			await s.open();

			expect(s.state?.stage).toBe('events');
			expect(s.polling).toBe(true);
			s.destroy();
		});

		it('keeps a running import when closed and resets an idle one', async () => {
			const s = store();
			await running(s);
			s.close();
			expect(s.state?.stage).toBe('started');
			s.destroy();

			const idle = store();
			api.get.mockResolvedValue(stateResponse({ stage: 'select', source: 'caldav' }));
			await idle.open();
			idle.close();
			expect(idle.importModal).toBe(false);
			expect(idle.state).toBeNull();
		});
	});
});
