import type { Calendar, ShareCalendarRequest } from '$lib/types/calendar';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import { getCalendars, type Calendars } from '$lib/state/Calendars.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class CalendarSharing {
	shareModal = $state<boolean>(false);
	shareCalendarTarget = $state<Calendar | null>(null);

	auth: Auth;
	apiService: ApiService;
	calendars: Calendars;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		calendars: Calendars = getCalendars()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.calendars = calendars;
	}

	async shareCalendar(calendarId: number, friendId: string): Promise<boolean> {
		const request: ShareCalendarRequest = { friend_id: friendId };
		const res = await this.apiService.post(
			apiRoutes.calendars.shareCalendar.replace('%d', calendarId.toString()),
			request
		);
		return res !== null;
	}

	async revokeShare(calendarId: number, userId: string): Promise<boolean> {
		return this.apiService.delete(
			apiRoutes.calendars.revokeShare.replace('%d', calendarId.toString()),
			userId
		);
	}

	async unsubscribeFromCalendar(calendarId: number): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.calendars.unsubscribe, calendarId);
		if (res) await this.calendars.loadCalendars();
		return res;
	}

	async acceptInvite(token: string): Promise<boolean> {
		const res = await this.apiService.put(
			apiRoutes.calendars.acceptInvite.replace('%s', token),
			{}
		);
		if (res) {
			await this.calendars.loadCalendars();
			await this.calendars.loadEvents();
		}
		return res;
	}

	async declineInvite(token: string): Promise<boolean> {
		const res = await this.apiService.put(
			apiRoutes.calendars.declineInvite.replace('%s', token),
			{}
		);
		if (res) await this.calendars.loadCalendars();
		return res;
	}

	openShareModal(calendar: Calendar): void {
		this.shareCalendarTarget = calendar;
		this.shareModal = true;
	}

	closeShareModal(): void {
		this.shareModal = false;
		this.shareCalendarTarget = null;
	}
}

const CALENDAR_SHARING_KEY = Symbol('SOLYTO_CALENDAR_SHARING');

export function setCalendarSharing(): CalendarSharing {
	return setContext(CALENDAR_SHARING_KEY, new CalendarSharing());
}

export function getCalendarSharing(): CalendarSharing {
	return getContext<CalendarSharing>(CALENDAR_SHARING_KEY);
}
