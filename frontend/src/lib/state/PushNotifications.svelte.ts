import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { NativePushStatus } from '$lib/types/platform';

export class PushNotifications {
	vapidPublicKey = $state<string>('');
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async loadVapidKey(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.notifications.push.getVapidKey, null);
		if (res?.data) this.vapidPublicKey = (res.data as { public_key: string }).public_key;
	}

	async subscribe(subscription: PushSubscriptionJSON): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.notifications.push.subscribe, subscription);
		return Boolean(res);
	}

	async unsubscribe(endpoint: string): Promise<void> {
		await this.apiService.create(apiRoutes.notifications.push.unsubscribe, { endpoint });
	}

	isNative(): boolean {
		return this.auth.widgetBridge.hasNativePush();
	}

	nativeStatus(): Promise<NativePushStatus> {
		return this.auth.widgetBridge.pushStatus();
	}

	setNative(enabled: boolean): Promise<NativePushStatus> {
		return enabled ? this.auth.widgetBridge.enablePush() : this.auth.widgetBridge.disablePush();
	}
}

const PUSH_NOTIFICATIONS_KEY = Symbol('SOLYTO_PUSH_NOTIFICATIONS');

export function setPushNotifications(): PushNotifications {
	return setContext(PUSH_NOTIFICATIONS_KEY, new PushNotifications());
}

export function getPushNotifications(): PushNotifications {
	return getContext<PushNotifications>(PUSH_NOTIFICATIONS_KEY);
}
