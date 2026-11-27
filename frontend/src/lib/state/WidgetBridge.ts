import type {
	NativePushPermission,
	NativePushStatus,
	PushRequestType,
	SolytoWidgetsBridge,
	WidgetAppMessage,
	WidgetNativeMessage
} from '$lib/types/platform';
import type { WidgetTokenResponse } from '$lib/types/auth';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { validate as isUuid } from 'uuid';
import { IS_MOBILE, getApiUrl } from '$lib/config/platform';
import { apiRoutes } from '$lib/config/apiRoutes';
import { urls } from '$lib/config/urls';
import ApiService from '$lib/services/ApiService';
import LocalStorageService from '$lib/services/LocalStorageService';

const REFRESH_DEBOUNCE_MS = 2000;
// Long enough for the user to answer Android's permission dialog.
const PUSH_REQUEST_TIMEOUT_MS = 60000;

interface UnsupportedServer {
	apiUrl: string;
	version: string | null;
}

export class WidgetBridge {
	static readonly LS_UNSUPPORTED_SERVER_KEY: string = 'widget_token_unsupported';

	private apiService: ApiService;
	private isLoggedIn: () => boolean;
	private localStorage: LocalStorageService;
	private refreshTimer: ReturnType<typeof setTimeout> | null = null;
	private started = false;
	private listening = false;
	// Waiting push requests by id; native echoes the id in its pushStatus answer.
	private pushRequests = new Map<string, (status: NativePushStatus) => void>();
	private nextPushRequestId = 1;

	constructor(
		apiService: ApiService,
		isLoggedIn: () => boolean,
		localStorage: LocalStorageService = new LocalStorageService()
	) {
		this.apiService = apiService;
		this.isLoggedIn = isLoggedIn;
		this.localStorage = localStorage;
	}

	start(): void {
		const bridge = this.bridge();
		if (!bridge || this.started) return;

		this.started = true;
		this.listen(bridge);
		this.post({ type: 'ready' });
	}

	async issueToken(): Promise<void> {
		if (!this.bridge()) return;

		// Native only learns this from us: without a token it never fetches itself.
		if (this.serverHasNoWidgets()) {
			this.post({ type: 'unsupported' });
			return;
		}

		try {
			const res = await this.apiService.postWithStatus(apiRoutes.auth.widgetToken, {});

			if (!res.ok) {
				if (res.status === 404) {
					this.rememberServerHasNoWidgets();
					this.post({ type: 'unsupported' });
				}
				return;
			}

			const data = res.data.data as WidgetTokenResponse;
			this.post({ type: 'setToken', token: data.token, expiresAt: data.token_expires_at, apiUrl: getApiUrl() });
		} catch {
			// Offline or throttled: the next trigger tries again.
		}
	}

	clear(): void {
		this.cancelRefresh();
		this.post({ type: 'clear' });
	}

	notifyChanged(): void {
		if (!this.bridge()) return;

		this.cancelRefresh();
		this.refreshTimer = setTimeout(() => {
			this.refreshTimer = null;
			this.post({ type: 'refresh' });
		}, REFRESH_DEBOUNCE_MS);
	}

	hasNativePush(): boolean {
		return this.bridge() !== null;
	}

	pushStatus(): Promise<NativePushStatus> {
		return this.askPush('getPushStatus');
	}

	enablePush(): Promise<NativePushStatus> {
		return this.askPush('enablePush');
	}

	disablePush(): Promise<NativePushStatus> {
		return this.askPush('disablePush');
	}

	destroy(): void {
		this.cancelRefresh();

		const bridge = this.bridge();
		if (bridge && this.listening) bridge.onmessage = null;
		this.listening = false;
		this.started = false;
	}

	private listen(bridge: SolytoWidgetsBridge): void {
		if (this.listening) return;

		this.listening = true;
		bridge.onmessage = (event) => this.receive(event.data);
	}

	private bridge(): SolytoWidgetsBridge | null {
		if (!IS_MOBILE || !browser) return null;
		return window.SolytoWidgets ?? null;
	}

	private post(message: WidgetAppMessage): void {
		this.bridge()?.postMessage(JSON.stringify(message));
	}

	// Native answers each push request with one pushStatus message carrying the request's id;
	// an answer after the timeout is ignored. Settings can ask before start() (a reload on the
	// settings page), so the answer needs the listener already.
	private askPush(type: PushRequestType): Promise<NativePushStatus> {
		const bridge = this.bridge();
		if (bridge) this.listen(bridge);

		const id = String(this.nextPushRequestId++);
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pushRequests.delete(id);
				reject(new Error(`No answer to ${type}`));
			}, PUSH_REQUEST_TIMEOUT_MS);

			this.pushRequests.set(id, (status) => {
				clearTimeout(timeout);
				this.pushRequests.delete(id);
				resolve(status);
			});
			this.post({ type, id });
		});
	}

	private receive(data: unknown): void {
		const message = this.parse(data);
		if (!message) return;

		if (message.type === 'status') {
			if (message.needsToken && this.isLoggedIn()) void this.issueToken();
			return;
		}

		if (message.type === 'pushStatus') {
			this.pushRequests.get(message.id)?.({ enabled: message.enabled, permission: message.permission });
			return;
		}

		if (message.type === 'open') {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- a notification's link, checked by isAppPath()
			if (this.isLoggedIn()) void goto(message.path);
			return;
		}

		this.navigate(message.key, message.id);
	}

	private parse(data: unknown): WidgetNativeMessage | null {
		if (typeof data !== 'string') return null;

		let message: unknown;
		try {
			message = JSON.parse(data);
		} catch {
			return null;
		}
		if (typeof message !== 'object' || message === null) return null;

		const { type, needsToken, key, id, enabled, permission, path } = message as Record<string, unknown>;

		if (type === 'status' && typeof needsToken === 'boolean') return { type, needsToken };
		const isPushStatus = type === 'pushStatus' && typeof id === 'string' && typeof enabled === 'boolean' && isPushPermission(permission);
		if (isPushStatus) return { type, id, enabled, permission };
		if (type === 'open' && typeof path === 'string' && isAppPath(path)) return { type, path };
		const isNavigation = type === 'navigate' && typeof key === 'string' && (id === undefined || typeof id === 'string');
		if (isNavigation) return { type, key, id };

		return null;
	}

	private navigate(key: string, id: string | undefined): void {
		if (!this.isLoggedIn()) return;

		if (key === 'todo' && id !== undefined && isUuid(id)) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() takes no query string
			void goto(`${resolve(urls.todos)}?todo=${id}`);
		} else if (key === 'calendar') {
			void goto(resolve(urls.calendar));
		} else if (key === 'check_in') {
			void goto(resolve(urls.checkIn));
		} else if (key === 'time_tracking') {
			void goto(resolve(urls.timeTracking));
		} else if (key === 'time_tracking_project' && id !== undefined && isUuid(id)) {
			void goto(resolve(urls.timeTrackingProject, { id }));
		}
	}

	private cancelRefresh(): void {
		if (this.refreshTimer === null) return;

		clearTimeout(this.refreshTimer);
		this.refreshTimer = null;
	}

	private serverHasNoWidgets(): boolean {
		const stored = this.localStorage.getJson(WidgetBridge.LS_UNSUPPORTED_SERVER_KEY) as Partial<UnsupportedServer> | null;
		return stored?.apiUrl === getApiUrl() && stored.version === this.apiService.storedServerVersion();
	}

	private rememberServerHasNoWidgets(): void {
		const stored: UnsupportedServer = { apiUrl: getApiUrl(), version: this.apiService.storedServerVersion() };
		this.localStorage.setJson(WidgetBridge.LS_UNSUPPORTED_SERVER_KEY, stored);
	}
}

function isPushPermission(value: unknown): value is NativePushPermission {
	return value === 'granted' || value === 'denied' || value === 'prompt';
}

// Only pages of this app: another site, a scheme, "//host" or "/\host" would leave the app's origin.
function isAppPath(value: string): boolean {
	const origin = 'http://app.invalid';
	return value.startsWith('/') && new URL(value, origin).origin === origin;
}
