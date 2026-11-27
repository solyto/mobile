import type { CreateGoalRequest, Goal, UpdateGoalRequest } from '$lib/types/goal';
import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Goals {
	loaded = $state<boolean>(false);
	goals = $state<Goal[]>([]);
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.goals.list);
		if (!res) return;

		this.goals = res.data as Goal[];
		this.loaded = true;
	}

	forTracker(trackerId: number): Goal | null {
		return this.goals.find((goal) => goal.check_in_tracker_id === trackerId) ?? null;
	}

	async create(request: CreateGoalRequest): Promise<boolean> {
		const created = await this.apiService.create(apiRoutes.goals.list, request);
		if (created === null) return false;

		await this.load();
		this.auth.widgetBridge.notifyChanged();
		return true;
	}

	async update(goal: Goal, request: UpdateGoalRequest): Promise<boolean> {
		const ok = await this.apiService.put(apiRoutes.goals.goal.replace('%d', String(goal.id)), request);
		if (!ok) return false;

		await this.load();
		this.auth.widgetBridge.notifyChanged();
		return true;
	}

	async delete(goal: Goal): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.goals.goal, goal.id);
		if (!ok) return false;

		await this.load();
		this.auth.widgetBridge.notifyChanged();
		return true;
	}
}

const GOALS_KEY = Symbol('SOLYTO_GOALS');

export function setGoals(): Goals {
	return setContext(GOALS_KEY, new Goals());
}

export function getGoals(): Goals {
	return getContext<Goals>(GOALS_KEY);
}
