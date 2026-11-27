import { describe, it, expect } from 'vitest';
import {
	adjustEventRange,
	combineDateAndTime,
	eventsNotStartingOn,
	eventsStartingOn,
	eventWriteErrorMessage,
	getCalendarEventKey,
	isDraggableOnDate,
	isRecurringOccurrence,
	moveErrorMessage,
	showsStartTimeOnDate,
	startsOnDate
} from '$lib/helpers/CalendarEventHelper';
import { en } from '$lib/i18n/en';
import { calendarEvent } from './factories';

describe('getCalendarEventKey', () => {
	it('combines the uri with the start time', () => {
		const event = calendarEvent();
		expect(getCalendarEventKey(event)).toBe('event-1-' + event.start_date.getTime());
	});

	it('uses the original start date of a recurrence instance', () => {
		const original = new Date('2026-10-06T09:00:00Z');
		expect(getCalendarEventKey(calendarEvent({ original_start_date: original }))).toBe(
			'event-1-' + original.getTime()
		);
	});

	it('gives two instances of one recurring event different keys', () => {
		const first = calendarEvent({ original_start_date: new Date('2026-10-06T09:00:00Z') });
		const second = calendarEvent({ original_start_date: new Date('2026-10-13T09:00:00Z') });
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

describe('eventWriteErrorMessage', () => {
	it('names the reason an external calendar refused the change', () => {
		expect(eventWriteErrorMessage('changed_on_server', en.calendar, 'fallback')).toBe(en.calendar.event_changed_on_server);
		expect(eventWriteErrorMessage('unreadable', en.calendar, 'fallback')).toBe(en.calendar.event_unreadable);
		expect(eventWriteErrorMessage('server_unavailable', en.calendar, 'fallback')).toBe(en.calendar.event_server_unavailable);
		expect(eventWriteErrorMessage('read_only', en.calendar, 'fallback')).toBe(en.calendar.event_read_only);
	});

	it('falls back to the given message for any other failure', () => {
		expect(eventWriteErrorMessage('failed', en.calendar, 'fallback')).toBe('fallback');
	});
});

describe('moveErrorMessage', () => {
	it('names the reason or says the entry could not be moved', () => {
		expect(moveErrorMessage('unreadable', en.calendar)).toBe(en.calendar.event_unreadable);
		expect(moveErrorMessage('failed', en.calendar)).toBe(en.calendar.entry_move_error);
	});
});

describe('start day of an event', () => {
	const startDay = new Date(2026, 7, 10);
	const nextDay = new Date(2026, 7, 11);
	const timed = calendarEvent({ start_date: new Date(2026, 7, 10, 22, 0), end_date: new Date(2026, 7, 11, 2, 0) });
	const allDay = calendarEvent({ is_all_day: true, start_date: new Date(2026, 7, 10), end_date: new Date(2026, 7, 12) });

	it('knows the day an event starts on', () => {
		expect(startsOnDate(timed, startDay)).toBe(true);
		expect(startsOnDate(timed, nextDay)).toBe(false);
	});

	it('drags a timed event from its start day only and an all-day event from every day', () => {
		expect(isDraggableOnDate(timed, startDay)).toBe(true);
		expect(isDraggableOnDate(timed, nextDay)).toBe(false);
		expect(isDraggableOnDate(allDay, nextDay)).toBe(true);
	});

	it('shows the start time of a timed event on its start day only', () => {
		expect(showsStartTimeOnDate(timed, startDay)).toBe(true);
		expect(showsStartTimeOnDate(timed, nextDay)).toBe(false);
		expect(showsStartTimeOnDate(allDay, startDay)).toBe(false);
	});
});

describe('isRecurringOccurrence', () => {
	it('is an occurrence of a series, not the series itself or a single event', () => {
		expect(isRecurringOccurrence(calendarEvent({ is_recurring: true, original_start_date: new Date(2026, 7, 10) }))).toBe(true);
		expect(isRecurringOccurrence(calendarEvent({ is_recurring: true, original_start_date: null }))).toBe(false);
		expect(isRecurringOccurrence(calendarEvent())).toBe(false);
	});
});

describe('eventsStartingOn / eventsNotStartingOn', () => {
	const today = new Date(2026, 10, 20, 15, 0);
	const late = calendarEvent({ id: 1, start_date: new Date(2026, 10, 20, 18, 0) });
	const early = calendarEvent({ id: 2, start_date: new Date(2026, 10, 20, 8, 0) });
	const tomorrow = calendarEvent({ id: 3, start_date: new Date(2026, 10, 21, 9, 0) });
	const yesterday = calendarEvent({ id: 4, start_date: new Date(2026, 10, 19, 23, 0) });
	const events = [tomorrow, late, yesterday, early];

	it('picks the events that start on the day, earliest first', () => {
		expect(eventsStartingOn(events, today).map((event) => event.id)).toEqual([2, 1]);
	});

	it('picks every other event, earliest first', () => {
		expect(eventsNotStartingOn(events, today).map((event) => event.id)).toEqual([4, 3]);
	});

	it('reads the raw date strings the widget endpoint sends', () => {
		const raw = calendarEvent({ start_date: '2026-11-20T09:00:00' as unknown as Date });
		expect(eventsStartingOn([raw], today)).toEqual([raw]);
	});

	it('leaves the given list in its order', () => {
		eventsStartingOn(events, today);
		expect(events.map((event) => event.id)).toEqual([3, 1, 4, 2]);
	});
});
