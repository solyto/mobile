import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { NotificationSettings } from '$lib/types/notification_settings';

export class NotificationPreferences {
	settings = $state<NotificationSettings | null>(null);
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async load(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.notifications.settings.get, null);
		if (res?.data) this.settings = res.data as NotificationSettings;
	}

	async update(key: keyof NotificationSettings, value: boolean): Promise<boolean> {
		if (!this.settings) return false;

		const ok = await this.apiService.put(apiRoutes.notifications.settings.update, { [key]: value });
		if (ok) this.settings = { ...this.settings, [key]: value };
		return ok;
	}
}

const NOTIFICATION_PREFERENCES_KEY = Symbol('SOLYTO_NOTIFICATION_PREFERENCES');

export function setNotificationPreferences(): NotificationPreferences {
	return setContext(NOTIFICATION_PREFERENCES_KEY, new NotificationPreferences());
}

export function getNotificationPreferences(): NotificationPreferences {
	return getContext<NotificationPreferences>(NOTIFICATION_PREFERENCES_KEY);
}
