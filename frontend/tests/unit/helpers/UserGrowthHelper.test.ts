import { describe, it, expect } from 'vitest';
import { formatGrowthPeriod } from '$lib/helpers/UserGrowthHelper';

describe('formatGrowthPeriod', () => {
	it('shows a year as it is', () => {
		expect(formatGrowthPeriod('2026', 'year')).toBe('2026');
	});

	it('shows a month as short month and year', () => {
		expect(formatGrowthPeriod('2026-03', 'month')).toBe('Mar 2026');
	});

	it('shows an ISO week as week.year', () => {
		expect(formatGrowthPeriod('2026-W07', 'week')).toBe('07.2026');
	});

	it('keeps a week it cannot read', () => {
		expect(formatGrowthPeriod('2026-7', 'week')).toBe('2026-7');
	});

	it('shows a day as short month and day', () => {
		expect(formatGrowthPeriod('2026-11-05', 'day')).toBe('Nov 5');
	});
});
