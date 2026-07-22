import { describe, it, expect } from 'vitest';
import {
	average,
	withDecimals,
	formatTimeElapsed,
	withLeadingZero,
	humanReadableNumber
} from '$lib/helpers/NumberHelper';

describe('average', () => {
	it('computes average with 2 decimal places by default', () => {
		expect(average([1, 2, 3])).toBe(2);
		expect(average([1, 2])).toBe(1.5);
		expect(average([1, 2, 4])).toBe(2.33);
	});

	it('respects custom decimal count', () => {
		expect(average([1, 2, 4], 0)).toBe(2);
		expect(average([1, 2, 4], 1)).toBe(2.3);
		expect(average([1, 2, 4], 3)).toBe(2.333);
	});
});

describe('withDecimals', () => {
	it('formats number with 2 decimals by default', () => {
		expect(withDecimals(3.14159)).toBe('3.14');
		expect(withDecimals(10)).toBe('10.00');
	});

	it('respects custom decimal count', () => {
		expect(withDecimals(3.14159, 4)).toBe('3.1416');
		expect(withDecimals(3.14159, 0)).toBe('3');
	});
});

describe('formatTimeElapsed', () => {
	it('shows seconds for values under 60', () => {
		expect(formatTimeElapsed(0)).toBe('0s');
		expect(formatTimeElapsed(45)).toBe('45s');
		expect(formatTimeElapsed(59)).toBe('59s');
	});

	it('shows minutes and seconds for values under 3600', () => {
		expect(formatTimeElapsed(60)).toBe('1m 0s');
		expect(formatTimeElapsed(90)).toBe('1m 30s');
		expect(formatTimeElapsed(3599)).toBe('59m 59s');
	});

	it('shows hours and minutes for values under 86400', () => {
		expect(formatTimeElapsed(3600)).toBe('1h 0m');
		expect(formatTimeElapsed(3661)).toBe('1h 1m');
		expect(formatTimeElapsed(7322)).toBe('2h 2m');
	});

	it('shows days and hours for values 86400 and above', () => {
		expect(formatTimeElapsed(86400)).toBe('1d 0h');
		expect(formatTimeElapsed(90000)).toBe('1d 1h');
	});
});

describe('withLeadingZero', () => {
	it('prepends zero for single-digit numbers', () => {
		expect(withLeadingZero(0)).toBe('00');
		expect(withLeadingZero(5)).toBe('05');
		expect(withLeadingZero(9)).toBe('09');
	});

	it('leaves double-digit numbers unchanged', () => {
		expect(withLeadingZero(10)).toBe('10');
		expect(withLeadingZero(99)).toBe('99');
	});
});

describe('humanReadableNumber', () => {
	it('returns plain number below 1000', () => {
		expect(humanReadableNumber(0)).toBe('0');
		expect(humanReadableNumber(999)).toBe('999');
	});

	it('abbreviates thousands with K', () => {
		expect(humanReadableNumber(1000)).toBe('1.0K');
		expect(humanReadableNumber(1500)).toBe('1.5K');
	});

	it('abbreviates millions with M', () => {
		expect(humanReadableNumber(1_000_000)).toBe('1.0M');
		expect(humanReadableNumber(2_500_000)).toBe('2.5M');
	});

	it('abbreviates billions with B', () => {
		expect(humanReadableNumber(1_000_000_000)).toBe('1.0B');
	});
});
