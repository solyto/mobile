import type {
	CheckIn,
	CheckInTracker,
	CheckInValue,
	CreateCheckInTrackerRequest,
	SportId,
	UpdateCheckInTrackerRequest
} from '$lib/types/check_in';
import { DEFAULT_SPORTS } from '$lib/types/check_in';
import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import CheckInTrackerService from '$lib/services/CheckInTrackerService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { page } from '$app/state';
import { getDateMinusDays, getPrevDay, getStartOfMonthMonthsAgo, getUrlFormat, parseUrlFormat } from '$lib/helpers/DateHelper';

const LOADED_MONTHS = 12;
const DASHBOARD_DAYS = 30;

export interface HistoryMonth {
	year: number;
	month: number;
}

export class CheckInData {
	loaded = $state<boolean>(false);
	trackers = $state<CheckInTracker[]>([]);
	values = $state<CheckInValue[]>([]);
	valuesFrom = $state<string | null>(getUrlFormat(getStartOfMonthMonthsAgo(new Date(), LOADED_MONTHS)));
	selectedSports = $state<SportId[]>([...DEFAULT_SPORTS]);
	historyMonth = $state<HistoryMonth>({ year: new Date().getFullYear(), month: new Date().getMonth() });
	selectedDate = $derived(page.params.date);
	auth: Auth;
	apiService: ApiService;
	readonly trackerService = new CheckInTrackerService();
	index = $derived(this.trackerService.index(this.values));
	activeTrackers = $derived(this.trackers.filter((tracker) => tracker.enabled));
	ratingTrackers = $derived(this.activeTrackers.filter((tracker) => this.trackerService.isRating(tracker)));
	logTrackers = $derived(this.activeTrackers.filter((tracker) => this.trackerService.isLog(tracker)));
	scoredTrackers = $derived(this.trackerService.scored(this.trackers));

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async load(): Promise<void> {
		const from = this.valuesFrom;
		const [trackersRes, valuesRes, settingsRes] = await Promise.all([
			this.apiService.list(apiRoutes.checkIn.trackers),
			this.apiService.list(this.valuesUrl(from, null)),
			this.apiService.get(apiRoutes.users.settings.updateCheckInSettings, null)
		]);

		if (trackersRes && valuesRes) {
			this.trackers = trackersRes.data as CheckInTracker[];
			this.values = valuesRes.data as CheckInValue[];
			// Older values loaded meanwhile were just replaced.
			this.valuesFrom = from;
			this.loaded = true;
		}

		if (settingsRes) {
			const data = settingsRes.data as { selected_sports?: SportId[] };
			this.selectedSports = data.selected_sports ?? [...DEFAULT_SPORTS];
		}
	}

	async loadDashboard(): Promise<void> {
		const from = getUrlFormat(getDateMinusDays(new Date(), DASHBOARD_DAYS));
		const [trackersRes, valuesRes] = await Promise.all([
			this.apiService.list(apiRoutes.checkIn.trackers),
			this.apiService.list(this.valuesUrl(from, null))
		]);
		if (!trackersRes || !valuesRes) return;

		this.trackers = trackersRes.data as CheckInTracker[];
		this.values = valuesRes.data as CheckInValue[];
		this.valuesFrom = from;
		this.loaded = true;
	}

	async loadValuesFrom(from: string | null): Promise<void> {
		const loadedFrom = this.valuesFrom;
		if (loadedFrom === null || (from !== null && from >= loadedFrom)) return;

		const to = getUrlFormat(getPrevDay(parseUrlFormat(loadedFrom)!));
		const res = await this.apiService.list(this.valuesUrl(from, to));
		if (!res) return;

		this.values = [...(res.data as CheckInValue[]), ...this.values];
		this.valuesFrom = from;
	}

	async loadTrackers(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.checkIn.trackers);
		if (res) this.trackers = res.data as CheckInTracker[];
	}

	getValue(tracker: CheckInTracker, date: string): number | null {
		return this.trackerService.value(this.index, tracker.id, date);
	}

	getDayData(day?: string): CheckIn | null {
		const date = day ?? this.selectedDate;
		if (!date) return null;

		return this.trackerService.builtInDay(this.index, this.trackers, date);
	}

	async saveDay(date: string, changes: Map<CheckInTracker, number | null>): Promise<boolean> {
		const entries = [...changes].map(([tracker, value]) => ({ tracker_id: tracker.id, value }));
		const ok = await this.apiService.put(apiRoutes.checkIn.values, { date, values: entries });
		if (!ok) return false;

		const changed = new Set(entries.map((entry) => entry.tracker_id));
		const saved = entries.flatMap(({ tracker_id, value }) => (value === null ? [] : [{ tracker_id, date, value }]));
		this.values = [...this.values.filter((v) => !(v.date === date && changed.has(v.tracker_id))), ...saved];
		this.auth.widgetBridge.notifyChanged();
		return true;
	}

	async saveSelectedSports(sports: SportId[]): Promise<boolean> {
		const enabledBuiltIns = this.trackers.filter((t) => t.key !== null && t.enabled).map((t) => t.key);
		const ok = await this.apiService.put(apiRoutes.users.settings.updateCheckInSettings, {
			enabled_trackers: enabledBuiltIns,
			selected_sports: sports
		});
		if (!ok) return false;

		this.selectedSports = sports;
		this.auth.widgetBridge.notifyChanged();
		return true;
	}

	async createTracker(request: CreateCheckInTrackerRequest): Promise<CheckInTracker | null> {
		const res = await this.apiService.create(apiRoutes.checkIn.trackers, request);
		if (!res) return null;

		await this.loadTrackers();
		this.auth.widgetBridge.notifyChanged();
		return this.trackers.find((tracker) => tracker.id === (res.data as CheckInTracker).id) ?? null;
	}

	// Shown at once and put back if the save fails, so a switch never shows what wasn't saved.
	async updateTracker(tracker: CheckInTracker, request: UpdateCheckInTrackerRequest): Promise<boolean> {
		this.replaceTracker({ ...tracker, ...request });
		const ok = await this.apiService.put(apiRoutes.checkIn.tracker.replace('%d', String(tracker.id)), request);
		if (!ok) {
			this.replaceTracker(tracker);
			return false;
		}

		await this.loadTrackers();
		this.auth.widgetBridge.notifyChanged();
		return true;
	}

	async deleteTracker(tracker: CheckInTracker): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.checkIn.tracker, tracker.id);
		if (!ok) return false;

		await this.loadTrackers();
		this.values = this.values.filter((value) => value.tracker_id !== tracker.id);
		this.auth.widgetBridge.notifyChanged();
		return true;
	}

	async moveTracker(tracker: CheckInTracker, offset: -1 | 1): Promise<boolean> {
		const ids = this.trackerService.orderAfterMove(this.trackers, tracker, offset);
		if (ids === null) return false;

		const ok = await this.apiService.put(apiRoutes.checkIn.trackerOrder, { ids });
		if (!ok) return false;

		await this.loadTrackers();
		this.auth.widgetBridge.notifyChanged();
		return true;
	}

	async prevMonth(): Promise<void> {
		const d = new Date(this.historyMonth.year, this.historyMonth.month - 1, 1);
		this.historyMonth = { year: d.getFullYear(), month: d.getMonth() };
		await this.loadValuesFrom(getUrlFormat(d));
	}

	nextMonth(): void {
		const d = new Date(this.historyMonth.year, this.historyMonth.month + 1, 1);
		this.historyMonth = { year: d.getFullYear(), month: d.getMonth() };
	}

	isCurrentMonth(): boolean {
		const now = new Date();
		return this.historyMonth.year === now.getFullYear() && this.historyMonth.month === now.getMonth();
	}

	private valuesUrl(from: string | null, to: string | null): string {
		const query = new URLSearchParams();
		if (from !== null) query.set('from', from);
		if (to !== null) query.set('to', to);
		const search = query.toString();
		return search === '' ? apiRoutes.checkIn.values : `${apiRoutes.checkIn.values}?${search}`;
	}

	private replaceTracker(tracker: CheckInTracker): void {
		this.trackers = this.trackers.map((t) => (t.id === tracker.id ? tracker : t));
	}
}

const CHECK_IN_KEY = Symbol('SOLYTO_CHECK_IN');

export function setCheckInData(): CheckInData {
	return setContext(CHECK_IN_KEY, new CheckInData());
}

export function getCheckInData(): CheckInData {
	return getContext<CheckInData>(CHECK_IN_KEY);
}
