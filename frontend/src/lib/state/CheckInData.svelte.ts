import type { CreateCheckInRequest, CheckIn, CheckInSettings, CheckInType, SportId } from '$lib/types/check_in';
import { ALL_CHECK_IN_TRACKERS, DEFAULT_SPORTS } from '$lib/types/check_in';
import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { getUrlFormat } from '$lib/helpers/DateHelper';
import { page } from '$app/state';
import LocalStorageService from '$lib/services/LocalStorageService';

export interface HistoryMonth {
	year: number;
	month: number;
}

export class CheckInData {
	static readonly LS_SCORED_TRACKERS_KEY: string = 'check_in_scored_trackers';

	loaded = $state<boolean>(false);
	data = $state<CheckIn[]>([]);
	settings = $state<CheckInSettings>({ enabledTrackers: [...ALL_CHECK_IN_TRACKERS], selectedSports: [...DEFAULT_SPORTS] });
	historyMonth = $state<HistoryMonth>({ year: new Date().getFullYear(), month: new Date().getMonth() });
	localStorage: LocalStorageService;
	scoredTrackers = $state<CheckInType[]>([]);
	activeTrackers = $derived(ALL_CHECK_IN_TRACKERS.filter((t) => this.settings.enabledTrackers.includes(t)));
	selectedDate = $derived(page.params.date);
	auth: Auth;
	apiService: ApiService;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		localStorage: LocalStorageService = new LocalStorageService()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.localStorage = localStorage;
		this.scoredTrackers = this.loadScoredTrackers();
	}

	private loadScoredTrackers(): CheckInType[] {
		const stored = this.localStorage.getJson(CheckInData.LS_SCORED_TRACKERS_KEY);
		if (Array.isArray(stored)) return stored as CheckInType[];
		return [...ALL_CHECK_IN_TRACKERS];
	}

	saveScoredTrackers(trackers: CheckInType[]): void {
		this.localStorage.setJson(CheckInData.LS_SCORED_TRACKERS_KEY, trackers);
		this.scoredTrackers = trackers;
	}

	async load(): Promise<void> {
		const [dataRes, settingsRes] = await Promise.all([
			this.apiService.list(apiRoutes.checkIn.list),
			this.apiService.get(apiRoutes.users.settings.updateCheckInSettings, null)
		]);

		if (dataRes) {
			this.loaded = true;
			this.data = dataRes.data as CheckIn[];
		}

		if (settingsRes) {
			const data = settingsRes.data as { enabled_trackers: CheckInType[]; selected_sports?: SportId[] };
			this.settings = {
				enabledTrackers: data.enabled_trackers,
				selectedSports: data.selected_sports ?? [...DEFAULT_SPORTS]
			};
		}
	}

	async save(request: CreateCheckInRequest): Promise<boolean> {
		const ok = await this.apiService.create(apiRoutes.checkIn.create, request);
		if (!ok) return false;
		await this.load();
		return true;
	}

	async saveSettings(settings: CheckInSettings): Promise<void> {
		await this.apiService.put(apiRoutes.users.settings.updateCheckInSettings, {
			enabled_trackers: settings.enabledTrackers,
			selected_sports: settings.selectedSports
		});
		this.settings = settings;
	}

	prevMonth(): void {
		const d = new Date(this.historyMonth.year, this.historyMonth.month - 1, 1);
		this.historyMonth = { year: d.getFullYear(), month: d.getMonth() };
	}

	nextMonth(): void {
		const d = new Date(this.historyMonth.year, this.historyMonth.month + 1, 1);
		this.historyMonth = { year: d.getFullYear(), month: d.getMonth() };
	}

	isCurrentMonth(): boolean {
		const now = new Date();
		return this.historyMonth.year === now.getFullYear() && this.historyMonth.month === now.getMonth();
	}

	getDayData(day?: string): CheckIn | null {
		if (!day)
			return (
				this.data.find((t) => t.date === getUrlFormat(new Date(this.selectedDate as string))) ??
				null
			);

		return this.data.find((t) => t.date === day) ?? null;
	}
}

const CHECK_IN_KEY = Symbol('SOLYTO_CHECK_IN');

export function setCheckInData(): CheckInData {
	return setContext(CHECK_IN_KEY, new CheckInData());
}

export function getCheckInData(): CheckInData {
	return getContext<CheckInData>(CHECK_IN_KEY);
}
