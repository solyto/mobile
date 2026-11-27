import { describe, it, expect } from 'vitest';
import { displayHostname, formatKeywords, parseKeywords } from '$lib/helpers/FeedHelper';

describe('parseKeywords', () => {
	it('splits a comma-separated list and trims each keyword', () => {
		expect(parseKeywords('apple, pear ,plum')).toEqual(['apple', 'pear', 'plum']);
	});

	it('drops empty entries', () => {
		expect(parseKeywords('apple,, ,pear,')).toEqual(['apple', 'pear']);
	});

	it.each(['', null])('is empty for %j', (list) => {
		expect(parseKeywords(list)).toEqual([]);
	});

	it('round-trips through formatKeywords', () => {
		expect(formatKeywords(parseKeywords('apple,pear'))).toBe('apple,pear');
	});
});

describe('formatKeywords', () => {
	it('joins the keywords with commas', () => {
		expect(formatKeywords(['apple', 'pear'])).toBe('apple,pear');
	});

	it('is an empty string for no keywords', () => {
		expect(formatKeywords([])).toBe('');
	});
});

describe('displayHostname', () => {
	it('shows the host without www', () => {
		expect(displayHostname('https://www.example.com/rss?x=1')).toBe('example.com');
	});

	it('keeps other subdomains', () => {
		expect(displayHostname('https://blog.example.com/feed')).toBe('blog.example.com');
	});

	it('falls back to the input when it is not a URL', () => {
		expect(displayHostname('not a url')).toBe('not a url');
	});
});
