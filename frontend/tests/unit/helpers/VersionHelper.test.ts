import { describe, it, expect } from 'vitest';
import {
	acceptsClientVersionHeader,
	compareVersions,
	fixedInState,
	isOlderVersion,
	isVersion,
	outdatedServerMessage
} from '$lib/helpers/VersionHelper';
import { en } from '$lib/i18n/en';
import { de } from '$lib/i18n/de';
import { es } from '$lib/i18n/es';
import { fr } from '$lib/i18n/fr';
import { it as itLocale } from '$lib/i18n/it';
import { ru } from '$lib/i18n/ru';

describe('compareVersions', () => {
	it('compares each part numerically', () => {
		expect(compareVersions('1.0.15', '1.1.0')).toBe(-1);
		expect(compareVersions('1.0.9', '1.0.15')).toBe(-1);
		expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
		expect(compareVersions('1.1.0', '1.1.0')).toBe(0);
	});

	it('treats missing parts as zero', () => {
		expect(compareVersions('1.1', '1.1.0')).toBe(0);
		expect(compareVersions('1.1', '1.1.1')).toBe(-1);
	});

	it('returns null for anything that is not a plain dotted version', () => {
		expect(compareVersions('', '1.1.0')).toBeNull();
		expect(compareVersions('1.1.0-beta', '1.1.0')).toBeNull();
		expect(compareVersions('v1.1.0', '1.1.0')).toBeNull();
	});
});

describe('isOlderVersion', () => {
	it('is true only when strictly older', () => {
		expect(isOlderVersion('1.0.15', '1.1.0')).toBe(true);
		expect(isOlderVersion('1.1.0', '1.1.0')).toBe(false);
		expect(isOlderVersion('1.2.0', '1.1.0')).toBe(false);
	});

	it('is false when a version cannot be compared', () => {
		expect(isOlderVersion('unknown', '1.1.0')).toBe(false);
	});
});

describe('acceptsClientVersionHeader', () => {
	it('accepts servers from 1.1.0 on', () => {
		expect(acceptsClientVersionHeader('1.1.0')).toBe(true);
		expect(acceptsClientVersionHeader('1.2.0')).toBe(true);
		expect(acceptsClientVersionHeader('2.0')).toBe(true);
	});

	it('rejects older, unknown and malformed versions', () => {
		expect(acceptsClientVersionHeader('1.0.15')).toBe(false);
		expect(acceptsClientVersionHeader(null)).toBe(false);
		expect(acceptsClientVersionHeader('')).toBe(false);
		expect(acceptsClientVersionHeader('1.1.0-beta')).toBe(false);
	});
});

describe('fixedInState', () => {
	it('is web on the web, whatever the client version', () => {
		expect(fixedInState(true, '1.0.0', '1.2.0')).toBe('web');
		expect(fixedInState(true, '', '1.2.0')).toBe('web');
	});

	it('is included when the native client is on or past the fix version', () => {
		expect(fixedInState(false, '1.2.0', '1.2.0')).toBe('included');
		expect(fixedInState(false, '1.10.0', '1.2.0')).toBe('included');
	});

	it('is pending when the native client is older than the fix version', () => {
		expect(fixedInState(false, '1.1.1', '1.2.0')).toBe('pending');
	});

	it('is unknown when the native client version is missing or invalid', () => {
		expect(fixedInState(false, '', '1.2.0')).toBe('unknown');
		expect(fixedInState(false, 'dev', '1.2.0')).toBe('unknown');
	});
});

describe('isVersion', () => {
	it('accepts three dotted numbers', () => {
		expect(isVersion('1.2.3')).toBe(true);
		expect(isVersion('2.10.0')).toBe(true);
	});

	it('rejects anything else', () => {
		for (const value of ['', '1', '1.2', '1.2.3.4', 'v1.2.3', '1.2.x', '1..3', ' 1.2.3']) {
			expect(isVersion(value)).toBe(false);
		}
	});
});

describe('outdatedServerMessage', () => {
	it('names the server and app version in every language', () => {
		const messages = [en, de, es, fr, itLocale, ru].map((locale) => outdatedServerMessage('1.0.15', '1.1.4', locale.update_required));

		expect(messages).toEqual([
			'Your server runs version 1.0.15, but this app is 1.1.4. Some things may not work until the server is updated.',
			'Dein Server läuft mit Version 1.0.15, diese App ist aber 1.1.4. Manches funktioniert eventuell erst, wenn der Server aktualisiert ist.',
			'Tu servidor usa la versión 1.0.15, pero esta aplicación es la 1.1.4. Puede que algunas cosas no funcionen hasta que actualices el servidor.',
			"Ton serveur utilise la version 1.0.15, mais cette application est en 1.1.4. Certaines fonctions peuvent ne pas marcher tant que le serveur n'est pas mis à jour.",
			'Il tuo server usa la versione 1.0.15, ma questa app è la 1.1.4. Alcune cose potrebbero non funzionare finché il server non viene aggiornato.',
			'На сервере установлена версия 1.0.15, а в приложении — 1.1.4. Некоторые функции могут не работать до обновления сервера.'
		]);
	});
});
