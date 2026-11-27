import type { Alert, AlertSuggestion, AlertSuggestionKey, CreateAlertRequest, UpdateAlertRequest } from '$lib/types/alert';
import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Alerts {
	loaded = $state<boolean>(false);
	alerts = $state<Alert[]>([]);
	suggestions = $state<AlertSuggestion[]>([]);
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async load(): Promise<void> {
		const [alertsRes, suggestionsRes] = await Promise.all([
			this.apiService.list(apiRoutes.alerts.list),
			this.apiService.list(apiRoutes.alerts.suggestions)
		]);

		if (alertsRes && suggestionsRes) {
			this.alerts = alertsRes.data as Alert[];
			this.suggestions = suggestionsRes.data as AlertSuggestion[];
			this.loaded = true;
		}
	}

	async create(request: CreateAlertRequest): Promise<boolean> {
		const created = await this.apiService.create(apiRoutes.alerts.list, request);
		if (created === null) return false;

		await this.load();
		return true;
	}

	async update(alert: Alert, request: UpdateAlertRequest): Promise<boolean> {
		const ok = await this.apiService.put(apiRoutes.alerts.alert.replace('%d', String(alert.id)), request);
		if (ok) await this.load();
		return ok;
	}

	async delete(alert: Alert): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.alerts.alert, alert.id);
		if (ok) await this.load();
		return ok;
	}

	async enableSuggestion(key: AlertSuggestionKey): Promise<boolean> {
		const created = await this.apiService.create(apiRoutes.alerts.suggestion.replace('%s', key), {});
		if (created === null) return false;

		await this.load();
		return true;
	}
}

const ALERTS_KEY = Symbol('SOLYTO_ALERTS');

export function setAlerts(): Alerts {
	return setContext(ALERTS_KEY, new Alerts());
}

export function getAlerts(): Alerts {
	return getContext<Alerts>(ALERTS_KEY);
}
