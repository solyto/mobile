import { describe, it, expect } from 'vitest';
import {
	nl2br,
	pluralize,
	truncate,
	formatFileSize,
	getFileExtension
} from '$lib/helpers/FormatHelper';

describe('nl2br', () => {
	it('replaces newlines with <br>', () => {
		expect(nl2br('line1\nline2')).toBe('line1<br>line2');
	});

	it('handles multiple newlines', () => {
		expect(nl2br('a\nb\nc')).toBe('a<br>b<br>c');
	});

	it('leaves text without newlines unchanged', () => {
		expect(nl2br('hello')).toBe('hello');
	});
});

describe('pluralize', () => {
	it('uses the singular for exactly one', () => {
		expect(pluralize(1, 'one feed', '{n} feeds')).toBe('one feed');
	});

	it('puts the count into the plural otherwise', () => {
		expect(pluralize(0, 'one feed', '{n} feeds')).toBe('0 feeds');
		expect(pluralize(12, 'one feed', '{n} feeds')).toBe('12 feeds');
	});
});

describe('truncate', () => {
	it('returns short text unchanged', () => {
		expect(truncate('hello', 10)).toBe('hello');
	});

	it('truncates long text and appends "..."', () => {
		expect(truncate('hello world', 5)).toBe('hello...');
	});

	it('leaves text at the exact boundary length unchanged', () => {
		expect(truncate('hello', 5)).toBe('hello');
	});

	it('does not put the ellipsis on its own line after a trailing newline', () => {
		expect(truncate('line1\nline2\nline3', 6)).toBe('line1...');
	});

	it('trims trailing whitespace and newlines before the ellipsis', () => {
		expect(truncate('abc\ndef  \n\n', 4)).toBe('abc...');
	});

	it('preserves newlines inside the truncated text', () => {
		expect(truncate('a\nb\nc\nd\ne', 4)).toBe('a\nb...');
	});

	it('returns empty string unchanged', () => {
		expect(truncate('', 10)).toBe('');
	});
});

describe('formatFileSize', () => {
	it('shows kilobytes below one megabyte', () => {
		expect(formatFileSize(1536, 'en')).toBe('1.5 kB');
	});

	it('shows megabytes from one megabyte', () => {
		expect(formatFileSize(10 * 1024 * 1024, 'en')).toBe('10 MB');
	});

	it('uses the locale', () => {
		expect(formatFileSize(1536, 'de')).toBe('1,5 kB');
	});
});

describe('getFileExtension', () => {
	it('returns the lowercased extension', () => {
		expect(getFileExtension('Report.Final.PDF')).toBe('pdf');
	});

	it('is empty without an extension or for a dotfile', () => {
		expect(getFileExtension('README')).toBe('');
		expect(getFileExtension('.env')).toBe('');
	});
});
