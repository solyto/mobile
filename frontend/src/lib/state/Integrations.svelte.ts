import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import LocalStorageService from '$lib/services/LocalStorageService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { getApiUrl } from '$lib/config/platform';
import type { InstanceIntegrations, IntegrationName } from '$lib/types/integration';

interface CachedIntegrations {
	apiUrl: string;
	fetchedAt: number;
	integrations: InstanceIntegrations;
}

export class Integrations {
	static readonly LS_CACHE_KEY: string = 'integrations';
	static readonly CACHE_TTL_MS: number = 24 * 60 * 60 * 1000;

	loaded = $state<boolean>(false);
	integrations = $state<InstanceIntegrations | null>(null);
	auth: Auth;
	apiService: ApiService;
	localStorage: LocalStorageService;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		localStorage: LocalStorageService = new LocalStorageService()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.localStorage = localStorage;

		const cached = this.readCache();
		if (cached) {
			this.integrations = cached;
			this.loaded = true;
		}
	}

	isConfigured(name: IntegrationName): boolean {
		return this.integrations?.[name] !== false;
	}

	async load(): Promise<void> {
		if (this.loaded) return;

		const res = await this.apiService.get(apiRoutes.integrations, null);
		if (!res) return;

		this.integrations = res.data as InstanceIntegrations;
		this.loaded = true;
		this.localStorage.setJson(Integrations.LS_CACHE_KEY, {
			apiUrl: getApiUrl(),
			fetchedAt: Date.now(),
			integrations: this.integrations
		} satisfies CachedIntegrations);
	}

	private readCache(): InstanceIntegrations | null {
		const cached = this.localStorage.getJson(
			Integrations.LS_CACHE_KEY
		) as CachedIntegrations | null;
		if (!cached?.integrations) return null;
		if (cached.apiUrl !== getApiUrl()) return null;
		if (Date.now() - cached.fetchedAt > Integrations.CACHE_TTL_MS) return null;

		return cached.integrations;
	}
}

const INTEGRATIONS_KEY = Symbol('SOLYTO_INTEGRATIONS');

export function setIntegrations(): Integrations {
	return setContext(INTEGRATIONS_KEY, new Integrations());
}

export function getIntegrations(): Integrations {
	return getContext<Integrations>(INTEGRATIONS_KEY);
}
