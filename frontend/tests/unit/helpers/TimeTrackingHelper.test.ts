import { describe, it, expect } from 'vitest';
import {
	durationInMinutes,
	durationOnlyTimestamps,
	formatDuration,
	formatElapsed,
	minutesBetween,
	splitDuration,
	timeTrackingTab,
	toDateTimeInputValue
} from '$lib/helpers/TimeTrackingHelper';

describe('timeTrackingTab', () => {
	it('reads the tab from the query and falls back to the dashboard', () => {
		expect(timeTrackingTab(new URL('https://x/time-tracking?tab=entries'))).toBe('entries');
		expect(timeTrackingTab(new URL('https://x/time-tracking?tab=statistics'))).toBe('statistics');
		expect(timeTrackingTab(new URL('https://x/time-tracking?tab=other'))).toBe('dashboard');
		expect(timeTrackingTab(new URL('https://x/time-tracking'))).toBe('dashboard');
	});
});

describe('formatDuration', () => {
	it('shows minutes only below an hour, else hours and minutes', () => {
		expect(formatDuration(0)).toBe('0m');
		expect(formatDuration(45)).toBe('45m');
		expect(formatDuration(60)).toBe('1h 0m');
		expect(formatDuration(125)).toBe('2h 5m');
	});
});

describe('splitDuration', () => {
	it('uses hours only for whole hours of at least one hour', () => {
		expect(splitDuration(120)).toEqual({ amount: 2, unit: 'hours' });
		expect(splitDuration(90)).toEqual({ amount: 90, unit: 'minutes' });
		expect(splitDuration(0)).toEqual({ amount: 0, unit: 'minutes' });
	});
});

describe('durationInMinutes', () => {
	it('converts hours and rounds to whole minutes', () => {
		expect(durationInMinutes(1.5, 'hours')).toBe(90);
		expect(durationInMinutes(0.01, 'hours')).toBe(1);
		expect(durationInMinutes(12.4, 'minutes')).toBe(12);
	});
});

describe('minutesBetween', () => {
	it('is zero unless the stop is after the start', () => {
		expect(minutesBetween('2026-10-03T09:15', '2026-10-03T10:00')).toBe(45);
		expect(minutesBetween('2026-10-03T10:00', '2026-10-03T10:00')).toBe(0);
		expect(minutesBetween('2026-10-03T10:00', '2026-10-03T09:00')).toBe(0);
	});
});

describe('durationOnlyTimestamps', () => {
	it('starts at local noon of the day and lasts the duration', () => {
		expect(durationOnlyTimestamps('2026-10-03', 90)).toEqual({
			started_at: '2026-10-03T12:00:00.000Z',
			stopped_at: '2026-10-03T13:30:00.000Z'
		});
	});
});

describe('toDateTimeInputValue', () => {
	it('formats an instant for a datetime-local input, without seconds', () => {
		expect(toDateTimeInputValue('2026-01-05T07:08:59.000Z')).toBe('2026-01-05T07:08');
	});
});

describe('formatElapsed', () => {
	it('formats seconds as hours, minutes and seconds', () => {
		expect(formatElapsed(0)).toBe('00:00:00');
		expect(formatElapsed(3725)).toBe('01:02:05');
		expect(formatElapsed(360000)).toBe('100:00:00');
	});
});
