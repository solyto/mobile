import { describe, it, expect, beforeEach } from 'vitest';
import { Calendars } from '$lib/state/Calendars.svelte';
import { api, storage, resetStoreMocks } from '../setup/storeMocks';
import { todo } from '../helpers/factories';
import { SvelteDate } from 'svelte/reactivity';
import { getWeekNumber } from '$lib/helpers/DateHelper';
import type { Calendar, CalendarEvent } from '$lib/types/calendar';

function event(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
	return {
		id: 1,
		uri: 'event-1',
		title: 'Event',
		description: '',
		location: '',
		start_date: new SvelteDate(2026, 7, 10, 10, 0),
		end_date: new SvelteDate(2026, 7, 10, 11, 0),
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
		etag: '',
		...overrides
	};
}

beforeEach(() => {
	resetStoreMocks();
});

describe('Calendars store', () => {
	describe('constructor', () => {
		it('initialises from the current date and loads the persisted view', () => {
			const c = new Calendars();
			const now = new Date();
			expect(c.currentYear).toBe(now.getFullYear());
			expect(c.currentMonth).toBe(now.getMonth() + 1); // 1-based
			expect(c.view).toBe('month');
			expect(c.month.weeks).toHaveLength(6);
			expect(storage.get).toHaveBeenCalledWith(Calendars.LS_VIEW_KEY);
		});

		it('restores a persisted view', () => {
			storage.get.mockReturnValue('week');
			const c = new Calendars();
			expect(c.view).toBe('week');
		});
	});

	describe('loadMonth', () => {
		it('builds a 42-day Monday-first grid for the current month', () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			c.loadMonth();

			expect(c.month.weeks).toHaveLength(6);
			for (const week of c.month.weeks) {
				expect(week.days).toHaveLength(7);
				// weeks start on Monday
				expect(week.days[0].weekday).toBe(1);
			}

			// August 2026: 1 Aug is a Saturday, grid starts Mon 27 Jul 2026
			expect(c.month.weeks[0].days[0].date).toEqual(new Date(2026, 6, 27));
			expect(c.month.weeks[0].days[0].is_grayed_out).toBe(true);
			// 31 non-grayed days for August
			const nonGrayed = c.month.weeks.flatMap((w) => w.days).filter((d) => !d.is_grayed_out);
			expect(nonGrayed).toHaveLength(31);
			// grid ends Sun 6 Sep 2026
			expect(c.month.weeks[5].days[6].date).toEqual(new Date(2026, 8, 6));
		});

		it('assigns ISO week numbers per row', () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			c.loadMonth();
			expect(c.month.weeks.map((w) => w.number)).toEqual([31, 32, 33, 34, 35, 36]);
		});

		it('handles a year-boundary month (January)', () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 1;
			c.loadMonth();
			// January 2026 starts on a Thursday, grid starts Mon 29 Dec 2025
			expect(c.month.weeks[0].days[0].date).toEqual(new Date(2025, 11, 29));
			expect(c.month.weeks[0].days[0].is_grayed_out).toBe(true);
		});
	});

	describe('loadEvents', () => {
		it('requests events for the current year-month and builds sortedEvents', async () => {
			const e1 = event({
				id: 1,
				start_date: new SvelteDate(2026, 7, 10, 10, 0),
				end_date: new SvelteDate(2026, 7, 10, 11, 0)
			});
			const e2 = event({
				id: 2,
				title: 'Second',
				start_date: new SvelteDate(2026, 7, 14, 9, 0),
				end_date: new SvelteDate(2026, 7, 14, 10, 0)
			});
			api.list.mockResolvedValue({ data: [e1, e2] });

			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			await c.loadEvents();

			expect(api.list).toHaveBeenCalledWith(
				expect.stringContaining('/calendars/events/2026-08')
			);
			expect(c.events).toHaveLength(2);
			expect(Object.keys(c.sortedEvents).sort()).toEqual(['10.08.2026', '14.08.2026']);
			expect(c.sortedEvents['14.08.2026'][0].id).toBe(2);
		});

		it('expands multi-day all-day events onto every spanned day', async () => {
			const multiDay = event({
				id: 1,
				is_all_day: true,
				start_date: new SvelteDate(2026, 7, 10),
				end_date: new SvelteDate(2026, 7, 12)
			});
			api.list.mockResolvedValue({ data: [multiDay] });

			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			await c.loadEvents();

			expect(c.sortedEvents['10.08.2026']).toHaveLength(1);
			expect(c.sortedEvents['11.08.2026']).toHaveLength(1);
			// the loop pushes the incremented date before re-checking, so the end date is included
			expect(c.sortedEvents['12.08.2026']).toHaveLength(1);
		});

		it('does not expand single-day all-day events', async () => {
			const singleDay = event({
				id: 1,
				is_all_day: true,
				start_date: new SvelteDate(2026, 7, 10),
				end_date: new SvelteDate(2026, 7, 11)
			});
			api.list.mockResolvedValue({ data: [singleDay] });

			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			await c.loadEvents();

			expect(Object.keys(c.sortedEvents)).toEqual(['10.08.2026']);
		});

		it('keeps the previous events when the request fails', async () => {
			api.list.mockResolvedValue(null);
			const c = new Calendars();
			c.sortedEvents = { '10.08.2026': [event()] };
			await c.loadEvents();
			expect(c.sortedEvents['10.08.2026']).toHaveLength(1);
		});
	});

	describe('event lookup for a date', () => {
		it('getEventsForDate returns the events of that day', () => {
			const e = event();
			const c = new Calendars();
			c.sortedEvents = { '10.08.2026': [e] };
			expect(c.getEventsForDate(new SvelteDate(2026, 7, 10))).toEqual([e]);
		});

		it('getEventsForDate returns an empty array for a date without events', () => {
			const c = new Calendars();
			expect(c.getEventsForDate(new SvelteDate(2026, 7, 11))).toEqual([]);
		});

		it('getAllDayEventsForDate keeps only all-day events', () => {
			const allDay = event({ id: 1, is_all_day: true });
			const timed = event({ id: 2, is_all_day: false });
			const c = new Calendars();
			c.sortedEvents = { '10.08.2026': [allDay, timed] };
			expect(c.getAllDayEventsForDate(new SvelteDate(2026, 7, 10))).toEqual([allDay]);
		});

		it('getNonAllDayEventsForDate keeps only timed events sorted by start time', () => {
			const late = event({ id: 1, start_date: new SvelteDate(2026, 7, 10, 15, 0) });
			const early = event({ id: 2, start_date: new SvelteDate(2026, 7, 10, 8, 0) });
			const allDay = event({ id: 3, is_all_day: true });
			const c = new Calendars();
			c.sortedEvents = { '10.08.2026': [late, allDay, early] };
			expect(
				c.getNonAllDayEventsForDate(new SvelteDate(2026, 7, 10)).map((x) => x.id)
			).toEqual([2, 1]);
		});

		it('getNonAllDayEventsForDate returns an empty array when nothing is sorted for the date', () => {
			const c = new Calendars();
			expect(c.getNonAllDayEventsForDate(new SvelteDate(2026, 7, 10))).toEqual([]);
		});
	});

	describe('getTodosForDate', () => {
		it('returns todos whose due date falls on the given day', () => {
			const c = new Calendars();
			c.todos = [
				todo({ id: '1', due_at: '2026-08-14' }),
				todo({ id: '2', due_at: '2026-08-15' }),
				todo({ id: '3', due_at: '2026-08-14T18:00:00' })
			];
			const result = c.getTodosForDate(new SvelteDate(2026, 7, 14));
			expect(result.map((t) => t.id)).toEqual(['1', '3']);
		});

		it('returns an empty array when no todo is due that day', () => {
			const c = new Calendars();
			c.todos = [todo({ id: '1', due_at: '2026-09-01' })];
			expect(c.getTodosForDate(new SvelteDate(2026, 7, 14))).toEqual([]);
		});
	});

	describe('month navigation', () => {
		it('nextMonth advances the month and reloads events', async () => {
			api.list.mockResolvedValue({ data: [] });
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			await c.nextMonth();
			expect(c.currentMonth).toBe(9);
			expect(c.currentYear).toBe(2026);
			expect(api.list).toHaveBeenCalledWith(
				expect.stringContaining('/calendars/events/2026-09')
			);
		});

		it('nextMonth wraps December to January of the next year', async () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 12;
			await c.nextMonth();
			expect(c.currentMonth).toBe(1);
			expect(c.currentYear).toBe(2027);
		});

		it('lastMonth goes back and reloads events', async () => {
			api.list.mockResolvedValue({ data: [] });
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			await c.lastMonth();
			expect(c.currentMonth).toBe(7);
			expect(c.currentYear).toBe(2026);
			expect(api.list).toHaveBeenCalledWith(
				expect.stringContaining('/calendars/events/2026-07')
			);
		});

		it('lastMonth wraps January to December of the previous year', async () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 1;
			await c.lastMonth();
			expect(c.currentMonth).toBe(12);
			expect(c.currentYear).toBe(2025);
		});
	});

	describe('week navigation', () => {
		it('nextWeek advances the week and updates the mobile week start', () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentWeek = 32;
			c.nextWeek();
			expect(c.currentWeek).toBe(33);
			expect(c.mobileWeekStart.getFullYear()).toBe(2026);
		});

		it('nextWeek wraps week 53 into the next year', () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 12;
			c.currentWeek = 53;
			c.nextWeek();
			expect(c.currentYear).toBe(2027);
			expect(c.currentMonth).toBe(13); // month is incremented without clamping (current behaviour)
			expect(c.currentWeek).toBe(2);
		});

		it('lastWeek goes back a week', () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentWeek = 32;
			c.lastWeek();
			expect(c.currentWeek).toBe(31);
		});

		it('lastWeek wraps week 1 into the previous year', () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 1;
			c.currentWeek = 1;
			c.lastWeek();
			expect(c.currentYear).toBe(2025);
			expect(c.currentMonth).toBe(0); // month is decremented without clamping (current behaviour)
			expect(c.currentWeek).toBe(52);
		});
	});

	describe('day navigation', () => {
		it('nextDay and lastDay move the current date', () => {
			const c = new Calendars();
			c.currentDate = new SvelteDate(2026, 7, 14);
			c.nextDay();
			expect(c.currentDate).toEqual(new SvelteDate(2026, 7, 15));
			c.lastDay();
			expect(c.currentDate).toEqual(new SvelteDate(2026, 7, 14));
		});

		it('goToToday resets navigation to the current date', async () => {
			const c = new Calendars();
			c.currentDate = new SvelteDate(2020, 0, 1);
			c.currentWeek = 1;
			c.currentMonth = 1;
			c.currentYear = 2020;
			const now = new Date();
			await c.goToToday();
			expect(c.currentYear).toBe(now.getFullYear());
			expect(c.currentMonth).toBe(now.getMonth() + 1);
			expect(c.currentWeek).toBe(getWeekNumber(now));
			expect(c.currentDate.getDate()).toBe(now.getDate());
			expect(api.list).toHaveBeenCalledWith(
				expect.stringContaining(
					`/calendars/events/${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
				)
			);
		});
	});

	describe('view state persistence', () => {
		it('saveView persists the current view', () => {
			const c = new Calendars();
			c.view = 'list';
			c.saveView();
			expect(storage.set).toHaveBeenCalledWith(Calendars.LS_VIEW_KEY, 'list');
		});

		it('changeView updates the view and persists it', () => {
			const c = new Calendars();
			c.changeView('week');
			expect(c.view).toBe('week');
			expect(storage.set).toHaveBeenCalledWith(Calendars.LS_VIEW_KEY, 'week');
		});

		it('loadView falls back to month when nothing is stored', () => {
			storage.get.mockReturnValue(null);
			const c = new Calendars();
			c.loadView();
			expect(c.view).toBe('month');
		});
	});

	describe('derived calendar groupings', () => {
		it('splits calendars into owned, pending and accepted', () => {
			const base = {
				name: 'C',
				color: '#fff',
				description: '',
				timezone: 'UTC',
				order: 0,
				is_shared: false,
				share_owner: null,
				share_token: null
			};
			const c = new Calendars();
			c.calendars = [
				{ ...base, id: 1, invite_status: null },
				{ ...base, id: 2, invite_status: 'pending' },
				{ ...base, id: 3, invite_status: 'accepted' }
			] as Calendar[];

			expect(c.ownedCalendars.map((x) => x.id)).toEqual([1]);
			expect(c.pendingInvites.map((x) => x.id)).toEqual([2]);
			expect(c.acceptedSharedCalendars.map((x) => x.id)).toEqual([3]);
		});
	});

	describe('hidden calendars', () => {
		it('toggles a calendar id in and out of the hidden list', () => {
			const c = new Calendars();
			expect(c.isCalendarHidden(3)).toBe(false);
			c.toggleCalendar(3);
			expect(c.isCalendarHidden(3)).toBe(true);
			c.toggleCalendar(3);
			expect(c.isCalendarHidden(3)).toBe(false);
		});
	});

	describe('loadCalendars', () => {
		it('loads the calendars and marks the store as loaded', async () => {
			const c = new Calendars();
			api.list.mockResolvedValue({ data: [{ id: 1, name: 'Personal' }] });
			await c.loadCalendars();
			expect(c.calendars).toHaveLength(1);
			expect(c.loaded).toBe(true);
		});
	});

	describe('moveEvent', () => {
		it('updates a non-recurring event with the new dates and reloads events', async () => {
			api.update.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;

			const e = event();
			const ok = await c.moveEvent(e, { date: new SvelteDate(2026, 7, 14), hour: 14, minute: 30 });

			expect(ok).toBe(true);
			expect(api.update).toHaveBeenCalledWith(
				expect.stringContaining('/calendars/1/events/'),
				'event-1',
				expect.objectContaining({
					start_date: '2026-08-14T14:30:00',
					end_date: '2026-08-14T15:30:00',
					etag: ''
				})
			);
			// loadEvents ran after the update
			expect(api.list).toHaveBeenCalledWith(
				expect.stringContaining('/calendars/events/2026-08')
			);
		});

		it('returns false when the API update fails', async () => {
			api.update.mockResolvedValue(false);
			const c = new Calendars();
			const ok = await c.moveEvent(event(), {
				date: new SvelteDate(2026, 7, 14),
				hour: 14,
				minute: 30
			});
			expect(ok).toBe(false);
		});

		it('does nothing for a no-op drop on the same slot and returns true', async () => {
			const c = new Calendars();
			const ok = await c.moveEvent(
				event({ start_date: new SvelteDate(2026, 7, 10, 10, 0) }),
				{ date: new SvelteDate(2026, 7, 10), hour: 10, minute: 0 }
			);
			expect(ok).toBe(true);
			expect(api.update).not.toHaveBeenCalled();
		});

		it('defers recurring occurrences to the pending move decision instead of calling the API', async () => {
			const c = new Calendars();
			const recurring = event({
				is_recurring: true,
				original_start_date: new SvelteDate(2026, 7, 10, 10, 0)
			});

			const ok = await c.moveEvent(recurring, {
				date: new SvelteDate(2026, 7, 14),
				hour: 10,
				minute: 0
			});

			expect(ok).toBe(true);
			expect(c.pendingMove).not.toBeNull();
			expect(c.pendingMove!.request.start_date).toBe('2026-08-14T10:00:00');
			expect(api.update).not.toHaveBeenCalled();
			expect(api.put).not.toHaveBeenCalled();
		});

		it('resolvePendingMove(true) updates only the occurrence via the original start date', async () => {
			api.put.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			const recurring = event({
				is_recurring: true,
				original_start_date: new SvelteDate(2026, 7, 10, 10, 0)
			});

			await c.moveEvent(recurring, { date: new SvelteDate(2026, 7, 14), hour: 10, minute: 0 });
			const ok = await c.resolvePendingMove(true);

			expect(ok).toBe(true);
			expect(c.pendingMove).toBeNull();
			expect(api.put).toHaveBeenCalledWith(
				expect.stringContaining('/calendars/1/events/event-1/occurrence/'),
				expect.objectContaining({ start_date: '2026-08-14T10:00:00' })
			);
			expect(api.update).not.toHaveBeenCalled();
		});

		it('resolvePendingMove(false) updates the whole series', async () => {
			api.update.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			const recurring = event({
				is_recurring: true,
				original_start_date: new SvelteDate(2026, 7, 10, 10, 0)
			});

			await c.moveEvent(recurring, { date: new SvelteDate(2026, 7, 14), hour: 10, minute: 0 });
			const ok = await c.resolvePendingMove(false);

			expect(ok).toBe(true);
			expect(c.pendingMove).toBeNull();
			expect(api.update).toHaveBeenCalledWith(
				expect.stringContaining('/calendars/1/events/'),
				'event-1',
				expect.objectContaining({ start_date: '2026-08-14T10:00:00' })
			);
			expect(api.put).not.toHaveBeenCalled();
		});

		it('moves the series master (recurring without original start) directly', async () => {
			api.update.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			const master = event({ is_recurring: true, original_start_date: null });

			const ok = await c.moveEvent(master, {
				date: new SvelteDate(2026, 7, 14),
				hour: 10,
				minute: 0
			});

			expect(ok).toBe(true);
			expect(c.pendingMove).toBeNull();
			expect(api.update).toHaveBeenCalled();
		});

		it('cancelPendingMove clears the pending decision', async () => {
			const c = new Calendars();
			const recurring = event({
				is_recurring: true,
				original_start_date: new SvelteDate(2026, 7, 10, 10, 0)
			});

			await c.moveEvent(recurring, { date: new SvelteDate(2026, 7, 14), hour: 10, minute: 0 });
			expect(c.pendingMove).not.toBeNull();

			c.cancelPendingMove();
			expect(c.pendingMove).toBeNull();
			expect(api.update).not.toHaveBeenCalled();
		});
	});
});
