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
	isDateThisWeek,
	isDateLast7Days,
	dateFromTimestamp,
	getCurrentTimestamp,
	getCurrentYearMonthString,
	getISODateInfo,
	getCalendarMonth,
	getCalendarWeek
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
		expect(isDateThisWeek(AUG_15)).toBe(true);
		expect(isDateThisWeek(plusDays(8))).toBe(false);
		expect(isDateThisWeek(plusDays(-8))).toBe(false);
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
});

describe('getCalendarWeek', () => {
	it('returns a 7-day week starting on Monday', () => {
		const days = getCalendarWeek(2025, 33);
		expect(days).toHaveLength(7);
		expect(days[0].weekday).toBe(1);
		expect(days[0].date.getDate()).toBe(11); // ISO week 33 of 2025 = Aug 11-17
		expect(days[6].date.getDate()).toBe(17);
	});
});
