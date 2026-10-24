import { describe, it, expect } from 'vitest';
import {
	adjustEventRange,
	combineDateAndTime,
	getCalendarEventKey
} from '$lib/helpers/CalendarEventHelper';
import type { CalendarEvent } from '$lib/types/calendar';

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
	return {
		id: 1,
		uri: 'event-1.ics',
		title: 'Meeting',
		description: '',
		location: '',
		start_date: new Date('2026-10-13T09:00:00Z'),
		end_date: new Date('2026-10-13T10:00:00Z'),
		is_all_day: false,
		is_recurring: false,
		recurrence_rule: null,
		recurrence_end: null,
		original_start_date: null,
		created_at: null,
		updated_at: null,
		calendar_id: 1,
		calendar_name: 'Work',
		calendar_color: '#ff0000',
		etag: 'etag',
		...overrides
	};
}

describe('getCalendarEventKey', () => {
	it('combines the uri with the start time', () => {
		const event = makeEvent();
		expect(getCalendarEventKey(event)).toBe('event-1.ics-' + event.start_date.getTime());
	});

	it('uses the original start date of a recurrence instance', () => {
		const original = new Date('2026-10-06T09:00:00Z');
		expect(getCalendarEventKey(makeEvent({ original_start_date: original }))).toBe(
			'event-1.ics-' + original.getTime()
		);
	});

	it('gives two instances of one recurring event different keys', () => {
		const first = makeEvent({ original_start_date: new Date('2026-10-06T09:00:00Z') });
		const second = makeEvent({ original_start_date: new Date('2026-10-13T09:00:00Z') });
		expect(getCalendarEventKey(first)).not.toBe(getCalendarEventKey(second));
	});
});

describe('combineDateAndTime', () => {
	it('replaces the time of the date with the given hours and minutes', () => {
		const result = combineDateAndTime(new Date('2026-10-15T09:41:27.123Z'), 22, 3);
		expect(result).toEqual(new Date('2026-10-15T22:03:00.000Z'));
	});

	it('does not change the given date', () => {
		const date = new Date('2026-10-15T09:41:00Z');
		combineDateAndTime(date, 22, 3);
		expect(date).toEqual(new Date('2026-10-15T09:41:00Z'));
	});
});

describe('adjustEventRange', () => {
	const hour = 60 * 60 * 1000;

	it('moves the end along with a changed start, keeping the duration', () => {
		const start = new Date('2026-10-15T22:03:00Z');
		const result = adjustEventRange('start', start, new Date('2026-10-15T13:00:00Z'), hour);
		expect(result).toEqual({ start, end: new Date('2026-10-15T23:03:00Z') });
	});

	it('moves the end into the next day when needed', () => {
		const start = new Date('2026-10-15T23:30:00Z');
		const result = adjustEventRange('start', start, start, hour);
		expect(result.end).toEqual(new Date('2026-10-16T00:30:00Z'));
	});

	it('moves the start back when the end is set before it, keeping the duration', () => {
		const end = new Date('2026-10-15T21:00:00Z');
		const result = adjustEventRange('end', new Date('2026-10-15T22:03:00Z'), end, hour);
		expect(result).toEqual({ start: new Date('2026-10-15T20:00:00Z'), end });
	});

	it('compares minutes, not only hours', () => {
		const end = new Date('2026-10-15T10:15:00Z');
		const result = adjustEventRange('end', new Date('2026-10-15T10:30:00Z'), end, hour);
		expect(result.start).toEqual(new Date('2026-10-15T09:15:00Z'));
	});

	it('leaves the start alone when the end is still after it', () => {
		const start = new Date('2026-10-15T10:00:00Z');
		const end = new Date('2026-10-15T12:00:00Z');
		expect(adjustEventRange('end', start, end, hour)).toEqual({ start, end });
	});
});
