import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LocalStorageService from '$lib/services/LocalStorageService';

const store = new Map<string, string>();

vi.mock('$app/environment', () => ({ browser: true, dev: true }));

beforeEach(() => {
	store.clear();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => store.set(key, value),
		removeItem: (key: string) => store.delete(key),
		clear: () => store.clear()
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const service = new LocalStorageService();

describe('get/set', () => {
	it('round-trips string values', () => {
		service.set('key', 'value');
		expect(service.get('key')).toBe('value');
	});

	it('returns null for missing keys', () => {
		expect(service.get('missing')).toBeNull();
	});

	it('overwrites existing values', () => {
		service.set('key', 'one');
		service.set('key', 'two');
		expect(service.get('key')).toBe('two');
	});
});

describe('getJson/setJson', () => {
	it('round-trips objects', () => {
		service.setJson('obj', { a: 1, b: [2, 3] });
		expect(service.getJson('obj')).toEqual({ a: 1, b: [2, 3] });
	});

	it('returns null for invalid JSON', () => {
		store.set('bad', '{not json');
		expect(service.getJson('bad')).toBeNull();
	});

	it('returns null for missing keys', () => {
		expect(service.getJson('missing')).toBeNull();
	});
});

describe('getNumber/setNumber', () => {
	it('round-trips numbers', () => {
		service.setNumber('n', 42);
		expect(service.getNumber('n')).toBe(42);
	});

	it('returns null for missing keys', () => {
		expect(service.getNumber('missing')).toBeNull();
	});
});

describe('getBool/setBool', () => {
	it('stores booleans as 1/0', () => {
		service.setBool('on', true);
		service.setBool('off', false);
		expect(service.getBool('on')).toBe(true);
		expect(service.getBool('off')).toBe(false);
	});

	it('returns null for missing keys', () => {
		expect(service.getBool('missing')).toBeNull();
	});
});

describe('destroy', () => {
	it('removes the key', () => {
		service.set('key', 'value');
		service.destroy('key');
		expect(service.get('key')).toBeNull();
	});
});
