import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import type { Calendars } from '$lib/state/Calendars.svelte';
import { formatTime } from '$lib/helpers/DateHelper';
import { renderWithContext } from './helpers/context';
import ListDayHarness from './helpers/ListDayHarness.svelte';
import { calendarEvent } from '../unit/helpers/factories';

// jsdom can't parse color-mix(), the real tint; a plain colour makes the tint visible to the test.
vi.mock('$lib/helpers/ColorHelper', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/helpers/ColorHelper')>()),
	getEventBackgroundColor: () => 'rgb(1, 2, 3)'
}));

const day = new Date(2026, 10, 20);

const holiday = calendarEvent({ id: 1, uri: 'holiday', title: 'Holiday', is_all_day: true, start_date: new Date(2026, 10, 20), end_date: new Date(2026, 10, 21) });
const meeting = calendarEvent({ id: 2, uri: 'meeting', title: 'Meeting', start_date: new Date(2026, 10, 20, 10, 0), end_date: new Date(2026, 10, 20, 11, 0) });

function renderDay(): Calendars {
	let calendars: Calendars | null = null;
	renderWithContext(ListDayHarness, { day, events: [holiday, meeting], onReady: (c: Calendars) => (calendars = c) });
	return calendars!;
}

describe('Calendar list view day', () => {
	it('tints all-day events only and shows the start time of timed events', () => {
		renderDay();

		const allDay = screen.getByRole('button', { name: /Holiday/ });
		const timed = screen.getByRole('button', { name: /Meeting/ });

		expect(allDay.style.backgroundColor).toBe('rgb(1, 2, 3)');
		expect(allDay.textContent).not.toContain(formatTime(holiday.start_date));
		expect(timed.style.backgroundColor).toBe('');
		expect(timed.textContent).toContain(formatTime(meeting.start_date));
	});

	it('opens the clicked event', async () => {
		const calendars = renderDay();
		const showSidebar = vi.spyOn(calendars, 'showSidebar').mockResolvedValue();

		await fireEvent.click(screen.getByRole('button', { name: /Meeting/ }));

		expect(showSidebar).toHaveBeenCalledWith(null, meeting);
	});
});
