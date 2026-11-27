import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import type { Component } from 'svelte';
import type { Calendars } from '$lib/state/Calendars.svelte';
import type { ExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
import type { Calendar } from '$lib/types/calendar';
import { formatDate, formatTime } from '$lib/helpers/DateHelper';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';
import CalendarHarness from './helpers/CalendarHarness.svelte';
import { calendar, calendarEvent } from '../unit/helpers/factories';
import NavigationEntry from '$lib/components/calendars/NavigationEntry.svelte';
import CalendarEdit from '$lib/components/calendars/CalendarEdit.svelte';
import CalendarNavigation from '$lib/components/calendars/CalendarNavigation.svelte';
import MobileMonthView from '$lib/components/calendars/views/month/MobileMonthView.svelte';
import MobileDayView from '$lib/components/calendars/views/day/MobileDayView.svelte';
import MobileWeekView from '$lib/components/calendars/views/week/MobileWeekView.svelte';
import WeekDay from '$lib/components/calendars/views/week/Day.svelte';
import EventEdit from '$lib/components/calendars/EventEdit.svelte';
import ExternalAccountEntry from '$lib/components/calendars/ExternalAccountEntry.svelte';
import ExternalAccountRemoveModal from '$lib/components/calendars/ExternalAccountRemoveModal.svelte';
import CalendarView from '$lib/components/calendars/CalendarView.svelte';
import ShareCalendarModal from '$lib/components/calendars/ShareCalendarModal.svelte';
import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/calendar') } }));

vi.mock('$lib/helpers/ColorHelper', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/helpers/ColorHelper')>()),
	getEventBackgroundColor: () => 'rgb(1, 2, 3)'
}));

const day = new Date(2026, 10, 20);
const holiday = calendarEvent({ id: 1, uri: 'holiday', title: 'Holiday', is_all_day: true, start_date: new Date(2026, 10, 20), end_date: new Date(2026, 10, 21) });
const meeting = calendarEvent({ id: 2, uri: 'meeting', title: 'Meeting', start_date: new Date(2026, 10, 20, 10, 0), end_date: new Date(2026, 10, 20, 11, 0) });

function renderCalendar(component: Component<never>, props: Record<string, unknown> = {}, setup: (calendars: Calendars) => void = () => {}): Calendars {
	let store: Calendars | null = null;
	renderWithContext(CalendarHarness, {
		component,
		props,
		setup: (calendars: Calendars) => {
			setup(calendars);
			store = calendars;
		}
	});
	return store!;
}

function withStatus(status: string): string {
	return en.calendar.calendar_with_status.replace('{status}', status).replace('{name}', 'Personal');
}

describe('Calendar navigation entry', () => {
	function entryButton(entry: Calendar, setup: (calendars: Calendars) => void = () => {}): HTMLButtonElement {
		renderCalendar(NavigationEntry as Component<never>, { calendar: entry }, setup);
		return screen.getByRole('button');
	}

	it('names a rejected app password before an unreachable server', () => {
		const button = entryButton(calendar({ is_external: true }), (calendars) => {
			calendars.unavailableCalendarIds = [1];
			calendars.credentialsRejectedCalendarIds = [1];
		});

		expect(button.title).toBe(withStatus(en.calendar.external_credentials_rejected));
		expect(button).toHaveTextContent(en.calendar.external_credentials_rejected);
	});

	it('names an unreachable server', () => {
		const button = entryButton(calendar({ is_external: true }), (calendars) => (calendars.unavailableCalendarIds = [1]));

		expect(button.title).toBe(withStatus(en.calendar.external_unavailable));
		expect(button).toHaveTextContent(en.calendar.external_unavailable);
	});

	it('names an external calendar', () => {
		const button = entryButton(calendar({ is_external: true }));

		expect(button.title).toBe(withStatus(en.calendar.external_calendar));
		expect(button).toHaveTextContent(en.calendar.external_calendar);
	});

	it('names the owner of a shared calendar', () => {
		const button = entryButton(calendar({ is_shared: true, share_owner: 'Bob' }));

		expect(button.title).toBe('Shared by Bob');
	});

	it('offers to toggle a shared calendar without an owner', () => {
		expect(entryButton(calendar({ is_shared: true })).title).toBe(en.layout.toggle);
	});

	it('offers to toggle a plain calendar', () => {
		const button = entryButton(calendar());

		expect(button.title).toBe(en.layout.toggle);
		expect(button).toHaveTextContent(/^\s*P\s*$/);
	});
});

describe('Calendar edit row', () => {
	it('names the owner of a shared calendar first', () => {
		renderCalendar(CalendarEdit as Component<never>, { calendar: calendar({ is_shared: true, share_owner: 'Bob', is_external: true }) }, (calendars) => {
			calendars.credentialsRejectedCalendarIds = [1];
		});

		expect(screen.getByText('shared by Bob')).toBeInTheDocument();
		expect(screen.queryByText(en.calendar.external_credentials_rejected)).toBeNull();
	});

	it('shows a rejected app password and offers to change it', () => {
		renderCalendar(CalendarEdit as Component<never>, { calendar: calendar({ is_external: true }) }, (calendars) => {
			calendars.unavailableCalendarIds = [1];
			calendars.credentialsRejectedCalendarIds = [1];
		});

		expect(screen.getByText(en.calendar.external_credentials_rejected)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: en.calendar.account_change_password })).toBeInTheDocument();
	});

	it('shows an unreachable server without offering a password change', () => {
		renderCalendar(CalendarEdit as Component<never>, { calendar: calendar({ is_external: true }) }, (calendars) => {
			calendars.unavailableCalendarIds = [1];
		});

		expect(screen.getByText(en.calendar.external_unavailable)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: en.calendar.account_change_password })).toBeNull();
	});

	it('marks an external calendar', () => {
		renderCalendar(CalendarEdit as Component<never>, { calendar: calendar({ is_external: true }) });

		expect(screen.getByText(en.calendar.external_calendar)).toBeInTheDocument();
	});

	it('sends no colour for a calendar without one when clicking outside', async () => {
		const calendars = renderCalendar(CalendarEdit as Component<never>, { calendar: calendar({ color: null }) }, (store) => {
			store.updateCalendarColor = vi.fn().mockResolvedValue(true);
		});

		await fireEvent.mouseDown(document.body);

		expect(calendars.updateCalendarColor).not.toHaveBeenCalled();
	});
});

describe('Calendar navigation', () => {
	it('switches between the four views', async () => {
		const calendars = renderCalendar(CalendarNavigation as Component<never>);

		for (const view of ['week', 'day', 'list', 'month'] as const) {
			await fireEvent.click(screen.getByTitle(en.calendar[view]));
			expect(calendars.view).toBe(view);
		}
	});

	it('opens the sync dialog', async () => {
		const calendars = renderCalendar(CalendarNavigation as Component<never>);

		await fireEvent.click(screen.getByTitle(en.calendar.synchronize));

		expect(calendars.syncModal).toBe(true);
	});
});

describe('Calendar mobile month view', () => {
	function renderMonth(): Calendars {
		return renderCalendar(MobileMonthView as Component<never>, { weekStart: 'monday' }, (calendars) => {
			calendars.mobileSelectedDate = day;
			calendars.sortedEvents = { [formatDate(day)]: [holiday, meeting] };
		});
	}

	it('tints every event of the selected day and shows the start time of timed events', () => {
		renderMonth();

		const allDay = screen.getByRole('button', { name: /Holiday/ });
		const timed = screen.getByRole('button', { name: /Meeting/ });

		expect(allDay.style.backgroundColor).toBe('rgb(1, 2, 3)');
		expect(allDay.textContent).not.toContain(formatTime(holiday.start_date));
		expect(timed.style.backgroundColor).toBe('rgb(1, 2, 3)');
		expect(timed.textContent).toContain(formatTime(meeting.start_date));
	});

	it('opens the clicked event', async () => {
		const calendars = renderMonth();
		const showSidebar = vi.spyOn(calendars, 'showSidebar').mockResolvedValue();

		await fireEvent.click(screen.getByRole('button', { name: /Holiday/ }));
		await fireEvent.click(screen.getByRole('button', { name: /Meeting/ }));

		expect(showSidebar).toHaveBeenNthCalledWith(1, null, holiday);
		expect(showSidebar).toHaveBeenNthCalledWith(2, null, meeting);
	});
});

describe('Calendar mobile hour labels', () => {
	it.each([
		['day', MobileDayView],
		['week', MobileWeekView]
	])('labels every hour in the mobile %s view and dims the off hours', (_, view) => {
		renderCalendar(view as Component<never>);

		for (const hour of ['00', '05', '06', '21', '22', '23']) {
			expect(screen.getAllByText(hour).length).toBeGreaterThan(0);
		}
		expect(screen.getAllByText('05')[0]).toHaveClass('text-c-neutral-4');
		expect(screen.getAllByText('06')[0]).not.toHaveClass('text-c-neutral-4');
	});
});

describe('Calendar week day column', () => {
	function renderColumn(events = [meeting]): { calendars: Calendars; buttons: HTMLButtonElement[] } {
		const calendars = renderCalendar(WeekDay as Component<never>, { date: day }, (c) => {
			c.sortedEvents = { [formatDate(day)]: events };
		});
		vi.spyOn(calendars, 'showSidebar').mockResolvedValue();
		return { calendars, buttons: Array.from(document.querySelectorAll<HTMLButtonElement>('[data-calendar-day] button')) };
	}

	it('adds an all-day event or an event at the clicked hour', async () => {
		const { calendars, buttons } = renderColumn([]);

		await fireEvent.click(buttons[0]);
		await fireEvent.click(buttons[1 + 9]);

		expect(calendars.showSidebar).toHaveBeenNthCalledWith(1, day, null, { allDay: true });
		expect(calendars.showSidebar).toHaveBeenNthCalledWith(2, day, null, { hour: 9 });
	});

	it('adds an event on a double click into an empty part of a cell only', async () => {
		const { calendars, buttons } = renderColumn([]);

		await fireEvent.dblClick(buttons[0].parentElement!);
		await fireEvent.dblClick(buttons[1 + 9].parentElement!);
		await fireEvent.dblClick(buttons[1 + 9]);

		expect(calendars.showSidebar).toHaveBeenCalledTimes(2);
		expect(calendars.showSidebar).toHaveBeenNthCalledWith(1, day, null, { allDay: true });
		expect(calendars.showSidebar).toHaveBeenNthCalledWith(2, day, null, { hour: 9 });
	});

	it('gives short events a minimum height', () => {
		const short = calendarEvent({ uri: 'short', title: 'Short', start_date: new Date(2026, 10, 20, 8, 0), end_date: new Date(2026, 10, 20, 8, 39) });
		renderColumn([short]);

		expect(screen.getByRole('button', { name: 'Short' }).style.height).toBe('65%');
	});

	it('opens the clicked event', async () => {
		const { calendars } = renderColumn();

		await fireEvent.click(screen.getByRole('button', { name: 'Meeting' }));

		expect(calendars.showSidebar).toHaveBeenCalledWith(null, meeting);
	});
});

describe('Calendar event editor', () => {
	const occurrence = calendarEvent({ is_recurring: true, original_start_date: new Date(2026, 7, 10, 10, 0) });

	function renderEditor(activeEvent: typeof occurrence | null): Calendars {
		const calendars = renderCalendar(EventEdit as Component<never>, { timeZone: 'UTC' }, (c) => {
			c.calendars = [calendar()];
			c.activeEvent = activeEvent;
		});
		for (const method of ['createEvent', 'updateEvent', 'updateOccurrence', 'deleteEvent', 'deleteOccurrence'] as const) {
			vi.spyOn(calendars, method).mockResolvedValue('ok');
		}
		return calendars;
	}

	it('creates a new event', async () => {
		const calendars = renderEditor(null);

		await fireEvent.click(screen.getByRole('button', { name: en.layout.save }));

		expect(calendars.createEvent).toHaveBeenCalled();
	});

	it('opens an event of a read-only calendar without save and delete', () => {
		renderCalendar(EventEdit as Component<never>, { timeZone: 'UTC' }, (c) => {
			c.calendars = [calendar({ id: 2, is_shared: true, is_read_only: true })];
			c.activeEvent = calendarEvent({ calendar_id: 2 });
		});

		expect(screen.getByText(en.calendar.event_read_only)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: en.layout.save })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: en.calendar.delete_entry })).not.toBeInTheDocument();
	});

	it('creates new events in a writable calendar by default', async () => {
		const calendars = renderCalendar(EventEdit as Component<never>, { timeZone: 'UTC' }, (c) => {
			c.calendars = [calendar({ id: 2, is_read_only: true }), calendar({ id: 3, name: 'Mine' })];
			c.activeEvent = null;
		});
		vi.spyOn(calendars, 'createEvent').mockResolvedValue('ok');

		await fireEvent.click(screen.getByRole('button', { name: en.layout.save }));

		expect(calendars.createEvent).toHaveBeenCalledWith(expect.objectContaining({ calendar_id: 3 }));
	});

	it('updates a single event without asking', async () => {
		const single = calendarEvent();
		const calendars = renderEditor(single);

		await fireEvent.click(screen.getByRole('button', { name: en.layout.save }));

		expect(calendars.updateEvent).toHaveBeenCalledWith(single, expect.anything());
	});

	it('asks whether to change this occurrence or the whole series', async () => {
		const calendars = renderEditor(occurrence);

		await fireEvent.click(screen.getByRole('button', { name: en.layout.save }));
		await fireEvent.click(await screen.findByRole('button', { name: en.calendar.this_occurrence }));

		expect(calendars.updateOccurrence).toHaveBeenCalledWith(occurrence, expect.anything(), occurrence.original_start_date);
		expect(calendars.updateEvent).not.toHaveBeenCalled();
	});

	it('changes the whole series', async () => {
		const calendars = renderEditor(occurrence);

		await fireEvent.click(screen.getByRole('button', { name: en.layout.save }));
		await fireEvent.click(await screen.findByRole('button', { name: en.calendar.all_occurrences }));

		expect(calendars.updateEvent).toHaveBeenCalledWith(occurrence, expect.anything());
		expect(calendars.updateOccurrence).not.toHaveBeenCalled();
	});

	it('deletes this occurrence or the whole series', async () => {
		const calendars = renderEditor(occurrence);

		await fireEvent.click(screen.getByRole('button', { name: en.calendar.delete_entry }));
		await fireEvent.click(await screen.findByRole('button', { name: en.calendar.this_occurrence }));

		expect(calendars.deleteOccurrence).toHaveBeenCalledWith(occurrence, occurrence.original_start_date);
	});
});

describe('Calendar view with the user\'s settings', () => {
	function renderView(setup: (calendars: Calendars) => void = () => {}): Calendars {
		let store: Calendars | null = null;
		renderWithContext(CalendarHarness, {
			component: CalendarView,
			setup: (calendars: Calendars) => {
				calendars.view = 'month';
				setup(calendars);
				store = calendars;
			}
		}, {
			stores: { auth: { user: { settings: { week_start: 'sunday', timezone: 'Europe/Berlin' } } } }
		});
		return store!;
	}

	it('starts the month view on the user\'s first day of the week', () => {
		renderView();

		const labels = Object.values(en.calendar.weekdays_short).map((short) => `${short}.`);
		const headers = screen.getAllByText((text) => labels.includes(text));

		expect(headers[0]).toHaveTextContent(`${en.calendar.weekdays_short[7]}.`);
		expect(headers[1]).toHaveTextContent(`${en.calendar.weekdays_short[1]}.`);
	});

	it('reads the end of a series in the user\'s time zone when the event is saved', async () => {
		const series = calendarEvent({
			start_date: new Date(2026, 10, 20, 10, 0),
			end_date: new Date(2026, 10, 20, 11, 0),
			is_recurring: true,
			recurrence_rule: 'FREQ=DAILY;UNTIL=20261130T230000Z'
		});
		const calendars = renderView((c) => {
			c.calendars = [calendar()];
			c.activeEvent = series;
			c.editSidebar = true;
		});
		const updateEvent = vi.spyOn(calendars, 'updateEvent').mockResolvedValue('ok');

		await fireEvent.click(screen.getByLabelText(en.calendar.is_all_day));
		await fireEvent.click(screen.getByRole('button', { name: en.layout.save }));

		expect(updateEvent).toHaveBeenCalledWith(series, expect.objectContaining({ recurrence_rule: 'FREQ=DAILY;UNTIL=20261201' }));
	});
});

describe('Sharing a calendar', () => {
	it('shows each friend with their profile image', async () => {
		const friend = { id: 'u2', name: 'Bob', profile_image_path: 'u2/avatar.png' };
		const list = vi.fn((url: string) => Promise.resolve({ data: url.endsWith('/share') ? [] : [friend] }));
		renderWithContext(CalendarHarness, {
			component: ShareCalendarModal,
			props: { calendar: calendar(), onClose: () => {} }
		}, {
			stores: { auth: { apiService: { list } } }
		});

		expect((await screen.findByAltText('Profile')).getAttribute('src')).toBe(API_USER_STORAGE_URL + '/u2/avatar.png');
	});
});

describe('Removing an external account', () => {
	const account = { id: 7, server_url: 'https://cloud.example.com', username: 'alice', calendars: [] };

	function renderExternal(component: Component<never>, props: Record<string, unknown> = {}): ExternalCalendars {
		let store: ExternalCalendars | null = null;
		renderWithContext(CalendarHarness, {
			component,
			props,
			setup: (_: Calendars, externalCalendars: ExternalCalendars) => (store = externalCalendars)
		});
		return store!;
	}

	it('counts the account\'s calendars', () => {
		renderExternal(ExternalAccountEntry as Component<never>, { account });

		expect(screen.getByText('alice · 0 calendars')).toBeInTheDocument();
	});

	it('asks before an account is removed', async () => {
		const externalCalendars = renderExternal(ExternalAccountEntry as Component<never>, { account });

		await fireEvent.click(screen.getByRole('button', { name: en.calendar.account_remove }));

		expect(externalCalendars.removal).toEqual(account);
	});

	it('removes the account once confirmed', async () => {
		const externalCalendars = renderExternal(ExternalAccountRemoveModal as Component<never>);
		const deleteAccount = vi.spyOn(externalCalendars, 'deleteAccount').mockResolvedValue(true);
		externalCalendars.removal = account;

		await fireEvent.click(await screen.findByRole('button', { name: en.layout.modal_confirm }));

		expect(deleteAccount).toHaveBeenCalledWith(account);
		expect(externalCalendars.removal).toBeNull();
	});

	it('keeps the account when cancelled', async () => {
		const externalCalendars = renderExternal(ExternalAccountRemoveModal as Component<never>);
		const deleteAccount = vi.spyOn(externalCalendars, 'deleteAccount');
		externalCalendars.removal = account;

		await screen.findByRole('button', { name: en.layout.modal_confirm });
		const close = screen.getAllByRole('button').find((button) => button.textContent?.trim() !== en.layout.modal_confirm);
		await fireEvent.click(close!);

		expect(deleteAccount).not.toHaveBeenCalled();
		expect(externalCalendars.removal).toBeNull();
	});
});
