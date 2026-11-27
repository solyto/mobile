import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { CalendarImport } from '$lib/state/CalendarImport.svelte';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import type { Calendars } from '$lib/state/Calendars.svelte';
import { renderWithContext } from './helpers/context';
import CalendarImportModalHarness from './helpers/CalendarImportModalHarness.svelte';
import { calendar, calendarImportState } from '../unit/helpers/factories';

const ics = new File(['BEGIN:VCALENDAR'], 'Holidays.ics', { type: 'text/calendar' });

async function openFileForm(user: ReturnType<typeof userEvent.setup>, props: Record<string, unknown> = {}): Promise<void> {
	renderWithContext(CalendarImportModalHarness, props);
	await user.click(screen.getByRole('button', { name: '.ics file' }));
}

describe('Calendar ImportModal', () => {
	it('starts with the CalDAV form', () => {
		renderWithContext(CalendarImportModalHarness);

		expect(screen.getByLabelText('Server URL')).toBeInTheDocument();
		expect(screen.queryByLabelText('Select File')).not.toBeInTheDocument();
	});

	it('imports a file into a new calendar named after the file', async () => {
		const user = userEvent.setup();
		const importFile = vi.spyOn(CalendarImport.prototype, 'importFile').mockResolvedValue(null);
		await openFileForm(user);

		await user.upload(screen.getByLabelText('Select File'), ics);
		await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Holidays'));

		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(importFile).toHaveBeenCalledWith(ics, { type: 'new', name: 'Holidays', color: null });
	});

	it('names the new calendar after the file\'s X-WR-CALNAME', async () => {
		const user = userEvent.setup();
		const importFile = vi.spyOn(CalendarImport.prototype, 'importFile').mockResolvedValue(null);
		const named = new File(['BEGIN:VCALENDAR\r\nX-WR-CALNAME:School\\, holi\r\n days\r\nEND:VCALENDAR'], 'export.ics');
		await openFileForm(user);

		await user.upload(screen.getByLabelText('Select File'), named);
		await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('School, holidays'));

		await user.clear(screen.getByLabelText('Name'));
		await user.type(screen.getByLabelText('Name'), 'Trips');
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(importFile).toHaveBeenCalledWith(named, { type: 'new', name: 'Trips', color: null });
	});

	it('replaces a suggested name when another file is picked', async () => {
		const user = userEvent.setup();
		await openFileForm(user);

		await user.upload(screen.getByLabelText('Select File'), new File(['BEGIN:VCALENDAR\r\nX-WR-CALNAME:School\r\nEND:VCALENDAR'], 'a.ics'));
		await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('School'));
		await waitFor(() => expect(screen.getByLabelText('Select File')).toBeEnabled());
		await user.upload(screen.getByLabelText('Select File'), ics);

		await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Holidays'));
	});

	it('offers only .ics files', async () => {
		const user = userEvent.setup();
		await openFileForm(user);

		expect(screen.getByLabelText('Select File')).toHaveAttribute('accept', '.ics');
	});

	it('offers calendars that arrive after the form', async () => {
		const user = userEvent.setup();
		const importFile = vi.spyOn(CalendarImport.prototype, 'importFile').mockResolvedValue(null);
		let calendarsStore: Calendars | null = null;
		await openFileForm(user, { onCalendars: (store: Calendars) => (calendarsStore = store) });

		calendarsStore!.calendars = [calendar({ id: 5, name: 'Family' })];
		await user.selectOptions(await screen.findByRole('combobox', { name: 'Import into' }), '5');
		await user.upload(screen.getByLabelText('Select File'), ics);
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(importFile).toHaveBeenCalledWith(ics, { type: 'existing', calendarId: 5 });
	});

	it('keeps a name the user typed before picking the file', async () => {
		const user = userEvent.setup();
		await openFileForm(user);

		await user.type(screen.getByLabelText('Name'), 'Trips');
		await user.upload(screen.getByLabelText('Select File'), ics);
		await waitFor(() => expect(screen.getByLabelText('Select File')).toBeEnabled());

		expect(screen.getByLabelText('Name')).toHaveValue('Trips');
	});

	it('keeps a name the user typed when another file is picked', async () => {
		const user = userEvent.setup();
		await openFileForm(user);

		await user.upload(screen.getByLabelText('Select File'), ics);
		await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Holidays'));
		await user.clear(screen.getByLabelText('Name'));
		await user.type(screen.getByLabelText('Name'), 'Trips');
		await waitFor(() => expect(screen.getByLabelText('Select File')).toBeEnabled());
		await user.upload(screen.getByLabelText('Select File'), new File([''], 'other.ics'));

		expect(screen.getByLabelText('Name')).toHaveValue('Trips');
	});

	it('offers only own calendars as existing targets', async () => {
		const user = userEvent.setup();
		const importFile = vi.spyOn(CalendarImport.prototype, 'importFile').mockResolvedValue(null);
		await openFileForm(user, {
			calendars: [
				calendar({ id: 1, name: 'Personal' }),
				calendar({ id: 2, name: 'Team', is_shared: true }),
				calendar({ id: 3, name: 'Work', is_external: true }),
				calendar({ id: 4, name: 'Family' })
			]
		});

		const picker = screen.getByRole('combobox', { name: 'Import into' });
		expect([...picker.querySelectorAll('option')].map((option) => option.textContent)).toEqual(['New calendar', 'Personal', 'Family']);

		await user.selectOptions(picker, '4');
		await user.upload(screen.getByLabelText('Select File'), ics);
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(importFile).toHaveBeenCalledWith(ics, { type: 'existing', calendarId: 4 });
	});

	it('hides the target choice without own calendars', async () => {
		const user = userEvent.setup();
		await openFileForm(user, { calendars: [calendar({ is_shared: true })] });

		expect(screen.queryByRole('combobox', { name: 'Import into' })).not.toBeInTheDocument();
	});

	it('shows the message for a rejected file', async () => {
		const user = userEvent.setup();
		vi.spyOn(CalendarImport.prototype, 'importFile').mockResolvedValue('invalid_file');
		let notifications: UiNotifications | null = null;
		renderWithContext(CalendarImportModalHarness, {}, { onReady: (stores) => (notifications = stores.uiNotifications as UiNotifications) });
		const error = vi.spyOn(notifications!, 'error');

		await user.click(screen.getByRole('button', { name: '.ics file' }));
		await user.upload(screen.getByLabelText('Select File'), ics);
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(error).toHaveBeenCalledWith(expect.stringContaining('.ics file of at most 10 MB'));
	});

	it('shows the progress of a running import', () => {
		renderWithContext(CalendarImportModalHarness, {
			state: calendarImportState({ stage: 'events', calendars_current: 'Holidays', events_count: 4, events_done: 1 })
		});

		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
	});

	it('shows imported and skipped counts when finished', () => {
		renderWithContext(CalendarImportModalHarness, { state: calendarImportState({ stage: 'finished', events_done: 9, events_skipped: 2 }) });

		expect(screen.getByText('Imported').nextElementSibling).toHaveTextContent('9');
		expect(screen.getByText('Skipped').nextElementSibling).toHaveTextContent('2');
	});

	it('shows a failure and closes', async () => {
		const user = userEvent.setup();
		let store: CalendarImport | null = null;
		renderWithContext(CalendarImportModalHarness, { state: calendarImportState({ stage: 'failed' }), onStore: (s: CalendarImport) => (store = s) });

		expect(screen.getByRole('alert')).toHaveTextContent('There was an error when importing Calendars.');

		await user.click(screen.getByRole('button', { name: 'Close' }));

		expect(store!.importModal).toBe(false);
		expect(store!.state).toBeNull();
	});
});
