import { browser } from '$app/environment';

export default class LocalStorageService {
	get(key: string): string | null {
		if (!browser) return null;

		return localStorage.getItem(key);
	}

	set(key: string, value: string): void {
		if (!browser) return;

		localStorage.setItem(key, value);
	}

	setJson(key: string, value: unknown): void {
		if (!browser) return;

		localStorage.setItem(key, JSON.stringify(value));
	}

	getJson(key: string): unknown | null {
		if (!browser) return null;

		const item = localStorage.getItem(key);

		if (!item) return null;

		try {
			return JSON.parse(item);
		} catch {
			return null;
		}
	}

	setNumber(key: string, value: number): void {
		if (!browser) return;

		localStorage.setItem(key, value.toString());
	}

	getNumber(key: string): number | null {
		if (!browser) return null;

		const item = localStorage.getItem(key);

		if (!item) return null;

		return Number(item);
	}

	setBool(key: string, value: boolean): void {
		if (!browser) return;

		localStorage.setItem(key, value ? '1' : '0');
	}

	getBool(key: string): boolean | null {
		if (!browser) return null;

		const item = localStorage.getItem(key);

		if (!item) return null;

		return item === '1';
	}

	destroy(key: string): void {
		if (!browser) return;

		localStorage.removeItem(key);
	}
}