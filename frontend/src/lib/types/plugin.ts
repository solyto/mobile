export type PluginName = 'ai';

export type AiProviderId = 'openai' | 'openrouter' | 'mistral';

export interface AiPluginSettings {
	provider: AiProviderId | null;
	model: string | null;
}

export interface UserPlugin {
	plugin: PluginName;
	enabled: boolean;
	has_api_key: boolean;
	settings: AiPluginSettings | null;
	model_available: boolean | null;
}

export interface AiModel {
	id: string;
	name: string;
}

export interface AiProvider {
	provider: AiProviderId;
	name: string;
	models: AiModel[];
}

export interface AiPluginDraft {
	enabled: boolean;
	provider: AiProviderId | null;
	model: string | null;
	apiKey: string;
}

export interface UpdateAiPluginRequest {
	enabled: boolean;
	provider: AiProviderId;
	model: string;
	api_key?: string;
}
