import { describe, it, expect } from 'vitest';
import { nl2br, markdownToHtml, truncate } from '$lib/helpers/FormatHelper';

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

describe('markdownToHtml', () => {
	it('renders a heading', () => {
		expect(markdownToHtml('# Hello')).toContain('<h1');
		expect(markdownToHtml('# Hello')).toContain('Hello');
	});

	it('renders bold text', () => {
		expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>');
	});

	it('renders inline code', () => {
		expect(markdownToHtml('`code`')).toContain('<code>code</code>');
	});

	it('renders links', () => {
		expect(markdownToHtml('[solyto](https://solyto.app)')).toContain(
			'href="https://solyto.app"'
		);
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
