import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Auth } from '$lib/state/Auth.svelte';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { User, AuthToken, LoginResponse } from '$lib/types/auth';

// The Auth module itself must NOT be mocked — only its service dependencies.

const { api, storage, monitor, bridge } = vi.hoisted(() => {
	const api = {
		post: vi.fn(),
		postWithStatus: vi.fn(),
		postRaw: vi.fn(),
		get: vi.fn(),
		put: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		postFormData: vi.fn(),
		updateAuthToken: vi.fn()
	};
	const storage = {
		getJson: vi.fn(),
		setJson: vi.fn(),
		destroy: vi.fn(),
		get: vi.fn(),
		set: vi.fn()
	};
	const monitor = {
		check: null as (() => void) | null,
		destroy: vi.fn()
	};
	const bridge = {
		issueToken: vi.fn(),
		clear: vi.fn(),
		destroy: vi.fn()
	};
	return { api, storage, monitor, bridge };
});

vi.mock('$lib/state/WidgetBridge', () => ({
	WidgetBridge: class FakeWidgetBridge {
		issueToken = bridge.issueToken;
		clear = bridge.clear;
		destroy = bridge.destroy;
	}
}));

vi.mock('$lib/state/SessionMonitor', () => ({
	SessionMonitor: class FakeSessionMonitor {
		destroy = monitor.destroy;
		constructor(check: () => void) {
			monitor.check = check;
		}
	}
}));

vi.mock('$lib/services/ApiService', () => ({
	default: class FakeApi {
		post = api.post;
		postWithStatus = api.postWithStatus;
		postRaw = api.postRaw;
		get = api.get;
		put = api.put;
		update = api.update;
		delete = api.delete;
		postFormData = api.postFormData;
		updateAuthToken = api.updateAuthToken;
		setUnauthorizedHandler = vi.fn();
	}
}));

vi.mock('$lib/services/LocalStorageService', () => ({
	default: class FakeStorage {
		getJson = storage.getJson;
		setJson = storage.setJson;
		destroy = storage.destroy;
		get = storage.get;
		set = storage.set;
	}
}));

function user(overrides: Partial<User> = {}): User {
	return {
		id: 'user-1',
		name: 'Test User',
		email: 'test@solyto.app',
		role: 'user',
		profile: { profile_image_path: null },
		settings: {
			language: 'en',
			timezone: 'UTC',
			date_format: 'dd.mm.YYYY',
			time_format: 'H:i',
			week_start: 'monday',
			widgets: '',
			navigation: '',
			first_visit: true,
			temperature_unit: 'c',
			journal_enabled: false,
			journal_calendar_mark: false,
			check_in_calendar_mark: false
		},
		created_at: '2026-01-01T00:00:00',
		updated_at: '2026-01-01T00:00:00',
		additional_info_last_updated_at: '2026-01-01T00:00:00',
		...overrides
	};
}

function authToken(expiresAt: string, token = 'token-1'): AuthToken {
	return { token, token_type: 'bearer', expires_at: expiresAt };
}

function loginResponse(overrides: Partial<LoginResponse> = {}): LoginResponse {
	return {
		token: 'fresh-token',
		token_type: 'bearer',
		token_expires_at: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
		user: user(),
		...overrides
	};
}

/** Flushes the fire-and-forget constructor load() chain (microtasks only). */
async function flushAsync(): Promise<void> {
	for (let i = 0; i < 10; i++) {
		await Promise.resolve();
	}
}

beforeEach(() => {
	vi.clearAllMocks();
	storage.getJson.mockReturnValue(null);
	storage.destroy.mockReturnValue(undefined);
	api.post.mockResolvedValue(null);
	api.postWithStatus.mockResolvedValue({ ok: false, status: 500, data: null });
	api.postRaw.mockResolvedValue(null);
	api.get.mockResolvedValue(null);
	api.put.mockResolvedValue(null);
	api.update.mockResolvedValue(null);
	api.delete.mockResolvedValue(null);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Auth store', () => {
	it('starts logged out when nothing is stored', async () => {
		const auth = new Auth();
		await flushAsync();
		expect(auth.loggedIn).toBe(false);
		expect(auth.user).toBeNull();
		expect(auth.getToken()).toBeNull();
		expect(storage.getJson).toHaveBeenCalledWith('auth');
	});

	it('constructs its ApiService without a token', () => {
		new Auth();
		expect(api.updateAuthToken).not.toHaveBeenCalled();
	});

	describe('load from localStorage', () => {
		it('restores a valid session that does not need refreshing', async () => {
			const expiresAt = new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });
			api.get.mockResolvedValue({ data: user({ name: 'Refreshed Name' }) });

			const auth = new Auth();
			await flushAsync();

			expect(auth.loggedIn).toBe(true);
			expect(auth.getToken()).toBe('token-1');
			expect(auth.user?.name).toBe('Refreshed Name');
			// token was pushed into the ApiService
			expect(api.updateAuthToken).toHaveBeenCalledWith('token-1');
			// not within the 5-day refresh threshold
			expect(api.post).not.toHaveBeenCalled();
			// session was persisted again after the additional data load
			expect(storage.setJson).toHaveBeenCalledWith('auth', expect.objectContaining({}));
		});

		it('refreshes when the token expires within the 5-day threshold', async () => {
			const expiresAt = new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });
			api.postWithStatus.mockResolvedValue({
				ok: true,
				status: 200,
				data: { data: loginResponse({ token: 'refreshed-token' }) }
			});

			const auth = new Auth();
			await flushAsync();

			expect(api.postWithStatus).toHaveBeenCalledWith(
				expect.stringContaining('/refresh'),
				{}
			);
			expect(auth.getToken()).toBe('refreshed-token');
			expect(auth.loggedIn).toBe(true);
		});

		it('discards an expired session', async () => {
			const expiresAt = new Date(Date.now() - 1000).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });

			const auth = new Auth();
			await flushAsync();

			expect(storage.destroy).toHaveBeenCalledWith('auth');
			expect(auth.loggedIn).toBe(false);
			expect(auth.user).toBeNull();
		});

		it('ignores stored data without a token or user', async () => {
			storage.getJson.mockReturnValue({ user: null, authToken: authToken('x') });

			const auth = new Auth();
			await flushAsync();

			expect(storage.destroy).not.toHaveBeenCalled();
			expect(auth.loggedIn).toBe(false);
		});
	});

	describe('login', () => {
		it('stores the session and fetches additional user data on success', async () => {
			api.post.mockResolvedValue({ data: loginResponse() });
			api.get.mockResolvedValue({ data: user({ name: 'Loaded' }) });

			const auth = new Auth();
			const ok = await auth.login('test@solyto.app', 'secret');

			expect(ok).toBe(true);
			expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/login'), {
				email: 'test@solyto.app',
				password: 'secret',
				platform: 'web'
			});
			expect(auth.loggedIn).toBe(true);
			expect(auth.getToken()).toBe('fresh-token');
			expect(api.updateAuthToken).toHaveBeenCalledWith('fresh-token');
			expect(api.get).toHaveBeenCalled(); // loadAdditionalData
			expect(auth.user?.name).toBe('Loaded');
			expect(storage.setJson).toHaveBeenCalled();
		});

		it('returns false and keeps the store logged out on failure', async () => {
			api.post.mockResolvedValue(null);

			const auth = new Auth();
			const ok = await auth.login('test@solyto.app', 'wrong');

			expect(ok).toBe(false);
			expect(auth.loggedIn).toBe(false);
			expect(storage.setJson).not.toHaveBeenCalled();
		});
	});

	describe('refresh', () => {
		it('updates the session from the refresh response', async () => {
			api.postWithStatus.mockResolvedValue({
				ok: true,
				status: 200,
				data: { data: loginResponse({ token: 'new-session' }) }
			});

			const auth = new Auth();
			const outcome = await auth.refresh();

			expect(outcome).toBe('refreshed');
			expect(auth.getToken()).toBe('new-session');
			expect(auth.loggedIn).toBe(true);
			expect(storage.setJson).toHaveBeenCalled();
		});

		it('reports a definitive rejection on 401 without touching the session', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 401, data: null });

			const auth = new Auth();
			await expect(auth.refresh()).resolves.toBe('rejected');
		});

		it('reports a transient failure on 5xx', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 503, data: null });

			const auth = new Auth();
			await expect(auth.refresh()).resolves.toBe('transient');
		});
	});

	describe('recoverFromUnauthorized', () => {
		async function loggedInAuth(): Promise<Auth> {
			const expiresAt = new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });
			const auth = new Auth();
			await flushAsync();
			storage.getJson.mockClear();
			return auth;
		}

		it('keeps the session when the refresh fails transiently', async () => {
			const auth = await loggedInAuth();
			api.postWithStatus.mockResolvedValue({ ok: false, status: 503, data: null });
			// adoptExternalSession reads storage; return the same session so it declines.
			storage.getJson.mockReturnValue({
				user: user(),
				authToken: authToken(new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString())
			});

			await expect(auth.recoverFromUnauthorized()).resolves.toBe(false);
			expect(auth.loggedIn).toBe(true);
			expect(storage.destroy).not.toHaveBeenCalled();
		});

		it('logs out only on a definitive refresh rejection', async () => {
			const auth = await loggedInAuth();
			api.postWithStatus.mockResolvedValue({ ok: false, status: 401, data: null });
			storage.getJson.mockReturnValue(null);

			await expect(auth.recoverFromUnauthorized()).resolves.toBe(false);
			expect(auth.loggedIn).toBe(false);
			expect(storage.destroy).toHaveBeenCalledWith('auth');
		});

		it('keeps the session when the refresh request rejects (offline)', async () => {
			const auth = await loggedInAuth();
			api.postWithStatus.mockRejectedValue(new Error('offline'));
			storage.getJson.mockReturnValue(null);

			await expect(auth.recoverFromUnauthorized()).resolves.toBe(false);
			expect(auth.loggedIn).toBe(true);
			expect(storage.destroy).not.toHaveBeenCalled();
		});
	});

	describe('validateSession', () => {
		// Accessing the private resume routine directly to assert it never leaks
		// a rejected promise when the network drops mid-check.
		async function callValidateSession(auth: Auth): Promise<void> {
			await (auth as unknown as { validateSession: () => Promise<void> }).validateSession();
		}

		it('swallows a rejecting loadAdditionalData while resuming offline', async () => {
			const expiresAt = new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });
			const auth = new Auth();
			await flushAsync();

			api.get.mockRejectedValue(new Error('offline'));

			await expect(callValidateSession(auth)).resolves.toBeUndefined();
			expect(auth.loggedIn).toBe(true);
		});
	});

	describe('session expired event', () => {
		async function loggedInAuth(expiresInMs = 6 * 24 * 3600 * 1000): Promise<Auth> {
			const expiresAt = new Date(Date.now() + expiresInMs).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });
			const auth = new Auth();
			await flushAsync();
			storage.getJson.mockReturnValue(null);
			return auth;
		}

		async function callValidateSession(auth: Auth): Promise<void> {
			await (auth as unknown as { validateSession: () => Promise<void> }).validateSession();
		}

		it('fires once when 401 recovery is rejected', async () => {
			const auth = await loggedInAuth();
			const handler = vi.fn();
			auth.setSessionExpiredHandler(handler);
			api.postWithStatus.mockResolvedValue({ ok: false, status: 401, data: null });

			await auth.recoverFromUnauthorized();

			expect(handler).toHaveBeenCalledTimes(1);
			expect(auth.loggedIn).toBe(false);
		});

		it('fires once when the resume check is rejected', async () => {
			const auth = await loggedInAuth(1000);
			const handler = vi.fn();
			auth.setSessionExpiredHandler(handler);
			api.postWithStatus.mockResolvedValue({ ok: false, status: 403, data: null });

			await callValidateSession(auth);

			expect(handler).toHaveBeenCalledTimes(1);
			expect(auth.loggedIn).toBe(false);
		});

		it('does not fire on a transient refresh failure', async () => {
			const auth = await loggedInAuth(1000);
			const handler = vi.fn();
			auth.setSessionExpiredHandler(handler);
			api.postWithStatus.mockResolvedValue({ ok: false, status: 503, data: null });

			await auth.recoverFromUnauthorized();
			await callValidateSession(auth);

			expect(handler).not.toHaveBeenCalled();
		});

		it('does not fire when the refresh request rejects (offline)', async () => {
			const auth = await loggedInAuth(1000);
			const handler = vi.fn();
			auth.setSessionExpiredHandler(handler);
			api.postWithStatus.mockRejectedValue(new Error('offline'));

			await auth.recoverFromUnauthorized();
			await callValidateSession(auth);

			expect(handler).not.toHaveBeenCalled();
		});

		it('does not fire on an explicit logout', async () => {
			const auth = await loggedInAuth();
			const handler = vi.fn();
			auth.setSessionExpiredHandler(handler);

			auth.logout();

			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe('session monitor', () => {
		it('validates the session when the monitor runs its check', async () => {
			const expiresAt = new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });
			new Auth();
			await flushAsync();
			api.get.mockClear();

			monitor.check?.();
			await flushAsync();

			expect(api.get).toHaveBeenCalledTimes(1);
		});

		it('destroy() tears the monitor down', () => {
			const auth = new Auth();

			auth.destroy();

			expect(monitor.destroy).toHaveBeenCalledTimes(1);
		});
	});

	describe('logout', () => {
		it('clears the session and removes the stored auth', async () => {
			api.post.mockResolvedValue({ data: loginResponse() });
			const auth = new Auth();
			await auth.login('a@b.c', 'p');
			expect(auth.loggedIn).toBe(true);

			auth.logout();

			expect(auth.loggedIn).toBe(false);
			expect(auth.user).toBeNull();
			expect(auth.getToken()).toBeNull();
			expect(storage.destroy).toHaveBeenCalledWith('auth');
		});
	});

	describe('widget bridge', () => {
		it('issues a widget token after a password login', async () => {
			api.postRaw.mockResolvedValue({ data: loginResponse() });

			const auth = new Auth();
			await auth.login('a@b.c', 'p');

			expect(bridge.issueToken).toHaveBeenCalledTimes(1);
		});

		it('does not issue a widget token after a failed login', async () => {
			api.postRaw.mockResolvedValue({ success: false });

			const auth = new Auth();
			await auth.login('a@b.c', 'wrong');

			expect(bridge.issueToken).not.toHaveBeenCalled();
		});

		it('issues a widget token after a passkey login', async () => {
			api.postRaw.mockResolvedValue({ success: true, data: loginResponse() });

			const auth = new Auth();
			await auth.passkeyAuthenticate({ id: 'cred' });

			expect(bridge.issueToken).toHaveBeenCalledTimes(1);
		});

		it('issues a widget token after a successful refresh only', async () => {
			const auth = new Auth();
			await auth.refresh();
			expect(bridge.issueToken).not.toHaveBeenCalled();

			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: { data: loginResponse() } });
			await auth.refresh();

			expect(bridge.issueToken).toHaveBeenCalledTimes(1);
		});

		it('clears the widgets before the local session is cleared', () => {
			const auth = new Auth();

			auth.logout();

			expect(bridge.clear).toHaveBeenCalledTimes(1);
			expect(bridge.clear.mock.invocationCallOrder[0]).toBeLessThan(storage.destroy.mock.invocationCallOrder[0]);
		});

		it('destroy() tears the bridge down', () => {
			const auth = new Auth();

			auth.destroy();

			expect(bridge.destroy).toHaveBeenCalledTimes(1);
		});
	});

	describe('signOut', () => {
		async function signedInAuth(): Promise<Auth> {
			api.postRaw.mockResolvedValue({ data: loginResponse() });
			const auth = new Auth();
			await auth.login('a@b.c', 'p');
			api.postWithStatus.mockClear();
			return auth;
		}

		function expectSignedOut(auth: Auth): void {
			expect(auth.loggedIn).toBe(false);
			expect(auth.user).toBeNull();
			expect(auth.getToken()).toBeNull();
			expect(storage.destroy).toHaveBeenCalledWith('auth');
		}

		it('revokes the token on the server, then clears the session', async () => {
			const auth = await signedInAuth();
			api.postWithStatus.mockResolvedValue({ ok: true, status: 200, data: {} });

			await auth.signOut();

			expect(api.postWithStatus).toHaveBeenCalledWith(apiRoutes.auth.logout, {}, expect.any(AbortSignal));
			expectSignedOut(auth);
		});

		it.each([401, 500])('still clears the session when the server answers %d', async (status) => {
			const auth = await signedInAuth();
			api.postWithStatus.mockResolvedValue({ ok: false, status, data: null });

			await expect(auth.signOut()).resolves.toBeUndefined();

			expectSignedOut(auth);
		});

		it('still clears the session when the request fails or times out', async () => {
			const auth = await signedInAuth();
			api.postWithStatus.mockRejectedValue(new Error('offline'));

			await expect(auth.signOut()).resolves.toBeUndefined();

			expectSignedOut(auth);
		});

		it('does not report an expired session', async () => {
			const auth = await signedInAuth();
			const handler = vi.fn();
			auth.setSessionExpiredHandler(handler);
			api.postWithStatus.mockResolvedValue({ ok: false, status: 401, data: null });

			await auth.signOut();

			expect(handler).not.toHaveBeenCalled();
		});

		it('skips the server call without a token', async () => {
			const auth = new Auth();
			await flushAsync();

			await auth.signOut();

			expect(api.postWithStatus).not.toHaveBeenCalled();
			expect(auth.loggedIn).toBe(false);
		});
	});

	describe('isAdmin', () => {
		it('is true for admin and super_admin roles', () => {
			expect(new Auth().isAdmin()).toBe(false);
			const admin = new Auth();
			admin.user = user({ role: 'admin' });
			expect(admin.isAdmin()).toBe(true);
			const superAdmin = new Auth();
			superAdmin.user = user({ role: 'super_admin' });
			expect(superAdmin.isAdmin()).toBe(true);
		});
	});

	describe('register', () => {
		it('posts the register request and returns the action response', async () => {
			const response = { success: true };
			api.postRaw.mockResolvedValue(response);

			const auth = new Auth();
			const res = await auth.register({
				name: 'New',
				email: 'new@solyto.app',
				password: 'pw',
				password_confirmation: 'pw'
			});

			expect(res).toEqual(response);
			expect(api.postRaw).toHaveBeenCalledWith(expect.stringContaining('/register'), {
				name: 'New',
				email: 'new@solyto.app',
				password: 'pw',
				password_confirmation: 'pw'
			});
		});
	});

	describe('passkeys', () => {
		it('passkeyAuthenticationOptions returns the options from the API', async () => {
			const options = {
				challenge: 'c',
				rpId: 'solyto.app',
				allowCredentials: [],
				userVerification: 'preferred',
				timeout: 60000
			};
			api.post.mockResolvedValue({ data: options });

			const auth = new Auth();
			await expect(auth.passkeyAuthenticationOptions()).resolves.toEqual(options);
			expect(api.post).toHaveBeenCalledWith(
				expect.stringContaining('/auth/passkey/authenticate-options'),
				{}
			);
		});

		it('passkeyAuthenticationOptions returns null when the request fails', async () => {
			api.post.mockResolvedValue(null);
			const auth = new Auth();
			await expect(auth.passkeyAuthenticationOptions()).resolves.toBeNull();
		});

		it('passkeyAuthenticate logs the user in on success', async () => {
			api.postRaw.mockResolvedValue({
				success: true,
				data: loginResponse({ token: 'pk-token' })
			});
			api.get.mockResolvedValue({ data: user() });

			const auth = new Auth();
			await auth.passkeyAuthenticate({ id: 'cred' });

			expect(auth.loggedIn).toBe(true);
			expect(auth.getToken()).toBe('pk-token');
			expect(api.updateAuthToken).toHaveBeenCalledWith('pk-token');
		});

		it('passkeyAuthenticate throws when the response is not successful', async () => {
			api.postRaw.mockResolvedValue({ success: false, message: 'no passkey' });

			const auth = new Auth();
			await expect(auth.passkeyAuthenticate({})).rejects.toThrow('no passkey');
		});

		it('passkeyRegistrationOptions returns the options from the API', async () => {
			api.post.mockResolvedValue({ data: { challenge: 'c' } });
			const auth = new Auth();
			await expect(auth.passkeyRegistrationOptions()).resolves.toEqual({ challenge: 'c' });
		});

		it('passkeyRegister throws when registration fails', async () => {
			api.postRaw.mockResolvedValue({ success: false, message: 'failed' });
			const auth = new Auth();
			await expect(auth.passkeyRegister({}, 'Key')).rejects.toThrow('failed');
		});

		it('getPasskeys returns the list or an empty array', async () => {
			api.get.mockResolvedValue({
				data: [{ id: '1', name: 'K', created_at: '', last_used_at: null, transports: null }]
			});
			const auth = new Auth();
			await expect(auth.getPasskeys()).resolves.toHaveLength(1);

			api.get.mockResolvedValue(null);
			await expect(auth.getPasskeys()).resolves.toEqual([]);
		});

		it('deletePasskey and renamePasskey forward to the API', async () => {
			const auth = new Auth();
			await auth.deletePasskey('pk-1');
			expect(api.delete).toHaveBeenCalledWith(expect.stringContaining('/passkeys'), 'pk-1');

			await auth.renamePasskey('pk-1', 'New name');
			expect(api.update).toHaveBeenCalledWith(expect.stringContaining('/passkeys'), 'pk-1', {
				name: 'New name'
			});
		});
	});

	describe('getPublicProfile cache', () => {
		it('fetches once per user id and reuses the cached profile', async () => {
			api.get.mockResolvedValue({ data: user({ id: 'friend-1' }) });

			const auth = new Auth();
			const first = await auth.getPublicProfile('friend-1');
			const second = await auth.getPublicProfile('friend-1');

			expect(first?.id).toBe('friend-1');
			expect(second?.id).toBe('friend-1');
			expect(api.get).toHaveBeenCalledTimes(1);
		});

		it('does not cache a failed lookup', async () => {
			api.get.mockResolvedValue(null);

			const auth = new Auth();
			await expect(auth.getPublicProfile('nobody')).resolves.toBeUndefined();
			await expect(auth.getPublicProfile('nobody')).resolves.toBeUndefined();
			expect(api.get).toHaveBeenCalledTimes(2);
		});
	});

	describe('life mark settings', () => {
		async function loggedInUser(): Promise<Auth> {
			const expiresAt = new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });
			const auth = new Auth();
			await flushAsync();
			storage.getJson.mockClear();
			return auth;
		}

		it('keeps a toggled journal_enabled in the user settings', async () => {
			api.put.mockResolvedValue(true);
			const auth = await loggedInUser();

			await auth.updateJournalEnabled(true);

			expect(api.put).toHaveBeenCalledWith(
				expect.stringContaining('/settings/journal'),
				{ enabled: true }
			);
			expect(auth.user?.settings?.journal_enabled).toBe(true);
		});

		it('keeps a toggled journal_calendar_mark in the user settings', async () => {
			api.put.mockResolvedValue(true);
			const auth = await loggedInUser();

			await auth.updateJournalCalendarMark(true);

			expect(api.put).toHaveBeenCalledWith(
				expect.stringContaining('/settings/journal-calendar-mark'),
				{ enabled: true }
			);
			expect(auth.user?.settings?.journal_calendar_mark).toBe(true);
		});

		it('keeps a toggled check_in_calendar_mark in the user settings', async () => {
			api.put.mockResolvedValue(true);
			const auth = await loggedInUser();

			await auth.updateCheckInCalendarMark(true);

			expect(api.put).toHaveBeenCalledWith(
				expect.stringContaining('/settings/check-in-calendar-mark'),
				{ enabled: true }
			);
			expect(auth.user?.settings?.check_in_calendar_mark).toBe(true);
		});

		it('does not persist the flag when the API rejects the update', async () => {
			api.put.mockResolvedValue(false);
			const auth = await loggedInUser();

			const result = await auth.updateJournalEnabled(true);

			expect(result).toBe(false);
			expect(auth.user?.settings?.journal_enabled).toBe(false);
		});
	});

	describe('week start setting', () => {
		async function loggedInUser(): Promise<Auth> {
			const expiresAt = new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString();
			storage.getJson.mockReturnValue({ user: user(), authToken: authToken(expiresAt) });
			const auth = new Auth();
			await flushAsync();
			return auth;
		}

		it('falls back to Monday without a user or a stored setting', () => {
			const auth = new Auth();
			expect(auth.getWeekStart()).toBe('monday');

			const { week_start: _, ...settings } = user().settings;
			auth.user = user({ settings: settings as User['settings'] });
			expect(auth.getWeekStart()).toBe('monday');
		});

		it('returns the stored week start', () => {
			const auth = new Auth();
			auth.user = user({ settings: { ...user().settings, week_start: 'sunday' } });
			expect(auth.getWeekStart()).toBe('sunday');
		});

		it('keeps an updated week start in the user settings and persists it', async () => {
			api.put.mockResolvedValue(true);
			const auth = await loggedInUser();
			storage.setJson.mockClear();

			const result = await auth.updateWeekStart('sunday');

			expect(result).toBe(true);
			expect(api.put).toHaveBeenCalledWith(
				expect.stringContaining('/settings/week-start'),
				{ week_start: 'sunday' }
			);
			expect(auth.getWeekStart()).toBe('sunday');
			expect(storage.setJson).toHaveBeenCalled();
		});

		it('keeps the old week start when the API rejects the update', async () => {
			api.put.mockResolvedValue(false);
			const auth = await loggedInUser();

			const result = await auth.updateWeekStart('sunday');

			expect(result).toBe(false);
			expect(auth.getWeekStart()).toBe('monday');
		});
	});

	describe('preferred formats', () => {
		it('formats dates according to the user settings', () => {
			const auth = new Auth();
			expect(auth.getDateInUserPreferredFormat('2026-08-14')).toBe('14.08.2026');

			auth.user = user({ settings: { ...user().settings, date_format: 'YYYY-mm-dd' } });
			expect(auth.getDateInUserPreferredFormat('2026-08-14')).toBe('2026-08-14');
		});

		it('converts temperature to Fahrenheit when configured', () => {
			const auth = new Auth();
			auth.user = user({ settings: { ...user().settings, temperature_unit: 'f' } });
			expect(auth.getTemperatureInUserPreferredFormat(0)).toBe(32);

			auth.user = user({ settings: { ...user().settings, temperature_unit: 'c' } });
			expect(auth.getTemperatureInUserPreferredFormat(20)).toBe(20);
		});
	});
});
