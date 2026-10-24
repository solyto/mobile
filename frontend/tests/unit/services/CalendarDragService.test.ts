import { describe, it, expect } from 'vitest';
import CalendarDragService from '$lib/services/CalendarDragService';
import type { CalendarEvent, UpdateEventRequest } from '$lib/types/calendar';

function event(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
	return {
		id: 1,
		uri: 'event-1',
		title: 'Meeting',
		description: '',
		location: '',
		start_date: new Date(2026, 7, 10, 10, 0),
		end_date: new Date(2026, 7, 10, 11, 0),
		is_all_day: false,
		is_recurring: false,
		recurrence_rule: null,
		recurrence_end: null,
		original_start_date: null,
		created_at: null,
		updated_at: null,
		calendar_id: 1,
		calendar_name: 'Personal',
		calendar_color: '#fff',
		etag: 'abc123',
		...overrides
	};
}

const service = new CalendarDragService();

describe('CalendarDragService', () => {
	describe('snapToMinutes', () => {
		it('snaps to 15-minute slots with rounding', () => {
			expect(service.snapToMinutes(0)).toBe(0);
			expect(service.snapToMinutes(7)).toBe(0);
			expect(service.snapToMinutes(8)).toBe(15);
			expect(service.snapToMinutes(22)).toBe(15);
			expect(service.snapToMinutes(23)).toBe(30);
			expect(service.snapToMinutes(44)).toBe(45);
			expect(service.snapToMinutes(58)).toBe(60);
		});

		it('supports a custom granularity', () => {
			expect(service.snapToMinutes(40, 60)).toBe(60);
			expect(service.snapToMinutes(20, 30)).toBe(30);
		});
	});

	describe('buildMoveRequest', () => {
		it('moves a timed event to the target slot keeping its duration', () => {
			const request = service.buildMoveRequest(event(), {
				date: new Date(2026, 7, 14),
				hour: 14,
				minute: 30
			}) as UpdateEventRequest;

			expect(request.start_date).toBe('2026-08-14T14:30:00');
			expect(request.end_date).toBe('2026-08-14T15:30:00');
			expect(request.is_all_day).toBe(false);
			expect(request.etag).toBe('abc123');
		});

		it('returns null when the timed event is dropped on its current day and time', () => {
			const request = service.buildMoveRequest(event(), {
				date: new Date(2026, 7, 10),
				hour: 10,
				minute: 0
			});
			expect(request).toBeNull();
		});

		it('still moves a timed event when only the minute is snapped differently on the same day', () => {
			const request = service.buildMoveRequest(event(), {
				date: new Date(2026, 7, 10),
				hour: 10,
				minute: 45
			}) as UpdateEventRequest;
			expect(request.start_date).toBe('2026-08-10T10:45:00');
		});

		it('moves an all-day event date-only and keeps its duration in days', () => {
			const allDay = event({
				is_all_day: true,
				start_date: new Date(2026, 7, 10),
				end_date: new Date(2026, 7, 12)
			});
			const request = service.buildMoveRequest(allDay, {
				date: new Date(2026, 7, 15),
				hour: 0,
				minute: 0
			}) as UpdateEventRequest;

			expect(request.start_date).toBe('2026-08-15T00:00:00');
			expect(request.end_date).toBe('2026-08-17T00:00:00');
			expect(request.is_all_day).toBe(true);
		});

		it('returns null when an all-day event is dropped on its current day', () => {
			const allDay = event({
				is_all_day: true,
				start_date: new Date(2026, 7, 10),
				end_date: new Date(2026, 7, 11)
			});
			const request = service.buildMoveRequest(allDay, {
				date: new Date(2026, 7, 10),
				hour: 0,
				minute: 0
			});
			expect(request).toBeNull();
		});

		it('keeps the time of day when a timed event is moved date-only (month view)', () => {
			const request = service.buildMoveRequest(
				event({
					start_date: new Date(2026, 7, 10, 16, 20),
					end_date: new Date(2026, 7, 10, 17, 20)
				}),
				{ date: new Date(2026, 7, 18), hour: 16, minute: 20 }
			) as UpdateEventRequest;

			expect(request.start_date).toBe('2026-08-18T16:20:00');
			expect(request.end_date).toBe('2026-08-18T17:20:00');
		});

		it('preserves the duration of an event that crosses midnight', () => {
			const late = event({
				start_date: new Date(2026, 7, 10, 22, 0),
				end_date: new Date(2026, 7, 11, 2, 0)
			});
			const request = service.buildMoveRequest(late, {
				date: new Date(2026, 7, 15),
				hour: 9,
				minute: 0
			}) as UpdateEventRequest;

			expect(request.start_date).toBe('2026-08-15T09:00:00');
			expect(request.end_date).toBe('2026-08-15T13:00:00');
		});

		it('falls back to a 1-hour duration when the event has no end date', () => {
			const noEnd = event({ end_date: null as unknown as Date });
			const request = service.buildMoveRequest(noEnd, {
				date: new Date(2026, 7, 14),
				hour: 11,
				minute: 15
			}) as UpdateEventRequest;

			expect(request.start_date).toBe('2026-08-14T11:15:00');
			expect(request.end_date).toBe('2026-08-14T12:15:00');
		});

		it('preserves recurrence data and the etag for recurring events', () => {
			const recurring = event({
				is_recurring: true,
				recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
				recurrence_end: new Date(2026, 11, 31)
			});
			const request = service.buildMoveRequest(recurring, {
				date: new Date(2026, 7, 14),
				hour: 10,
				minute: 0
			}) as UpdateEventRequest;

			expect(request.is_recurring).toBe(true);
			expect(request.recurrence_rule).toBe('FREQ=WEEKLY;BYDAY=MO');
			expect(request.recurrence_end).toBe('2026-12-31T00:00:00');
			expect(request.etag).toBe('abc123');
		});

		it('copies description and location untouched', () => {
			const request = service.buildMoveRequest(
				event({ description: 'desc', location: 'Office' }),
				{ date: new Date(2026, 7, 14), hour: 9, minute: 0 }
			) as UpdateEventRequest;

			expect(request.description).toBe('desc');
			expect(request.location).toBe('Office');
			expect(request.title).toBe('Meeting');
			expect(request.calendar_id).toBe(1);
		});
	});
});
