import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
import type { Calendars } from '$lib/state/Calendars.svelte';
import type { Auth } from '$lib/state/Auth.svelte';
import type ApiService from '$lib/services/ApiService';
import { RateLimitedError } from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { api, auth, resetStoreMocks } from '../setup/storeMocks';
import type { ExternalCalendarAccount } from '$lib/types/calendar';

const routes = apiRoutes.calendars.externalAccounts;

function account(overrides: Partial<ExternalCalendarAccount> = {}): ExternalCalendarAccount {
	return { id: 7, server_url: 'https://cloud.example.com/remote.php/dav', username: 'alice', calendars: [], ...overrides };
}

function calendarsStub() {
	return {
		calendars: [{ id: 11 }, { id: 12 }],
		loadCalendars: vi.fn().mockResolvedValue(undefined),
		loadEvents: vi.fn().mockResolvedValue(undefined)
	};
}

let calendars: ReturnType<typeof calendarsStub>;

function store(): ExternalCalendars {
	return new ExternalCalendars(auth as unknown as Auth, api as unknown as ApiService, calendars as unknown as Calendars);
}

beforeEach(() => {
	resetStoreMocks();
	calendars = calendarsStub();
});

describe('ExternalCalendars store', () => {
	it('loads the accounts', async () => {
		api.list.mockResolvedValue({ data: [account()] });
		const s = store();

		await s.load();

		expect(api.list).toHaveBeenCalledWith(routes.list);
		expect(s.accounts).toEqual([account()]);
		expect(s.loaded).toBe(true);
	});

	it('marks a failed load and clears the mark once a retry succeeds', async () => {
		api.list.mockResolvedValue(null);
		const s = store();

		await s.load();
		expect(s.loadFailed).toBe(true);
		expect(s.loaded).toBe(false);

		api.list.mockResolvedValue({ data: [account()] });
		await s.load();
		expect(s.loadFailed).toBe(false);
		expect(s.loaded).toBe(true);
	});

	it('marks a load that throws as failed and lets the error through', async () => {
		api.list.mockRejectedValue(new Error('offline'));
		const s = store();

		await expect(s.load()).rejects.toThrow('offline');
		expect(s.loadFailed).toBe(true);
	});

	it('adds an account and reloads the list', async () => {
		api.postRaw.mockResolvedValue({ success: true, data: account() });
		api.list.mockResolvedValue({ data: [account()] });
		const s = store();
		const request = { server_url: 'https://cloud.example.com', username: 'alice', password: 'app-password' };

		const result = await s.addAccount(request);

		expect(api.postRaw).toHaveBeenCalledWith(routes.create, request);
		expect(result).toEqual({ ok: true, data: account() });
		expect(s.accounts).toHaveLength(1);
	});

	it('puts a rejected app password on the password field', async () => {
		api.postRaw.mockResolvedValue({
			success: false,
			message: 'The server rejected the username or app password.',
			errors: ['external_credentials_rejected']
		});
		const s = store();

		const result = await s.addAccount({ server_url: 'https://x.test', username: 'a', password: 'b' });

		expect(result).toEqual({ ok: false, error: { field: 'password', reason: 'credentials_rejected', retryAfter: null } });
		expect(api.list).not.toHaveBeenCalled();
	});

	it('turns a 429 into a rate-limit error instead of throwing', async () => {
		api.postRaw.mockRejectedValue(new RateLimitedError(42, 'too_many_requests'));
		const s = store();

		const result = await s.addAccount({ server_url: 'https://x.test', username: 'a', password: 'b' });

		expect(result).toEqual({ ok: false, error: { field: null, reason: 'rate_limited', retryAfter: 42 } });
	});

	it('turns a reply without the API envelope into a generic error', async () => {
		api.postRaw.mockResolvedValue({ success: false });

		const result = await store().addAccount({ server_url: 'https://x.test', username: 'a', password: 'b' });

		expect(result).toEqual({ ok: false, error: { field: null, reason: 'failed', retryAfter: null } });
	});

	it('lets other errors through', async () => {
		api.listRaw.mockRejectedValue(new Error('boom'));

		await expect(store().loadAvailable(account())).rejects.toThrow('boom');
	});

	it('lists the calendars available on the server', async () => {
		const candidate = { url: 'https://cloud.example.com/work/', name: 'Work', color: '#f00', is_connected: false };
		api.listRaw.mockResolvedValue({ success: true, data: [candidate] });

		const result = await store().loadAvailable(account());

		expect(api.listRaw).toHaveBeenCalledWith(routes.available.replace('%d', '7'));
		expect(result).toEqual({ ok: true, data: [candidate] });
	});

	it('reports an unreachable server when listing the available calendars', async () => {
		api.listRaw.mockResolvedValue({
			success: false,
			message: 'The server could not be reached or did not answer as a CalDAV server.',
			errors: ['external_server_unreachable']
		});

		const result = await store().loadAvailable(account());

		expect(result).toEqual({ ok: false, error: { field: 'server_url', reason: 'server_unreachable', retryAfter: null } });
	});

	it('connects calendars and refreshes accounts, calendars and events', async () => {
		api.postRaw.mockResolvedValue({ success: true, data: [{ id: 13 }] });
		api.list.mockResolvedValue({ data: [account()] });

		const result = await store().connect(account(), ['https://cloud.example.com/work/']);

		expect(api.postRaw).toHaveBeenCalledWith(routes.connect.replace('%d', '7'), { urls: ['https://cloud.example.com/work/'] });
		expect(result.ok).toBe(true);
		expect(api.list).toHaveBeenCalledWith(routes.list);
		expect(calendars.loadCalendars).toHaveBeenCalled();
		expect(calendars.loadEvents).toHaveBeenCalled();
		expect(auth.widgetBridge.notifyChanged).toHaveBeenCalled();
	});

	it('refreshes nothing when connecting fails', async () => {
		api.postRaw.mockResolvedValue({ success: false, errors: { urls: ['Only calendars found on the server can be connected.'] } });

		const result = await store().connect(account(), ['https://elsewhere.test/']);

		expect(result).toEqual({ ok: false, error: { field: 'urls', reason: 'failed', retryAfter: null } });
		expect(calendars.loadCalendars).not.toHaveBeenCalled();
	});

	it('sends the new username and app password and reloads events', async () => {
		api.putRaw.mockResolvedValue({ success: true, data: account() });
		api.list.mockResolvedValue({ data: [account()] });

		const result = await store().updateAccount(account(), { username: 'alice', password: 'new' });

		expect(api.putRaw).toHaveBeenCalledWith(routes.update.replace('%d', '7'), { username: 'alice', password: 'new' });
		expect(result.ok).toBe(true);
		expect(calendars.loadCalendars).toHaveBeenCalled();
		expect(calendars.loadEvents).toHaveBeenCalled();
	});

	it('removes an account and refreshes the calendars', async () => {
		api.delete.mockResolvedValue(true);
		api.list.mockResolvedValue({ data: [] });

		await expect(store().deleteAccount(account())).resolves.toBe(true);

		expect(api.delete).toHaveBeenCalledWith(routes.delete, 7);
		expect(calendars.loadCalendars).toHaveBeenCalled();
		expect(calendars.loadEvents).toHaveBeenCalled();
	});

	it('keeps everything as it is when removing fails', async () => {
		api.delete.mockResolvedValue(false);

		await expect(store().deleteAccount(account())).resolves.toBe(false);
		expect(calendars.loadCalendars).not.toHaveBeenCalled();
	});

	it('counts only the connected calendars that still exist', () => {
		const linked = account({
			calendars: [
				{ id: 11, remote_url: 'a' },
				{ id: 99, remote_url: 'b' }
			]
		});

		expect(store().connectedCount(linked)).toBe(1);
	});

	it('gives every opened or closed dialog a new token', () => {
		const s = store();
		s.openDialog({ step: 'connect' });
		const token = s.dialogToken();

		expect(s.isDialogCurrent(token)).toBe(true);
		s.closeDialog();
		expect(s.isDialogCurrent(token)).toBe(false);
		s.openDialog({ step: 'connect' });
		expect(s.isDialogCurrent(token)).toBe(false);
	});

	it('opens the app password dialog of the account a calendar belongs to, loading the accounts first', async () => {
		const owner = account({ id: 8, calendars: [{ id: 12, remote_url: 'b' }] });
		api.list.mockResolvedValue({ data: [account({ calendars: [{ id: 11, remote_url: 'a' }] }), owner] });
		const s = store();

		await s.changePasswordForCalendar(12);

		expect(api.list).toHaveBeenCalledWith(routes.list);
		expect(s.dialog).toEqual({ step: 'credentials', account: owner });
	});

	it('opens no dialog for a calendar without an account', async () => {
		api.list.mockResolvedValue({ data: [account()] });
		const s = store();

		await s.changePasswordForCalendar(12);

		expect(s.dialog).toBeNull();
	});
});
