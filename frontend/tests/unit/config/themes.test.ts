import { describe, it, expect } from 'vitest';
import { themes } from '$lib/config/themes';

describe('themes', () => {
	it('exposes a non-empty list of themes', () => {
		expect(themes.length).toBeGreaterThan(0);
	});

	it('defaults to the default theme first', () => {
		expect(themes[0].id).toBe('default');
		expect(themes[0].name).toBe('Default');
		expect(themes[0].supportsDarkMode).toBe(true);
	});

	it('has unique ids', () => {
		const ids = themes.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('defines all required preview fields per theme', () => {
		for (const theme of themes) {
			expect(typeof theme.previewBg).toBe('string');
			expect(typeof theme.previewSurface).toBe('string');
			expect(typeof theme.previewText).toBe('string');
			expect(typeof theme.previewAccent).toBe('string');
			expect(theme.previewBg).toMatch(/^#/);
			expect(theme.previewAccent).toMatch(/^#/);
		}
	});
});
