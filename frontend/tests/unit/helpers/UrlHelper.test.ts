import { describe, it, expect } from 'vitest';
import { hostnameOf, safeHref } from '$lib/helpers/UrlHelper';

describe('safeHref', () => {
	it('keeps http, https and mailto URLs', () => {
		expect(safeHref('http://example.com')).toBe('http://example.com');
		expect(safeHref('https://example.com/a?b=c#d')).toBe('https://example.com/a?b=c#d');
		expect(safeHref('mailto:someone@example.com')).toBe('mailto:someone@example.com');
	});

	it('keeps same-origin paths', () => {
		expect(safeHref('/todos')).toBe('/todos');
		expect(safeHref('/todos/1?x=y')).toBe('/todos/1?x=y');
	});

	it('rejects script and data schemes', () => {
		expect(safeHref('javascript:alert(1)')).toBeUndefined();
		expect(safeHref('JavaScript:alert(1)')).toBeUndefined();
		expect(safeHref('  javascript:alert(1)')).toBeUndefined();
		expect(safeHref('data:text/html,<script>alert(1)</script>')).toBeUndefined();
		expect(safeHref('vbscript:msgbox(1)')).toBeUndefined();
	});

	it('rejects protocol-relative URLs', () => {
		expect(safeHref('//example.com')).toBeUndefined();
		expect(safeHref('/\\example.com')).toBeUndefined();
	});

	it('rejects protocol-relative URLs hidden by tabs and newlines', () => {
		expect(safeHref('/\t/evil.com')).toBeUndefined();
		expect(safeHref('/\n\\evil.com')).toBeUndefined();
		expect(safeHref('/\r/evil.com')).toBeUndefined();
		expect(safeHref('\t//evil.com')).toBeUndefined();
	});

	it('rejects script schemes hidden by tabs, newlines and control characters', () => {
		expect(safeHref('java\tscript:alert(1)')).toBeUndefined();
		expect(safeHref('java\nscript:alert(1)')).toBeUndefined();
		expect(safeHref('\u0000javascript:alert(1)')).toBeUndefined();
		expect(safeHref('\u001fjavascript:alert(1)')).toBeUndefined();
	});

	it('strips tabs, newlines and surrounding whitespace the browser would ignore', () => {
		expect(safeHref('  https://example.com  ')).toBe('https://example.com');
		expect(safeHref('/to\tdos')).toBe('/todos');
	});

	it('treats a host without a scheme as https', () => {
		expect(safeHref('example.com')).toBe('https://example.com');
		expect(safeHref('www.example.com/a?b=c#d')).toBe('https://www.example.com/a?b=c#d');
		expect(safeHref('example.com:8080/x')).toBe('https://example.com:8080/x');
		expect(safeHref(' example.com ')).toBe('https://example.com');
		expect(safeHref('münchen.de')).toBe('https://münchen.de');
	});

	it('rejects input that is not a URL', () => {
		expect(safeHref('todos/1')).toBeUndefined();
		expect(safeHref('localhost')).toBeUndefined();
		expect(safeHref('not a url')).toBeUndefined();
		expect(safeHref('example .com')).toBeUndefined();
		expect(safeHref('example.com/a b')).toBeUndefined();
		expect(safeHref('someone@example.com')).toBeUndefined();
		expect(safeHref('example.com:javascript')).toBeUndefined();
		expect(safeHref('.example.com')).toBeUndefined();
	});

	it('rejects empty input', () => {
		expect(safeHref(null)).toBeUndefined();
		expect(safeHref(undefined)).toBeUndefined();
		expect(safeHref('')).toBeUndefined();
		expect(safeHref('   ')).toBeUndefined();
		expect(safeHref('\t\n')).toBeUndefined();
	});
});

describe('hostnameOf', () => {
	it('returns the host of an absolute URL', () => {
		expect(hostnameOf('https://www.example.com/a?b=1')).toBe('www.example.com');
		expect(hostnameOf('http://localhost:5173/notes')).toBe('localhost');
	});

	it('returns null for relative paths, garbage and URLs without a host', () => {
		expect(hostnameOf('/notes/1')).toBeNull();
		expect(hostnameOf('not a url')).toBeNull();
		expect(hostnameOf('mailto:someone@example.com')).toBeNull();
	});
});
