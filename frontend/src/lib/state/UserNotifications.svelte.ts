import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { UserNotification } from '$lib/types/user_notification';

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export class UserNotifications {
	notifications = $state<UserNotification[]>([]);
	loaded = $state<boolean>(false);
	auth = getAuth();
	apiService: ApiService;
	private pollInterval: ReturnType<typeof setInterval> | null = null;
	private visibilityHandler: (() => void) | null = null;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		await this.fetch();
		this.startPolling();

		this.visibilityHandler = () => {
			if (document.hidden) {
				this.stopPolling();
			} else {
				this.fetch();
				this.startPolling();
			}
		};

		document.addEventListener('visibilitychange', this.visibilityHandler);
	}

	private startPolling(): void {
		this.stopPolling();
		this.pollInterval = setInterval(() => this.fetch(), POLL_INTERVAL_MS);
	}

	private async fetch(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.notifications.list);
		if (res) {
			this.notifications = res.data as UserNotification[];
			this.loaded = true;
		}
	}

	destroy(): void {
		this.stopPolling();
		if (this.visibilityHandler) {
			document.removeEventListener('visibilitychange', this.visibilityHandler);
			this.visibilityHandler = null;
		}
	}

	private stopPolling(): void {
		if (this.pollInterval !== null) {
			clearInterval(this.pollInterval);
			this.pollInterval = null;
		}
	}

	getUnread(): UserNotification[] {
		return this.notifications.filter((n) => !n.read_at);
	}

	async markRead(notification: UserNotification): Promise<void> {
		await this.apiService.update(apiRoutes.notifications.markRead, notification.id, {});
	}

	async markAllRead(): Promise<void> {
		await this.apiService.create(apiRoutes.notifications.markAllRead, {});
		this.notifications = this.notifications.map((n) => ({
			...n,
			read_at: n.read_at ?? new Date().toISOString()
		}));
	}
}

const USER_NOTIFICATIONS_KEY = Symbol('SOLYTO_USER_NOTIFICATIONS');

export function setUserNotifications(): UserNotifications {
	return setContext(USER_NOTIFICATIONS_KEY, new UserNotifications());
}

export function getUserNotifications(): UserNotifications {
	return getContext<UserNotifications>(USER_NOTIFICATIONS_KEY);
}
