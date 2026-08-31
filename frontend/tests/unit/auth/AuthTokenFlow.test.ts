import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type ApiService from '$lib/services/ApiService';
import { Todos } from '$lib/state/Todos.svelte';
import { Finances } from '$lib/state/Finances.svelte';

const { testAuth, constructorTokens } = vi.hoisted(() => ({
	testAuth: { getToken: vi.fn(() => 'default-token') },
	constructorTokens: [] as (string | null)[]
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

vi.mock('$lib/services/ApiService', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/services/ApiService')>();
	const ApiServiceCtor = actual.default as new (token?: string | null) => ApiService;
	return {
		default: class extends ApiServiceCtor {
			constructor(token?: string | null) {
				super(token);
				constructorTokens.push(token ?? null);
			}
		}
	};
});

beforeEach(() => {
	constructorTokens.length = 0;
	vi.clearAllMocks();
	testAuth.getToken.mockReturnValue('default-token');
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('auth token capture at store construction', () => {
	it('passes the current auth token into the Todos ApiService', () => {
		testAuth.getToken.mockReturnValue('todo-session-token');
		new Todos();
		expect(constructorTokens).toEqual(['todo-session-token']);
	});

	it('passes the current auth token into the Finances ApiService', () => {
		testAuth.getToken.mockReturnValue('finance-session-token');
		new Finances();
		expect(constructorTokens).toEqual(['finance-session-token']);
	});

	it('captures the token as a snapshot at construction time', () => {
		testAuth.getToken.mockReturnValue('first-token');
		const todos = new Todos();
		testAuth.getToken.mockReturnValue('changed-token');
		expect(todos.apiService.authToken).toBe('first-token');
	});

	it('sends the captured token as a Bearer header on requests', async () => {
		testAuth.getToken.mockReturnValue('session-token');
		const todos = new Todos();

		const fetchMock = vi
			.fn()
			.mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: [] }) });
		vi.stubGlobal('fetch', fetchMock);

		await todos.apiService.list('/todos');

		expect(fetchMock).toHaveBeenCalledWith('/todos', {
			headers: { Authorization: 'Bearer session-token', Accept: 'application/json' }
		});
	});
});
