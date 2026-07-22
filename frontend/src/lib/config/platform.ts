import { env } from '$env/dynamic/public';
import { browser, dev } from '$app/environment';
import type { Platform } from '$lib/types/platform';
import LocalStorageService from '$lib/services/LocalStorageService';

const LS_CUSTOM_API_URL_KEY = 'custom_api_url';
export const PLATFORM: Platform = (() => {
	if (env.PUBLIC_DESKTOP) return 'desktop';
	if (env.PUBLIC_MOBILE) return 'mobile';
	return 'web';
})();

export const IS_NATIVE = PLATFORM !== 'web';

export function getApiUrl(): string {
	return PLATFORM === 'web' ? getPwaApiUrl() : getCustomApiUrl();
}

export function getPwaApiUrl(): string {
	if (dev) return 'http://localhost:8000';
	if (env.PUBLIC_API_URL) return env.PUBLIC_API_URL;
	if (!browser) return 'https://api.solyto.app';

	const domainMap: Record<string, string> = {
		'app.solyto.de': 'https://api.solyto.de',
		'my.solyto.app': 'https://api.solyto.app'
	};

	return domainMap[window.location.hostname] || 'https://api.solyto.app';
}

export function getCustomApiUrl(): string {
	const ls = new LocalStorageService();
	return ls.get(LS_CUSTOM_API_URL_KEY) || getPwaApiUrl();
}

export function setCustomApiUrl(url: string) {
	const ls = new LocalStorageService();
	ls.set(LS_CUSTOM_API_URL_KEY, url);
}

export function dropCustomApiUrl() {
	const ls = new LocalStorageService();
	ls.destroy(LS_CUSTOM_API_URL_KEY);
}