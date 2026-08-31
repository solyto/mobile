import { describe, it, expect } from 'vitest';
import { lightenColor } from '$lib/helpers/ColorHelper';

describe('lightenColor', () => {
	it('lightens towards white by the default amount', () => {
		expect(lightenColor('#000000')).toBe('rgb(179, 179, 179)');
	});

	it('keeps white unchanged', () => {
		expect(lightenColor('#ffffff', 0.7)).toBe('rgb(255, 255, 255)');
	});

	it('lightens each channel proportionally', () => {
		expect(lightenColor('#ff0000', 0.7)).toBe('rgb(255, 179, 179)');
	});

	it('respects a custom amount', () => {
		// amount 0 returns the original color
		expect(lightenColor('#336699', 0)).toBe('rgb(51, 102, 153)');
		// amount 0.5
		expect(lightenColor('#336699', 0.5)).toBe('rgb(153, 179, 204)');
	});

	it('rounds to nearest integer', () => {
		expect(lightenColor('#010203', 0.5)).toBe('rgb(128, 129, 129)');
	});
});
