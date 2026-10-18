import type {
	AiPluginDraft,
	AiProvider,
	AiProviderId,
	UpdateAiPluginRequest,
	UserPlugin
} from '$lib/types/plugin';

export default class PluginService {
	findPlugin(plugins: UserPlugin[], name: UserPlugin['plugin']): UserPlugin | null {
		return plugins.find((plugin) => plugin.plugin === name) ?? null;
	}

	toDraft(plugin: UserPlugin | null): AiPluginDraft {
		return {
			enabled: plugin?.enabled ?? false,
			provider: plugin?.settings?.provider ?? null,
			model: plugin?.model_available === false ? null : (plugin?.settings?.model ?? null),
			apiKey: ''
		};
	}

	modelsOf(providers: AiProvider[], provider: AiProviderId | null): AiProvider['models'] {
		return providers.find((p) => p.provider === provider)?.models ?? [];
	}

	isModelAvailable(providers: AiProvider[], provider: AiProviderId | null, model: string | null): boolean {
		return this.modelsOf(providers, provider).some((m) => m.id === model);
	}

	needsApiKey(plugin: UserPlugin | null, draft: AiPluginDraft): boolean {
		return !(plugin?.has_api_key ?? false) && draft.apiKey.trim() === '';
	}

	canSave(plugin: UserPlugin | null, providers: AiProvider[], draft: AiPluginDraft): boolean {
		return !this.needsApiKey(plugin, draft) && this.isModelAvailable(providers, draft.provider, draft.model);
	}

	buildRequest(draft: AiPluginDraft): UpdateAiPluginRequest | null {
		if (draft.provider === null || draft.model === null) return null;

		const request: UpdateAiPluginRequest = {
			enabled: draft.enabled,
			provider: draft.provider,
			model: draft.model
		};
		const apiKey = draft.apiKey.trim();
		if (apiKey !== '') request.api_key = apiKey;

		return request;
	}

	buildDisableRequest(plugin: UserPlugin | null): UpdateAiPluginRequest | null {
		const provider = plugin?.settings?.provider ?? null;
		const model = plugin?.settings?.model ?? null;
		if (provider === null || model === null) return null;

		return { enabled: false, provider, model };
	}
}
