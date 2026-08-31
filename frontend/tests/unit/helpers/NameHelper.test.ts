import { describe, it, expect } from 'vitest';
import { getInitials } from '$lib/helpers/NameHelper';

describe('getInitials', () => {
	it('combines first and last name initials', () => {
		expect(getInitials('John', 'Doe')).toBe('JD');
	});

	it('uppercases the result', () => {
		expect(getInitials('alice', 'wonder')).toBe('AW');
	});

	it('handles a missing first name', () => {
		expect(getInitials(null, 'Doe')).toBe('D');
	});

	it('handles a missing last name', () => {
		expect(getInitials('John', null)).toBe('J');
	});

	it('strips parenthetical suffixes from the last name', () => {
		expect(getInitials('John', 'Doe (Jr)')).toBe('JD');
	});

	it('returns an empty string when both names are missing', () => {
		expect(getInitials(null, null)).toBe('');
		expect(getInitials('', '')).toBe('');
	});
});
