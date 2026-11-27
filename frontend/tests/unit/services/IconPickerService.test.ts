import { describe, it, expect } from 'vitest';
import IconPickerService, { ICON_PICKER_CATEGORIES } from '$lib/services/IconPickerService';
import type { IconPickerData } from '$lib/services/IconPickerService';
import pickerData from '$lib/icons/lucide/picker-data.json';

const service = new IconPickerService();

const data: IconPickerData = {
	lucideVersion: '1.59.0',
	categories: ['multimedia', 'sports'],
	icons: {
		guitar: { categories: ['multimedia'], tags: ['instrument', 'music'] },
		bike: { categories: ['sports', 'transportation'], tags: ['bicycle', 'cycling'] },
		'piano-keys': { categories: ['multimedia'], tags: ['instrument'] }
	}
};

describe('IconPickerService', () => {
	it('lists the icons of a category when there is no search', () => {
		expect(service.filter(data, 'multimedia', '')).toEqual(['guitar', 'piano-keys']);
	});

	it('searches names and terms across all categories, case-insensitively', () => {
		expect(service.filter(data, 'sports', 'Instrument')).toEqual(['guitar', 'piano-keys']);
		expect(service.filter(data, 'multimedia', 'cycl')).toEqual(['bike']);
		expect(service.filter(data, 'multimedia', 'piano')).toEqual(['piano-keys']);
	});

	it('needs every search word to match', () => {
		expect(service.filter(data, 'sports', 'instrument music')).toEqual(['guitar']);
	});

	it('only offers categories that exist in the icon data', () => {
		const known = new Set((pickerData as unknown as IconPickerData).categories);

		expect(ICON_PICKER_CATEGORIES.every((category) => known.has(category))).toBe(true);
	});
});
