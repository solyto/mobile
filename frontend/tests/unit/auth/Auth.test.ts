import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Auth } from '$lib/state/Auth.svelte';
import type { User, AuthToken, LoginResponse } from '$lib/types/auth';

// The Auth module itself must NOT be mocked — only its service dependencies.

const { api, storage } = vi.hoisted(() => {
	const api = {
		post: vi.fn(),
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
	return { api, storage };
});

vi.mock('$lib/services/ApiService', () => ({
	default: class FakeApi {
		post = api.post;
		postRaw = api.postRaw;
		get = api.get;
		put = api.put;
		update = api.update;
		delete = api.delete;
		postFormData = api.postFormData;
		updateAuthToken = api.updateAuthToken;
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
			widgets: '',
			ai_enabled: false,
			navigation: '',
			openai_api_key: null,
			first_visit: true,
			temperature_unit: 'c'
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
			api.post.mockResolvedValue({ data: loginResponse({ token: 'refreshed-token' }) });

			const auth = new Auth();
			await flushAsync();

			expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/refresh'), {});
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
			api.post.mockResolvedValue({ data: loginResponse({ token: 'new-session' }) });

			const auth = new Auth();
			const ok = await auth.refresh();

			expect(ok).toBe(true);
			expect(auth.getToken()).toBe('new-session');
			expect(auth.loggedIn).toBe(true);
			expect(storage.setJson).toHaveBeenCalled();
		});

		it('reports failure when the refresh request fails', async () => {
			api.post.mockResolvedValue(null);

			const auth = new Auth();
			await expect(auth.refresh()).resolves.toBe(false);
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
