import { describe, it, expect, afterEach, vi } from 'vitest';
import {
	formatDate,
	formatDateWithoutYear,
	formatMonth,
	formatDateTime,
	formatTime,
	formatTimeWithSeconds,
	getDateDiffInDays,
	getDateDiffInMinutes,
	getDateMinusDays,
	getDatePlusDays,
	getISOWeek,
	getISOWeeksInYear,
	getWeekNumber,
	isDateAfter,
	isDateInTheFuture,
	isDateInThePast,
	isDateToday,
	isDateTomorrow,
	isDateYesterday,
	daysSince,
	getHoursOfDay,
	isOffHour,
	eachDayBetween,
	parseDateSlug,
	parseUrlFormat,
	getUrlFormat
} from '$lib/helpers/DateHelper';

// Aug 15 2025, 14:30 — TZ=UTC so no timezone surprises
const AUG_15 = new Date(2025, 7, 15, 14, 30, 0);

describe('formatDate', () => {
	it('returns dd.mm.yyyy by default', () => {
		expect(formatDate(AUG_15)).toBe('15.08.2025');
	});

	it('applies custom format tokens', () => {
		expect(formatDate(AUG_15, 'dd/mm/YYYY')).toBe('15/08/2025');
		expect(formatDate(AUG_15, 'YYYY-mm-dd')).toBe('2025-08-15');
		expect(formatDate(AUG_15, 'dd.mm.YY')).toBe('15.08.25');
		expect(formatDate(AUG_15, 'mm/dd/YYYY')).toBe('08/15/2025');
		expect(formatDate(AUG_15, 'mm/dd/YY')).toBe('08/15/25');
	});

	it('accepts an ISO date string', () => {
		expect(formatDate('2025-08-15T14:30:00')).toBe('15.08.2025');
	});
});

describe('formatDateWithoutYear', () => {
	it('returns dd.mm by default', () => {
		expect(formatDateWithoutYear(AUG_15)).toBe('15.08');
	});

	it('strips year and cleans trailing separator', () => {
		expect(formatDateWithoutYear(AUG_15, 'dd/mm/YYYY')).toBe('15/08');
		expect(formatDateWithoutYear(AUG_15, 'mm/dd/YYYY')).toBe('08/15');
		expect(formatDateWithoutYear(AUG_15, 'mm/dd/YY')).toBe('08/15');
	});
});

describe('formatMonth', () => {
	it('returns mm.YYYY by default', () => {
		expect(formatMonth(AUG_15)).toBe('08.2025');
	});

	it('drops a leading day', () => {
		expect(formatMonth(AUG_15, 'dd.mm.YY')).toBe('08.25');
	});

	it('drops a trailing day', () => {
		expect(formatMonth(AUG_15, 'YYYY/mm/dd')).toBe('2025/08');
		expect(formatMonth(AUG_15, 'YYYY-mm-dd')).toBe('2025-08');
	});

	it('drops a day between month and year', () => {
		expect(formatMonth(AUG_15, 'mm/dd/YYYY')).toBe('08/2025');
		expect(formatMonth(AUG_15, 'mm/dd/YY')).toBe('08/25');
	});
});

describe('formatDateTime', () => {
	it('combines formatted date and time', () => {
		expect(formatDateTime(AUG_15)).toBe('15.08.2025 14:30');
	});
});

describe('formatTime', () => {
	it('returns H:MM by default', () => {
		expect(formatTime(AUG_15)).toBe('14:30');
	});

	it('formats 12-hour uppercase AM/PM', () => {
		expect(formatTime(AUG_15, 'g:i A')).toBe('2:30 PM');
		expect(formatTime(new Date(2025, 7, 15, 9, 5), 'g:i A')).toBe('9:05 AM');
		expect(formatTime(new Date(2025, 7, 15, 0, 0), 'g:i A')).toBe('12:00 AM');
		expect(formatTime(new Date(2025, 7, 15, 12, 0), 'g:i A')).toBe('12:00 PM');
	});

	it('formats 12-hour lowercase am/pm', () => {
		expect(formatTime(AUG_15, 'g:i a')).toBe('2:30 pm');
	});

	it('applies HH:i custom format with zero-padded hours', () => {
		expect(formatTime(new Date(2025, 7, 15, 9, 5), 'HH:i')).toBe('09:05');
	});
});

describe('formatTimeWithSeconds', () => {
	const date = new Date(2025, 7, 15, 14, 30, 45);

	it('returns HH:MM:SS by default', () => {
		expect(formatTimeWithSeconds(date)).toBe('14:30:45');
	});

	it('formats 12-hour with seconds', () => {
		expect(formatTimeWithSeconds(date, 'g:i A')).toBe('2:30:45 PM');
	});
});

describe('getDateDiffInDays', () => {
	it('returns 0 for the same date', () => {
		const d = new Date(2025, 7, 15);
		expect(getDateDiffInDays(d, d)).toBe(0);
	});

	it('returns positive for later second date', () => {
		expect(getDateDiffInDays(new Date(2025, 7, 15), new Date(2025, 7, 20))).toBe(5);
	});

	it('returns negative for earlier second date', () => {
		expect(getDateDiffInDays(new Date(2025, 7, 20), new Date(2025, 7, 15))).toBe(-5);
	});
});

describe('getDateDiffInMinutes', () => {
	it('returns minutes between two dates', () => {
		const d1 = new Date(2025, 7, 15, 10, 0);
		const d2 = new Date(2025, 7, 15, 11, 30);
		expect(getDateDiffInMinutes(d1, d2)).toBe(90);
	});
});

describe('getDatePlusDays / getDateMinusDays', () => {
	it('adds days correctly', () => {
		const result = getDatePlusDays(AUG_15, 3);
		expect(result.getDate()).toBe(18);
	});

	it('subtracts days correctly', () => {
		const result = getDateMinusDays(AUG_15, 5);
		expect(result.getDate()).toBe(10);
	});

	it('does not mutate the original date', () => {
		const original = new Date(2025, 7, 15);
		getDatePlusDays(original, 10);
		expect(original.getDate()).toBe(15);
	});
});

describe('isDateToday / isDateTomorrow / isDateYesterday', () => {
	it('recognises today', () => {
		expect(isDateToday(new Date())).toBe(true);
		expect(isDateToday(new Date(2000, 0, 1))).toBe(false);
	});

	it('recognises tomorrow', () => {
		expect(isDateTomorrow(getDatePlusDays(new Date(), 1))).toBe(true);
		expect(isDateTomorrow(new Date())).toBe(false);
	});

	it('recognises yesterday', () => {
		expect(isDateYesterday(getDateMinusDays(new Date(), 1))).toBe(true);
		expect(isDateYesterday(new Date())).toBe(false);
	});
});

describe('isDateInThePast / isDateInTheFuture / isDateAfter', () => {
	it('identifies past dates', () => {
		expect(isDateInThePast(new Date(2000, 0, 1))).toBe(true);
		expect(isDateInThePast(new Date(2099, 0, 1))).toBe(false);
	});

	it('identifies future dates', () => {
		expect(isDateInTheFuture(new Date(2099, 0, 1))).toBe(true);
		expect(isDateInTheFuture(new Date(2000, 0, 1))).toBe(false);
	});

	it('compares two dates with isDateAfter', () => {
		const earlier = new Date(2025, 0, 1);
		const later = new Date(2025, 6, 1);
		expect(isDateAfter(later, earlier)).toBe(true);
		expect(isDateAfter(earlier, later)).toBe(false);
	});
});

describe('daysSince', () => {
	it('returns 0 for today', () => {
		expect(daysSince(new Date())).toBe(0);
	});

	it('returns correct count for a past date', () => {
		expect(daysSince(getDateMinusDays(new Date(), 10))).toBe(10);
	});

	it('accepts a date string', () => {
		expect(daysSince(getDateMinusDays(new Date(), 3).toISOString())).toBe(3);
	});
});

describe('getWeekNumber', () => {
	it('returns week 1 for Jan 1 2025', () => {
		expect(getWeekNumber(new Date(2025, 0, 1))).toBe(1);
	});

	it('returns week 33 for Aug 15 2025', () => {
		expect(getWeekNumber(AUG_15)).toBe(33);
	});
});

describe('getISOWeek', () => {
	it('returns ISO week and year for Aug 15 2025', () => {
		const result = getISOWeek(AUG_15);
		expect(result.week).toBe(33);
		expect(result.year).toBe(2025);
	});

	it('handles year boundary — Dec 29 2025 belongs to ISO week 1 of 2026', () => {
		const result = getISOWeek(new Date(2025, 11, 29));
		expect(result.week).toBe(1);
		expect(result.year).toBe(2026);
	});
});

describe('getISOWeeksInYear', () => {
	it('returns 53 for years with an ISO week 53', () => {
		expect(getISOWeeksInYear(2020)).toBe(53);
		expect(getISOWeeksInYear(2026)).toBe(53);
	});

	it('returns 52 for years without an ISO week 53', () => {
		expect(getISOWeeksInYear(2025)).toBe(52);
		expect(getISOWeeksInYear(2027)).toBe(52);
	});
});

describe('getHoursOfDay', () => {
	it('returns the 24 hours as zero-padded strings', () => {
		const hours = getHoursOfDay();
		expect(hours).toHaveLength(24);
		expect(hours[0]).toBe('00');
		expect(hours[9]).toBe('09');
		expect(hours[23]).toBe('23');
	});

	it('matches the array the calendar views used to build', () => {
		const legacy = Array.from({ length: 24 }, (_, i) => i + 1).map((i) =>
			(i - 1).toString().padStart(2, '0')
		);
		expect(getHoursOfDay()).toEqual(legacy);
	});
});

describe('isOffHour', () => {
	it('is true before 06:00', () => {
		expect(isOffHour('00')).toBe(true);
		expect(isOffHour('05')).toBe(true);
	});

	it('is false from 06:00 to 21:00', () => {
		expect(isOffHour('06')).toBe(false);
		expect(isOffHour('12')).toBe(false);
		expect(isOffHour('21')).toBe(false);
	});

	it('is true from 22:00 on', () => {
		expect(isOffHour('22')).toBe(true);
		expect(isOffHour('23')).toBe(true);
	});
});

describe('eachDayBetween', () => {
	const slugs = (dates: Date[]) => dates.map((d) => formatDate(d));

	it('walks the days after start up to and including the day that reaches end', () => {
		const days = eachDayBetween(new Date(2025, 7, 15), new Date(2025, 7, 18));
		expect(slugs(days)).toEqual(['16.08.2025', '17.08.2025', '18.08.2025']);
	});

	it('includes the first day past end when end is not on a day boundary', () => {
		const days = eachDayBetween(new Date(2025, 7, 15, 10), new Date(2025, 7, 17, 9));
		expect(slugs(days)).toEqual(['16.08.2025', '17.08.2025']);
	});

	it('keeps the time of day of start', () => {
		const days = eachDayBetween(AUG_15, new Date(2025, 7, 16, 14, 30));
		expect(days).toHaveLength(1);
		expect(days[0].getHours()).toBe(14);
		expect(days[0].getMinutes()).toBe(30);
	});

	it('crosses month and year boundaries', () => {
		const days = eachDayBetween(new Date(2025, 11, 30), new Date(2026, 0, 2));
		expect(slugs(days)).toEqual(['31.12.2025', '01.01.2026', '02.01.2026']);
	});

	it('returns nothing when start is not before end', () => {
		expect(eachDayBetween(AUG_15, AUG_15)).toEqual([]);
		expect(eachDayBetween(AUG_15, new Date(2025, 7, 14))).toEqual([]);
	});

	it('does not mutate start', () => {
		const start = new Date(2025, 7, 15);
		eachDayBetween(start, new Date(2025, 7, 18));
		expect(start.getDate()).toBe(15);
	});
});

describe('parseDateSlug', () => {
	it('parses a dd.mm.YYYY slug into a local date', () => {
		const date = parseDateSlug('15.08.2025');
		expect(date?.getFullYear()).toBe(2025);
		expect(date?.getMonth()).toBe(7);
		expect(date?.getDate()).toBe(15);
		expect(date?.getHours()).toBe(0);
	});

	it('round-trips with formatDate', () => {
		const date = parseDateSlug(formatDate(AUG_15));
		expect(date).not.toBeNull();
		expect(formatDate(date as Date)).toBe('15.08.2025');
	});

	it('returns null for invalid input', () => {
		expect(parseDateSlug('')).toBeNull();
		expect(parseDateSlug('15.08')).toBeNull();
		expect(parseDateSlug('2025-08-15')).toBeNull();
		expect(parseDateSlug('aa.bb.cccc')).toBeNull();
		expect(parseDateSlug('00.08.2025')).toBeNull();
	});
});

describe('parseUrlFormat', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('parses a YYYY-mm-dd value into a local date', () => {
		const date = parseUrlFormat('2025-08-15');
		expect(date?.getFullYear()).toBe(2025);
		expect(date?.getMonth()).toBe(7);
		expect(date?.getDate()).toBe(15);
		expect(date?.getHours()).toBe(0);
	});

	it('keeps the day in a timezone west of UTC', () => {
		vi.stubEnv('TZ', 'America/Chicago');
		expect(parseUrlFormat('2026-10-28')?.getDate()).toBe(28);
	});

	it('round-trips with getUrlFormat', () => {
		vi.stubEnv('TZ', 'America/Chicago');
		expect(getUrlFormat(parseUrlFormat('2026-10-28') as Date)).toBe('2026-10-28');
	});

	it('returns null for invalid input', () => {
		expect(parseUrlFormat('')).toBeNull();
		expect(parseUrlFormat('2025-08')).toBeNull();
		expect(parseUrlFormat('15.08.2025')).toBeNull();
		expect(parseUrlFormat('aaaa-bb-cc')).toBeNull();
		expect(parseUrlFormat('2025-08-00')).toBeNull();
	});
});
