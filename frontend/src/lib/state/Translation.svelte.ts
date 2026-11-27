import { setContext, getContext } from 'svelte';
import type { LanguageFile, Language } from '$lib/types/translation';
import { en } from '$lib/i18n/en';
import { de } from '$lib/i18n/de';
import { fr } from '$lib/i18n/fr';
import { es } from '$lib/i18n/es';
import { it } from '$lib/i18n/it';
import { ru } from '$lib/i18n/ru';
import { browser } from '$app/environment';
import { type Auth, getAuth } from '$lib/state/Auth.svelte';

const LANGUAGE_FILES: Record<Language, LanguageFile> = { en, de, fr, es, it, ru };

function isSupported(code: string): code is Language {
	return Object.hasOwn(LANGUAGE_FILES, code);
}

export class Translation {
	locale = $state<string>('en');
	get = $state<LanguageFile>(en);
	auth: Auth;

	constructor(auth: Auth = getAuth()) {
		this.auth = auth;
	}

	loadLanguage(): void {
		const stored = this.auth?.user?.settings?.language;
		if (stored) {
			if (this.locale !== stored) this.changeLanguage(stored as Language);
			return;
		}
		if (browser) {
			const code = (navigator.language || 'en').split('-')[0];
			const lang: Language = isSupported(code) ? code : 'en';
			if (this.locale !== lang) this.changeLanguage(lang);
		}
	}

	changeLanguage(locale: Language): void {
		const supported: Language = isSupported(locale) ? locale : 'en';
		this.locale = supported;
		this.get = LANGUAGE_FILES[supported];
		if (browser) document.documentElement.lang = this.locale;
	}
}

const TRANSLATION_KEY = Symbol('SOLYTO_TRANSLATION');

export function setTranslation(): Translation {
	return setContext(TRANSLATION_KEY, new Translation());
}

export function getTranslation(): Translation {
	return getContext<Translation>(TRANSLATION_KEY);
}
