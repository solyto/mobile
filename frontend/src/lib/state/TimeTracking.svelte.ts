import type {
	TimeTrackingCategory,
	TimeTrackingProject,
	TimeTrackingEntry,
	CreateTimeTrackingCategoryRequest,
	UpdateTimeTrackingCategoryRequest,
	CreateTimeTrackingProjectRequest,
	UpdateTimeTrackingProjectRequest,
	CreateTimeTrackingEntryRequest,
	UpdateTimeTrackingEntryRequest,
	StartTimerRequest,
	TimeTrackingStatistics
} from '$lib/types/time_tracking';
import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class TimeTracking {
	loaded = $state<boolean>(false);
	categories = $state<TimeTrackingCategory[]>([]);
	projects = $state<TimeTrackingProject[]>([]);
	entries = $state<TimeTrackingEntry[]>([]);
	activeTimer = $state<TimeTrackingEntry | null>(null);
	statistics = $state<TimeTrackingStatistics | null>(null);
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async load(): Promise<void> {
		await Promise.all([
			this.loadCategories(),
			this.loadProjects(),
			this.loadEntries()
		]);
		this.loaded = true;
	}

	async loadCategories(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.timeTracking.categories.list);
		if (res) this.categories = res.data as TimeTrackingCategory[];
	}

	async loadProjects(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.timeTracking.projects.list);
		if (res) this.projects = res.data as TimeTrackingProject[];
	}

	async loadEntries(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.timeTracking.entries.list);
		if (res) {
			this.entries = res.data as TimeTrackingEntry[];
			this.activeTimer = this.entries.find((e) => e.stopped_at === null) ?? null;
		}
	}

	async createCategory(request: CreateTimeTrackingCategoryRequest): Promise<boolean> {
		const res = await this.apiService.create(
			apiRoutes.timeTracking.categories.create,
			request
		);
		if (res) await this.loadCategories();
		return res !== null;
	}

	async updateCategory(id: number, request: UpdateTimeTrackingCategoryRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.timeTracking.categories.update,
			id,
			request
		);
		if (res) await Promise.all([this.loadCategories(), this.loadProjects()]);
		return res;
	}

	async deleteCategory(id: number): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.timeTracking.categories.delete, id);
		if (res) await Promise.all([this.loadCategories(), this.loadProjects()]);
		return res;
	}

	async createProject(request: CreateTimeTrackingProjectRequest): Promise<boolean> {
		const res = await this.apiService.create(
			apiRoutes.timeTracking.projects.create,
			request
		);
		if (res) await this.loadProjects();
		return res !== null;
	}

	async updateProject(id: string, request: UpdateTimeTrackingProjectRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.timeTracking.projects.update,
			id,
			request
		);
		if (res) await this.loadProjects();
		return res;
	}

	async deleteProject(id: string): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.timeTracking.projects.delete, id);
		if (res) await Promise.all([this.loadProjects(), this.loadEntries()]);
		return res;
	}

	async createEntry(request: CreateTimeTrackingEntryRequest): Promise<boolean> {
		const res = await this.apiService.create(
			apiRoutes.timeTracking.entries.create,
			request
		);
		if (res) await Promise.all([this.loadEntries(), this.loadProjects()]);
		return res !== null;
	}

	async updateEntry(id: string, request: UpdateTimeTrackingEntryRequest): Promise<boolean> {
		const res = await this.apiService.update(apiRoutes.timeTracking.entries.update, id, request);
		if (res) await Promise.all([this.loadEntries(), this.loadProjects()]);
		return res;
	}

	async deleteEntry(id: string): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.timeTracking.entries.delete, id);
		if (res) await Promise.all([this.loadEntries(), this.loadProjects()]);
		return res;
	}

	async startTimer(request: StartTimerRequest): Promise<boolean> {
		const res = await this.apiService.post(apiRoutes.timeTracking.entries.start, request);
		if (res) await this.loadEntries();
		return res !== null;
	}

	async stopTimer(entryId: string): Promise<boolean> {
		const res = await this.apiService.post(
			apiRoutes.timeTracking.entries.stop.replace('%s', entryId),
			{}
		);
		if (res) await Promise.all([this.loadEntries(), this.loadProjects()]);
		return res !== null;
	}

	async loadStatistics(from: string, to: string, categoryIds: number[] = []): Promise<void> {
		const params = [`from=${encodeURIComponent(from)}`, `to=${encodeURIComponent(to)}`];
		if (categoryIds.length > 0) params.push(`category_ids=${categoryIds.join(',')}`);
		const res = await this.apiService.list(
			apiRoutes.timeTracking.entries.statistics + `?${params.join('&')}`
		);
		if (res) this.statistics = res.data as unknown as TimeTrackingStatistics;
	}

	formatDuration(minutes: number): string {
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		if (h === 0) return `${m}m`;
		return `${h}h ${m}m`;
	}
}

const TIME_TRACKING_KEY = Symbol('SOLYTO_TIME_TRACKING');

export function setTimeTracking(): TimeTracking {
	return setContext(TIME_TRACKING_KEY, new TimeTracking());
}

export function getTimeTracking(): TimeTracking {
	return getContext<TimeTracking>(TIME_TRACKING_KEY);
}
