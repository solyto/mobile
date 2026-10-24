import { describe, it, expect } from 'vitest';
import { API_FAVICON_URL } from '$lib/config/apiRoutes';
import { canReduceImage, getReducedSize, grabFaviconFromUrl, shouldReduceImage } from '$lib/helpers/ImageHelper';

const MB = 1024 * 1024;

describe('canReduceImage', () => {
	it('allows photos', () => {
		expect(canReduceImage('image/jpeg')).toBe(true);
		expect(canReduceImage('image/webp')).toBe(true);
	});

	it('keeps screenshots and animations exact', () => {
		expect(canReduceImage('image/png')).toBe(false);
		expect(canReduceImage('image/gif')).toBe(false);
	});
});

describe('shouldReduceImage', () => {
	it('suggests reducing a large camera photo', () => {
		expect(shouldReduceImage('image/jpeg', 6 * MB, 4000, 3000)).toBe(true);
	});

	it('suggests reducing a small file with a large resolution', () => {
		expect(shouldReduceImage('image/jpeg', MB, 4000, 3000)).toBe(true);
	});

	it('suggests reducing a large file with a moderate resolution', () => {
		expect(shouldReduceImage('image/webp', 3 * MB, 2000, 1500)).toBe(true);
	});

	it('leaves small images alone', () => {
		expect(shouldReduceImage('image/jpeg', MB, 1920, 1080)).toBe(false);
	});

	it('never suggests reducing formats it cannot reduce', () => {
		expect(shouldReduceImage('image/png', 6 * MB, 4000, 3000)).toBe(false);
	});
});

describe('getReducedSize', () => {
	it('scales the longer side to 2048 and keeps the aspect ratio', () => {
		expect(getReducedSize(4000, 3000)).toEqual({ width: 2048, height: 1536 });
	});

	it('handles portrait images', () => {
		expect(getReducedSize(3000, 4000)).toEqual({ width: 1536, height: 2048 });
	});

	it('never scales up', () => {
		expect(getReducedSize(1200, 800)).toEqual({ width: 1200, height: 800 });
	});
});

describe('grabFaviconFromUrl', () => {
	it('points at the API favicon proxy', () => {
		expect(grabFaviconFromUrl('https://github.com/solyto')).toBe(`${API_FAVICON_URL}/github.com.ico`);
	});

	it('strips a leading www', () => {
		expect(grabFaviconFromUrl('https://www.example.com/feed')).toBe(`${API_FAVICON_URL}/example.com.ico`);
	});

	it('keeps www inside a hostname', () => {
		expect(grabFaviconFromUrl('https://news.www.example.com')).toBe(`${API_FAVICON_URL}/news.www.example.com.ico`);
	});

	it('returns an empty string for invalid urls', () => {
		expect(grabFaviconFromUrl('not a url')).toBe('');
	});
});
