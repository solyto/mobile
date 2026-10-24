import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ApiService from '$lib/services/ApiService';
import { Todos } from '$lib/state/Todos.svelte';
import { Finances } from '$lib/state/Finances.svelte';

const { testAuth } = vi.hoisted(() => ({
	testAuth: {
		getToken: vi.fn(() => 'default-token'),
		apiService: null as unknown as ApiService
	}
}));

vi.mock('$app/state', () => ({
	page: {
		url: { pathname: '/todos', searchParams: new URL('http://localhost/todos').searchParams },
		params: {}
	}
}));

vi.mock('$lib/state/Auth.svelte', () => ({
	getAuth: () => testAuth,
	setAuth: () => testAuth
}));

beforeEach(() => {
	vi.clearAllMocks();
	testAuth.getToken.mockReturnValue('default-token');
	testAuth.apiService = new ApiService('session-token');
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('stores share the Auth ApiService instance', () => {
	it('does not construct its own ApiService but uses the shared one', () => {
		const todos = new Todos();
		expect(todos.apiService).toBe(testAuth.apiService);

		const finances = new Finances();
		expect(finances.apiService).toBe(testAuth.apiService);
	});

	it('sends whatever token the shared instance currently holds', async () => {
		const todos = new Todos();
		// A runtime refresh updates the shared instance, not just Auth.
		testAuth.apiService.updateAuthToken('refreshed-token');

		const fetchMock = vi
			.fn()
			.mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: [] }) });
		vi.stubGlobal('fetch', fetchMock);

		await todos.apiService.list('/todos');

		expect(fetchMock).toHaveBeenCalledWith('/todos', {
			headers: { Authorization: 'Bearer refreshed-token', Accept: 'application/json' }
		});
	});
});
