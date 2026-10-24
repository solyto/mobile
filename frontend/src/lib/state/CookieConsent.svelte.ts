import { setContext, getContext } from 'svelte';
import LocalStorageService from '$lib/services/LocalStorageService';

export class CookieConsent {
	static readonly LS_ACKNOWLEDGED_KEY: string = 'cookie_consent_acknowledged';

	acknowledged = $state<boolean>(true);
	localStorage = new LocalStorageService();

	constructor() {
		this.acknowledged = this.localStorage.getBool(CookieConsent.LS_ACKNOWLEDGED_KEY) ?? true;
	}

	acknowledge(): void {
		this.acknowledged = true;
		this.localStorage.setBool(CookieConsent.LS_ACKNOWLEDGED_KEY, this.acknowledged);
	}
}

const COOKIE_CONSENT_KEY = Symbol('SOLYTO_COOKIE_CONSENT');

export function setCookieConsent(): CookieConsent {
	return setContext(COOKIE_CONSENT_KEY, new CookieConsent());
}

export function getCookieConsent(): CookieConsent {
	return getContext<CookieConsent>(COOKIE_CONSENT_KEY);
}
