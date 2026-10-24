import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetStoreMocks } from '../setup/storeMocks';

// This file exercises the PUBLIC_DISABLE_DEV_REQUESTS branch of
// loadActiveFeatures, so it mocks the public env before importing the store
// (the main Navigation.test.ts runs with an empty env).
vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_DISABLE_DEV_REQUESTS: 'true' }
}));

import { Navigation } from '$lib/state/Navigation.svelte';

beforeEach(() => {
	resetStoreMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Navigation store with PUBLIC_DISABLE_DEV_REQUESTS', () => {
	it('disables the dev-requests feature', async () => {
		const s = new Navigation();
		await s.loadActiveFeatures();
		expect(s.features.dev_requests).toBe(false);
		expect(s.features.todos).toBe(true);
	});
});
