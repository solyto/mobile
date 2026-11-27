import type { CalendarEvent, EventWriteResult } from '$lib/types/calendar';
import type { CalendarRecords } from '$lib/types/translation';
import { formatDate, getUrlFormat } from '$lib/helpers/DateHelper';

export function getCalendarEventKey(item: CalendarEvent): string {
	return item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime();
}

export function startsOnDate(item: CalendarEvent, date: Date): boolean {
	return formatDate(item.start_date) === formatDate(date);
}

// A timed event that spans several days is dragged from its start day only.
export function isDraggableOnDate(item: CalendarEvent, date: Date): boolean {
	return item.is_all_day || startsOnDate(item, date);
}

export function showsStartTimeOnDate(item: CalendarEvent, date: Date): boolean {
	return !item.is_all_day && startsOnDate(item, date);
}

export function eventsStartingOn(events: CalendarEvent[], day: Date): CalendarEvent[] {
	return events.filter((event) => startsOnDay(event, day)).sort(byStart);
}

export function eventsNotStartingOn(events: CalendarEvent[], day: Date): CalendarEvent[] {
	return events.filter((event) => !startsOnDay(event, day)).sort(byStart);
}

// Unlike startsOnDate, also takes the raw date strings the widget endpoint sends.
function startsOnDay(event: CalendarEvent, day: Date): boolean {
	return getUrlFormat(new Date(event.start_date)) === getUrlFormat(day);
}

function byStart(a: CalendarEvent, b: CalendarEvent): number {
	return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
}

export function isRecurringOccurrence(item: CalendarEvent): boolean {
	return item.is_recurring && item.original_start_date !== null;
}

export function combineDateAndTime(date: Date, hours: number, minutes: number): Date {
	const result = new Date(date);
	result.setHours(hours, minutes, 0, 0);
	return result;
}

export function adjustEventRange(
	changed: 'start' | 'end',
	start: Date,
	end: Date,
	duration: number
): { start: Date; end: Date } {
	if (changed === 'start') {
		return { start, end: new Date(start.getTime() + duration) };
	}
	if (end.getTime() < start.getTime()) {
		return { start: new Date(end.getTime() - duration), end };
	}
	return { start, end };
}

export function eventWriteErrorMessage(result: EventWriteResult, calendar: CalendarRecords, fallback: string): string {
	switch (result) {
		case 'changed_on_server':
			return calendar.event_changed_on_server;
		case 'unreadable':
			return calendar.event_unreadable;
		case 'server_unavailable':
			return calendar.event_server_unavailable;
		case 'read_only':
			return calendar.event_read_only;
		default:
			return fallback;
	}
}

export function moveErrorMessage(result: EventWriteResult, calendar: CalendarRecords): string {
	return eventWriteErrorMessage(result, calendar, calendar.entry_move_error);
}
