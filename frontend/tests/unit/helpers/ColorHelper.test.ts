import { describe, it, expect } from 'vitest';
import {
	withAlpha,
	lightenColor,
	isLightColor,
	getReadableTextColor,
	getEventBorderColor,
	getEventBackgroundColor,
	getChartColor
} from '$lib/helpers/ColorHelper';

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

describe('isLightColor', () => {
	it('detects light hex colours', () => {
		expect(isLightColor('#ffffff')).toBe(true);
		expect(isLightColor('#ffff00')).toBe(true);
	});

	it('detects dark hex colours', () => {
		expect(isLightColor('#000000')).toBe(false);
		expect(isLightColor('#1dbda5')).toBe(false);
	});

	it('handles 3-digit hex and case', () => {
		expect(isLightColor('#fff')).toBe(true);
		expect(isLightColor('#FFF')).toBe(true);
		expect(isLightColor('#123')).toBe(false);
	});

	it('treats CSS variables as dark', () => {
		expect(isLightColor('var(--color-c-neutral-4)')).toBe(false);
	});
});

describe('getReadableTextColor', () => {
	it('returns a dark text colour on light backgrounds', () => {
		expect(getReadableTextColor('#ffffff')).toBe('var(--color-c-neutral-9)');
	});

	it('returns white on dark backgrounds', () => {
		expect(getReadableTextColor('#000000')).toBe('#ffffff');
		expect(getReadableTextColor('var(--color-c-primary)')).toBe('#ffffff');
	});
});

describe('getEventBorderColor', () => {
	it('returns the calendar colour', () => {
		expect(getEventBorderColor('#336699')).toBe('#336699');
	});

	it('falls back to the neutral colour for null and undefined', () => {
		expect(getEventBorderColor(null)).toBe('var(--color-c-neutral-2)');
		expect(getEventBorderColor(undefined)).toBe('var(--color-c-neutral-2)');
	});

	it('keeps an empty string as it is', () => {
		expect(getEventBorderColor('')).toBe('');
	});
});

describe('getEventBackgroundColor', () => {
	it('mixes the calendar colour into the elevated background', () => {
		expect(getEventBackgroundColor('#336699')).toBe(
			'color-mix(in srgb, #336699 25%, var(--color-c-bg-elevated))'
		);
	});

	it('returns an empty string without a colour', () => {
		expect(getEventBackgroundColor(null)).toBe('');
		expect(getEventBackgroundColor(undefined)).toBe('');
		expect(getEventBackgroundColor('')).toBe('');
	});
});

describe('getChartColor', () => {
	it('uses the given colour', () => {
		expect(getChartColor(0, '#123456')).toBe('#123456');
	});

	it('falls back to the palette by index without a colour', () => {
		expect(getChartColor(0)).toBe('#5070dd');
		expect(getChartColor(1, null)).toBe('#b6d634');
		expect(getChartColor(2, '')).toBe('#505372');
	});

	it('starts over after the last palette colour', () => {
		expect(getChartColor(9)).toBe(getChartColor(0));
	});
});

describe('withAlpha', () => {
	it('adds the alpha to a computed rgb colour', () => {
		expect(withAlpha('rgb(97, 217, 106)', 0.25)).toBe('rgba(97, 217, 106, 0.25)');
	});

	it('leaves any other colour as it is', () => {
		expect(withAlpha('rgba(97, 217, 106, 0.5)', 0.25)).toBe('rgba(97, 217, 106, 0.5)');
		expect(withAlpha('#61d96a', 0.25)).toBe('#61d96a');
	});
});
