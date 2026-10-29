import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WidgetBridge } from '$lib/state/WidgetBridge';
import type ApiService from '$lib/services/ApiService';
import type LocalStorageService from '$lib/services/LocalStorageService';

const { platform, navigation } = vi.hoisted(() => ({
	platform: { mobile: true, apiUrl: 'https://api.solyto.app' },
	navigation: { goto: vi.fn() }
}));

vi.mock('$app/environment', () => ({ browser: true, dev: false }));
vi.mock('$app/navigation', () => ({ goto: navigation.goto }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));
vi.mock('$lib/config/platform', () => ({
	get IS_MOBILE() {
		return platform.mobile;
	},
	getApiUrl: () => platform.apiUrl
}));

const TODO_ID = '3f2b8c1e-4d5a-4b6c-8e7f-9a0b1c2d3e4f';

let native: { postMessage: ReturnType<typeof vi.fn>; onmessage: ((event: { data: unknown }) => void) | null };
let api: { postWithStatus: ReturnType<typeof vi.fn>; storedServerVersion: ReturnType<typeof vi.fn> };
let stored: Record<string, unknown>;
let storage: { getJson: (key: string) => unknown; setJson: (key: string, value: unknown) => void };
let loggedIn: boolean;

function createBridge(): WidgetBridge {
	return new WidgetBridge(
		api as unknown as ApiService,
		() => loggedIn,
		storage as unknown as LocalStorageService
	);
}

function sent(): unknown[] {
	return native.postMessage.mock.calls.map(([message]) => JSON.parse(message as string));
}

function receive(message: unknown): void {
	native.onmessage?.({ data: typeof message === 'string' ? message : JSON.stringify(message) });
}

function tokenResponse() {
	return {
		ok: true,
		status: 201,
		data: { data: { token: 'widget-token', token_type: 'Bearer', token_expires_at: '2026-12-01T00:00:00Z' } }
	};
}

async function flushAsync(): Promise<void> {
	for (let i = 0; i < 10; i++) await Promise.resolve();
}

beforeEach(() => {
	platform.mobile = true;
	platform.apiUrl = 'https://api.solyto.app';
	navigation.goto.mockReset();
	native = { postMessage: vi.fn(), onmessage: null };
	vi.stubGlobal('window', { SolytoWidgets: native });
	api = { postWithStatus: vi.fn().mockResolvedValue(tokenResponse()), storedServerVersion: vi.fn().mockReturnValue('1.2.0') };
	stored = {};
	storage = {
		getJson: (key) => stored[key] ?? null,
		setJson: (key, value) => { stored[key] = value; }
	};
	loggedIn = true;
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('WidgetBridge', () => {
	describe('inert', () => {
		it('does nothing without the native bridge object', async () => {
			vi.stubGlobal('window', {});
			const bridge = createBridge();

			bridge.start();
			bridge.clear();
			await bridge.issueToken();

			expect(api.postWithStatus).not.toHaveBeenCalled();
		});

		it('does nothing on web and desktop', async () => {
			platform.mobile = false;
			const bridge = createBridge();

			bridge.start();
			bridge.clear();
			bridge.notifyChanged();
			await bridge.issueToken();

			expect(native.postMessage).not.toHaveBeenCalled();
			expect(native.onmessage).toBeNull();
			expect(api.postWithStatus).not.toHaveBeenCalled();
		});
	});

	describe('start', () => {
		it('sends ready once and listens for native messages', () => {
			const bridge = createBridge();

			bridge.start();
			bridge.start();

			expect(sent()).toEqual([{ type: 'ready' }]);
			expect(native.onmessage).toEqual(expect.any(Function));
		});

		it('destroy() stops listening', () => {
			const bridge = createBridge();
			bridge.start();

			bridge.destroy();

			expect(native.onmessage).toBeNull();
		});
	});

	describe('status', () => {
		it('issues a token when native needs one and the user is logged in', async () => {
			createBridge().start();

			receive({ type: 'status', needsToken: true });
			await flushAsync();

			expect(sent()).toContainEqual({
				type: 'setToken',
				token: 'widget-token',
				expiresAt: '2026-12-01T00:00:00Z',
				apiUrl: 'https://api.solyto.app'
			});
		});

		it('does not issue a token when native has one', async () => {
			createBridge().start();

			receive({ type: 'status', needsToken: false });
			await flushAsync();

			expect(api.postWithStatus).not.toHaveBeenCalled();
		});

		it('does not issue a token when logged out', async () => {
			loggedIn = false;
			createBridge().start();

			receive({ type: 'status', needsToken: true });
			await flushAsync();

			expect(api.postWithStatus).not.toHaveBeenCalled();
		});

		it('ignores malformed messages', async () => {
			createBridge().start();

			receive('not json');
			receive({ type: 'status', needsToken: 'yes' });
			receive({ type: 'unknown' });
			native.onmessage?.({ data: { type: 'status', needsToken: true } });
			await flushAsync();

			expect(api.postWithStatus).not.toHaveBeenCalled();
			expect(navigation.goto).not.toHaveBeenCalled();
		});
	});

	describe('issueToken', () => {
		it('posts to the widget-token endpoint and sends the token', async () => {
			await createBridge().issueToken();

			expect(api.postWithStatus).toHaveBeenCalledWith(expect.stringContaining('/auth/widget-token'), {});
			expect(sent()).toEqual([
				{ type: 'setToken', token: 'widget-token', expiresAt: '2026-12-01T00:00:00Z', apiUrl: 'https://api.solyto.app' }
			]);
		});

		it('remembers a 404 and does not retry for the same server', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 404, data: null });
			const bridge = createBridge();

			await bridge.issueToken();
			await bridge.issueToken();

			expect(api.postWithStatus).toHaveBeenCalledTimes(1);
		});

		it('tells native the server has no widgets, on the 404 and on later triggers', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 404, data: null });
			const bridge = createBridge();

			await bridge.issueToken();
			await bridge.issueToken();

			expect(sent()).toEqual([{ type: 'unsupported' }, { type: 'unsupported' }]);
		});

		it('does not report unsupported for other failures', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 500, data: null });

			await createBridge().issueToken();

			expect(native.postMessage).not.toHaveBeenCalled();
		});

		it('retries after a 404 once the server version changes', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 404, data: null });
			const bridge = createBridge();
			await bridge.issueToken();

			api.storedServerVersion.mockReturnValue('1.3.0');
			await bridge.issueToken();

			expect(api.postWithStatus).toHaveBeenCalledTimes(2);
		});

		it('retries after a 404 once the API URL changes', async () => {
			api.postWithStatus.mockResolvedValue({ ok: false, status: 404, data: null });
			const bridge = createBridge();
			await bridge.issueToken();

			platform.apiUrl = 'https://api.example.org';
			await bridge.issueToken();

			expect(api.postWithStatus).toHaveBeenCalledTimes(2);
		});

		it('retries on the next trigger after other failures', async () => {
			api.postWithStatus
				.mockResolvedValueOnce({ ok: false, status: 500, data: null })
				.mockRejectedValueOnce(new Error('Too many requests'))
				.mockResolvedValueOnce(tokenResponse());
			const bridge = createBridge();

			await bridge.issueToken();
			await bridge.issueToken();
			await bridge.issueToken();

			expect(api.postWithStatus).toHaveBeenCalledTimes(3);
			expect(sent()).toHaveLength(1);
		});
	});

	describe('clear', () => {
		it('sends clear and drops a pending refresh', () => {
			vi.useFakeTimers();
			const bridge = createBridge();
			bridge.notifyChanged();

			bridge.clear();
			vi.advanceTimersByTime(5000);

			expect(sent()).toEqual([{ type: 'clear' }]);
		});
	});

	describe('notifyChanged', () => {
		it('sends one refresh after changes settle', () => {
			vi.useFakeTimers();
			const bridge = createBridge();

			bridge.notifyChanged();
			vi.advanceTimersByTime(1500);
			bridge.notifyChanged();
			vi.advanceTimersByTime(1500);
			expect(native.postMessage).not.toHaveBeenCalled();

			vi.advanceTimersByTime(500);
			expect(sent()).toEqual([{ type: 'refresh' }]);
		});
	});

	describe('navigate', () => {
		it('opens a todo by id', () => {
			createBridge().start();

			receive({ type: 'navigate', key: 'todo', id: TODO_ID });

			expect(navigation.goto).toHaveBeenCalledWith(`/todos?todo=${TODO_ID}`);
		});

		it('opens the calendar', () => {
			createBridge().start();

			receive({ type: 'navigate', key: 'calendar' });

			expect(navigation.goto).toHaveBeenCalledWith('/calendar');
		});

		it('ignores unknown keys and invalid ids', () => {
			createBridge().start();

			receive({ type: 'navigate', key: 'notes' });
			receive({ type: 'navigate', key: 'todo', id: 'not-a-uuid' });
			receive({ type: 'navigate', key: 'todo' });
			receive({ type: 'navigate', key: 'todo', id: 42 });

			expect(navigation.goto).not.toHaveBeenCalled();
		});

		it('does nothing when logged out', () => {
			loggedIn = false;
			createBridge().start();

			receive({ type: 'navigate', key: 'calendar' });

			expect(navigation.goto).not.toHaveBeenCalled();
		});
	});
});
