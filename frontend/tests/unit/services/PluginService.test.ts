import { describe, it, expect } from 'vitest';
import PluginService from '$lib/services/PluginService';
import type { AiPluginDraft, AiProvider, UserPlugin } from '$lib/types/plugin';

const service = new PluginService();

const providers: AiProvider[] = [
	{ provider: 'openai', name: 'OpenAI', models: [{ id: 'gpt-4o', name: 'GPT-4o' }] },
	{ provider: 'mistral', name: 'Mistral', models: [{ id: 'mistral-large', name: 'Mistral Large' }] }
];

function plugin(overrides: Partial<UserPlugin> = {}): UserPlugin {
	return {
		plugin: 'ai',
		enabled: true,
		has_api_key: true,
		settings: { provider: 'openai', model: 'gpt-4o' },
		model_available: true,
		...overrides
	};
}

function draft(overrides: Partial<AiPluginDraft> = {}): AiPluginDraft {
	return { enabled: true, provider: 'openai', model: 'gpt-4o', apiKey: '', ...overrides };
}

describe('findPlugin', () => {
	it('finds the plugin by name', () => {
		const ai = plugin();
		expect(service.findPlugin([ai], 'ai')).toBe(ai);
	});

	it('returns null when the plugin is missing', () => {
		expect(service.findPlugin([], 'ai')).toBeNull();
	});
});

describe('toDraft', () => {
	it('copies the stored settings and never a key', () => {
		expect(service.toDraft(plugin())).toEqual(draft());
	});

	it('starts empty for an unconfigured plugin', () => {
		const unconfigured = plugin({ enabled: false, has_api_key: false, settings: null, model_available: null });
		expect(service.toDraft(unconfigured)).toEqual({ enabled: false, provider: null, model: null, apiKey: '' });
	});

	it('starts empty when the plugin is missing', () => {
		expect(service.toDraft(null)).toEqual({ enabled: false, provider: null, model: null, apiKey: '' });
	});

	it('clears a model that is no longer available', () => {
		const removed = plugin({ settings: { provider: 'openai', model: 'gpt-3' }, model_available: false });
		expect(service.toDraft(removed)).toEqual(draft({ model: null }));
	});
});

describe('modelsOf', () => {
	it('returns the models of the selected provider', () => {
		expect(service.modelsOf(providers, 'mistral')).toEqual([{ id: 'mistral-large', name: 'Mistral Large' }]);
	});

	it('returns no models without a provider', () => {
		expect(service.modelsOf(providers, null)).toEqual([]);
	});
});

describe('canSave', () => {
	it('allows saving with a stored key and a blank input', () => {
		expect(service.canSave(plugin(), providers, draft())).toBe(true);
	});

	it('rejects the first save without a key', () => {
		expect(service.canSave(plugin({ has_api_key: false }), providers, draft())).toBe(false);
	});

	it('rejects a key made of whitespace only', () => {
		expect(service.canSave(plugin({ has_api_key: false }), providers, draft({ apiKey: '   ' }))).toBe(false);
	});

	it('allows the first save with a key', () => {
		expect(service.canSave(plugin({ has_api_key: false }), providers, draft({ apiKey: 'sk-1' }))).toBe(true);
	});

	it('rejects a model that is not in the provider list', () => {
		expect(service.canSave(plugin(), providers, draft({ model: 'gpt-3' }))).toBe(false);
	});

	it('rejects a model that belongs to another provider', () => {
		expect(service.canSave(plugin(), providers, draft({ provider: 'mistral' }))).toBe(false);
	});

	it('rejects a missing model', () => {
		expect(service.canSave(plugin(), providers, draft({ model: null }))).toBe(false);
	});
});

describe('buildRequest', () => {
	it('leaves out the key when the input is blank', () => {
		const request = service.buildRequest(draft({ apiKey: '  ' }));
		expect(request).toEqual({ enabled: true, provider: 'openai', model: 'gpt-4o' });
		expect(request).not.toHaveProperty('api_key');
	});

	it('sends a trimmed key when one is entered', () => {
		expect(service.buildRequest(draft({ apiKey: ' sk-1 ' }))).toEqual({
			enabled: true,
			provider: 'openai',
			model: 'gpt-4o',
			api_key: 'sk-1'
		});
	});

	it('sends the disabled state', () => {
		expect(service.buildRequest(draft({ enabled: false }))?.enabled).toBe(false);
	});

	it('returns null without a provider or model', () => {
		expect(service.buildRequest(draft({ provider: null }))).toBeNull();
		expect(service.buildRequest(draft({ model: null }))).toBeNull();
	});
});

describe('buildDisableRequest', () => {
	it('disables with the stored provider and model', () => {
		expect(service.buildDisableRequest(plugin())).toEqual({ enabled: false, provider: 'openai', model: 'gpt-4o' });
	});

	it('disables even when the stored model is no longer available', () => {
		const unavailable = plugin({ settings: { provider: 'openai', model: 'gpt-3' }, model_available: false });
		expect(service.buildDisableRequest(unavailable)).toEqual({ enabled: false, provider: 'openai', model: 'gpt-3' });
	});

	it('never sends a key', () => {
		expect(service.buildDisableRequest(plugin())).not.toHaveProperty('api_key');
	});

	it('returns null when nothing is stored', () => {
		expect(service.buildDisableRequest(plugin({ settings: null }))).toBeNull();
		expect(service.buildDisableRequest(null)).toBeNull();
	});
});
