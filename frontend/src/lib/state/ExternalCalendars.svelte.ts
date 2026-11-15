import type {
	CreateExternalAccountRequest,
	ExternalAccountDialog,
	ExternalAccountResult,
	ExternalCalendarAccount,
	ExternalCalendarCandidate,
	ExternalCalendarResponse,
	UpdateExternalAccountRequest
} from '$lib/types/calendar';
import type { ListResponse } from '$lib/types/api';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import { getCalendars, type Calendars } from '$lib/state/Calendars.svelte';
import ApiService, { RateLimitedError } from '$lib/services/ApiService';
import ExternalCalendarService from '$lib/services/ExternalCalendarService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class ExternalCalendars {
	accounts = $state<ExternalCalendarAccount[]>([]);
	loaded = $state<boolean>(false);
	loadFailed = $state<boolean>(false);
	dialog = $state<ExternalAccountDialog | null>(null);
	removal = $state<ExternalCalendarAccount | null>(null);

	auth: Auth;
	apiService: ApiService;
	calendars: Calendars;
	service = new ExternalCalendarService();
	private dialogGeneration = 0;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		calendars: Calendars = getCalendars()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.calendars = calendars;
	}

	async load(): Promise<void> {
		let res: ListResponse | null = null;
		try {
			res = await this.apiService.list(apiRoutes.calendars.externalAccounts.list);
		} finally {
			this.loadFailed = res === null;
		}
		if (!res) return;

		this.accounts = res.data as ExternalCalendarAccount[];
		this.loaded = true;
	}

	async addAccount(request: CreateExternalAccountRequest): Promise<ExternalAccountResult<ExternalCalendarAccount>> {
		const result = await this.send(() => this.apiService.postRaw<ExternalCalendarResponse<ExternalCalendarAccount>>(
			apiRoutes.calendars.externalAccounts.create,
			request
		));
		if (result.ok) await this.load();
		return result;
	}

	async updateAccount(
		account: ExternalCalendarAccount,
		request: UpdateExternalAccountRequest
	): Promise<ExternalAccountResult<ExternalCalendarAccount>> {
		const result = await this.send(() => this.apiService.putRaw<ExternalCalendarResponse<ExternalCalendarAccount>>(
			apiRoutes.calendars.externalAccounts.update.replace('%d', account.id.toString()),
			request
		));
		if (result.ok) await Promise.all([this.load(), this.calendars.loadCalendars(), this.calendars.loadEvents()]);
		return result;
	}

	async deleteAccount(account: ExternalCalendarAccount): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.calendars.externalAccounts.delete, account.id);
		if (ok) await this.refreshAfterCalendarChange();
		return ok;
	}

	async loadAvailable(account: ExternalCalendarAccount): Promise<ExternalAccountResult<ExternalCalendarCandidate[]>> {
		return this.send(() => this.apiService.listRaw<ExternalCalendarResponse<ExternalCalendarCandidate[]>>(
			apiRoutes.calendars.externalAccounts.available.replace('%d', account.id.toString())
		));
	}

	async connect(account: ExternalCalendarAccount, urls: string[]): Promise<ExternalAccountResult<unknown>> {
		const result = await this.send(() => this.apiService.postRaw<ExternalCalendarResponse<unknown>>(
			apiRoutes.calendars.externalAccounts.connect.replace('%d', account.id.toString()),
			{ urls }
		));
		if (result.ok) await this.refreshAfterCalendarChange();
		return result;
	}

	connectedCount(account: ExternalCalendarAccount): number {
		return account.calendars.filter((linked) => this.calendars.calendars.some((calendar) => calendar.id === linked.id)).length;
	}

	async changePasswordForCalendar(calendarId: number): Promise<void> {
		if (!this.loaded) await this.load();

		const account = this.accounts.find((candidate) => candidate.calendars.some((linked) => linked.id === calendarId));
		if (account) this.openDialog({ step: 'credentials', account });
	}

	openDialog(dialog: ExternalAccountDialog): void {
		this.dialogGeneration++;
		this.dialog = dialog;
	}

	closeDialog(): void {
		this.dialogGeneration++;
		this.dialog = null;
	}

	dialogToken(): number {
		return this.dialogGeneration;
	}

	isDialogCurrent(token: number): boolean {
		return token === this.dialogGeneration;
	}

	private async send<T>(request: () => Promise<ExternalCalendarResponse<T>>): Promise<ExternalAccountResult<T>> {
		try {
			const res = await request();
			if (res.success && res.data !== undefined) return { ok: true, data: res.data };
			return { ok: false, error: this.service.errorFromResponse(res) };
		} catch (error) {
			if (!(error instanceof RateLimitedError)) throw error;
			return { ok: false, error: this.service.rateLimited(error.retryAfter) };
		}
	}

	private async refreshAfterCalendarChange(): Promise<void> {
		await Promise.all([this.load(), this.calendars.loadCalendars(), this.calendars.loadEvents()]);
		this.auth.widgetBridge.notifyChanged();
	}
}

const EXTERNAL_CALENDARS_KEY = Symbol('SOLYTO_EXTERNAL_CALENDARS');

export function setExternalCalendars(): ExternalCalendars {
	return setContext(EXTERNAL_CALENDARS_KEY, new ExternalCalendars());
}

export function getExternalCalendars(): ExternalCalendars {
	return getContext<ExternalCalendars>(EXTERNAL_CALENDARS_KEY);
}
