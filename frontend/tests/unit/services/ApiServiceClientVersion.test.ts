import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import type ApiServiceClass from '$lib/services/ApiService';

// This file exercises the X-Client-Version header, which depends on
// PUBLIC_VERSION. It mocks the public env per test and re-imports the service
// (the main ApiService.test.ts runs with an empty env).

function jsonResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: vi.fn().mockResolvedValue(data),
		blob: vi.fn().mockResolvedValue(new Blob())
	};
}

const API_URL = 'https://api.solyto.app';
const lsStore = new Map<string, string>();

function healthResponse(version: unknown, ok = true) {
	return {
		ok,
		json: vi.fn().mockResolvedValue({ success: true, data: { app: 'solyto', version }, app: 'solyto', version })
	};
}

function storeServerVersion(version: string, apiUrl = API_URL): void {
	lsStore.set('server_version', JSON.stringify({ apiUrl, version }));
}

// By default the server is remembered as one that accepts the header, so the
// header tests below see it; pass null to start without a remembered server.
async function loadApiService(
	env: Record<string, string> = {},
	serverVersion: string | null = '1.1.0'
): Promise<typeof ApiServiceClass> {
	if (serverVersion) storeServerVersion(serverVersion);

	vi.resetModules();
	vi.doMock('$env/dynamic/public', () => ({ env }));
	vi.doMock('$app/environment', () => ({ browser: true, dev: false }));
	vi.doMock('$lib/services/LocalStorageService', () => ({
		default: class {
			get = (key: string) => lsStore.get(key) ?? null;
			set = (key: string, value: string) => lsStore.set(key, value);
			getJson = (key: string) => (lsStore.has(key) ? JSON.parse(lsStore.get(key) as string) : null);
			setJson = (key: string, value: unknown) => lsStore.set(key, JSON.stringify(value));
			destroy = (key: string) => lsStore.delete(key);
		}
	}));
	return (await import('$lib/services/ApiService')).default;
}

function headersOf(fetchMock: ReturnType<typeof vi.fn>, call = 0): Record<string, string> {
	return fetchMock.mock.calls[call][1].headers;
}

beforeEach(() => {
	lsStore.clear();
	vi.stubGlobal('window', { location: { hostname: 'my.solyto.app' } });
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.doUnmock('$env/dynamic/public');
	vi.doUnmock('$app/environment');
	vi.doUnmock('$lib/services/LocalStorageService');
});

describe('X-Client-Version with PUBLIC_VERSION set', () => {
	const env = { PUBLIC_VERSION: '1.2.3' };

	it('is sent on bodyless requests with and without a token', async () => {
		const ApiService = await loadApiService(env);
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').list('/todos');
		await new ApiService().list('/todos');

		expect(headersOf(fetchMock, 0)).toEqual({
			Authorization: 'Bearer tok',
			Accept: 'application/json',
			'X-Client-Version': '1.2.3'
		});
		expect(headersOf(fetchMock, 1)).toEqual({
			Accept: 'application/json',
			'X-Client-Version': '1.2.3'
		});
	});

	it('is sent on JSON body requests with and without a token', async () => {
		const ApiService = await loadApiService(env);
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').create('/todos', {});
		await new ApiService().create('/todos', {});

		expect(headersOf(fetchMock, 0)).toEqual({
			Authorization: 'Bearer tok',
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'X-Client-Version': '1.2.3'
		});
		expect(headersOf(fetchMock, 1)).toEqual({
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'X-Client-Version': '1.2.3'
		});
	});

	it('is sent on form uploads', async () => {
		const ApiService = await loadApiService(env);
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').postFormData('/upload', new FormData());

		expect(headersOf(fetchMock)).toEqual({
			Authorization: 'Bearer tok',
			'X-Client-Version': '1.2.3'
		});
	});

	it('is sent on downloads next to the given Accept type', async () => {
		const ApiService = await loadApiService(env);
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').download('/export/7/download', 'application/zip');

		expect(headersOf(fetchMock)).toEqual({
			Authorization: 'Bearer tok',
			Accept: 'application/zip',
			'X-Client-Version': '1.2.3'
		});
	});

	it('is sent again on the 401 recovery retry', async () => {
		const ApiService = await loadApiService(env);
		const service = new ApiService('old');
		service.setUnauthorizedHandler(async () => {
			service.updateAuthToken('new');
			return true;
		});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(null, false, 401))
			.mockResolvedValueOnce(jsonResponse({ data: [] }));
		vi.stubGlobal('fetch', fetchMock);

		await service.list('/todos');

		expect(headersOf(fetchMock, 1)).toEqual({
			Authorization: 'Bearer new',
			Accept: 'application/json',
			'X-Client-Version': '1.2.3'
		});
	});
});

describe('X-Client-Version without PUBLIC_VERSION', () => {
	it('is not sent when PUBLIC_VERSION is unset', async () => {
		const ApiService = await loadApiService({});
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').list('/todos');

		expect(headersOf(fetchMock)).not.toHaveProperty('X-Client-Version');
	});

	it('is not sent when PUBLIC_VERSION is empty', async () => {
		const ApiService = await loadApiService({ PUBLIC_VERSION: '' });
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService().create('/todos', {});

		expect(headersOf(fetchMock)).not.toHaveProperty('X-Client-Version');
	});
});

describe('X-Client-Version before the server is known to accept it', () => {
	const env = { PUBLIC_VERSION: '1.2.3' };

	it('is off when no server version is remembered', async () => {
		const ApiService = await loadApiService(env, null);
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService().create('/todos', {});

		expect(headersOf(fetchMock)).not.toHaveProperty('X-Client-Version');
	});

	it('is off when the remembered server is too old', async () => {
		const ApiService = await loadApiService(env, '1.0.15');
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').list('/todos');

		expect(headersOf(fetchMock)).not.toHaveProperty('X-Client-Version');
	});

	it('ignores a version remembered for a different server', async () => {
		storeServerVersion('1.1.0', 'https://other.example.org');
		const ApiService = await loadApiService(env, null);
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').list('/todos');

		expect(headersOf(fetchMock)).not.toHaveProperty('X-Client-Version');
	});
});

describe('checkServerVersion', () => {
	const env = { PUBLIC_VERSION: '1.2.3' };

	it('requests health without custom headers so old servers pass CORS', async () => {
		const ApiService = await loadApiService(env);
		const fetchMock = vi.fn().mockResolvedValue(healthResponse('1.1.0'));
		vi.stubGlobal('fetch', fetchMock);

		expect(await new ApiService('tok').checkServerVersion()).toBe('1.1.0');
		expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/api/v1/health`);
	});

	it('switches the header on for a server that accepts it and remembers it', async () => {
		const ApiService = await loadApiService(env, null);
		const service = new ApiService('tok');
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(healthResponse('1.1.0'))
			.mockResolvedValueOnce(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await service.checkServerVersion();
		await service.list('/todos');

		expect(headersOf(fetchMock, 1)).toHaveProperty('X-Client-Version', '1.2.3');
		expect(JSON.parse(lsStore.get('server_version') as string)).toEqual({ apiUrl: API_URL, version: '1.1.0' });
	});

	it('switches the header off for a server that rejects it', async () => {
		const ApiService = await loadApiService(env);
		const service = new ApiService('tok');
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(healthResponse('1.0.15'))
			.mockResolvedValueOnce(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		await service.checkServerVersion();
		await service.list('/todos');

		expect(headersOf(fetchMock, 1)).not.toHaveProperty('X-Client-Version');
	});

	it('keeps the remembered version when the server does not answer properly', async () => {
		const ApiService = await loadApiService(env);
		const service = new ApiService('tok');

		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
		expect(await service.checkServerVersion()).toBeNull();

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(healthResponse('1.0.15', false)));
		expect(await service.checkServerVersion()).toBeNull();

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(healthResponse(undefined)));
		expect(await service.checkServerVersion()).toBeNull();

		expect(JSON.parse(lsStore.get('server_version') as string)).toEqual({ apiUrl: API_URL, version: '1.1.0' });
	});

	it('does not check at all without PUBLIC_VERSION', async () => {
		const ApiService = await loadApiService({});
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		expect(await new ApiService().checkServerVersion()).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe('outdatedServerVersionToAnnounce', () => {
	it('announces an older server once per server and app version pair', async () => {
		const ApiService = await loadApiService({ PUBLIC_VERSION: '1.1.0' });
		const service = new ApiService();

		expect(service.outdatedServerVersionToAnnounce('1.0.15')).toBe('1.0.15');
		expect(service.outdatedServerVersionToAnnounce('1.0.15')).toBeNull();
	});

	it('announces again after the app version changes', async () => {
		lsStore.set('server_version_notice_seen', '1.0.15|1.1.0');
		const ApiService = await loadApiService({ PUBLIC_VERSION: '1.2.0' });

		expect(new ApiService().outdatedServerVersionToAnnounce('1.0.15')).toBe('1.0.15');
	});

	it('stays quiet when the server is the same or newer', async () => {
		const ApiService = await loadApiService({ PUBLIC_VERSION: '1.1.0' });
		const service = new ApiService();

		expect(service.outdatedServerVersionToAnnounce('1.1.0')).toBeNull();
		expect(service.outdatedServerVersionToAnnounce('1.2.0')).toBeNull();
	});

	it('stays quiet without PUBLIC_VERSION', async () => {
		const ApiService = await loadApiService();

		expect(new ApiService().outdatedServerVersionToAnnounce('1.0.15')).toBeNull();
	});
});
