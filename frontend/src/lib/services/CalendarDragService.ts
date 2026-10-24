import { formatFloatingDate } from '$lib/helpers/DateHelper';
import type { CalendarEvent, UpdateEventRequest } from '$lib/types/calendar';

export interface CalendarDropTarget {
	date: Date;
	hour: number;
	minute: number;
}

export default class CalendarDragService {
	static readonly SNAP_MINUTES: number = 15;

	snapToMinutes(minutes: number, granularity: number = CalendarDragService.SNAP_MINUTES): number {
		return Math.round(minutes / granularity) * granularity;
	}

	buildMoveRequest(event: CalendarEvent, target: CalendarDropTarget): UpdateEventRequest | null {
		if (this.isSameSlot(event, target)) {
			return null;
		}

		const duration = event.end_date ? event.end_date.getTime() - event.start_date.getTime() : 0;

		const newStart = event.is_all_day
			? this.atStartOfDay(target.date)
			: this.atSlot(target.date, target.hour, target.minute);
		const newEnd =
			duration > 0
				? new Date(newStart.getTime() + duration)
				: new Date(newStart.getTime() + 60 * 60 * 1000);

		return {
			calendar_id: event.calendar_id,
			title: event.title,
			description: event.description,
			location: event.location,
			start_date: formatFloatingDate(newStart),
			end_date: formatFloatingDate(newEnd),
			is_all_day: event.is_all_day,
			is_recurring: event.is_recurring,
			recurrence_rule: event.recurrence_rule,
			recurrence_end: event.recurrence_end ? formatFloatingDate(event.recurrence_end) : null,
			etag: event.etag
		};
	}

	private isSameSlot(event: CalendarEvent, target: CalendarDropTarget): boolean {
		const start = event.start_date;

		if (
			start.getFullYear() !== target.date.getFullYear() ||
			start.getMonth() !== target.date.getMonth() ||
			start.getDate() !== target.date.getDate()
		) {
			return false;
		}

		if (event.is_all_day) {
			return true;
		}

		return start.getHours() === target.hour && start.getMinutes() === target.minute;
	}

	private atSlot(date: Date, hour: number, minute: number): Date {
		const slot = new Date(date);
		slot.setHours(hour, minute, 0, 0);
		return slot;
	}

	private atStartOfDay(date: Date): Date {
		const start = new Date(date);
		start.setHours(0, 0, 0, 0);
		return start;
	}
}
