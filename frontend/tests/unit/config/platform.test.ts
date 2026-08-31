import { describe, it, expect, vi, beforeEach } from 'vitest';

const lsStore = new Map<string, string>();

function installEnv(env: Record<string, string> = {}, appEnv = { browser: false, dev: true }) {
	vi.doMock('$env/dynamic/public', () => ({ env }));
	vi.doMock('$app/environment', () => appEnv);
	vi.doMock('$lib/services/LocalStorageService', () => ({
		default: class {
			get = (key: string) => lsStore.get(key) ?? null;
			set = (key: string, value: string) => lsStore.set(key, value);
			destroy = (key: string) => lsStore.delete(key);
		}
	}));
}

async function loadPlatform(
	env: Record<string, string> = {},
	appEnv = { browser: false, dev: true }
) {
	vi.resetModules();
	installEnv(env, appEnv);
	return import('$lib/config/platform');
}

beforeEach(() => {
	lsStore.clear();
	vi.unstubAllGlobals();
});

describe('PLATFORM', () => {
	it('defaults to web', async () => {
		const { PLATFORM, IS_WEB, IS_NATIVE } = await loadPlatform();
		expect(PLATFORM).toBe('web');
		expect(IS_WEB).toBe(true);
		expect(IS_NATIVE).toBe(false);
	});

	it('is desktop when PUBLIC_DESKTOP is set', async () => {
		const { PLATFORM, IS_DESKTOP, IS_NATIVE } = await loadPlatform({ PUBLIC_DESKTOP: '1' });
		expect(PLATFORM).toBe('desktop');
		expect(IS_DESKTOP).toBe(true);
		expect(IS_NATIVE).toBe(true);
	});

	it('is mobile when PUBLIC_MOBILE is set', async () => {
		const { PLATFORM, IS_MOBILE } = await loadPlatform({ PUBLIC_MOBILE: '1' });
		expect(PLATFORM).toBe('mobile');
		expect(IS_MOBILE).toBe(true);
	});
});

describe('getPwaApiUrl', () => {
	it('uses localhost in development', async () => {
		const { getPwaApiUrl } = await loadPlatform({}, { browser: false, dev: true });
		expect(getPwaApiUrl()).toBe('http://localhost:8000');
	});

	it('uses PUBLIC_API_URL when set', async () => {
		const { getPwaApiUrl } = await loadPlatform(
			{ PUBLIC_API_URL: 'https://staging.solyto.app' },
			{ browser: false, dev: false }
		);
		expect(getPwaApiUrl()).toBe('https://staging.solyto.app');
	});

	it('falls back to api.solyto.app when not in the browser', async () => {
		const { getPwaApiUrl } = await loadPlatform({}, { browser: false, dev: false });
		expect(getPwaApiUrl()).toBe('https://api.solyto.app');
	});

	it('maps known hostnames in the browser', async () => {
		vi.stubGlobal('window', { location: { hostname: 'app.solyto.de' } });
		const { getPwaApiUrl } = await loadPlatform({}, { browser: true, dev: false });
		expect(getPwaApiUrl()).toBe('https://api.solyto.de');
	});

	it('falls back for unknown hostnames in the browser', async () => {
		vi.stubGlobal('window', { location: { hostname: 'example.com' } });
		const { getPwaApiUrl } = await loadPlatform({}, { browser: true, dev: false });
		expect(getPwaApiUrl()).toBe('https://api.solyto.app');
	});
});

describe('getApiUrl', () => {
	it('delegates to the PWA URL on web', async () => {
		const { getApiUrl } = await loadPlatform({}, { browser: false, dev: true });
		expect(getApiUrl()).toBe('http://localhost:8000');
	});

	it('uses the custom API URL on native platforms', async () => {
		lsStore.set('custom_api_url', 'https://selfhosted.example');
		const { getApiUrl } = await loadPlatform(
			{ PUBLIC_DESKTOP: '1' },
			{ browser: true, dev: false }
		);
		expect(getApiUrl()).toBe('https://selfhosted.example');
	});
});

describe('custom API URL storage', () => {
	it('setCustomApiUrl stores the url and getCustomApiUrl reads it back', async () => {
		const { setCustomApiUrl, getCustomApiUrl } = await loadPlatform({ PUBLIC_DESKTOP: '1' });
		setCustomApiUrl('https://my-api.example');
		expect(lsStore.get('custom_api_url')).toBe('https://my-api.example');
		expect(getCustomApiUrl()).toBe('https://my-api.example');
	});

	it('dropCustomApiUrl removes the url and falls back to the PWA url', async () => {
		lsStore.set('custom_api_url', 'https://x.example');
		const { dropCustomApiUrl, getCustomApiUrl } = await loadPlatform(
			{},
			{ browser: false, dev: true }
		);
		dropCustomApiUrl();
		expect(lsStore.has('custom_api_url')).toBe(false);
		expect(getCustomApiUrl()).toBe('http://localhost:8000');
	});
});
