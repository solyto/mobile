import { describe, it, expect } from 'vitest';
import RecurrenceRuleService from '$lib/services/RecurrenceRuleService';
import type { RecurrenceSelection } from '$lib/services/RecurrenceRuleService';

const service = new RecurrenceRuleService();

const wednesday10th = new Date(2026, 5, 10);
const saturday31st = new Date(2026, 9, 31);

function selection(overrides: Partial<RecurrenceSelection> = {}): RecurrenceSelection {
	return {
		type: 'daily',
		weekdays: [],
		monthlyOrdinal: 2,
		monthlyWeekday: 'WE',
		preserved: [],
		...overrides
	};
}

function roundTrip(rule: string, startDate: Date = wednesday10th): string {
	const parsed = service.parse(rule, startDate);
	expect(parsed).not.toBeNull();
	return service.build(parsed!, startDate);
}

describe('RecurrenceRuleService', () => {
	describe('round-trip', () => {
		it.each([
			'FREQ=DAILY',
			'FREQ=WEEKLY;BYDAY=WE',
			'FREQ=WEEKLY;BYDAY=MO,WE,FR',
			'FREQ=MONTHLY;BYMONTHDAY=10',
			'FREQ=MONTHLY;BYDAY=WE;BYSETPOS=2',
			'FREQ=MONTHLY;BYDAY=FR;BYSETPOS=4',
			'FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=10'
		])('keeps %s unchanged', (rule) => {
			expect(roundTrip(rule)).toBe(rule);
		});

		it.each([
			'FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=2',
			'FREQ=DAILY;UNTIL=20271231T000000Z',
			'FREQ=WEEKLY;BYDAY=TU,TH;INTERVAL=2;UNTIL=20271231T000000Z',
			'FREQ=MONTHLY;BYDAY=WE;BYSETPOS=2;UNTIL=20271231T000000Z;INTERVAL=3',
			'FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=10;COUNT=5',
			'FREQ=DAILY;COUNT=10',
			'FREQ=WEEKLY;BYDAY=MO;WKST=SU'
		])('preserves the fields the form does not edit in %s', (rule) => {
			expect(roundTrip(rule)).toBe(rule);
		});
	});

	describe('parse', () => {
		it('defaults to daily with the monthly fields taken from the start date', () => {
			expect(service.parse(null, wednesday10th)).toEqual(selection());
		});

		it('treats an empty rule like no rule', () => {
			expect(service.parse('', wednesday10th)).toEqual(selection());
		});

		it('caps the default monthly ordinal at 4', () => {
			expect(service.parse(null, saturday31st)).toEqual(
				selection({ monthlyOrdinal: 4, monthlyWeekday: 'SA' })
			);
		});

		it('reads the weekly days', () => {
			expect(service.parse('FREQ=WEEKLY;BYDAY=MO,FR', wednesday10th)).toEqual(
				selection({ type: 'weekly', weekdays: ['MO', 'FR'] })
			);
		});

		it('reads the monthly weekday and ordinal', () => {
			expect(service.parse('FREQ=MONTHLY;BYDAY=TH;BYSETPOS=3', wednesday10th)).toEqual(
				selection({ type: 'monthly_weekday', monthlyOrdinal: 3, monthlyWeekday: 'TH' })
			);
		});

		it('keeps unknown fields verbatim and in order', () => {
			expect(
				service.parse('FREQ=DAILY;UNTIL=20271231T000000Z;INTERVAL=2', wednesday10th)
			).toEqual(selection({ preserved: ['UNTIL=20271231T000000Z', 'INTERVAL=2'] }));
		});

		it.each([
			'FREQ=MONTHLY;BYDAY=2MO',
			'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=-1',
			'FREQ=MONTHLY;BYDAY=MO,TU;BYSETPOS=1',
			'FREQ=MONTHLY;BYDAY=MO',
			'FREQ=MONTHLY;BYMONTHDAY=15',
			'FREQ=MONTHLY;BYMONTHDAY=10,20',
			'FREQ=WEEKLY;BYDAY=1MO',
			'FREQ=YEARLY;BYMONTH=7;BYMONTHDAY=10',
			'FREQ=YEARLY;BYMONTH=6',
			'FREQ=DAILY;BYDAY=MO',
			'FREQ=HOURLY',
			'FREQ=DAILY;FREQ=WEEKLY',
			'INTERVAL=2',
			'FREQ=DAILY;;INTERVAL=2',
			'garbage'
		])('returns null for %s, which the form cannot show', (rule) => {
			expect(service.parse(rule, wednesday10th)).toBeNull();
		});
	});

	describe('build', () => {
		it('falls back to the start weekday when no weekday is chosen', () => {
			expect(service.build(selection({ type: 'weekly' }), wednesday10th)).toBe(
				'FREQ=WEEKLY;BYDAY=WE'
			);
		});

		it('writes weekdays in MO to SU order regardless of selection order', () => {
			expect(
				service.build(selection({ type: 'weekly', weekdays: ['SU', 'MO', 'TH'] }), wednesday10th)
			).toBe('FREQ=WEEKLY;BYDAY=MO,TH,SU');
		});

		it('derives the month day from the start date', () => {
			expect(service.build(selection({ type: 'monthly_date' }), saturday31st)).toBe(
				'FREQ=MONTHLY;BYMONTHDAY=31'
			);
		});

		it('derives month and day from the start date for yearly rules', () => {
			expect(service.build(selection({ type: 'yearly' }), saturday31st)).toBe(
				'FREQ=YEARLY;BYMONTH=10;BYMONTHDAY=31'
			);
		});

		it('keeps preserved fields when the type changes', () => {
			const parsed = service.parse('FREQ=WEEKLY;BYDAY=MO;INTERVAL=2', wednesday10th)!;
			expect(service.build({ ...parsed, type: 'daily' }, wednesday10th)).toBe(
				'FREQ=DAILY;INTERVAL=2'
			);
		});
	});

	describe('effectiveWeekdays', () => {
		it('returns the chosen weekdays in MO to SU order', () => {
			expect(
				service.effectiveWeekdays(selection({ weekdays: ['FR', 'TU'] }), wednesday10th)
			).toEqual(['TU', 'FR']);
		});

		it('returns the start weekday when none is chosen', () => {
			expect(service.effectiveWeekdays(selection(), saturday31st)).toEqual(['SA']);
		});
	});
});
