import { describe, it, expect } from 'vitest';
import { getMeanValue, getScoreColor, getTotalMeanValue } from '$lib/helpers/CheckInHelper';
import type { CheckIn } from '$lib/types/check_in';

function checkIn(overrides: Partial<CheckIn> = {}): CheckIn {
	return {
		id: 1,
		date: '2025-08-15',
		mood: null,
		sports: null,
		water: null,
		sleep: null,
		dreams: null,
		work: null,
		food_quality: null,
		food_amount: null,
		menstruation: null,
		alcohol: null,
		smoking: null,
		social_life: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

describe('getMeanValue', () => {
	it('returns NaN when there are no usable values', () => {
		expect(getMeanValue([checkIn({ mood: null }), checkIn({ mood: 0 })], 'mood')).toBeNaN();
	});

	it('averages numeric tracker values', () => {
		const data = [checkIn({ mood: 2 }), checkIn({ mood: 4 })];
		expect(getMeanValue(data, 'mood')).toBe(3);
	});

	it('skips null and zero values', () => {
		const data = [
			checkIn({ mood: 1 }),
			checkIn({ mood: null }),
			checkIn({ mood: 0 }),
			checkIn({ mood: 5 })
		];
		expect(getMeanValue(data, 'mood')).toBe(3);
	});

	it('maps food_amount scale values to amounts', () => {
		const data = [checkIn({ food_amount: 1 }), checkIn({ food_amount: 4 })];
		expect(getMeanValue(data, 'food_amount')).toBe(3.125); // (1.25 + 5) / 2
	});
});

describe('getTotalMeanValue', () => {
	it('returns 0 when every tracker mean is NaN', () => {
		expect(getTotalMeanValue([checkIn()], ['mood', 'sleep'])).toBe(0);
	});

	it('averages the means of the given trackers', () => {
		const data = [checkIn({ mood: 2, sleep: 4 }), checkIn({ mood: 4, sleep: 8 })];
		expect(getTotalMeanValue(data, ['mood', 'sleep'])).toBe(4.5); // (3 + 6) / 2
	});

	it('ignores trackers with no data', () => {
		const data = [checkIn({ mood: 2, sleep: null })];
		expect(getTotalMeanValue(data, ['mood', 'sleep'])).toBe(2);
	});
});

describe('getScoreColor', () => {
	it.each([
		[5, 'bg-c-success'],
		[4, 'bg-c-success'],
		[3.99, 'bg-c-primary'],
		[3, 'bg-c-primary'],
		[2.5, 'bg-c-warning'],
		[2, 'bg-c-warning'],
		[1.75, 'bg-c-action'],
		[1.5, 'bg-c-action'],
		[1.49, 'bg-c-danger'],
		[1, 'bg-c-danger']
	])('colors %s as %s', (value, expected) => {
		expect(getScoreColor(value)).toBe(expected);
	});
});
