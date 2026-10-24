import { describe, it, expect, beforeEach } from 'vitest';
import { Plugins } from '$lib/state/Plugins.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';
import type { AiProvider, UserPlugin } from '$lib/types/plugin';

beforeEach(() => {
	resetStoreMocks();
});

function aiPlugin(overrides: Partial<UserPlugin> = {}): UserPlugin {
	return {
		plugin: 'ai',
		enabled: true,
		has_api_key: true,
		settings: { provider: 'openai', model: 'gpt-4o' },
		model_available: true,
		...overrides
	};
}

const providers: AiProvider[] = [
	{ provider: 'openai', name: 'OpenAI', models: [{ id: 'gpt-4o', name: 'GPT-4o' }] }
];

function respond(plugins: UserPlugin[] | null, aiProviders: AiProvider[] | null): void {
	api.list.mockImplementation(async (endpoint: string) => {
		if (endpoint.endsWith('/users/me/plugins')) return plugins === null ? null : { data: plugins };
		if (endpoint.endsWith('/plugins/ai/providers')) return aiProviders === null ? null : { data: aiProviders };
		return null;
	});
}

describe('Plugins store', () => {
	it('loads plugins and providers', async () => {
		respond([aiPlugin()], providers);

		const p = new Plugins();
		await p.load();

		expect(p.loaded).toBe(true);
		expect(p.ai).toEqual(aiPlugin());
		expect(p.aiProviders).toEqual(providers);
	});

	it('keeps the previous state when a request fails', async () => {
		respond([aiPlugin()], providers);
		const p = new Plugins();
		await p.load();

		respond([aiPlugin({ enabled: false })], null);
		await p.load();

		expect(p.ai?.enabled).toBe(true);
		expect(p.aiProviders).toEqual(providers);
	});

	it('is not loaded after a failed first load', async () => {
		respond(null, providers);

		const p = new Plugins();
		await p.load();

		expect(p.loaded).toBe(false);
		expect(p.ai).toBeNull();
	});

	it('updates the ai plugin and reloads on success', async () => {
		api.update.mockResolvedValue(true);
		respond([aiPlugin({ enabled: false })], providers);

		const p = new Plugins();
		const request = { enabled: false, provider: 'openai' as const, model: 'gpt-4o' };

		await expect(p.updateAi(request)).resolves.toBe(true);
		expect(api.update).toHaveBeenCalledWith(expect.stringContaining('/users/me/plugins/%s'), 'ai', request);
		expect(p.ai?.enabled).toBe(false);
	});

	it('does not reload when the update fails', async () => {
		api.update.mockResolvedValue(false);

		const p = new Plugins();
		await expect(p.updateAi({ enabled: true, provider: 'openai', model: 'gpt-4o' })).resolves.toBe(false);
		expect(api.list).not.toHaveBeenCalled();
	});
});
