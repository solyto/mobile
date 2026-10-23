import { describe, it, expect } from 'vitest';
import CalendarEventService from '$lib/services/CalendarEventService';
import type { CalendarEvent, CalendarEventResponse } from '$lib/types/calendar';

function response(overrides: Partial<CalendarEventResponse> = {}): CalendarEventResponse {
	return {
		id: 1,
		uri: 'event-1',
		title: 'Meeting',
		description: 'Weekly sync',
		location: 'Office',
		start_date: '2026-08-10T10:00:00Z',
		end_date: '2026-08-10T11:00:00Z',
		is_all_day: false,
		is_recurring: false,
		recurrence_rule: null,
		recurrence_end: null,
		original_start_date: null,
		created_at: '2026-08-01T08:00:00Z',
		updated_at: null,
		calendar_id: 3,
		calendar_name: 'Personal',
		calendar_color: '#ff0000',
		etag: 'etag-1',
		...overrides
	};
}

const service = new CalendarEventService();

function loadedEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
	return {
		...service.fromApi(response()),
		...overrides
	};
}

describe('CalendarEventService', () => {
	describe('fromApi', () => {
		it('converts start and end date strings to Date instances', () => {
			const event = service.fromApi(response());

			expect(event.start_date).toBeInstanceOf(Date);
			expect(event.start_date.getTime()).toBe(Date.UTC(2026, 7, 10, 10, 0));
			expect(event.end_date).toBeInstanceOf(Date);
			expect(event.end_date.getTime()).toBe(Date.UTC(2026, 7, 10, 11, 0));
		});

		it('keeps null recurrence end and original start date as null', () => {
			const event = service.fromApi(response());

			expect(event.recurrence_end).toBeNull();
			expect(event.original_start_date).toBeNull();
		});

		it('converts recurrence end and original start date when set', () => {
			const event = service.fromApi(
				response({
					is_recurring: true,
					recurrence_rule: 'FREQ=WEEKLY',
					recurrence_end: '2026-12-31T00:00:00Z',
					original_start_date: '2026-08-03T10:00:00Z'
				})
			);

			expect(event.recurrence_end).toBeInstanceOf(Date);
			expect(event.recurrence_end!.getTime()).toBe(Date.UTC(2026, 11, 31));
			expect(event.original_start_date).toBeInstanceOf(Date);
			expect(event.original_start_date!.getTime()).toBe(Date.UTC(2026, 7, 3, 10, 0));
		});

		it('passes every other field through unchanged', () => {
			const input = response({ is_recurring: true, recurrence_rule: 'FREQ=DAILY' });
			const event = service.fromApi(input);

			expect(event).toEqual({
				...input,
				start_date: new Date('2026-08-10T10:00:00Z'),
				end_date: new Date('2026-08-10T11:00:00Z'),
				recurrence_end: null,
				original_start_date: null
			});
		});

		it('returns a new object and leaves the response untouched', () => {
			const input = response();
			const event = service.fromApi(input);

			expect(event).not.toBe(input);
			expect(input.start_date).toBe('2026-08-10T10:00:00Z');
		});
	});

	describe('groupByDay', () => {
		it('returns an empty index for no events', () => {
			expect(service.groupByDay([])).toEqual({});
		});

		it('keys events by the dd.mm.YYYY slug of their start date', () => {
			const first = loadedEvent({ id: 1 });
			const second = loadedEvent({
				id: 2,
				start_date: new Date('2026-08-14T09:00:00Z'),
				end_date: new Date('2026-08-14T10:00:00Z')
			});

			expect(service.groupByDay([first, second])).toEqual({
				'10.08.2026': [first],
				'14.08.2026': [second]
			});
		});

		it('expands a multi-day all-day event onto every day, end day included', () => {
			const multiDay = loadedEvent({
				is_all_day: true,
				start_date: new Date('2026-08-10T00:00:00Z'),
				end_date: new Date('2026-08-12T00:00:00Z')
			});

			const byDay = service.groupByDay([multiDay]);

			expect(Object.keys(byDay)).toEqual(['10.08.2026', '11.08.2026', '12.08.2026']);
		});

		it('does not expand an all-day event spanning exactly one day', () => {
			const singleDay = loadedEvent({
				is_all_day: true,
				start_date: new Date('2026-08-10T00:00:00Z'),
				end_date: new Date('2026-08-11T00:00:00Z')
			});

			expect(Object.keys(service.groupByDay([singleDay]))).toEqual(['10.08.2026']);
		});

		it('does not expand a timed event spanning more than one day', () => {
			const longTimed = loadedEvent({
				start_date: new Date('2026-08-10T10:00:00Z'),
				end_date: new Date('2026-08-12T10:00:00Z')
			});

			expect(Object.keys(service.groupByDay([longTimed]))).toEqual(['10.08.2026']);
		});

		it('keeps the input order of events on the same day', () => {
			const late = loadedEvent({ id: 1, start_date: new Date('2026-08-10T15:00:00Z') });
			const early = loadedEvent({ id: 2, start_date: new Date('2026-08-10T08:00:00Z') });

			const byDay = service.groupByDay([late, early]);

			expect(byDay['10.08.2026'].map((e) => e.id)).toEqual([1, 2]);
		});

		it('puts the same object reference into every bucket', () => {
			const multiDay = loadedEvent({
				is_all_day: true,
				start_date: new Date('2026-08-10T00:00:00Z'),
				end_date: new Date('2026-08-12T00:00:00Z')
			});

			const byDay = service.groupByDay([multiDay]);

			expect(byDay['10.08.2026'][0]).toBe(multiDay);
			expect(byDay['11.08.2026'][0]).toBe(multiDay);
			expect(byDay['12.08.2026'][0]).toBe(multiDay);
		});
	});
});
