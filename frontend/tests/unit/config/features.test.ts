import { describe, it, expect, vi, beforeEach } from 'vitest';

const lsStore = new Map<string, string>();
const lsCalls: string[] = [];

function install(env: Record<string, string> = {}, browser = false) {
	vi.doMock('$env/dynamic/public', () => ({ env }));
	vi.doMock('$app/environment', () => ({ browser, dev: true }));
	vi.doMock('$lib/services/LocalStorageService', () => ({
		default: class {
			getBool = (key: string) => {
				lsCalls.push(`getBool:${key}`);
				const v = lsStore.get(key);
				return v === undefined ? null : v === '1';
			};
			setBool = (key: string, value: boolean) => {
				lsCalls.push(`setBool:${key}:${value}`);
				lsStore.set(key, value ? '1' : '0');
			};
		}
	}));
}

async function loadFeatures(env: Record<string, string> = {}, browser = false) {
	vi.resetModules();
	install(env, browser);
	return import('$lib/config/features');
}

beforeEach(() => {
	lsStore.clear();
	lsCalls.length = 0;
});

describe('featureConfig', () => {
	it('disables native features on the web', async () => {
		const { featureConfig } = await loadFeatures();
		expect(featureConfig.setCustomApiUrl).toBe(false);
		expect(featureConfig.firstStartupOptions).toBe(false);
	});

	it('enables first-startup options on first native run', async () => {
		const { featureConfig } = await loadFeatures({ PUBLIC_DESKTOP: '1' }, false);
		expect(featureConfig.setCustomApiUrl).toBe(true);
		expect(featureConfig.firstStartupOptions).toBe(true);
		expect(lsCalls).toContain('setBool:first_startup:true');
	});

	it('does not show first-startup options again once acknowledged', async () => {
		lsStore.set('first_startup', '1');
		const { featureConfig } = await loadFeatures({ PUBLIC_MOBILE: '1' }, false);
		expect(featureConfig.firstStartupOptions).toBe(false);
		expect(lsCalls.some((c) => c.startsWith('setBool:first_startup'))).toBe(false);
	});
});
