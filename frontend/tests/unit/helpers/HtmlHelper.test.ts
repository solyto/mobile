// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { stripHtml, hasMeaningfulDescription } from '$lib/helpers/HtmlHelper';

describe('stripHtml', () => {
	it('returns the text content of html', () => {
		expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
	});

	it('decodes entities', () => {
		expect(stripHtml('Fish &amp; Chips')).toBe('Fish & Chips');
	});
});

describe('hasMeaningfulDescription', () => {
	it('is false for an empty description', () => {
		expect(hasMeaningfulDescription('')).toBe(false);
	});

	it('is false for whitespace and empty tags only', () => {
		expect(hasMeaningfulDescription(' <p> </p> ')).toBe(false);
	});

	it('is false for a description that is only a link', () => {
		expect(hasMeaningfulDescription('<a href="https://news.ycombinator.com/item?id=1">Comments</a>')).toBe(false);
	});

	it('is true for text', () => {
		expect(hasMeaningfulDescription('<p>An article about tablets.</p>')).toBe(true);
	});

	it('is true for text containing a link', () => {
		expect(hasMeaningfulDescription('Read the <a href="#">full article</a> here.')).toBe(true);
	});

	it('is true for several links', () => {
		expect(hasMeaningfulDescription('<a href="#">Article</a> <a href="#">Comments</a>')).toBe(true);
	});
});
