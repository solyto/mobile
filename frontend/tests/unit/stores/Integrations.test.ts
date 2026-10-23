import { describe, it, expect, beforeEach } from 'vitest';
import { Integrations } from '$lib/state/Integrations.svelte';
import { api, storage, resetStoreMocks } from '../setup/storeMocks';
import { getApiUrl } from '$lib/config/platform';
import type { InstanceIntegrations } from '$lib/types/integration';

beforeEach(() => {
	resetStoreMocks();
});

function flags(overrides: Partial<InstanceIntegrations> = {}): InstanceIntegrations {
	return {
		hardcover: true,
		tmdb: true,
		discogs: true,
		bgg: true,
		spotify: true,
		telegram: true,
		ntfy: true,
		...overrides
	};
}

describe('Integrations store', () => {
	it('loads the flags', async () => {
		api.get.mockResolvedValue({ data: flags({ tmdb: false }) });

		const i = new Integrations();
		await i.load();

		expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/integrations'), null);
		expect(i.loaded).toBe(true);
		expect(i.isConfigured('hardcover')).toBe(true);
		expect(i.isConfigured('tmdb')).toBe(false);
	});

	it('does not fetch again once loaded', async () => {
		api.get.mockResolvedValue({ data: flags() });

		const i = new Integrations();
		await i.load();
		await i.load();

		expect(api.get).toHaveBeenCalledTimes(1);
	});

	it('reports every integration as configured before loading', () => {
		const i = new Integrations();

		expect(i.isConfigured('telegram')).toBe(true);
	});

	it('reports every integration as configured after a failed load', async () => {
		const i = new Integrations();
		await i.load();

		expect(i.loaded).toBe(false);
		expect(i.isConfigured('bgg')).toBe(true);
	});

	it('retries after a failed load', async () => {
		const i = new Integrations();
		await i.load();

		api.get.mockResolvedValue({ data: flags({ bgg: false }) });
		await i.load();

		expect(i.loaded).toBe(true);
		expect(i.isConfigured('bgg')).toBe(false);
	});

	it('caches the flags in localStorage after loading', async () => {
		api.get.mockResolvedValue({ data: flags({ tmdb: false }) });

		const i = new Integrations();
		await i.load();

		expect(storage.setJson).toHaveBeenCalledWith(
			Integrations.LS_CACHE_KEY,
			expect.objectContaining({ apiUrl: getApiUrl(), integrations: flags({ tmdb: false }) })
		);
	});

	it('uses a fresh cache without fetching', async () => {
		storage.getJson.mockReturnValue({
			apiUrl: getApiUrl(),
			fetchedAt: Date.now(),
			integrations: flags({ telegram: false })
		});

		const i = new Integrations();
		await i.load();

		expect(api.get).not.toHaveBeenCalled();
		expect(i.loaded).toBe(true);
		expect(i.isConfigured('telegram')).toBe(false);
	});

	it('refetches when the cache is expired', async () => {
		storage.getJson.mockReturnValue({
			apiUrl: getApiUrl(),
			fetchedAt: Date.now() - Integrations.CACHE_TTL_MS - 1,
			integrations: flags({ telegram: false })
		});
		api.get.mockResolvedValue({ data: flags() });

		const i = new Integrations();
		await i.load();

		expect(api.get).toHaveBeenCalledTimes(1);
		expect(i.isConfigured('telegram')).toBe(true);
	});

	it('refetches when the cache belongs to another API server', async () => {
		storage.getJson.mockReturnValue({
			apiUrl: 'https://other.example',
			fetchedAt: Date.now(),
			integrations: flags({ telegram: false })
		});
		api.get.mockResolvedValue({ data: flags() });

		const i = new Integrations();
		await i.load();

		expect(api.get).toHaveBeenCalledTimes(1);
		expect(i.isConfigured('telegram')).toBe(true);
	});
});
