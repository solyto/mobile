import type {
	Calendar,
	CalendarEvent,
	CalendarStatus,
	CalendarEventResponse,
	CalendarWeek,
	CalendarMonth,
	UpdateCalendarRequest,
	CreateEventRequest,
	UpdateEventRequest,
	CreateCalendarRequest,
	NewEventPreset,
	EventWriteResult
} from '$lib/types/calendar';
import { getContext, setContext, tick } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import type { ListResponse, StatusResponse } from '$lib/types/api';
import { apiRoutes } from '$lib/config/apiRoutes';
import {
	formatDate,
	formatFloatingDate,
	getCalendarMonth,
	getDatePlusDays,
	getStartOfWeek,
	getUrlFormat,
	getWeekNumberOfWeek
} from '$lib/helpers/DateHelper';
import type { Todo, UpdateTodoRequest } from '$lib/types/todo';
import type { Note } from '$lib/types/note';
import LocalStorageService from '$lib/services/LocalStorageService';
import CalendarDragService from '$lib/services/CalendarDragService';
import CalendarEventService from '$lib/services/CalendarEventService';
import type { CalendarDropTarget } from '$lib/services/CalendarDragService';
import { isRecurringOccurrence } from '$lib/helpers/CalendarEventHelper';

export class Calendars {
	static readonly LS_VIEW_KEY: string = 'calendars_view';
	static readonly VIEWS = ['month', 'week', 'day', 'list'] as const;

	calendars = $state<Calendar[]>([]);
	events = $state<CalendarEvent[]>([]);
	widgetEvents = $state<CalendarEvent[]>([]);
	unavailableCalendarIds = $state<number[]>([]);
	credentialsRejectedCalendarIds = $state<number[]>([]);
	sortedEvents = $state<Record<string, CalendarEvent[]>>({});
	todos = $state<Todo[]>([]);
	month = $state<CalendarMonth>({ weeks: [] });
	currentWeekStart = $state<Date>(new Date());
	currentMonth = $state<number>(0);
	currentYear = $state<number>(0);
	currentDate = $state<Date>(new Date());
	loaded = $state<boolean>(false);
	editSidebar = $state<boolean>(false);
	selectedDate = $state<Date | null>(null);
	newEventPreset = $state<NewEventPreset>({});
	isSyncing = $state<boolean>(false);
	lastSync = $state<number | null>(null);
	view = $state<(typeof Calendars.VIEWS)[number]>('month');
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

	auth: Auth;
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
		this.currentWeekStart = getStartOfWeek(today, auth.getWeekStart());
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

	get currentWeekNumber(): number {
		return getWeekNumberOfWeek(this.currentWeekStart);
	}

	loadMonth(): void {
		const calendarDays = getCalendarMonth(this.currentYear, this.currentMonth - 1, this.auth.getWeekStart());

		const weeks: CalendarWeek[] = [];
		for (let i = 0; i < calendarDays.length; i += 7) {
			const firstDayOfWeek = calendarDays[i];
			weeks.push({
				number: firstDayOfWeek.date ? getWeekNumberOfWeek(firstDayOfWeek.date) : 0,
				days: calendarDays.slice(i, i + 7)
			});
		}

		this.month = { weeks };
	}

	async loadEvents(): Promise<void> {
		const year = this.currentYear;
		const month = this.currentMonth;
		const res = await this.apiService.list(
			apiRoutes.calendars.listEvents.replace(
				'%s',
				year.toString() + '-' + month.toString().padStart(2, '0')
			)
		);

		if (!res || !this.isCurrentMonth(year, month)) return;

		const events = (res.data as CalendarEventResponse[]).map((item) =>
			this.eventService.fromApi(item)
		);
		this.events = events;
		this.sortedEvents = this.eventService.groupByDay(events);
		this.unavailableCalendarIds = (res.meta?.unavailable_calendars as number[] | undefined) ?? [];
		this.credentialsRejectedCalendarIds = (res.meta?.credentials_rejected_calendars as number[] | undefined) ?? [];
	}

	isCalendarUnavailable(id: number): boolean {
		return this.unavailableCalendarIds.includes(Number(id));
	}

	isCalendarCredentialsRejected(id: number): boolean {
		return this.credentialsRejectedCalendarIds.includes(Number(id));
	}

	unreachableCalendars(): Calendar[] {
		return this.calendars.filter((calendar) => this.isCalendarUnavailable(calendar.id) && !this.isCalendarCredentialsRejected(calendar.id));
	}

	credentialsRejectedCalendars(): Calendar[] {
		return this.calendars.filter((calendar) => this.isCalendarCredentialsRejected(calendar.id));
	}

	writableCalendars(): Calendar[] {
		return this.calendars.filter((calendar) => !calendar.is_read_only);
	}

	isEventReadOnly(event: CalendarEvent): boolean {
		return this.calendars.some((calendar) => Number(calendar.id) === Number(event.calendar_id) && calendar.is_read_only);
	}

	calendarStatus(calendar: Calendar): CalendarStatus | null {
		if (this.isCalendarCredentialsRejected(calendar.id)) return 'credentials_rejected';
		if (this.isCalendarUnavailable(calendar.id)) return 'unavailable';
		if (calendar.is_external) return 'external';
		if (calendar.is_shared) return 'shared';
		return null;
	}

	loadMarksConfig(): void {
		this.journalMarksEnabled = this.auth.user?.settings?.journal_calendar_mark ?? false;
		this.checkInMarksEnabled = this.auth.user?.settings?.check_in_calendar_mark ?? false;
	}

	async loadWidgetEvents(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.calendars.listWidgetEvents);
		if (res) this.widgetEvents = res.data as CalendarEvent[];
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

		const year = this.currentYear;
		const month = this.currentMonth;
		const from = getUrlFormat(days[0]);
		const to = getUrlFormat(days[days.length - 1]);

		const [journalRes, checkInRes] = await Promise.all([
			this.listMarks(apiRoutes.notes.journalMarks, this.journalMarksEnabled, from, to),
			this.listMarks(apiRoutes.checkIn.marks, this.checkInMarksEnabled, from, to)
		]);

		if (!this.isCurrentMonth(year, month)) return;

		this.journalMarks = (journalRes?.data as string[]) ?? [];
		this.checkInMarks = (checkInRes?.data as string[]) ?? [];
	}

	changeView(view: (typeof Calendars.VIEWS)[number]): void {
		this.view = view;
		this.saveView();
	}

	loadView(): void {
		const stored = this.localStorage.get(Calendars.LS_VIEW_KEY);
		this.view = Calendars.VIEWS.find((view) => view === stored) ?? 'month';
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
		await this.reloadMonth();
	}

	async lastMonth(): Promise<void> {
		if (this.currentMonth === 1) {
			this.currentMonth = 12;
			this.currentYear--;
		} else {
			this.currentMonth--;
		}
		await this.reloadMonth();
	}

	nextWeek(): void {
		this.currentWeekStart = getDatePlusDays(this.currentWeekStart, 7);
		this.mobileWeekStart = new Date(this.currentWeekStart);
	}

	lastWeek(): void {
		this.currentWeekStart = getDatePlusDays(this.currentWeekStart, -7);
		this.mobileWeekStart = new Date(this.currentWeekStart);
	}

	goToCurrentWeek(): void {
		this.currentWeekStart = getStartOfWeek(new Date(), this.auth.getWeekStart());
	}

	nextDay(): void {
		this.currentDate = getDatePlusDays(this.currentDate, 1);
	}

	lastDay(): void {
		this.currentDate = getDatePlusDays(this.currentDate, -1);
	}

	selectMobileDate(date: Date): void {
		this.mobileSelectedDate = new Date(date);
	}

	setMobileWeekStart(date: Date): void {
		this.mobileWeekStart = new Date(date);
		this.currentWeekStart = getStartOfWeek(date, this.auth.getWeekStart());
	}

	async goToToday(): Promise<void> {
		const today = new Date();
		this.currentDate = today;
		this.currentWeekStart = getStartOfWeek(today, this.auth.getWeekStart());
		this.currentMonth = today.getMonth() + 1;
		this.currentYear = today.getFullYear();
		this.mobileSelectedDate = new Date(today);
		this.mobileWeekStart = new Date(today);
		await this.reloadMonth();
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
		this.selectedDate = selectedDate ? new Date(selectedDate) : null;
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

	async createEvent(request: CreateEventRequest): Promise<EventWriteResult> {
		const res = await this.apiService.createWithStatus(
			apiRoutes.calendars.createEvent.replace('%d', request.calendar_id.toString()),
			request
		);
		return this.afterEventWrite(res);
	}

	async updateEvent(entry: CalendarEvent, request: UpdateEventRequest): Promise<EventWriteResult> {
		const res = await this.apiService.putWithStatus(
			apiRoutes.calendars.updateEvent
				.replace('%d', entry.calendar_id.toString())
				.replace('%s', entry.uri),
			this.withOccurrenceStart(entry, request)
		);
		return this.afterEventWrite(res);
	}

	async deleteEvent(entry: CalendarEvent): Promise<EventWriteResult> {
		const res = await this.apiService.deleteWithStatus(
			apiRoutes.calendars.deleteEvent
				.replace('%d', entry.calendar_id.toString())
				.replace('%s', entry.uri)
		);
		return this.afterEventWrite(res);
	}

	async reopenEvent(entry: CalendarEvent): Promise<void> {
		const current = this.eventService.findCurrentVersion(this.events, entry);
		if (current) {
			await this.showSidebar(null, current);
		} else {
			this.hideSidebar();
		}
	}

	async moveEvent(event: CalendarEvent, target: CalendarDropTarget): Promise<EventWriteResult> {
		const request = this.dragService.buildMoveRequest(event, target);
		if (request === null) return 'ok';

		if (isRecurringOccurrence(event)) {
			this.pendingMove = { event, request };
			return 'ok';
		}

		return this.applyEventMove(event, request, false);
	}

	async applyEventMove(
		event: CalendarEvent,
		request: UpdateEventRequest,
		thisOccurrenceOnly: boolean
	): Promise<EventWriteResult> {
		if (thisOccurrenceOnly) {
			return this.updateOccurrence(event, request, event.original_start_date!);
		}
		return this.updateEvent(event, request);
	}

	async resolvePendingMove(thisOccurrenceOnly: boolean): Promise<EventWriteResult> {
		const pending = this.pendingMove;
		if (!pending) return 'failed';

		const result = await this.applyEventMove(pending.event, pending.request, thisOccurrenceOnly);
		this.pendingMove = null;
		return result;
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
	): Promise<EventWriteResult> {
		const occDateStr = occurrenceDate.toISOString();
		const url = apiRoutes.calendars.updateOccurrence
			.replace('%d', entry.calendar_id.toString())
			.replace('%s', entry.uri)
			.replace('%s', encodeURIComponent(occDateStr));
		const res = await this.apiService.putWithStatus(url, request);
		return this.afterEventWrite(res);
	}

	async deleteOccurrence(entry: CalendarEvent, occurrenceDate: Date): Promise<EventWriteResult> {
		const res = await this.apiService.deleteWithStatus(
			apiRoutes.calendars.deleteOccurrence
				.replace('%d', entry.calendar_id.toString())
				.replace('%s', entry.uri)
				.replace('%s', encodeURIComponent(occurrenceDate.toISOString()))
		);
		return this.afterEventWrite(res);
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
		return res;
	}

	async updateCalendarsOrder(orderedIds: number[]): Promise<boolean> {
		return this.apiService.put(apiRoutes.calendars.updateCalendarsOrder, { order: orderedIds });
	}

	async deleteCalendar(calendar: Calendar): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.calendars.deleteCalendar, calendar.id);
		if (res) {
			await this.loadCalendars();
			await this.loadEvents();
			this.auth.widgetBridge.notifyChanged();
		}
		this.selectedCalendar = null;
		this.deletionModal = false;
		return res;
	}

	async changeTodoCompleted(todo: Todo, checked: boolean): Promise<boolean> {
		const request: UpdateTodoRequest = { is_completed: checked };
		const res = await this.apiService.update(apiRoutes.todos.update, todo.id, request);
		if (res) {
			await this.loadTodos();
			this.auth.widgetBridge.notifyChanged();
		}
		return res;
	}

	private async afterEventWrite(res: StatusResponse): Promise<EventWriteResult> {
		const result = this.eventService.writeResult(res);
		if (this.eventService.needsReload(result)) await this.loadEvents();
		if (result === 'ok') this.auth.widgetBridge.notifyChanged();
		return result;
	}

	private withOccurrenceStart(entry: CalendarEvent, request: UpdateEventRequest): UpdateEventRequest {
		if (!isRecurringOccurrence(entry)) return request;
		return { ...request, occurrence_start_date: formatFloatingDate(entry.start_date) };
	}

	private async listMarks(endpoint: string, enabled: boolean, from: string, to: string): Promise<ListResponse | null> {
		if (!enabled) return null;
		return this.apiService.list(`${endpoint}?${new URLSearchParams({ from, to })}`);
	}

	private async reloadMonth(): Promise<void> {
		this.loadMonth();
		await Promise.all([this.loadEvents(), this.loadMarks()]);
	}

	private isCurrentMonth(year: number, month: number): boolean {
		return year === this.currentYear && month === this.currentMonth;
	}
}

const CALENDARS_KEY = Symbol('SOLYTO_CALENDARS');

export function setCalendars(): Calendars {
	return setContext(CALENDARS_KEY, new Calendars());
}

export function getCalendars(): Calendars {
	return getContext<Calendars>(CALENDARS_KEY);
}
