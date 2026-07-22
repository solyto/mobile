import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { StatisticsOverview } from '$lib/types/statistic';

export class Statistics {
	loaded = $state<boolean>(false);
	auth = getAuth();
	overview = $state<StatisticsOverview | null>(null);
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.statistics.overview, null);
		if (res) {
			this.overview = res.data as StatisticsOverview;
			this.loaded = true;
		}
	}
}

const STATISTICS_KEY = Symbol('SOLYTO_STATISTICS');

export function setStatistics(): Statistics {
	return setContext(STATISTICS_KEY, new Statistics());
}

export function getStatistics(): Statistics {
	return getContext<Statistics>(STATISTICS_KEY);
}
