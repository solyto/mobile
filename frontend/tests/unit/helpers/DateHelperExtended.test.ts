import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
	formatFloatingDate,
	formatDateWithWeekday,
	getUrlFormat,
	getNextDay,
	getPrevDay,
	getDaysInMonth,
	getLast30Days,
	getNextXDays,
	getStartOfWeek,
	isDateThisWeek,
	isDateLast7Days,
	dateFromTimestamp,
	getCurrentTimestamp,
	getCurrentYearMonthString,
	getISODateInfo,
	getCalendarMonth,
	getCalendarWeek,
	getISOWeek,
	getWeekNumberOfWeek,
	getWeekdayOrder
} from '$lib/helpers/DateHelper';

// Aug 15 2025, 14:30 — TZ=UTC so no timezone surprises
const AUG_15 = new Date(2025, 7, 15, 14, 30, 0);
const AUG_15_STR = '2025-08-15';

describe('formatFloatingDate', () => {
	it('formats as YYYY-MM-DDTHH:MM:SS', () => {
		expect(formatFloatingDate(AUG_15)).toBe('2025-08-15T14:30:00');
	});
});

describe('formatDateWithWeekday', () => {
	it('prepends the localized weekday', () => {
		expect(formatDateWithWeekday(AUG_15, null, 'en-US')).toBe('Friday, 15.08.2025');
	});
});

describe('getUrlFormat', () => {
	it('formats as YYYY-MM-DD', () => {
		expect(getUrlFormat(AUG_15)).toBe(AUG_15_STR);
	});
});

describe('getNextDay / getPrevDay', () => {
	it('advances and recedes by one day', () => {
		expect(getNextDay(AUG_15).getDate()).toBe(16);
		expect(getPrevDay(AUG_15).getDate()).toBe(14);
	});

	it('does not mutate the input', () => {
		const original = new Date(AUG_15);
		getNextDay(AUG_15);
		expect(AUG_15).toEqual(original);
	});
});

describe('getDaysInMonth', () => {
	it('returns the correct number of days', () => {
		expect(getDaysInMonth(2025, 1)).toHaveLength(28); // Feb 2025
		expect(getDaysInMonth(2025, 7)).toHaveLength(31); // Aug 2025
		expect(getDaysInMonth(2024, 1)).toHaveLength(29); // Feb 2024 (leap)
	});

	it('numbers days from 1', () => {
		const days = getDaysInMonth(2025, 7);
		expect(days[0].getDate()).toBe(1);
		expect(days[days.length - 1].getDate()).toBe(31);
	});
});

describe('getLast30Days', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(AUG_15);
	});
	afterEach(() => vi.useRealTimers());

	it('returns 30 consecutive days ending today', () => {
		const days = getLast30Days();
		expect(days).toHaveLength(30);
		expect(days[0].toDateString()).toBe(AUG_15.toDateString());
		const expectedLast = new Date(AUG_15);
		expectedLast.setDate(expectedLast.getDate() - 29);
		expect(days[29].toDateString()).toBe(expectedLast.toDateString());
	});
});

describe('getNextXDays', () => {
	it('returns x consecutive days starting today', () => {
		const days = getNextXDays(3);
		expect(days).toHaveLength(3);

		const expectedLast = new Date();
		expectedLast.setDate(expectedLast.getDate() + 2);
		expect(days[0].toDateString()).toBe(new Date().toDateString());
		expect(days[2].toDateString()).toBe(expectedLast.toDateString());
	});
});

describe('getStartOfWeek', () => {
	const ymd = (date: Date) => getUrlFormat(date);

	it.each([
		['2025-08-10', '2025-08-04', '2025-08-10'],
		['2025-08-11', '2025-08-11', '2025-08-10'],
		['2025-08-12', '2025-08-11', '2025-08-10'],
		['2025-08-13', '2025-08-11', '2025-08-10'],
		['2025-08-14', '2025-08-11', '2025-08-10'],
		['2025-08-15', '2025-08-11', '2025-08-10'],
		['2025-08-16', '2025-08-11', '2025-08-10'],
		['2025-08-17', '2025-08-11', '2025-08-17']
	])('%s starts its week on %s (Monday) or %s (Sunday)', (day, monday, sunday) => {
		const date = new Date(`${day}T15:45:00`);
		expect(ymd(getStartOfWeek(date, 'monday'))).toBe(monday);
		expect(ymd(getStartOfWeek(date, 'sunday'))).toBe(sunday);
	});

	it('returns local midnight', () => {
		const start = getStartOfWeek(AUG_15, 'sunday');
		expect([start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds()]).toEqual([0, 0, 0, 0]);
	});

	it('does not change the date it is given', () => {
		const date = new Date(AUG_15);
		getStartOfWeek(date, 'monday');
		expect(date).toEqual(AUG_15);
	});

	it('crosses month boundaries', () => {
		expect(ymd(getStartOfWeek(new Date(2025, 9, 1), 'monday'))).toBe('2025-09-29');
		expect(ymd(getStartOfWeek(new Date(2025, 9, 1), 'sunday'))).toBe('2025-09-28');
	});

	it('crosses year boundaries', () => {
		expect(ymd(getStartOfWeek(new Date(2026, 0, 1), 'monday'))).toBe('2025-12-29');
		expect(ymd(getStartOfWeek(new Date(2026, 0, 1), 'sunday'))).toBe('2025-12-28');
		expect(ymd(getStartOfWeek(new Date(2028, 0, 1), 'monday'))).toBe('2027-12-27');
		expect(ymd(getStartOfWeek(new Date(2028, 0, 1), 'sunday'))).toBe('2027-12-26');
	});
});

describe('isDateThisWeek / isDateLast7Days', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(AUG_15);
	});
	afterEach(() => vi.useRealTimers());

	const plusDays = (n: number) => {
		const d = new Date(AUG_15);
		d.setDate(d.getDate() + n);
		return d;
	};

	it('detects dates within the current week', () => {
		expect(isDateThisWeek(AUG_15, 'monday')).toBe(true);
		expect(isDateThisWeek(plusDays(8), 'monday')).toBe(false);
		expect(isDateThisWeek(plusDays(-8), 'monday')).toBe(false);
	});

	it('runs the week from Monday to Sunday when it starts on Monday', () => {
		expect(isDateThisWeek(new Date(2025, 7, 10, 23, 59), 'monday')).toBe(false);
		expect(isDateThisWeek(new Date(2025, 7, 11, 0, 0), 'monday')).toBe(true);
		expect(isDateThisWeek(new Date(2025, 7, 17, 23, 59), 'monday')).toBe(true);
		expect(isDateThisWeek(new Date(2025, 7, 18, 0, 0), 'monday')).toBe(false);
	});

	it('runs the week from Sunday to Saturday when it starts on Sunday', () => {
		expect(isDateThisWeek(new Date(2025, 7, 9, 23, 59), 'sunday')).toBe(false);
		expect(isDateThisWeek(new Date(2025, 7, 10, 0, 0), 'sunday')).toBe(true);
		expect(isDateThisWeek(new Date(2025, 7, 16, 23, 59), 'sunday')).toBe(true);
		expect(isDateThisWeek(new Date(2025, 7, 17, 0, 0), 'sunday')).toBe(false);
	});

	it('includes the coming Sunday only when the week starts on Monday', () => {
		vi.setSystemTime(new Date(2025, 7, 16, 12, 0));
		expect(isDateThisWeek(new Date(2025, 7, 17, 9, 0), 'monday')).toBe(true);
		expect(isDateThisWeek(new Date(2025, 7, 17, 9, 0), 'sunday')).toBe(false);
	});

	it('starts a new Sunday week on Sunday itself', () => {
		vi.setSystemTime(new Date(2025, 7, 17, 12, 0));
		expect(isDateThisWeek(new Date(2025, 7, 11, 9, 0), 'monday')).toBe(true);
		expect(isDateThisWeek(new Date(2025, 7, 11, 9, 0), 'sunday')).toBe(false);
		expect(isDateThisWeek(new Date(2025, 7, 23, 9, 0), 'sunday')).toBe(true);
	});

	it('detects dates within the last 7 days', () => {
		expect(isDateLast7Days(AUG_15)).toBe(true);
		expect(isDateLast7Days(plusDays(-1))).toBe(true);
		expect(isDateLast7Days(plusDays(-8))).toBe(false);
	});
});

describe('dateFromTimestamp', () => {
	it('converts a unix timestamp to a date', () => {
		const result = dateFromTimestamp(1755261000); // Aug 15 2025 12:30 UTC
		expect(result.getUTCFullYear()).toBe(2025);
		expect(result.getUTCMonth()).toBe(7);
		expect(result.getUTCDate()).toBe(15);
	});
});

describe('getCurrentTimestamp / getCurrentYearMonthString', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(AUG_15);
	});
	afterEach(() => vi.useRealTimers());

	it('returns the current unix timestamp in seconds', () => {
		expect(getCurrentTimestamp()).toBe(Math.floor(AUG_15.getTime() / 1000));
	});

	it('returns the current year-month string', () => {
		expect(getCurrentYearMonthString()).toBe('2025-08');
	});
});

describe('getISODateInfo', () => {
	it('returns ISO year, month and week', () => {
		expect(getISODateInfo(AUG_15)).toEqual({ year: 2025, month: 8, week: 33 });
	});

	it('handles the year boundary — Dec 29 2025 belongs to ISO week 1 of 2026', () => {
		expect(getISODateInfo(new Date(2025, 11, 29))).toEqual({ year: 2026, month: 12, week: 1 });
	});
});

describe('getCalendarMonth', () => {
	it('returns a fixed 42-day grid', () => {
		const days = getCalendarMonth(2025, 7);
		expect(days).toHaveLength(42);
	});

	it('pads the start to Monday and marks out-of-month days grayed', () => {
		const days = getCalendarMonth(2025, 7); // Aug 1 2025 is a Friday
		expect(days[0].number).toBe(28); // July 28
		expect(days[0].is_grayed_out).toBe(true);
		expect(days[4].number).toBe(1); // Aug 1
		expect(days[4].is_grayed_out).toBe(false);
	});

	it('contains exactly the days of the target month un-grayed', () => {
		const days = getCalendarMonth(2025, 7);
		expect(days.filter((d) => !d.is_grayed_out)).toHaveLength(31);
	});

	it('starts on Monday by default', () => {
		expect(getCalendarMonth(2025, 7)).toEqual(getCalendarMonth(2025, 7, 'monday'));
	});

	it('pads the start to Sunday when the week starts on Sunday', () => {
		const days = getCalendarMonth(2025, 7, 'sunday');
		expect(getUrlFormat(days[0].date)).toBe('2025-07-27');
		expect(days[0].weekday).toBe(7);
		expect(days[5].number).toBe(1);
		expect(days[5].is_grayed_out).toBe(false);
		expect(days.filter((d) => !d.is_grayed_out)).toHaveLength(31);
	});

	it.each(['monday', 'sunday'] as const)('starts every row on the first day of the week (%s)', (weekStart) => {
		const days = getCalendarMonth(2025, 7, weekStart);
		const first = getWeekdayOrder(weekStart)[0];
		for (let row = 0; row < 6; row++) {
			expect(days[row * 7].weekday).toBe(first);
		}
	});

	it('does not pad when the month begins on the first day of the week', () => {
		expect(getUrlFormat(getCalendarMonth(2025, 8, 'monday')[0].date)).toBe('2025-09-01');
		expect(getUrlFormat(getCalendarMonth(2025, 5, 'sunday')[0].date)).toBe('2025-06-01');
	});

	it('crosses the year boundary into January', () => {
		expect(getUrlFormat(getCalendarMonth(2026, 0, 'monday')[0].date)).toBe('2025-12-29');
		expect(getUrlFormat(getCalendarMonth(2026, 0, 'sunday')[0].date)).toBe('2025-12-28');
	});

	it('crosses the year boundary out of December', () => {
		expect(getUrlFormat(getCalendarMonth(2025, 11, 'monday')[41].date)).toBe('2026-01-11');
		expect(getUrlFormat(getCalendarMonth(2025, 11, 'sunday')[41].date)).toBe('2026-01-10');
	});
});

describe('getCalendarWeek', () => {
	it('returns seven consecutive days from a Monday', () => {
		const days = getCalendarWeek(new Date(2025, 7, 11));
		expect(days).toHaveLength(7);
		expect(days.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5, 6, 7]);
		expect(days[0].date.getDate()).toBe(11);
		expect(days[6].date.getDate()).toBe(17);
	});

	it('returns seven consecutive days from a Sunday', () => {
		const days = getCalendarWeek(new Date(2025, 7, 10));
		expect(days.map((d) => d.weekday)).toEqual([7, 1, 2, 3, 4, 5, 6]);
		expect(days[0].date.getDate()).toBe(10);
		expect(days[6].date.getDate()).toBe(16);
	});

	it('crosses the year boundary', () => {
		const days = getCalendarWeek(new Date(2025, 11, 28));
		expect(days.map((d) => getUrlFormat(d.date))).toEqual([
			'2025-12-28',
			'2025-12-29',
			'2025-12-30',
			'2025-12-31',
			'2026-01-01',
			'2026-01-02',
			'2026-01-03'
		]);
		expect(days.every((d) => !d.is_grayed_out)).toBe(true);
	});
});

describe('getWeekNumberOfWeek', () => {
	it.each([
		['2025-08-11', 33], // Monday week
		['2025-08-10', 33], // Sunday week, Monday is Aug 11
		['2025-12-29', 1], // Monday week in ISO 2026-W01
		['2025-12-28', 1], // Sunday week, Monday is Dec 29
		['2026-12-28', 53],
		['2026-12-27', 53],
		['2027-01-03', 1] // Sunday week, Monday is Jan 4 2027
	])('labels the week starting %s as CW %i', (start, week) => {
		expect(getWeekNumberOfWeek(new Date(`${start}T00:00:00`))).toBe(week);
	});

	it('matches the ISO week of the Monday inside every week from 2000 to 2100', () => {
		for (const weekStart of ['monday', 'sunday'] as const) {
			let start = getStartOfWeek(new Date(2000, 0, 1), weekStart);
			while (start.getFullYear() <= 2100) {
				const lastDay = getCalendarWeek(start)[6].date;
				const monday = getStartOfWeek(lastDay, 'monday');
				expect(getWeekNumberOfWeek(start)).toBe(getISOWeek(monday).week);
				start = getNextDay(lastDay);
			}
		}
	});
});

describe('getWeekdayOrder', () => {
	it('lists ISO weekdays from Monday to Sunday', () => {
		expect(getWeekdayOrder('monday')).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('lists ISO weekdays from Sunday to Saturday', () => {
		expect(getWeekdayOrder('sunday')).toEqual([7, 1, 2, 3, 4, 5, 6]);
	});
});
