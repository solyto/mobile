import { describe, it, expect } from 'vitest';
import RecurrenceRuleService from '$lib/services/RecurrenceRuleService';
import type { EndFormat, RecurrenceSelection } from '$lib/services/RecurrenceRuleService';

const service = new RecurrenceRuleService();

const wednesday10th = new Date(2026, 5, 10);
const saturday31st = new Date(2026, 9, 31);

function selection(overrides: Partial<RecurrenceSelection> = {}): RecurrenceSelection {
	return {
		type: 'daily',
		interval: 1,
		weekdays: [],
		monthlyOrdinal: 2,
		monthlyWeekday: 'WE',
		end: 'never',
		until: '',
		count: null,
		preserved: [],
		...overrides
	};
}

function timed(timeZone: string = 'UTC'): EndFormat {
	return { isAllDay: false, wasAllDay: false, timeZone };
}

function allDay(timeZone: string = 'UTC'): EndFormat {
	return { isAllDay: true, wasAllDay: true, timeZone };
}

function roundTrip(rule: string, startDate: Date = wednesday10th): string {
	const parsed = service.parse(rule, startDate, 'UTC');
	expect(parsed).not.toBeNull();
	return service.build(parsed!, startDate, timed());
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
			expect(service.parse(null, wednesday10th, 'UTC')).toEqual(selection());
		});

		it('treats an empty rule like no rule', () => {
			expect(service.parse('', wednesday10th, 'UTC')).toEqual(selection());
		});

		it('caps the default monthly ordinal at 4', () => {
			expect(service.parse(null, saturday31st, 'UTC')).toEqual(
				selection({ monthlyOrdinal: 4, monthlyWeekday: 'SA' })
			);
		});

		it('reads the weekly days', () => {
			expect(service.parse('FREQ=WEEKLY;BYDAY=MO,FR', wednesday10th, 'UTC')).toEqual(
				selection({ type: 'weekly', weekdays: ['MO', 'FR'] })
			);
		});

		it('reads the monthly weekday and ordinal', () => {
			expect(service.parse('FREQ=MONTHLY;BYDAY=TH;BYSETPOS=3', wednesday10th, 'UTC')).toEqual(
				selection({ type: 'monthly_weekday', monthlyOrdinal: 3, monthlyWeekday: 'TH' })
			);
		});

		it('keeps unknown fields verbatim and in order', () => {
			expect(
				service.parse('FREQ=DAILY;UNTIL=20271231T000000Z;INTERVAL=2', wednesday10th, 'UTC')
			).toEqual(
				selection({
					interval: 2,
					end: 'until',
					until: '2027-12-31',
					preserved: ['UNTIL=20271231T000000Z', 'INTERVAL=2']
				})
			);
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
			expect(service.parse(rule, wednesday10th, 'UTC')).toBeNull();
		});
	});

	describe('build', () => {
		it('falls back to the start weekday when no weekday is chosen', () => {
			expect(service.build(selection({ type: 'weekly' }), wednesday10th, timed())).toBe(
				'FREQ=WEEKLY;BYDAY=WE'
			);
		});

		it('writes weekdays in MO to SU order regardless of selection order', () => {
			expect(
				service.build(selection({ type: 'weekly', weekdays: ['SU', 'MO', 'TH'] }), wednesday10th, timed())
			).toBe('FREQ=WEEKLY;BYDAY=MO,TH,SU');
		});

		it('derives the month day from the start date', () => {
			expect(service.build(selection({ type: 'monthly_date' }), saturday31st, timed())).toBe(
				'FREQ=MONTHLY;BYMONTHDAY=31'
			);
		});

		it('derives month and day from the start date for yearly rules', () => {
			expect(service.build(selection({ type: 'yearly' }), saturday31st, timed())).toBe(
				'FREQ=YEARLY;BYMONTH=10;BYMONTHDAY=31'
			);
		});

		it('keeps the interval when the type changes', () => {
			const parsed = service.parse('FREQ=WEEKLY;BYDAY=MO;INTERVAL=2', wednesday10th, 'UTC')!;
			const daily = { ...parsed, type: 'daily' as const };
			expect(daily.interval).toBe(2);
			expect(service.build(daily, wednesday10th, timed())).toBe('FREQ=DAILY;INTERVAL=2');
		});

		it('keeps other preserved fields when the type changes', () => {
			const parsed = service.parse('FREQ=WEEKLY;BYDAY=MO;WKST=SU', wednesday10th, 'UTC')!;
			expect(service.build({ ...parsed, type: 'daily' }, wednesday10th, timed())).toBe(
				'FREQ=DAILY;WKST=SU'
			);
		});
	});

	describe('interval', () => {
		it.each([
			['FREQ=DAILY;INTERVAL=12', selection({ interval: 12 })],
			['FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH', selection({ type: 'weekly', interval: 2, weekdays: ['MO', 'TH'] })],
			['FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=10', selection({ type: 'monthly_date', interval: 3 })],
			['FREQ=MONTHLY;INTERVAL=2;BYDAY=TH;BYSETPOS=3', selection({ type: 'monthly_weekday', interval: 2, monthlyOrdinal: 3, monthlyWeekday: 'TH' })],
			['FREQ=YEARLY;INTERVAL=2;BYMONTH=6;BYMONTHDAY=10', selection({ type: 'yearly', interval: 2 })]
		])('reads %s', (rule, expected) => {
			expect(service.parse(rule, wednesday10th, 'UTC')).toEqual(expected);
		});

		it.each([
			[selection({ interval: 12 }), 'FREQ=DAILY;INTERVAL=12'],
			[selection({ type: 'weekly', interval: 2, weekdays: ['TH', 'MO'] }), 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH'],
			[selection({ type: 'monthly_date', interval: 3 }), 'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=10'],
			[selection({ type: 'monthly_weekday', interval: 2, monthlyOrdinal: 3, monthlyWeekday: 'TH' }), 'FREQ=MONTHLY;INTERVAL=2;BYDAY=TH;BYSETPOS=3'],
			[selection({ type: 'yearly', interval: 2 }), 'FREQ=YEARLY;INTERVAL=2;BYMONTH=6;BYMONTHDAY=10']
		])('writes a new interval right after FREQ: %j', (value, rule) => {
			expect(service.build(value, wednesday10th, timed())).toBe(rule);
		});

		it.each([
			'FREQ=DAILY;INTERVAL=12',
			'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH',
			'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=10',
			'FREQ=MONTHLY;INTERVAL=2;BYDAY=TH;BYSETPOS=3',
			'FREQ=YEARLY;INTERVAL=2;BYMONTH=6;BYMONTHDAY=10',
			'FREQ=WEEKLY;BYDAY=MO;WKST=SU;INTERVAL=2',
			'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO;WKST=SU;COUNT=4',
			'FREQ=DAILY;UNTIL=20271231T000000Z;INTERVAL=12'
		])('keeps %s unchanged', (rule) => {
			expect(roundTrip(rule)).toBe(rule);
		});

		it('leaves out an interval of 1', () => {
			expect(service.build(selection({ type: 'weekly', interval: 1 }), wednesday10th, timed())).toBe(
				'FREQ=WEEKLY;BYDAY=WE'
			);
		});

		it.each([
			['FREQ=DAILY;INTERVAL=1', 'FREQ=DAILY'],
			['FREQ=WEEKLY;BYDAY=MO;INTERVAL=1;WKST=SU', 'FREQ=WEEKLY;BYDAY=MO;WKST=SU']
		])('drops the redundant INTERVAL=1 from %s', (rule, expected) => {
			expect(roundTrip(rule)).toBe(expected);
		});

		it('changes an interval right after FREQ in place', () => {
			const parsed = service.parse('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO;WKST=SU', wednesday10th, 'UTC')!;
			expect(service.build({ ...parsed, interval: 3 }, wednesday10th, timed())).toBe(
				'FREQ=WEEKLY;INTERVAL=3;BYDAY=MO;WKST=SU'
			);
		});

		it('writes a changed interval in place', () => {
			const parsed = service.parse('FREQ=DAILY;WKST=SU;INTERVAL=2;COUNT=5', wednesday10th, 'UTC')!;
			expect(service.build({ ...parsed, interval: 7 }, wednesday10th, timed())).toBe(
				'FREQ=DAILY;WKST=SU;INTERVAL=7;COUNT=5'
			);
		});

		it('removes the interval when it is changed to 1', () => {
			const parsed = service.parse('FREQ=DAILY;INTERVAL=2;UNTIL=20271231T000000Z', wednesday10th, 'UTC')!;
			expect(service.build({ ...parsed, interval: 1 }, wednesday10th, timed())).toBe(
				'FREQ=DAILY;UNTIL=20271231T000000Z'
			);
		});

		it.each([
			[2.5, 'FREQ=DAILY;WKST=SU;INTERVAL=3;COUNT=5'],
			[1500, 'FREQ=DAILY;WKST=SU;INTERVAL=999;COUNT=5'],
			[-4, 'FREQ=DAILY;WKST=SU;COUNT=5']
		])('writes only a positive whole interval within bounds for %d', (interval, rule) => {
			const parsed = service.parse('FREQ=DAILY;WKST=SU;INTERVAL=2;COUNT=5', wednesday10th, 'UTC')!;
			expect(service.build({ ...parsed, interval }, wednesday10th, timed())).toBe(rule);
		});

		it('inserts a new interval after FREQ and keeps the end and other fields in order', () => {
			const parsed = service.parse('FREQ=WEEKLY;BYDAY=MO;UNTIL=20271231T000000Z;WKST=SU', wednesday10th, 'UTC')!;
			expect(service.build({ ...parsed, interval: 2 }, wednesday10th, timed())).toBe(
				'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO;UNTIL=20271231T000000Z;WKST=SU'
			);
		});

		it.each([
			'FREQ=DAILY;INTERVAL=0',
			'FREQ=DAILY;INTERVAL=-1',
			'FREQ=DAILY;INTERVAL=abc',
			'FREQ=DAILY;INTERVAL=1.5',
			'FREQ=DAILY;INTERVAL=',
			'FREQ=DAILY;INTERVAL=2;INTERVAL=3'
		])('returns null for %s, which the form cannot show', (rule) => {
			expect(service.parse(rule, wednesday10th, 'UTC')).toBeNull();
		});
	});

	describe('parse end', () => {
		it('reads no end as never', () => {
			expect(service.parse('FREQ=DAILY', wednesday10th, 'Europe/Berlin')).toEqual(selection());
		});

		it.each([
			['FREQ=DAILY;UNTIL=20271231T225959Z', 'Europe/Berlin', '2027-12-31'],
			['FREQ=DAILY;UNTIL=20280101T020000Z', 'Europe/Berlin', '2028-01-01'],
			['FREQ=DAILY;UNTIL=20280101T020000Z', 'America/New_York', '2027-12-31'],
			['FREQ=DAILY;UNTIL=20271231', 'America/New_York', '2027-12-31'],
			['FREQ=DAILY;UNTIL=20271231T235959', 'Asia/Tokyo', '2027-12-31']
		])('reads %s in %s as ending on %s', (rule, timeZone, until) => {
			expect(service.parse(rule, wednesday10th, timeZone)).toMatchObject({ end: 'until', until });
		});

		it('reads COUNT as an end after that many occurrences', () => {
			expect(service.parse('FREQ=DAILY;COUNT=10', wednesday10th, 'UTC')).toEqual(
				selection({ end: 'count', count: 10, preserved: ['COUNT=10'] })
			);
		});

		it.each([
			'FREQ=DAILY;UNTIL=20271231;COUNT=5',
			'FREQ=DAILY;UNTIL=20271231;UNTIL=20281231',
			'FREQ=DAILY;COUNT=0',
			'FREQ=DAILY;COUNT=abc',
			'FREQ=DAILY;UNTIL=2027',
			'FREQ=DAILY;UNTIL=20271340',
			'FREQ=DAILY;UNTIL=20270230',
			'FREQ=DAILY;UNTIL=20271231T2359'
		])('returns null for %s, which the form cannot show', (rule) => {
			expect(service.parse(rule, wednesday10th, 'UTC')).toBeNull();
		});
	});

	describe('build end', () => {
		const until = (date: string) => selection({ end: 'until', until: date });

		it('writes a DATE for all-day events', () => {
			expect(service.build(until('2027-12-31'), wednesday10th, allDay('Europe/Berlin'))).toBe(
				'FREQ=DAILY;UNTIL=20271231'
			);
		});

		it.each([
			['Europe/Berlin', '2027-12-31', '20271231T225959Z'],
			['Europe/Berlin', '2027-07-15', '20270715T215959Z'],
			['America/New_York', '2027-12-31', '20280101T045959Z'],
			['America/New_York', '2027-03-14', '20270315T035959Z'],
			['Asia/Kolkata', '2027-12-31', '20271231T182959Z'],
			['Pacific/Kiritimati', '2027-12-31', '20271231T095959Z'],
			['UTC', '2027-12-31', '20271231T235959Z']
		])('ends timed events in %s at the end of %s, as UTC %s', (timeZone, date, utc) => {
			expect(service.build(until(date), wednesday10th, timed(timeZone))).toBe(
				'FREQ=DAILY;UNTIL=' + utc
			);
		});

		it('keeps an unchanged UNTIL verbatim and in place', () => {
			const rule = 'FREQ=WEEKLY;BYDAY=TU;UNTIL=20271231T120000Z;INTERVAL=2';
			const parsed = service.parse(rule, wednesday10th, 'Europe/Berlin')!;
			expect(service.build(parsed, wednesday10th, timed('Europe/Berlin'))).toBe(rule);
		});

		it('replaces a changed UNTIL in place', () => {
			const parsed = service.parse(
				'FREQ=WEEKLY;BYDAY=TU;UNTIL=20271231T000000Z;INTERVAL=2',
				wednesday10th,
				'UTC'
			)!;
			expect(service.build({ ...parsed, until: '2028-06-30' }, wednesday10th, timed())).toBe(
				'FREQ=WEEKLY;BYDAY=TU;UNTIL=20280630T235959Z;INTERVAL=2'
			);
		});

		it('rewrites a DATE UNTIL as UTC when the event stops being all-day', () => {
			const parsed = service.parse('FREQ=DAILY;UNTIL=20271231', wednesday10th, 'Europe/Berlin')!;
			expect(service.build(parsed, wednesday10th, { isAllDay: false, wasAllDay: true, timeZone: 'Europe/Berlin' })).toBe(
				'FREQ=DAILY;UNTIL=20271231T225959Z'
			);
		});

		it('rewrites a UTC UNTIL as a DATE when the event becomes all-day', () => {
			const parsed = service.parse('FREQ=DAILY;UNTIL=20271231T225959Z', wednesday10th, 'Europe/Berlin')!;
			expect(service.build(parsed, wednesday10th, { isAllDay: true, wasAllDay: false, timeZone: 'Europe/Berlin' })).toBe(
				'FREQ=DAILY;UNTIL=20271231'
			);
		});

		it.each([
			['FREQ=DAILY;UNTIL=20271231T000000Z', 'America/New_York'],
			['FREQ=DAILY;UNTIL=20280101T045959Z', 'America/New_York'],
			['FREQ=DAILY;UNTIL=20271231T235959Z', 'Europe/Berlin'],
			['FREQ=DAILY;UNTIL=20271231T225959Z', 'Europe/Berlin']
		])('keeps the untouched end %s of an all-day series in %s as it was', (rule, timeZone) => {
			const parsed = service.parse(rule, wednesday10th, timeZone)!;
			expect(service.build(parsed, wednesday10th, allDay(timeZone))).toBe(rule);
		});

		it('writes a changed end of an all-day series as a DATE', () => {
			const parsed = service.parse('FREQ=DAILY;UNTIL=20271231T000000Z', wednesday10th, 'America/New_York')!;
			expect(service.build({ ...parsed, until: '2028-03-31' }, wednesday10th, allDay('America/New_York'))).toBe(
				'FREQ=DAILY;UNTIL=20280331'
			);
		});

		it('keeps an untouched DATE end of a timed series as it was', () => {
			const parsed = service.parse('FREQ=DAILY;UNTIL=20271231', wednesday10th, 'Europe/Berlin')!;
			expect(service.build(parsed, wednesday10th, timed('Europe/Berlin'))).toBe('FREQ=DAILY;UNTIL=20271231');
		});

		it('appends a new UNTIL after the preserved fields', () => {
			const parsed = service.parse('FREQ=DAILY;INTERVAL=2', wednesday10th, 'UTC')!;
			expect(
				service.build({ ...parsed, end: 'until', until: '2027-12-31' }, wednesday10th, allDay())
			).toBe('FREQ=DAILY;INTERVAL=2;UNTIL=20271231');
		});

		it('replaces COUNT with UNTIL in place', () => {
			const parsed = service.parse('FREQ=DAILY;COUNT=10;INTERVAL=2', wednesday10th, 'UTC')!;
			expect(
				service.build({ ...parsed, end: 'until', until: '2027-12-31' }, wednesday10th, allDay())
			).toBe('FREQ=DAILY;UNTIL=20271231;INTERVAL=2');
		});

		it.each(['FREQ=DAILY;UNTIL=20271231T000000Z;INTERVAL=2', 'FREQ=DAILY;COUNT=10;INTERVAL=2'])(
			'removes the end of %s when set to never',
			(rule) => {
				const parsed = service.parse(rule, wednesday10th, 'UTC')!;
				expect(service.build({ ...parsed, end: 'never' }, wednesday10th, timed())).toBe(
					'FREQ=DAILY;INTERVAL=2'
				);
			}
		);

		it('keeps the existing UNTIL when the chosen date is not a valid date', () => {
			const parsed = service.parse('FREQ=DAILY;UNTIL=20271231T000000Z', wednesday10th, 'UTC')!;
			expect(service.build({ ...parsed, until: '' }, wednesday10th, timed())).toBe(
				'FREQ=DAILY;UNTIL=20271231T000000Z'
			);
		});

		it('writes no UNTIL when the chosen date is not a valid date and there was none', () => {
			expect(service.build(until(''), wednesday10th, timed())).toBe('FREQ=DAILY');
		});
	});

	describe('defaultUntil', () => {
		it('is one month after the start', () => {
			expect(service.defaultUntil(selection({ type: 'weekly' }), wednesday10th)).toBe('2026-07-10');
		});

		it('is one year after the start for yearly rules', () => {
			expect(service.defaultUntil(selection({ type: 'yearly' }), wednesday10th)).toBe('2027-06-10');
		});

		it.each([
			[selection({ interval: 12 }), '2026-07-10'],
			[selection({ interval: 45 }), '2026-07-25'],
			[selection({ type: 'weekly', interval: 2 }), '2026-07-10'],
			[selection({ type: 'weekly', interval: 6 }), '2026-07-22'],
			[selection({ type: 'monthly_date', interval: 3 }), '2026-09-10'],
			[selection({ type: 'monthly_weekday', interval: 2 }), '2026-08-10'],
			[selection({ type: 'yearly', interval: 2 }), '2028-06-10']
		])('leaves room for at least one repeat: %j', (value, expected) => {
			expect(service.defaultUntil(value, wednesday10th)).toBe(expected);
		});
	});

	describe('intervalWithinBounds', () => {
		it.each([
			[12, 12],
			[0, 1],
			[-3, 1],
			[1000, 999],
			[2.6, 3],
			[null, 5],
			[NaN, 5]
		])('turns %j into %j with 5 as the last valid value', (interval, expected) => {
			expect(service.intervalWithinBounds(interval, 5)).toBe(expected);
		});
	});

	describe('untilNotBeforeStart', () => {
		it.each([
			['', ''],
			['2026-06-01', '2026-06-10'],
			['2026-06-10', '2026-06-10'],
			['2026-07-01', '2026-07-01']
		])('turns %j into %j for a start on 2026-06-10', (until, expected) => {
			expect(service.untilNotBeforeStart(until, wednesday10th)).toBe(expected);
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
