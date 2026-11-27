import type { ImportFileTarget, ImportRequest, ImportSource, ImportState } from '$lib/types/calendar';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import { getCalendars, type Calendars } from '$lib/state/Calendars.svelte';
import { getUiNotifications, type UiNotifications } from '$lib/state/UiNotifications.svelte';
import { getTranslation, type Translation } from '$lib/state/Translation.svelte';
import ApiService, { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import CalendarImportService, { type CalendarImportError } from '$lib/services/CalendarImportService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class CalendarImport {
	static readonly POLL_INTERVAL_MS = 1000;
	static readonly STALL_TIMEOUT_MS = 300000;

	importModal = $state<boolean>(false);
	state = $state<ImportState | null>(null);
	stalled = $state<boolean>(false);
	awaitingState = $state<boolean>(false);

	auth: Auth;
	apiService: ApiService;
	calendars: Calendars;
	notifications: UiNotifications;
	ts: Translation;
	service = new CalendarImportService();

	private pollTimer: ReturnType<typeof setTimeout> | null = null;
	private lastMarker = '';
	private lastProgressAt = 0;
	private destroyed = false;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		calendars: Calendars = getCalendars(),
		notifications: UiNotifications = getUiNotifications(),
		ts: Translation = getTranslation()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.calendars = calendars;
		this.notifications = notifications;
		this.ts = ts;
	}

	get polling(): boolean {
		return this.pollTimer !== null;
	}

	async open(): Promise<void> {
		this.importModal = true;
		if (this.polling) return;

		this.stalled = false;
		await this.refresh();
		if (this.service.isStale(this.state)) this.state = null;
		if (this.service.isRunning(this.state)) this.startPolling();
	}

	close(): void {
		this.importModal = false;
		if (!this.polling) this.reset();
	}

	async startCaldavImport(request: ImportRequest): Promise<CalendarImportError | null> {
		return this.start('caldav', apiRoutes.calendars.startImport, request);
	}

	async selectCaldavCalendars(calendars: string[]): Promise<CalendarImportError | null> {
		return this.start('caldav', apiRoutes.calendars.selectImportCalendars, { calendars });
	}

	async importFile(file: File, target: ImportFileTarget): Promise<CalendarImportError | null> {
		return this.start('file', apiRoutes.calendars.startFileImport, this.service.fileRequest(file, target));
	}

	destroy(): void {
		this.destroyed = true;
		this.stopPolling();
	}

	private async start(
		source: ImportSource,
		endpoint: string,
		body: FormData | object
	): Promise<CalendarImportError | null> {
		const res = await this.post(endpoint, body);
		if (!res.ok) return this.service.errorFor(res.status, source);

		this.state = res.state ?? this.startedState(source);
		this.awaitingState = res.state === null;
		this.stalled = false;
		this.startPolling();
		return null;
	}

	// The file endpoint answers with the initial state, the CalDAV endpoints with an empty list.
	private async post(
		endpoint: string,
		body: FormData | object
	): Promise<{ ok: boolean; status: number; state: ImportState | null }> {
		try {
			const res = await this.apiService.postWithStatus(endpoint, body);
			if (!res.ok) return { ok: false, status: res.status, state: null };

			const data = res.data.data;
			return { ok: true, status: res.status, state: Array.isArray(data) ? null : (data as ImportState) };
		} catch (error) {
			if (error instanceof RateLimitedError) return { ok: false, status: 429, state: null };
			if (error instanceof NetworkError) return { ok: false, status: 0, state: null };
			throw error;
		}
	}

	private async refresh(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.calendars.getImportState, null);
		if (!res) return;

		this.state = res.data as ImportState;
		this.awaitingState = false;
	}

	private startPolling(): void {
		if (this.polling || this.destroyed) return;

		this.lastMarker = this.service.progressMarker(this.state);
		this.lastProgressAt = Date.now();
		this.pollTimer = setTimeout(() => this.poll(), CalendarImport.POLL_INTERVAL_MS);
	}

	private async poll(): Promise<void> {
		try {
			await this.refresh();
		} catch (error) {
			if (!(error instanceof NetworkError || error instanceof RateLimitedError)) {
				this.stall();
				return;
			}
		}

		if (this.destroyed) return;

		if (this.service.isRunning(this.state, this.awaitingState)) {
			this.continuePolling();
			return;
		}

		this.stopPolling();
		await this.settle();
	}

	private continuePolling(): void {
		const marker = this.service.progressMarker(this.state);
		if (marker !== this.lastMarker) {
			this.lastMarker = marker;
			this.lastProgressAt = Date.now();
		}

		if (Date.now() - this.lastProgressAt >= CalendarImport.STALL_TIMEOUT_MS) {
			this.stall();
			return;
		}

		this.pollTimer = setTimeout(() => this.poll(), CalendarImport.POLL_INTERVAL_MS);
	}

	private stall(): void {
		this.stopPolling();
		this.stalled = true;
		this.announceFailure();
	}

	private async settle(): Promise<void> {
		if (this.state?.stage === 'failed') {
			this.announceFailure();
			return;
		}

		if (this.state?.stage !== 'finished') return;

		await this.calendars.loadCalendars();
		await this.calendars.loadEvents();
		if (!this.importModal) {
			this.notifications.success(this.ts.get.calendar.import_success);
			this.reset();
		}
	}

	private announceFailure(): void {
		if (this.importModal) return;

		this.notifications.error(this.ts.get.calendar.import_error);
		this.reset();
	}

	private reset(): void {
		this.state = null;
		this.stalled = false;
		this.awaitingState = false;
	}

	private stopPolling(): void {
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = null;
	}

	private startedState(source: ImportSource): ImportState {
		return {
			stage: 'started',
			source,
			calendars: [],
			calendars_count: 0,
			calendars_done: 0,
			calendars_current: null,
			events_count: 0,
			events_done: 0,
			events_skipped: 0
		};
	}
}

const CALENDAR_IMPORT_KEY = Symbol('SOLYTO_CALENDAR_IMPORT');

export function setCalendarImport(): CalendarImport {
	return setContext(CALENDAR_IMPORT_KEY, new CalendarImport());
}

export function getCalendarImport(): CalendarImport {
	return getContext<CalendarImport>(CALENDAR_IMPORT_KEY);
}
