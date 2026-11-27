import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContactImport } from '$lib/state/ContactImport.svelte';
import { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import type ApiService from '$lib/services/ApiService';
import type { Auth } from '$lib/state/Auth.svelte';
import type { Contacts } from '$lib/state/Contacts.svelte';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import type { Translation } from '$lib/state/Translation.svelte';
import type { ImportState } from '$lib/types/contact';
import { apiRoutes } from '$lib/config/apiRoutes';
import { api, auth, resetStoreMocks } from '../setup/storeMocks';
import { contactImportState } from '../helpers/factories';

let contacts: { loadAddressBooks: ReturnType<typeof vi.fn>; loadContacts: ReturnType<typeof vi.fn> };
let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

const ts = { get: { contacts: { import_success: 'imported', import_error: 'failed' } } };

const file = new File(['BEGIN:VCARD'], 'friends.vcf', { type: 'text/vcard' });

function store(): ContactImport {
	return new ContactImport(
		auth as unknown as Auth,
		api as unknown as ApiService,
		contacts as unknown as Contacts,
		notifications as unknown as UiNotifications,
		ts as unknown as Translation
	);
}

async function running(s: ContactImport): Promise<void> {
	api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
	await s.importFile(file, { type: 'new', name: 'Friends', color: '#0088CC' });
}

function stateResponse(overrides: Partial<ImportState>): { data: ImportState } {
	return { data: contactImportState(overrides) };
}

beforeEach(() => {
	resetStoreMocks();
	contacts = { loadAddressBooks: vi.fn().mockResolvedValue(undefined), loadContacts: vi.fn().mockResolvedValue(undefined) };
	notifications = { success: vi.fn(), error: vi.fn() };
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('ContactImport store', () => {
	describe('importFile', () => {
		it('posts the file and the target to the file import route', async () => {
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
			const s = store();

			const error = await s.importFile(file, { type: 'existing', addressBookId: 4 });

			expect(error).toBeNull();
			const [endpoint, body] = api.postWithStatus.mock.calls[0];
			expect(endpoint).toBe(apiRoutes.contacts.startFileImport);
			expect((body as FormData).get('file')).toBeInstanceOf(File);
			expect((body as FormData).get('address_book_id')).toBe('4');
			expect(s.state?.stage).toBe('started');
			expect(s.state?.source).toBe('file');
			expect(s.polling).toBe(true);
			s.destroy();
		});

		it('takes the initial state from the response', async () => {
			const initial = contactImportState({ stage: 'contacts', contacts_count: 0 });
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: initial } });
			const s = store();

			await s.importFile(file, { type: 'new', name: '', color: '#0088CC' });

			expect(s.state).toEqual(initial);
			s.destroy();
		});

		it.each([
			[422, 'invalid_file'],
			[413, 'invalid_file'],
			[404, 'address_book_not_found'],
			[409, 'already_running']
		])('maps a %d to %s and does not poll', async (status, expected) => {
			api.postWithStatus.mockResolvedValue({ ok: false, status, data: null });
			const s = store();

			expect(await s.importFile(file, { type: 'new', name: 'Friends', color: '#0088CC' })).toBe(expected);
			expect(s.state).toBeNull();
			expect(s.polling).toBe(false);
		});

		it('maps a thrown RateLimitedError and NetworkError', async () => {
			const s = store();

			api.postWithStatus.mockRejectedValueOnce(new RateLimitedError(60, null));
			expect(await s.importFile(file, { type: 'new', name: '', color: '#0088CC' })).toBe('rate_limited');

			api.postWithStatus.mockRejectedValueOnce(new NetworkError(new TypeError('offline')));
			expect(await s.importFile(file, { type: 'new', name: '', color: '#0088CC' })).toBe('generic');
		});
	});

	describe('CardDAV import', () => {
		it('shows progress right after the login step and polls until the account address books are ready to pick', async () => {
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
			api.get.mockResolvedValueOnce(stateResponse({ stage: 'select', source: 'carddav', address_books: ['Work'] }));
			const s = store();

			await s.startCarddavImport({ url: 'https://dav.test', username: 'me', secret: 'x' });

			expect(api.postWithStatus).toHaveBeenCalledWith(apiRoutes.contacts.startImport, { url: 'https://dav.test', username: 'me', secret: 'x' });
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
			api.get.mockResolvedValue(stateResponse({ stage: 'address-books', source: 'carddav' }));
			const s = store();

			await s.selectCarddavAddressBooks(['Work']);

			expect(s.service.view(s.state, s.awaitingState)).toBe('progress');

			await vi.advanceTimersByTimeAsync(3000);

			expect(api.get).toHaveBeenCalledTimes(3);
			expect(s.service.view(s.state, s.awaitingState)).toBe('progress');
			expect(s.polling).toBe(true);
			s.destroy();
		});

		it('stops polling and offers the form again when the server reports an abandoned login step', async () => {
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: [] } });
			api.get.mockResolvedValue(stateResponse({ stage: 'started', source: 'carddav' }));
			const s = store();

			await s.startCarddavImport({ url: 'https://dav.test', username: 'me', secret: 'x' });
			await vi.advanceTimersByTimeAsync(3000);

			expect(api.get).toHaveBeenCalledTimes(1);
			expect(s.service.view(s.state, s.awaitingState)).toBe('start');
			expect(s.polling).toBe(false);
		});

		it('sends the picked address books and reports a running import', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 409, data: null });
			const s = store();

			expect(await s.selectCarddavAddressBooks(['Work'])).toBe('already_running');
			expect(api.postWithStatus).toHaveBeenCalledWith(apiRoutes.contacts.selectImportAddressBooks, { address_books: ['Work'] });
		});

		it('maps other CardDAV failures to the generic error', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 422, data: null });

			expect(await store().startCarddavImport({ url: '', username: '', secret: '' })).toBe('generic');
		});
	});

	describe('polling', () => {
		it('reloads address books and contacts once the import finishes and keeps the result for the open modal', async () => {
			const s = store();
			s.importModal = true;
			await running(s);
			api.get.mockResolvedValueOnce(stateResponse({ stage: 'contacts', contacts_done: 4 }));
			api.get.mockResolvedValueOnce(stateResponse({ stage: 'finished', contacts_done: 9, contacts_skipped: 1 }));

			await vi.advanceTimersByTimeAsync(10000);

			expect(api.get).toHaveBeenCalledTimes(2);
			expect(api.get).toHaveBeenCalledWith(apiRoutes.contacts.getImportState, null);
			expect(contacts.loadAddressBooks).toHaveBeenCalledTimes(1);
			expect(contacts.loadContacts).toHaveBeenCalledTimes(1);
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
			expect(contacts.loadAddressBooks).not.toHaveBeenCalled();
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
			api.get.mockResolvedValue(stateResponse({ stage: 'contacts', contacts_done: 3 }));

			await vi.advanceTimersByTimeAsync(ContactImport.STALL_TIMEOUT_MS + 2000);

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
			api.get.mockResolvedValue(stateResponse({ stage: 'contacts' }));
			const s = store();

			await s.open();

			expect(s.state?.stage).toBe('contacts');
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
			api.get.mockResolvedValue(stateResponse({ stage: 'select', source: 'carddav' }));
			await idle.open();
			idle.close();
			expect(idle.importModal).toBe(false);
			expect(idle.state).toBeNull();
		});
	});
});
