import { describe, it, expect } from 'vitest';
import {
	acceptsClientVersionHeader,
	buildVersion,
	compareVersions,
	fixedInState,
	isOlderVersion,
	parseVersion
} from '$lib/helpers/VersionHelper';

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

describe('parseVersion', () => {
	it('splits a dotted version into its three parts', () => {
		expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
	});

	it('leaves missing or non-numeric parts empty', () => {
		expect(parseVersion(null)).toEqual({ major: null, minor: null, patch: null });
		expect(parseVersion('1.2')).toEqual({ major: 1, minor: 2, patch: null });
		expect(parseVersion('v1.2.3')).toEqual({ major: null, minor: 2, patch: 3 });
	});
});

describe('buildVersion', () => {
	it('joins the parts with dots', () => {
		expect(buildVersion({ major: 1, minor: 2, patch: 3 })).toBe('1.2.3');
	});

	it('is null when every part is empty', () => {
		expect(buildVersion({ major: null, minor: null, patch: null })).toBeNull();
	});

	it('fills empty parts with zero and drops fractions and signs', () => {
		expect(buildVersion({ major: 1, minor: null, patch: null })).toBe('1.0.0');
		expect(buildVersion({ major: 1.7, minor: -2, patch: 0 })).toBe('1.0.0');
	});

	it('round-trips a full version unchanged', () => {
		expect(buildVersion(parseVersion('2.10.0'))).toBe('2.10.0');
	});
});
