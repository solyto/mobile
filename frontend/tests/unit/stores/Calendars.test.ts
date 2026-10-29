import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Calendars } from '$lib/state/Calendars.svelte';
import { api, auth, storage, resetStoreMocks } from '../setup/storeMocks';
import { todo } from '../helpers/factories';
import { SvelteDate } from 'svelte/reactivity';
import { getWeekNumber } from '$lib/helpers/DateHelper';
import type { Calendar, CalendarEvent, UpdateEventRequest } from '$lib/types/calendar';
import { apiRoutes } from '$lib/config/apiRoutes';

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

afterEach(() => {
	vi.useRealTimers();
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

	describe('widget refresh', () => {
		it('notifies the widgets after a successful event change only', async () => {
			const c = new Calendars();

			api.delete.mockResolvedValueOnce(false);
			await c.deleteEvent(event());
			expect(auth.widgetBridge.notifyChanged).not.toHaveBeenCalled();

			api.delete.mockResolvedValueOnce(true);
			await c.deleteEvent(event());
			expect(auth.widgetBridge.notifyChanged).toHaveBeenCalledTimes(1);
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

		it('builds a Sunday-first grid when the week starts on Sunday', () => {
			auth.getWeekStart.mockReturnValue('sunday');
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			c.loadMonth();

			for (const week of c.month.weeks) {
				expect(week.days[0].weekday).toBe(7);
			}
			// August 2026: 1 Aug is a Saturday, grid starts Sun 26 Jul 2026 and ends Sat 5 Sep 2026
			expect(c.month.weeks[0].days[0].date).toEqual(new Date(2026, 6, 26));
			expect(c.month.weeks[5].days[6].date).toEqual(new Date(2026, 8, 5));
			const nonGrayed = c.month.weeks.flatMap((w) => w.days).filter((d) => !d.is_grayed_out);
			expect(nonGrayed).toHaveLength(31);
		});

		it('labels Sunday-first rows with the ISO week of their Monday', () => {
			auth.getWeekStart.mockReturnValue('sunday');
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			c.loadMonth();
			expect(c.month.weeks.map((w) => w.number)).toEqual([31, 32, 33, 34, 35, 36]);
		});

		it('handles a year-boundary month (January) when the week starts on Sunday', () => {
			auth.getWeekStart.mockReturnValue('sunday');
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 1;
			c.loadMonth();
			// grid starts Sun 28 Dec 2025, whose Monday (29 Dec) is in 2026-W1
			expect(c.month.weeks[0].days[0].date).toEqual(new Date(2025, 11, 28));
			expect(c.month.weeks[0].number).toBe(1);
		});
	});

	describe('loadEvents', () => {
		function apiEvent(overrides: Record<string, unknown> = {}): Record<string, unknown> {
			return {
				id: 1,
				uri: 'event-1',
				title: 'Event',
				description: '',
				location: '',
				start_date: '2026-08-10T10:00:00Z',
				end_date: '2026-08-10T11:00:00Z',
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

		async function loadAugust(data: Record<string, unknown>[]): Promise<Calendars> {
			api.list.mockResolvedValue({ data });
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 8;
			await c.loadEvents();
			return c;
		}

		it('requests events for the current year-month and builds sortedEvents', async () => {
			const c = await loadAugust([
				apiEvent({ id: 1 }),
				apiEvent({
					id: 2,
					title: 'Second',
					start_date: '2026-08-14T09:00:00Z',
					end_date: '2026-08-14T10:00:00Z'
				})
			]);

			expect(api.list).toHaveBeenCalledWith(
				expect.stringContaining('/calendars/events/2026-08')
			);
			expect(c.events).toHaveLength(2);
			expect(Object.keys(c.sortedEvents).sort()).toEqual(['10.08.2026', '14.08.2026']);
			expect(c.sortedEvents['14.08.2026'][0].id).toBe(2);
		});

		it('converts the date strings to Date instances and keeps the other fields', async () => {
			const c = await loadAugust([
				apiEvent({ id: 1 }),
				apiEvent({
					id: 2,
					is_recurring: true,
					recurrence_rule: 'FREQ=WEEKLY',
					recurrence_end: '2026-12-31T00:00:00Z',
					original_start_date: '2026-08-03T10:00:00Z'
				})
			]);

			const [plain, recurring] = c.events;
			expect(plain.start_date).toBeInstanceOf(Date);
			expect(plain.start_date.getTime()).toBe(Date.UTC(2026, 7, 10, 10, 0));
			expect(plain.end_date).toBeInstanceOf(Date);
			expect(plain.end_date.getTime()).toBe(Date.UTC(2026, 7, 10, 11, 0));
			expect(plain.recurrence_end).toBeNull();
			expect(plain.original_start_date).toBeNull();
			expect(plain.title).toBe('Event');
			expect(plain.calendar_name).toBe('Personal');

			expect(recurring.recurrence_end).toBeInstanceOf(Date);
			expect(recurring.recurrence_end!.getTime()).toBe(Date.UTC(2026, 11, 31));
			expect(recurring.original_start_date).toBeInstanceOf(Date);
			expect(recurring.original_start_date!.getTime()).toBe(Date.UTC(2026, 7, 3, 10, 0));
			expect(recurring.recurrence_rule).toBe('FREQ=WEEKLY');
		});

		it('expands multi-day all-day events onto every spanned day', async () => {
			const c = await loadAugust([
				apiEvent({
					is_all_day: true,
					start_date: '2026-08-10T00:00:00Z',
					end_date: '2026-08-12T00:00:00Z'
				})
			]);

			expect(Object.keys(c.sortedEvents)).toEqual(['10.08.2026', '11.08.2026', '12.08.2026']);
			expect(c.sortedEvents['10.08.2026']).toHaveLength(1);
			expect(c.sortedEvents['11.08.2026']).toHaveLength(1);
			// the end date is included
			expect(c.sortedEvents['12.08.2026']).toHaveLength(1);
		});

		it('does not expand single-day all-day events', async () => {
			const c = await loadAugust([
				apiEvent({
					is_all_day: true,
					start_date: '2026-08-10T00:00:00Z',
					end_date: '2026-08-11T00:00:00Z'
				})
			]);

			expect(Object.keys(c.sortedEvents)).toEqual(['10.08.2026']);
		});

		it('does not expand timed events spanning more than one day', async () => {
			const c = await loadAugust([
				apiEvent({
					start_date: '2026-08-10T10:00:00Z',
					end_date: '2026-08-12T10:00:00Z'
				})
			]);

			expect(Object.keys(c.sortedEvents)).toEqual(['10.08.2026']);
		});

		it('puts the loaded event into every sortedEvents bucket it spans', async () => {
			const c = await loadAugust([
				apiEvent({
					is_all_day: true,
					start_date: '2026-08-10T00:00:00Z',
					end_date: '2026-08-12T00:00:00Z'
				})
			]);

			const [loaded] = c.events;
			expect(c.sortedEvents['10.08.2026'][0]).toEqual(loaded);
			expect(c.sortedEvents['11.08.2026'][0]).toEqual(loaded);
			expect(c.sortedEvents['12.08.2026'][0]).toEqual(loaded);
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
			c.currentWeekStart = new Date(2026, 7, 3);
			c.nextWeek();
			expect(c.currentWeekStart).toEqual(new Date(2026, 7, 10));
			expect(c.currentWeekNumber).toBe(33);
			expect(c.mobileWeekStart).toEqual(new Date(2026, 7, 10));
		});

		it('lastWeek goes back a week', () => {
			const c = new Calendars();
			c.currentWeekStart = new Date(2026, 7, 3);
			c.lastWeek();
			expect(c.currentWeekStart).toEqual(new Date(2026, 6, 27));
			expect(c.currentWeekNumber).toBe(31);
		});

		it('nextWeek moves from the last week of a 52-week year into week 1', () => {
			const c = new Calendars();
			c.currentWeekStart = new Date(2025, 11, 22);
			c.nextWeek();
			expect(c.currentWeekNumber).toBe(1);
			expect(c.mobileWeekStart).toEqual(new Date(2025, 11, 29));
		});

		it('nextWeek moves from week 53 of a 53-week year into week 1', () => {
			const c = new Calendars();
			c.currentWeekStart = new Date(2026, 11, 28);
			c.nextWeek();
			expect(c.currentWeekStart).toEqual(new Date(2027, 0, 4));
			expect(c.currentWeekNumber).toBe(1);
		});

		it('lastWeek moves from week 1 into the last week of a 52-week year', () => {
			const c = new Calendars();
			c.currentWeekStart = new Date(2025, 11, 29);
			c.lastWeek();
			expect(c.currentWeekNumber).toBe(52);
			expect(c.mobileWeekStart).toEqual(new Date(2025, 11, 22));
		});

		it('lastWeek moves from week 1 into week 53 of a 53-week year', () => {
			const c = new Calendars();
			c.currentWeekStart = new Date(2027, 0, 4);
			c.lastWeek();
			expect(c.currentWeekNumber).toBe(53);
			expect(c.mobileWeekStart).toEqual(new Date(2026, 11, 28));
		});

		it('moves Sunday weeks across the year boundary, labelled by their Monday', () => {
			auth.getWeekStart.mockReturnValue('sunday');
			const c = new Calendars();
			c.currentWeekStart = new Date(2025, 11, 21);
			expect(c.currentWeekNumber).toBe(52);
			c.nextWeek();
			expect(c.currentWeekStart).toEqual(new Date(2025, 11, 28));
			expect(c.currentWeekNumber).toBe(1);
			c.nextWeek();
			expect(c.currentWeekStart).toEqual(new Date(2026, 0, 4));
			expect(c.currentWeekNumber).toBe(2);
			c.lastWeek();
			c.lastWeek();
			expect(c.currentWeekStart).toEqual(new Date(2025, 11, 21));
		});

		it('labels the Sunday week before week 1 of 2027 as week 53', () => {
			auth.getWeekStart.mockReturnValue('sunday');
			const c = new Calendars();
			c.currentWeekStart = new Date(2027, 0, 3);
			expect(c.currentWeekNumber).toBe(1);
			c.lastWeek();
			expect(c.currentWeekStart).toEqual(new Date(2026, 11, 27));
			expect(c.currentWeekNumber).toBe(53);
		});

		it('nextWeek and lastWeek leave the calendar year and month alone', () => {
			const c = new Calendars();
			c.currentYear = 2026;
			c.currentMonth = 12;
			c.currentWeekStart = new Date(2026, 11, 28);
			c.nextWeek();
			expect(c.currentYear).toBe(2026);
			expect(c.currentMonth).toBe(12);
			c.lastWeek();
			c.lastWeek();
			expect(c.currentYear).toBe(2026);
			expect(c.currentMonth).toBe(12);
		});

		it('goToCurrentWeek returns to the week containing today', () => {
			vi.useFakeTimers({ toFake: ['Date'] });
			vi.setSystemTime(new Date(2026, 2, 4, 12, 0));

			const c = new Calendars();
			c.currentWeekStart = new Date(2020, 0, 6);
			c.goToCurrentWeek();
			expect(c.currentWeekStart).toEqual(new Date(2026, 2, 2));

			auth.getWeekStart.mockReturnValue('sunday');
			c.goToCurrentWeek();
			expect(c.currentWeekStart).toEqual(new Date(2026, 2, 1));
			expect(c.currentWeekNumber).toBe(10);
		});

		it('setMobileWeekStart moves the week to the one containing the date', () => {
			auth.getWeekStart.mockReturnValue('sunday');
			const c = new Calendars();
			c.setMobileWeekStart(new Date(2026, 2, 4));
			expect(c.mobileWeekStart).toEqual(new Date(2026, 2, 4));
			expect(c.currentWeekStart).toEqual(new Date(2026, 2, 1));
		});
	});

	describe('week around New Year', () => {
		const days = [
			{ date: new Date(2025, 11, 29, 12, 0), year: 2025, month: 12, sunday: new Date(2025, 11, 28), sundayWeek: 1 },
			{ date: new Date(2025, 11, 30, 12, 0), year: 2025, month: 12, sunday: new Date(2025, 11, 28), sundayWeek: 1 },
			{ date: new Date(2025, 11, 31, 12, 0), year: 2025, month: 12, sunday: new Date(2025, 11, 28), sundayWeek: 1 },
			{ date: new Date(2026, 0, 1, 12, 0), year: 2026, month: 1, sunday: new Date(2025, 11, 28), sundayWeek: 1 },
			{ date: new Date(2026, 0, 2, 12, 0), year: 2026, month: 1, sunday: new Date(2025, 11, 28), sundayWeek: 1 },
			{ date: new Date(2026, 0, 3, 12, 0), year: 2026, month: 1, sunday: new Date(2025, 11, 28), sundayWeek: 1 },
			{ date: new Date(2026, 0, 4, 12, 0), year: 2026, month: 1, sunday: new Date(2026, 0, 4), sundayWeek: 2 }
		];

		for (const { date, year, month, sunday, sundayWeek } of days) {
			const label = date.toDateString();

			it(`constructor on ${label} is in 2026-W1 and the calendar month`, () => {
				vi.useFakeTimers({ toFake: ['Date'] });
				vi.setSystemTime(date);

				const c = new Calendars();

				expect(c.currentWeekStart).toEqual(new Date(2025, 11, 29));
				expect(c.currentWeekNumber).toBe(1);
				expect(c.currentYear).toBe(year);
				expect(c.currentMonth).toBe(month);
			});

			it(`constructor on ${label} starts the Sunday week on ${sunday.toDateString()}`, () => {
				vi.useFakeTimers({ toFake: ['Date'] });
				vi.setSystemTime(date);
				auth.getWeekStart.mockReturnValue('sunday');

				const c = new Calendars();

				expect(c.currentWeekStart).toEqual(sunday);
				expect(c.currentWeekNumber).toBe(sundayWeek);
			});

			it(`goToToday on ${label} is in 2026-W1 and the calendar month`, async () => {
				vi.useFakeTimers({ toFake: ['Date'] });
				vi.setSystemTime(date);

				const c = new Calendars();
				c.currentWeekStart = new Date(2020, 2, 2);
				c.currentYear = 2020;
				c.currentMonth = 3;
				await c.goToToday();

				expect(c.currentWeekStart).toEqual(new Date(2025, 11, 29));
				expect(c.currentWeekNumber).toBe(1);
				expect(c.currentYear).toBe(year);
				expect(c.currentMonth).toBe(month);
			});
		}

		it('goToToday on 2027-01-01 is in week 53 of 2026', async () => {
			vi.useFakeTimers({ toFake: ['Date'] });
			vi.setSystemTime(new Date(2027, 0, 1, 12, 0));

			const c = new Calendars();
			await c.goToToday();

			expect(c.currentWeekStart).toEqual(new Date(2026, 11, 28));
			expect(c.currentWeekNumber).toBe(53);
			expect(c.currentYear).toBe(2027);
			expect(c.currentMonth).toBe(1);
		});

		it('goToToday on 2027-01-01 starts the Sunday week on 2026-12-27, week 53', async () => {
			vi.useFakeTimers({ toFake: ['Date'] });
			vi.setSystemTime(new Date(2027, 0, 1, 12, 0));
			auth.getWeekStart.mockReturnValue('sunday');

			const c = new Calendars();
			await c.goToToday();

			expect(c.currentWeekStart).toEqual(new Date(2026, 11, 27));
			expect(c.currentWeekNumber).toBe(53);
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
			c.currentWeekStart = new Date(2020, 0, 6);
			c.currentMonth = 1;
			c.currentYear = 2020;
			const now = new Date();
			await c.goToToday();
			expect(c.currentYear).toBe(now.getFullYear());
			expect(c.currentMonth).toBe(now.getMonth() + 1);
			expect(c.currentWeekNumber).toBe(getWeekNumber(now));
			expect(c.currentDate.getDate()).toBe(now.getDate());
			expect(api.list).toHaveBeenCalledWith(
				expect.stringContaining(
					`/calendars/events/${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
				)
			);
		});

		it('goToToday navigates to a pinned system date', async () => {
			vi.useFakeTimers({ toFake: ['Date'] });
			vi.setSystemTime(new Date(2026, 2, 4, 12, 0));

			const c = new Calendars();
			c.currentDate = new Date(2020, 0, 1);
			c.currentWeekStart = new Date(2020, 0, 6);
			c.currentMonth = 1;
			c.currentYear = 2020;
			await c.goToToday();

			expect(c.currentYear).toBe(2026);
			expect(c.currentMonth).toBe(3);
			expect(c.currentWeekStart).toEqual(new Date(2026, 2, 2));
			expect(c.currentWeekNumber).toBe(10);
			expect(c.currentDate).toEqual(new Date(2026, 2, 4, 12, 0));
			expect(api.list).toHaveBeenCalledWith(expect.stringContaining('/calendars/events/2026-03'));
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

		it('loadView falls back to month for an invalid stored view', () => {
			const c = new Calendars();
			storage.get.mockReturnValue('grid');
			c.loadView();
			expect(c.view).toBe('month');

			// the JSON format written before 7afd9d43
			storage.get.mockReturnValue('"week"');
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

	describe('updateEvent', () => {
		// Third occurrence (Oct 16) of a daily series at 9:00 that started Oct 14
		function occurrence(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
			return event({
				start_date: new SvelteDate(2030, 9, 16, 9, 0),
				end_date: new SvelteDate(2030, 9, 16, 10, 0),
				is_recurring: true,
				recurrence_rule: 'FREQ=DAILY',
				original_start_date: new SvelteDate(2030, 9, 16, 9, 0),
				...overrides
			});
		}

		function formRequest(entry: CalendarEvent, start_date: string): UpdateEventRequest {
			return {
				calendar_id: entry.calendar_id,
				title: 'Renamed',
				description: entry.description,
				location: entry.location,
				start_date,
				end_date: start_date,
				is_all_day: entry.is_all_day,
				is_recurring: entry.is_recurring,
				recurrence_rule: entry.recurrence_rule,
				recurrence_end: null,
				etag: entry.etag
			};
		}

		function sentBody(): UpdateEventRequest {
			return api.update.mock.calls[0][2];
		}

		beforeEach(() => {
			api.update.mockResolvedValue(true);
			api.put.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });
		});

		it('sends the listed occurrence start unchanged when only the title of the series changes', async () => {
			const entry = occurrence();

			await new Calendars().updateEvent(entry, formRequest(entry, '2030-10-16T09:00:00'));

			expect(sentBody().start_date).toBe('2030-10-16T09:00:00');
			expect(sentBody().occurrence_start_date).toBe('2030-10-16T09:00:00');
		});

		it('sends the start from before the drag when the series is dragged by an hour', async () => {
			const c = new Calendars();

			await c.moveEvent(occurrence(), { date: new SvelteDate(2030, 9, 16), hour: 10, minute: 0 });
			await c.resolvePendingMove(false);

			expect(sentBody().start_date).toBe('2030-10-16T10:00:00');
			expect(sentBody().occurrence_start_date).toBe('2030-10-16T09:00:00');
		});

		it('sends the start from before the drag when the series is dragged to the next day', async () => {
			const c = new Calendars();

			await c.moveEvent(occurrence(), { date: new SvelteDate(2030, 9, 17), hour: 9, minute: 0 });
			await c.resolvePendingMove(false);

			expect(sentBody().start_date).toBe('2030-10-17T09:00:00');
			expect(sentBody().occurrence_start_date).toBe('2030-10-16T09:00:00');
		});

		it('sends the listed start of a moved occurrence, not its original slot', async () => {
			const entry = occurrence({
				start_date: new SvelteDate(2030, 9, 16, 8, 0),
				end_date: new SvelteDate(2030, 9, 16, 9, 0)
			});

			await new Calendars().updateEvent(entry, formRequest(entry, '2030-10-16T08:00:00'));

			expect(sentBody().start_date).toBe('2030-10-16T08:00:00');
			expect(sentBody().occurrence_start_date).toBe('2030-10-16T08:00:00');
		});

		it('sends no occurrence start for a single event', async () => {
			const entry = event();

			await new Calendars().updateEvent(entry, formRequest(entry, '2026-08-10T10:00:00'));

			expect(sentBody()).not.toHaveProperty('occurrence_start_date');
		});

		it('sends no occurrence start when only this occurrence is changed', async () => {
			const c = new Calendars();

			await c.moveEvent(occurrence(), { date: new SvelteDate(2030, 9, 16), hour: 10, minute: 0 });
			await c.resolvePendingMove(true);

			expect(api.update).not.toHaveBeenCalled();
			expect(api.put.mock.calls[0][1]).not.toHaveProperty('occurrence_start_date');
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

	describe('calendar deletes go through the shared ApiService', () => {
		it('deleteOccurrence deletes the encoded occurrence and reloads events', async () => {
			api.delete.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });
			const c = new Calendars();
			const occurrence = new Date(Date.UTC(2026, 7, 10, 10, 0));

			const ok = await c.deleteOccurrence(event(), occurrence);

			expect(ok).toBe(true);
			expect(api.delete).toHaveBeenCalledWith(
				apiRoutes.calendars.deleteOccurrence.replace('%d', '1').replace('%s', 'event-1'),
				encodeURIComponent('2026-08-10T10:00:00.000Z')
			);
			expect(api.list).toHaveBeenCalledWith(expect.stringContaining('/calendars/events/'));
		});

		it('deleteOccurrence does not reload events on failure', async () => {
			api.delete.mockResolvedValue(false);
			const c = new Calendars();

			await expect(c.deleteOccurrence(event(), new Date())).resolves.toBe(false);
			expect(api.list).not.toHaveBeenCalled();
		});
	});
});
