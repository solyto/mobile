import { describe, it, expect } from 'vitest';
import { acceptsClientVersionHeader, compareVersions, isOlderVersion } from '$lib/helpers/VersionHelper';

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
