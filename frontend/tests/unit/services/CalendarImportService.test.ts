import { describe, it, expect } from 'vitest';
import CalendarImportService from '$lib/services/CalendarImportService';
import { calendar, calendarImportState } from '../helpers/factories';

const service = new CalendarImportService();

describe('defaultCalendarName', () => {
	it('strips the .ics extension in any case', () => {
		expect(service.defaultCalendarName('Holidays.ics')).toBe('Holidays');
		expect(service.defaultCalendarName('work.ICS')).toBe('work');
	});

	it('keeps names without the extension and inner dots', () => {
		expect(service.defaultCalendarName('team.2026.calendar')).toBe('team.2026.calendar');
		expect(service.defaultCalendarName('my.ics.backup.ics')).toBe('my.ics.backup');
		expect(service.defaultCalendarName('b'.repeat(150) + '.ics')).toBe('b'.repeat(100));
	});
});

describe('calendarName', () => {
	function ics(...lines: string[]): string {
		return ['BEGIN:VCALENDAR', 'VERSION:2.0', ...lines, 'BEGIN:VEVENT', 'UID:1', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
	}

	it('reads X-WR-CALNAME from the calendar', () => {
		expect(service.calendarName(ics('X-WR-CALNAME:Holidays'))).toBe('Holidays');
	});

	it('accepts parameters, any case and LF line endings', () => {
		expect(service.calendarName(ics('x-wr-calname;VALUE=TEXT:Holidays').replaceAll('\r\n', '\n'))).toBe('Holidays');
	});

	it('unfolds folded lines', () => {
		expect(service.calendarName(ics('X-WR-CALNAME:School holi', ' days 2026', '\tand trips'))).toBe('School holidays 2026and trips');
	});

	it('unescapes text values', () => {
		expect(service.calendarName(ics('X-WR-CALNAME:Work\\, school\\; trips \\\\ more'))).toBe('Work, school; trips \\ more');
		expect(service.calendarName(ics('X-WR-CALNAME:Line\\none'))).toBe('Line one');
	});

	it('cuts a name to the length the API accepts', () => {
		expect(service.calendarName(ics('X-WR-CALNAME:' + 'a'.repeat(150)))).toBe('a'.repeat(100));
	});

	it('keeps a name without escapes unchanged', () => {
		expect(service.calendarName(ics('X-WR-CALNAME:Team: Q3 / 2026 (draft) – ü'))).toBe('Team: Q3 / 2026 (draft) – ü');
	});

	it('returns null without a name, with an empty name, or for a name inside an event', () => {
		expect(service.calendarName(ics())).toBeNull();
		expect(service.calendarName(ics('X-WR-CALNAME:  '))).toBeNull();
		expect(service.calendarName(['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'X-WR-CALNAME:Nope', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'))).toBeNull();
		expect(service.calendarName('')).toBeNull();
	});
});

describe('targetCalendars', () => {
	it('keeps only own, non-external calendars', () => {
		const own = calendar({ id: 1 });
		const shared = calendar({ id: 2, is_shared: true });
		const external = calendar({ id: 3, is_external: true });

		expect(service.targetCalendars([own, shared, external])).toEqual([own]);
	});
});

describe('fileRequest', () => {
	const file = new File(['BEGIN:VCALENDAR'], 'holidays.ics', { type: 'text/calendar' });

	it('sends the file and a trimmed name for a new calendar', () => {
		const body = service.fileRequest(file, { type: 'new', name: '  Holidays ', color: null });

		expect(body.get('file')).toBeInstanceOf(File);
		expect(body.get('name')).toBe('Holidays');
		expect(body.has('color')).toBe(false);
		expect(body.has('calendar_id')).toBe(false);
	});

	it('sends a chosen colour for a new calendar', () => {
		expect(service.fileRequest(file, { type: 'new', name: 'Holidays', color: '#1dbda5' }).get('color')).toBe('#1dbda5');
	});

	it('sends an empty name so the API picks one', () => {
		expect(service.fileRequest(file, { type: 'new', name: '', color: null }).get('name')).toBe('');
	});

	it('sends the calendar id for an existing calendar', () => {
		const body = service.fileRequest(file, { type: 'existing', calendarId: 7 });

		expect(body.get('calendar_id')).toBe('7');
		expect(body.has('name')).toBe(false);
	});
});

describe('errorFor', () => {
	it.each([
		[422, 'invalid_file'],
		[413, 'invalid_file'],
		[404, 'calendar_not_found'],
		[403, 'calendar_forbidden'],
		[409, 'already_running'],
		[429, 'rate_limited'],
		[500, 'generic']
	])('maps %d of a file import to %s', (status, error) => {
		expect(service.errorFor(status, 'file')).toBe(error);
	});

	it.each([
		[409, 'already_running'],
		[429, 'rate_limited'],
		[422, 'generic'],
		[403, 'generic']
	])('maps %d of a CalDAV import to %s', (status, error) => {
		expect(service.errorFor(status, 'caldav')).toBe(error);
	});
});

describe('view', () => {
	it('starts fresh without a state', () => {
		expect(service.view(null)).toBe('start');
	});

	it.each([
		['select', 'select'],
		['started', 'progress'],
		['calendars', 'progress'],
		['events', 'progress'],
		['finished', 'finished'],
		['failed', 'failed']
	] as const)('shows %s as %s', (stage, view) => {
		expect(service.view(calendarImportState({ stage }))).toBe(view);
	});

	it('treats a started CalDAV import as restartable, not running', () => {
		expect(service.view(calendarImportState({ stage: 'started', source: 'caldav' }))).toBe('start');
		expect(service.isRunning(calendarImportState({ stage: 'started', source: 'caldav' }))).toBe(false);
	});

	it('shows a CalDAV step that was just accepted as running until the first state arrives', () => {
		expect(service.view(calendarImportState({ stage: 'started', source: 'caldav' }), true)).toBe('progress');
		expect(service.isRunning(calendarImportState({ stage: 'started', source: 'caldav' }), true)).toBe(true);
	});
});

describe('isRunning and isStale', () => {
	it('is running only while calendars or events are being imported', () => {
		expect(service.isRunning(calendarImportState({ stage: 'events' }))).toBe(true);
		expect(service.isRunning(calendarImportState({ stage: 'select' }))).toBe(false);
		expect(service.isRunning(null)).toBe(false);
	});

	it('treats finished and failed states as stale', () => {
		expect(service.isStale(calendarImportState({ stage: 'finished' }))).toBe(true);
		expect(service.isStale(calendarImportState({ stage: 'failed' }))).toBe(true);
		expect(service.isStale(calendarImportState({ stage: 'events' }))).toBe(false);
		expect(service.isStale(null)).toBe(false);
	});
});

describe('progress', () => {
	it('is zero before the events are counted', () => {
		expect(service.progress(calendarImportState({ events_count: 0 }))).toBe(0);
	});

	it('counts imported and skipped events as handled', () => {
		expect(service.progress(calendarImportState({ events_count: 8, events_done: 2, events_skipped: 2 }))).toBe(0.5);
	});
});

describe('progressMarker', () => {
	it('changes when the import moves on', () => {
		const before = service.progressMarker(calendarImportState({ events_done: 1 }));
		const after = service.progressMarker(calendarImportState({ events_done: 2 }));

		expect(before).not.toBe(after);
	});

	it('stays the same for an unchanged state', () => {
		expect(service.progressMarker(calendarImportState())).toBe(service.progressMarker(calendarImportState()));
	});
});
