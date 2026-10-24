import type {
	ImportRequest,
	SelectImportCalendarsRequest,
	ImportState
} from '$lib/types/calendar';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class CalendarImport {
	importModal = $state<boolean>(false);

	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async startImport(request: ImportRequest): Promise<boolean> {
		return (await this.apiService.post(apiRoutes.calendars.startImport, request)) !== null;
	}

	async selectImportCalendars(request: SelectImportCalendarsRequest) {
		return (
			(await this.apiService.post(apiRoutes.calendars.selectImportCalendars, request)) !==
			null
		);
	}

	async getImportState(): Promise<ImportState | null> {
		const res = await this.apiService.get(apiRoutes.calendars.getImportState, '');
		if (res) return res.data as ImportState;
		return null;
	}
}

const CALENDAR_IMPORT_KEY = Symbol('SOLYTO_CALENDAR_IMPORT');

export function setCalendarImport(): CalendarImport {
	return setContext(CALENDAR_IMPORT_KEY, new CalendarImport());
}

export function getCalendarImport(): CalendarImport {
	return getContext<CalendarImport>(CALENDAR_IMPORT_KEY);
}
