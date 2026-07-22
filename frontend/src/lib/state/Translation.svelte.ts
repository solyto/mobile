import { setContext, getContext } from 'svelte';
import type { LanguageFile, Language } from '$lib/types/translation';
import { en } from '$lib/i18n/en';
import { de } from '$lib/i18n/de';
import { fr } from '$lib/i18n/fr';
import { es } from '$lib/i18n/es';
import { browser } from '$app/environment';
import { type Auth, getAuth } from '$lib/state/Auth.svelte';

const SUPPORTED: Language[] = ['en', 'de', 'fr', 'es'];

export class Translation {
	locale = $state<string>('en');
	get = $state<LanguageFile>(en);
	auth: Auth = getAuth();

	loadLanguage(): void {
		const stored = this.auth?.user?.settings?.language;
		if (stored) {
			if (this.locale !== stored) this.changeLanguage(stored as Language);
			return;
		}
		if (browser) {
			const code = (navigator.language || 'en').split('-')[0];
			const lang: Language = SUPPORTED.includes(code as Language) ? (code as Language) : 'en';
			if (this.locale !== lang) this.changeLanguage(lang);
		}
	}

	changeLanguage(locale: Language): void {
		switch (locale) {
			case 'en':
			default:
				this.locale = 'en';
				this.get = en;
				break;
			case 'de':
				this.locale = 'de';
				this.get = de;
				break;
			case 'fr':
				this.locale = 'fr';
				this.get = fr;
				break;
			case 'es':
				this.locale = 'es';
				this.get = es;
				break;
		}
	}
}

const TRANSLATION_KEY = Symbol('SOLYTO_TRANSLATION');

export function setTranslation(): Translation {
	return setContext(TRANSLATION_KEY, new Translation());
}

export function getTranslation(): Translation {
	return getContext<Translation>(TRANSLATION_KEY);
}
