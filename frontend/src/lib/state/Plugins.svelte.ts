import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import PluginService from '$lib/services/PluginService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { AiProvider, UpdateAiPluginRequest, UserPlugin } from '$lib/types/plugin';

export class Plugins {
	loaded = $state<boolean>(false);
	plugins = $state<UserPlugin[]>([]);
	aiProviders = $state<AiProvider[]>([]);
	auth: Auth;
	apiService: ApiService;
	pluginService: PluginService;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		pluginService: PluginService = new PluginService()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.pluginService = pluginService;
	}

	get ai(): UserPlugin | null {
		return this.pluginService.findPlugin(this.plugins, 'ai');
	}

	async load(): Promise<void> {
		const [plugins, providers] = await Promise.all([
			this.apiService.list(apiRoutes.users.plugins.list),
			this.apiService.list(apiRoutes.plugins.ai.providers)
		]);
		if (plugins === null || providers === null) return;

		this.plugins = plugins.data as UserPlugin[];
		this.aiProviders = providers.data as AiProvider[];
		this.loaded = true;
	}

	async updateAi(request: UpdateAiPluginRequest): Promise<boolean> {
		const ok = await this.apiService.update(apiRoutes.users.plugins.update, 'ai', request);
		if (ok) await this.load();
		return ok;
	}
}

const PLUGINS_KEY = Symbol('SOLYTO_PLUGINS');

export function setPlugins(): Plugins {
	return setContext(PLUGINS_KEY, new Plugins());
}

export function getPlugins(): Plugins {
	return getContext<Plugins>(PLUGINS_KEY);
}
