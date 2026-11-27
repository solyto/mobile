import { describe, it, expect } from 'vitest';
import AlertService from '$lib/services/AlertService';
import type { AlertRecords } from '$lib/types/translation';

const service = new AlertService();

describe('rules', () => {
	it('offers averages for 1–5, streaks for yes/no and sports, both for counts', () => {
		expect(service.rules('scale')).toEqual(['average_below', 'average_above']);
		expect(service.rules('yes_no')).toEqual(['no_entry_days', 'entry_days']);
		expect(service.rules('sport')).toEqual(['no_entry_days', 'entry_days']);
		expect(service.rules('count')).toEqual(['average_below', 'average_above', 'no_entry_days', 'entry_days']);
	});
});

describe('isValid', () => {
	it.each([
		['scale', 'average_below', 3, 7, true],
		['scale', 'average_below', null, 7, false],
		['scale', 'average_above', 6, 7, false],
		['scale', 'no_entry_days', null, 7, false],
		['count', 'average_below', 0, 7, true],
		['yes_no', 'no_entry_days', null, 90, true],
		['yes_no', 'no_entry_days', null, 91, false],
		['yes_no', 'entry_days', null, 0, false],
		['yes_no', 'entry_days', null, null, false]
	] as const)('%s %s %s over %s days → %s', (type, rule, threshold, days, valid) => {
		expect(service.isValid(type, rule, threshold, days)).toBe(valid);
	});
});

describe('describe', () => {
	const texts = {
		describe_average_below: 'Average below {threshold} over {days} days',
		describe_no_entry_days: 'Nothing logged for {days} days',
		describe_goal_reached: 'Goal reached'
	} as AlertRecords;

	it('fills in the rule\'s numbers', () => {
		expect(service.describe('average_below', 3.5, 7, texts)).toBe('Average below 3.5 over 7 days');
		expect(service.describe('no_entry_days', null, 14, texts)).toBe('Nothing logged for 14 days');
		expect(service.describe('goal_reached', null, null, texts)).toBe('Goal reached');
	});
});
