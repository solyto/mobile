import { eachDayBetween, formatDate, getDateDiffInMinutes } from '$lib/helpers/DateHelper';
import type { CalendarEvent, CalendarEventResponse } from '$lib/types/calendar';

const MINUTES_PER_DAY = 1440;

function spansMoreThanOneDay(event: CalendarEvent): boolean {
	return getDateDiffInMinutes(event.start_date, event.end_date) > MINUTES_PER_DAY;
}

// Calendar days after the start day that a timed event still runs into.
function followingDaysTouched(event: CalendarEvent): Date[] {
	const days: Date[] = [];
	const current = new Date(event.start_date);
	current.setHours(0, 0, 0, 0);
	current.setDate(current.getDate() + 1);

	while (current < event.end_date) {
		days.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return days;
}

export default class CalendarEventService {
	fromApi(response: CalendarEventResponse): CalendarEvent {
		return {
			...response,
			start_date: new Date(response.start_date),
			end_date: new Date(response.end_date),
			recurrence_end: response.recurrence_end ? new Date(response.recurrence_end) : null,
			original_start_date: response.original_start_date
				? new Date(response.original_start_date)
				: null
		};
	}

	groupByDay(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
		const byDay: Record<string, CalendarEvent[]> = {};

		for (const event of events) {
			(byDay[formatDate(event.start_date)] ??= []).push(event);

			if (event.is_all_day && spansMoreThanOneDay(event)) {
				for (const day of eachDayBetween(event.start_date, event.end_date)) {
					(byDay[formatDate(day)] ??= []).push(event);
				}
			}

			if (!event.is_all_day) {
				for (const day of followingDaysTouched(event)) {
					(byDay[formatDate(day)] ??= []).push(event);
				}
			}
		}

		return byDay;
	}
}
