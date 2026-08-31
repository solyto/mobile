import { describe, it, expect } from 'vitest';
import {
	formatDate,
	formatDateWithoutYear,
	formatDateTime,
	formatTime,
	formatTimeWithSeconds,
	getDateDiffInDays,
	getDateDiffInMinutes,
	getDateMinusDays,
	getDatePlusDays,
	getISOWeek,
	getWeekNumber,
	isDateAfter,
	isDateInTheFuture,
	isDateInThePast,
	isDateToday,
	isDateTomorrow,
	isDateYesterday,
	daysSince
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
