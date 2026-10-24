import type {
	Calendar,
	CalendarEvent,
	CalendarEventResponse,
	CalendarWeek,
	CalendarMonth,
	UpdateCalendarRequest,
	CreateEventRequest,
	UpdateEventRequest,
	CreateCalendarRequest,
	NewEventPreset
} from '$lib/types/calendar';
import { getContext, setContext, tick } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import {
	formatDate,
	formatFloatingDate,
	getCalendarMonth,
	getCalendarWeek,
	getISODateInfo,
	getISOWeeksInYear,
	getUrlFormat,
	getWeekNumber
} from '$lib/helpers/DateHelper';
import type { Todo, UpdateTodoRequest } from '$lib/types/todo';
import type { Note } from '$lib/types/note';
import LocalStorageService from '$lib/services/LocalStorageService';
import CalendarDragService from '$lib/services/CalendarDragService';
import CalendarEventService from '$lib/services/CalendarEventService';
import type { CalendarDropTarget } from '$lib/services/CalendarDragService';

export class Calendars {
	static readonly LS_VIEW_KEY: string = 'calendars_view';

	calendars = $state<Calendar[]>([]);
	events = $state<CalendarEvent[]>([]);
	sortedEvents = $state<Record<string, CalendarEvent[]>>({});
	todos = $state<Todo[]>([]);
	month = $state<CalendarMonth>({ weeks: [] });
	currentWeek = $state<number>(0);
	currentWeekYear = $state<number>(0);
	currentMonth = $state<number>(0);
	currentYear = $state<number>(0);
	currentDate = $state<Date>(new Date());
	auth: Auth;
	loaded = $state<boolean>(false);
	editSidebar = $state<boolean>(false);
	selectedDate = $state<Date | null>(null);
	newEventPreset = $state<NewEventPreset>({});
	isSyncing = $state<boolean>(false);
	lastSync = $state<number | null>(null);
	view = $state<'month' | 'week' | 'day' | 'list'>('month');
	activeEvent = $state<CalendarEvent | null>(null);
	activeEventTodos = $state<Todo[]>([]);
	activeEventNotes = $state<Note[]>([]);
	availableNotes = $state<Note[]>([]);
	availableNotesLoaded = $state<boolean>(false);
	selectedCalendar = $state<Calendar | null>(null);
	deletionModal = $state<boolean>(false);
	syncModal = $state<boolean>(false);
	manageModal = $state<boolean>(false);
	hiddenCalendars = $state<number[]>([]);
	mobileSelectedDate = $state<Date>(new Date());
	mobileWeekStart = $state<Date>(new Date());
	pendingMove = $state<{ event: CalendarEvent; request: UpdateEventRequest } | null>(null);
	pendingInvites = $derived(this.calendars.filter((c) => c.invite_status === 'pending'));
	ownedCalendars = $derived(this.calendars.filter((c) => c.invite_status === null));
	acceptedSharedCalendars = $derived(
		this.calendars.filter((c) => c.invite_status === 'accepted')
	);
	journalMarksEnabled = $state<boolean>(false);
	checkInMarksEnabled = $state<boolean>(false);
	journalMarks = $state<string[]>([]);
	checkInMarks = $state<string[]>([]);

	apiService: ApiService;
	localStorage: LocalStorageService;
	dragService = new CalendarDragService();
	eventService = new CalendarEventService();

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		localStorage: LocalStorageService = new LocalStorageService()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.localStorage = localStorage;

		const today = new Date();
		const iso = getISODateInfo(today);
		this.currentWeek = iso.week;
		this.currentWeekYear = iso.year;
		this.currentMonth = today.getMonth() + 1;
		this.currentYear = today.getFullYear();

		this.loadView();
		this.loadMonth();
		this.loadMarksConfig();
	}

	async loadCalendars(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.calendars.listCalendars);
		if (res) this.calendars = res.data as Calendar[];
		this.loaded = true;
	}

	loadMonth(): void {
		const calendarDays = getCalendarMonth(this.currentYear, this.currentMonth - 1);

		const weeks: CalendarWeek[] = [];
		for (let i = 0; i < calendarDays.length; i += 7) {
			const firstDayOfWeek = calendarDays[i];
			weeks.push({
				number: firstDayOfWeek.date ? getWeekNumber(firstDayOfWeek.date) : 0,
				days: calendarDays.slice(i, i + 7)
			});
		}

		this.month = { weeks };
	}

	async loadEvents(): Promise<void> {
		const res = await this.apiService.list(
			apiRoutes.calendars.listEvents.replace(
				'%s',
				this.currentYear.toString() + '-' + this.currentMonth.toString().padStart(2, '0')
			)
		);

		if (!res) return;

		const events = (res.data as CalendarEventResponse[]).map((item) =>
			this.eventService.fromApi(item)
		);
		this.events = events;
		this.sortedEvents = this.eventService.groupByDay(events);
	}

	loadMarksConfig(): void {
		this.journalMarksEnabled = this.auth.user?.settings?.journal_calendar_mark ?? false;
		this.checkInMarksEnabled = this.auth.user?.settings?.check_in_calendar_mark ?? false;
	}

	async getWidgetEvents(): Promise<CalendarEvent[]> {
		const res = await this.apiService.list(apiRoutes.calendars.listWidgetEvents);
		if (res) return res.data as CalendarEvent[];
		return [];
	}

	async loadTodos(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.todos.list);
		if (res) this.todos = res.data as Todo[];
	}

	async loadMarks(): Promise<void> {
		if (!this.journalMarksEnabled && !this.checkInMarksEnabled) {
			return;
		}

		const days = this.month.weeks.flatMap((week) => week.days.map((day) => day.date));
		if (days.length === 0) return;

		const from = getUrlFormat(days[0]);
		const to = getUrlFormat(days[days.length - 1]);

		const [journalRes, checkInRes] = await Promise.all([
			this.journalMarksEnabled ? this.apiService.list(`${apiRoutes.notes.journalMarks}?from=${from}&to=${to}`) : Promise.resolve(null),
			this.checkInMarksEnabled ? this.apiService.list(`${apiRoutes.checkIn.marks}?from=${from}&to=${to}`) : Promise.resolve(null)
		]);

		this.journalMarks = (journalRes?.data as string[]) ?? [];
		this.checkInMarks = (checkInRes?.data as string[]) ?? [];
	}

	changeView(view: 'month' | 'week' | 'day' | 'list'): void {
		this.view = view;
		this.saveView();
	}

	loadView(): void {
		const stored = this.localStorage.get(Calendars.LS_VIEW_KEY);
		this.view = (stored as 'month' | 'week' | 'day' | 'list' | null) ?? 'month';
	}

	saveView(): void {
		this.localStorage.set(Calendars.LS_VIEW_KEY, this.view);
	}

	async nextMonth(): Promise<void> {
		if (this.currentMonth === 12) {
			this.currentMonth = 1;
			this.currentYear++;
		} else {
			this.currentMonth++;
		}
		this.loadMonth();
		await this.loadEvents();
		await this.loadMarks();
	}

	async lastMonth(): Promise<void> {
		if (this.currentMonth === 1) {
			this.currentMonth = 12;
			this.currentYear--;
		} else {
			this.currentMonth--;
		}
		this.loadMonth();
		await this.loadEvents();
		await this.loadMarks();
	}

	nextWeek(): void {
		if (this.currentWeek === getISOWeeksInYear(this.currentWeekYear)) {
			this.currentWeek = 1;
			this.currentWeekYear++;
		} else {
			this.currentWeek++;
		}

		const weekDays = getCalendarWeek(this.currentWeekYear, this.currentWeek);
		this.mobileWeekStart = new Date(weekDays[0].date);
	}

	lastWeek(): void {
		if (this.currentWeek === 1) {
			this.currentWeekYear--;
			this.currentWeek = getISOWeeksInYear(this.currentWeekYear);
		} else {
			this.currentWeek--;
		}

		const weekDays = getCalendarWeek(this.currentWeekYear, this.currentWeek);
		this.mobileWeekStart = new Date(weekDays[0].date);
	}

	nextDay(): void {
		this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 1));
	}

	lastDay(): void {
		this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() - 1));
	}

	selectMobileDate(date: Date): void {
		this.mobileSelectedDate = new Date(date);
	}

	setMobileWeekStart(date: Date): void {
		this.mobileWeekStart = new Date(date);
		this.currentWeek = getWeekNumber(date);
	}

	async goToToday(): Promise<void> {
		const today = new Date();
		const iso = getISODateInfo(today);
		this.currentDate = today;
		this.currentWeek = iso.week;
		this.currentWeekYear = iso.year;
		this.currentMonth = today.getMonth() + 1;
		this.currentYear = today.getFullYear();
		this.mobileSelectedDate = new Date(today);
		this.mobileWeekStart = new Date(today);
		this.loadMonth();
		await this.loadEvents();
		await this.loadMarks();
	}

	getEventsForDate(date: Date): CalendarEvent[] {
		const dateSlug = formatDate(date);

		if (!this.sortedEvents[dateSlug]) {
			return [];
		}

		return this.sortedEvents[dateSlug] ?? [];
	}

	getAllDayEventsForDate(date: Date): CalendarEvent[] {
		const dateSlug = formatDate(date);

		if (!this.sortedEvents[dateSlug]) {
			return [];
		}

		return this.sortedEvents[dateSlug]?.filter((e) => e.is_all_day) ?? [];
	}

	getNonAllDayEventsForDate(date: Date): CalendarEvent[] {
		const dateSlug = formatDate(date);

		if (!this.sortedEvents[dateSlug]) {
			return [];
		}

		return (
			this.sortedEvents[dateSlug]
				?.filter((e) => !e.is_all_day)
				?.sort((a, b) => a.start_date.getTime() - b.start_date.getTime()) ?? []
		);
	}

	getTodosForDate(date: Date): Todo[] {
		return this.todos.filter((t) => {
			const due_date = new Date(t.due_at);

			return (
				due_date.getFullYear() === date.getFullYear() &&
				due_date.getMonth() === date.getMonth() &&
				due_date.getDate() === date.getDate()
			);
		});
	}

	toggleCalendar(id: number): void {
		const index = this.hiddenCalendars.indexOf(id);

		if (index === -1) {
			this.hiddenCalendars.push(id);
		} else {
			this.hiddenCalendars.splice(index, 1);
		}
	}

	isCalendarHidden(id: number): boolean {
		return this.hiddenCalendars.indexOf(id) !== -1;
	}

	async showSidebar(
		selectedDate: Date | null = null,
		selectedEntry: CalendarEvent | null = null,
		newEventPreset: NewEventPreset = {}
	): Promise<void> {
		this.hideSidebar();
		await tick();
		this.selectedDate = new Date(selectedDate as Date);
		this.newEventPreset = newEventPreset;
		this.activeEvent = selectedEntry;
		this.editSidebar = true;
		if (selectedEntry) {
			this.loadEventTodos(selectedEntry.id);
			this.loadEventNotes(selectedEntry.id);
		}
	}

	hideSidebar(): void {
		this.editSidebar = false;
		this.selectedDate = null;
		this.newEventPreset = {};
		this.activeEventTodos = [];
		this.activeEventNotes = [];
	}

	async createEvent(request: CreateEventRequest): Promise<boolean> {
		const res = await this.apiService.create(
			apiRoutes.calendars.createEvent.replace('%d', request.calendar_id.toString()),
			request
		);
		if (res) await this.loadEvents();
		return res !== null;
	}

	async updateEvent(entry: CalendarEvent, request: UpdateEventRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.calendars.updateEvent.replace('%d', entry.calendar_id.toString()),
			entry.uri,
			entry.is_recurring && entry.original_start_date !== null
				? { ...request, occurrence_start_date: formatFloatingDate(entry.start_date) }
				: request
		);
		if (res) await this.loadEvents();
		return res;
	}

	async deleteEvent(entry: CalendarEvent): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.calendars.deleteEvent.replace('%d', entry.calendar_id.toString()),
			entry.uri
		);
		if (res) await this.loadEvents();
		return res;
	}

	async moveEvent(event: CalendarEvent, target: CalendarDropTarget): Promise<boolean> {
		const request = this.dragService.buildMoveRequest(event, target);
		if (request === null) return true;

		if (event.is_recurring && event.original_start_date !== null) {
			this.pendingMove = { event, request };
			return true;
		}

		return this.applyEventMove(event, request, false);
	}

	async applyEventMove(
		event: CalendarEvent,
		request: UpdateEventRequest,
		thisOccurrenceOnly: boolean
	): Promise<boolean> {
		if (thisOccurrenceOnly) {
			return this.updateOccurrence(event, request, event.original_start_date!);
		}
		return this.updateEvent(event, request);
	}

	async resolvePendingMove(thisOccurrenceOnly: boolean): Promise<boolean> {
		const pending = this.pendingMove;
		if (!pending) return false;

		const ok = await this.applyEventMove(pending.event, pending.request, thisOccurrenceOnly);
		this.pendingMove = null;
		return ok;
	}

	cancelPendingMove(): void {
		this.pendingMove = null;
	}

	async loadEventTodos(eventId: number): Promise<void> {
		const res = await this.apiService.list(
			apiRoutes.calendars.eventAttachmentTodos.replace('%d', eventId.toString())
		);
		if (res) this.activeEventTodos = res.data as Todo[];
	}

	async loadEventNotes(eventId: number): Promise<void> {
		const res = await this.apiService.list(
			apiRoutes.calendars.eventAttachmentNotes.replace('%d', eventId.toString())
		);
		if (res) this.activeEventNotes = res.data as Note[];
	}

	async loadAvailableNotes(): Promise<void> {
		if (this.availableNotesLoaded) return;
		const res = await this.apiService.list(apiRoutes.notes.list);
		if (res) {
			this.availableNotes = res.data as Note[];
			this.availableNotesLoaded = true;
		}
	}

	async attachTodo(eventId: number, todoId: string): Promise<boolean> {
		const res = await this.apiService.post(
			apiRoutes.calendars.eventAttachmentTodos.replace('%d', eventId.toString()),
			{ todo_id: todoId }
		);
		if (res) await this.loadEventTodos(eventId);
		return !!res;
	}

	async detachTodo(eventId: number, todoId: string): Promise<void> {
		await this.apiService.delete(
			apiRoutes.calendars.eventDetachTodo.replace('%d', eventId.toString()),
			todoId
		);
		await this.loadEventTodos(eventId);
	}

	async attachNote(eventId: number, noteId: string): Promise<boolean> {
		const res = await this.apiService.post(
			apiRoutes.calendars.eventAttachmentNotes.replace('%d', eventId.toString()),
			{ note_id: noteId }
		);
		if (res) await this.loadEventNotes(eventId);
		return !!res;
	}

	async detachNote(eventId: number, noteId: string): Promise<void> {
		await this.apiService.delete(
			apiRoutes.calendars.eventDetachNote.replace('%d', eventId.toString()),
			noteId
		);
		await this.loadEventNotes(eventId);
	}

	async updateOccurrence(
		entry: CalendarEvent,
		request: UpdateEventRequest,
		occurrenceDate: Date
	): Promise<boolean> {
		const occDateStr = occurrenceDate.toISOString();
		const url = apiRoutes.calendars.updateOccurrence
			.replace('%d', entry.calendar_id.toString())
			.replace('%s', entry.uri)
			.replace('%s', encodeURIComponent(occDateStr));
		const res = await this.apiService.put(url, request);
		if (res) await this.loadEvents();
		return res;
	}

	async deleteOccurrence(entry: CalendarEvent, occurrenceDate: Date): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.calendars.deleteOccurrence
				.replace('%d', entry.calendar_id.toString())
				.replace('%s', entry.uri),
			encodeURIComponent(occurrenceDate.toISOString())
		);
		if (res) await this.loadEvents();
		return res;
	}

	async createCalendar(request: CreateCalendarRequest): Promise<boolean> {
		const res = await this.apiService.post(apiRoutes.calendars.createCalendar, request);
		if (res) await this.loadCalendars();
		return res !== null;
	}

	async updateCalendarColor(
		calendar: Calendar,
		request: UpdateCalendarRequest
	): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.calendars.updateCalendarColor,
			calendar.id,
			request
		);
		if (res) {
			await this.loadCalendars();
			await this.loadEvents();
		}
		return res !== null;
	}

	async updateCalendarsOrder(orderedIds: number[]): Promise<boolean> {
		return this.apiService.put(apiRoutes.calendars.updateCalendarsOrder, { order: orderedIds });
	}

	async deleteCalendar(calendar: Calendar): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.calendars.deleteCalendar, calendar.id);
		if (res) {
			await this.loadCalendars();
			await this.loadEvents();
		}
		this.selectedCalendar = null;
		this.deletionModal = false;
		return res !== null;
	}

	async changeTodoCompleted(todo: Todo, checked: boolean): Promise<boolean> {
		const request: UpdateTodoRequest = { is_completed: checked };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) await this.loadTodos();
		return res;
	}
}

const CALENDARS_KEY = Symbol('SOLYTO_CALENDARS');

export function setCalendars(): Calendars {
	return setContext(CALENDARS_KEY, new Calendars());
}

export function getCalendars(): Calendars {
	return getContext<Calendars>(CALENDARS_KEY);
}
