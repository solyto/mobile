import type { CalendarEvent } from '$lib/types/calendar';

export function getCalendarEventKey(item: CalendarEvent): string {
	return item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime();
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
