import type { CreateResponse, GetResponse, ListResponse, PostResponse } from '$lib/types/api';
import { apiRoutes } from '$lib/config/apiRoutes';
import { CLIENT_VERSION, getApiUrl } from '$lib/config/platform';
import { acceptsClientVersionHeader, isOlderVersion } from '$lib/helpers/VersionHelper';
import LocalStorageService from '$lib/services/LocalStorageService';

// Endpoints where a 401 is a legitimate, expected auth failure (bad credentials,
// expired refresh token, failed passkey authentication) rather than a stale
// session. Recovery must never run for these, otherwise a failed login would
// trigger a refresh/logout loop.
const AUTH_ENDPOINTS: string[] = [
	apiRoutes.auth.login,
	apiRoutes.auth.refresh,
	apiRoutes.auth.register,
	apiRoutes.auth.verify,
	apiRoutes.auth.forgotPassword,
	apiRoutes.auth.resetPassword,
	apiRoutes.auth.confirmAccountDeletion,
	apiRoutes.auth.passkeys.authenticateOptions,
	apiRoutes.auth.passkeys.authenticate
];

// A request that never got a response (offline, dropped connection, CORS
// failure). Thrown instead of fetch's own TypeError so the root layout can tell
// it apart from programming errors and stop the loading indicator.
export class NetworkError extends Error {
	constructor(cause: unknown) {
		super(cause instanceof Error ? cause.message : 'Network request failed', { cause });
		this.name = 'NetworkError';
	}
}

interface StoredServerVersion {
	apiUrl: string;
	version: string;
}

export default class ApiService {
	static readonly LS_SERVER_VERSION_KEY: string = 'server_version';
	static readonly LS_SERVER_VERSION_NOTICE_SEEN_KEY: string = 'server_version_notice_seen';

	authToken: string | null = null;
	private unauthorizedHandler: (() => Promise<boolean>) | null = null;
	private upgradeRequiredHandler: ((minVersion: string | null) => void) | null = null;
	private localStorage = new LocalStorageService();
	// Off until the server is known to accept X-Client-Version: servers up to
	// 1.0.15 reject it in their CORS preflight, which would fail every request.
	private clientVersionHeaderEnabled: boolean;

	constructor(authToken: string | null = null) {
		this.authToken = authToken;
		this.clientVersionHeaderEnabled = acceptsClientVersionHeader(this.storedServerVersion());
	}

	updateAuthToken(authToken: string | null): void {
		this.authToken = authToken;
	}

	setUnauthorizedHandler(handler: () => Promise<boolean>): void {
		this.unauthorizedHandler = handler;
	}

	setUpgradeRequiredHandler(handler: (minVersion: string | null) => void): void {
		this.upgradeRequiredHandler = handler;
	}

	// Asks /health without custom headers, so servers that reject X-Client-Version
	// still answer, and switches the header on or off for the reported version.
	async checkServerVersion(): Promise<string | null> {
		if (!CLIENT_VERSION) return null;

		const version = await this.fetchServerVersion();
		if (!version) return null;

		const stored: StoredServerVersion = { apiUrl: getApiUrl(), version };
		this.localStorage.setJson(ApiService.LS_SERVER_VERSION_KEY, stored);
		this.clientVersionHeaderEnabled = acceptsClientVersionHeader(version);
		return version;
	}

	// Returns the server version when it is older than this app and the notice
	// for this server/app pair has not been shown yet; marks the pair as seen.
	outdatedServerVersionToAnnounce(serverVersion: string): string | null {
		if (!CLIENT_VERSION || !isOlderVersion(serverVersion, CLIENT_VERSION)) return null;

		const pair = `${serverVersion}|${CLIENT_VERSION}`;
		if (this.localStorage.get(ApiService.LS_SERVER_VERSION_NOTICE_SEEN_KEY) === pair) return null;

		this.localStorage.set(ApiService.LS_SERVER_VERSION_NOTICE_SEEN_KEY, pair);
		return serverVersion;
	}

	private async fetchServerVersion(): Promise<string | null> {
		try {
			const res = await fetch(apiRoutes.health);
			if (!res.ok) return null;
			const data = await res.json();
			const health = data?.data ?? data;
			return typeof health?.version === 'string' ? health.version : null;
		} catch {
			return null;
		}
	}

	private storedServerVersion(): string | null {
		const stored = this.localStorage.getJson(ApiService.LS_SERVER_VERSION_KEY) as Partial<StoredServerVersion> | null;
		if (!stored || stored.apiUrl !== getApiUrl() || typeof stored.version !== 'string') return null;

		return stored.version;
	}

	private isAuthEndpoint(endpoint: string): boolean {
		return AUTH_ENDPOINTS.some((authEndpoint) => endpoint.startsWith(authEndpoint));
	}

	// Network errors (a rejected fetch) propagate as NetworkError: they are
	// transient and must never trigger recovery or logout.
	private async fetchWithRecovery(
		endpoint: string,
		init: Omit<RequestInit, 'headers'>,
		buildHeaders: () => HeadersInit
	): Promise<Response> {
		const res = await this.send(endpoint, init, buildHeaders);

		if (res.status === 426) {
			await this.reportUpgradeRequired(res);
			return res;
		}

		if (res.status !== 401 || !this.unauthorizedHandler || this.isAuthEndpoint(endpoint)) {
			return res;
		}

		const recovered = await this.unauthorizedHandler();
		if (!recovered) return res;

		return this.send(endpoint, init, buildHeaders);
	}

	private async send(
		endpoint: string,
		init: Omit<RequestInit, 'headers'>,
		buildHeaders: () => HeadersInit
	): Promise<Response> {
		try {
			return await fetch(endpoint, { ...init, headers: buildHeaders() });
		} catch (error) {
			throw new NetworkError(error);
		}
	}

	private async reportUpgradeRequired(res: Response): Promise<void> {
		if (!this.upgradeRequiredHandler) return;
		this.upgradeRequiredHandler(await this.readMinClientVersion(res));
	}

	// Read from a clone so callers that parse the body themselves (postRaw) still
	// can; a body that is not the API's error envelope must not break the request.
	private async readMinClientVersion(res: Response): Promise<string | null> {
		try {
			const body = await res.clone().json();
			const minVersion = body?.meta?.min_client_version;
			return typeof minVersion === 'string' ? minVersion : null;
		} catch {
			return null;
		}
	}

	async list(endpoint: string): Promise<ListResponse | null> {
		const res = await this.fetchWithRecovery(endpoint, {}, () => this.getApiHeader());
		return res.ok ? await res.json() : null;
	}

	async get(endpoint: string, id: string | number | null): Promise<GetResponse | null> {
		if (typeof id === 'string') {
			endpoint = endpoint.replace('%s', id);
		} else if (typeof id === 'number') {
			endpoint = endpoint.replace('%d', id.toString());
		}

		const res = await this.fetchWithRecovery(endpoint, {}, () => this.getApiHeader());
		return res.ok ? await res.json() : null;
	}

	async create(endpoint: string, body: object): Promise<CreateResponse | null> {
		const res = await this.fetchWithRecovery(
			endpoint,
			{ method: 'POST', body: JSON.stringify(body) },
			() => this.getApiHeaderWithBody()
		);

		return res.ok ? await res.json() : null;
	}

	async createWithStatus(endpoint: string, body: object): Promise<{ ok: boolean; status: number }> {
		const res = await this.fetchWithRecovery(
			endpoint,
			{ method: 'POST', body: JSON.stringify(body) },
			() => this.getApiHeaderWithBody()
		);

		return { ok: res.ok, status: res.status };
	}

	async delete(endpoint: string, id: string | number): Promise<boolean> {
		const res = await this.fetchWithRecovery(
			typeof id === 'string'
				? endpoint.replace('%s', id)
				: endpoint.replace('%d', id.toString()),
			{ method: 'DELETE' },
			() => this.getApiHeader()
		);

		return Promise.resolve(res.ok);
	}

	async update(endpoint: string, id: string | number, body: object): Promise<boolean> {
		const res = await this.fetchWithRecovery(
			typeof id === 'string'
				? endpoint.replace('%s', id)
				: endpoint.replace('%d', id.toString()),
			{ method: 'PUT', body: JSON.stringify(body) },
			() => this.getApiHeaderWithBody()
		);

		return Promise.resolve(res.ok);
	}

	async post(endpoint: string, body: FormData | object): Promise<PostResponse | null> {
		const res = await this.fetchWithRecovery(
			endpoint,
			{ method: 'POST', body: typeof body === 'object' ? JSON.stringify(body) : body },
			() => (typeof body === 'object' ? this.getApiHeaderWithBody() : this.getApiHeader())
		);

		return res.ok ? await res.json() : null;
	}

	async postWithStatus(
		endpoint: string,
		body: FormData | object
	): Promise<
		{ ok: true; status: number; data: PostResponse } | { ok: false; status: number; data: null }
	> {
		const isFormData = body instanceof FormData;
		const res = await this.fetchWithRecovery(
			endpoint,
			{ method: 'POST', body: isFormData ? body : JSON.stringify(body) },
			() => (isFormData ? this.getApiHeader() : this.getApiHeaderWithBody())
		);

		return res.ok
			? { ok: true, status: res.status, data: await res.json() }
			: { ok: false, status: res.status, data: null };
	}

	async getRaw<T = object>(endpoint: string): Promise<T | null> {
		const res = await this.fetchWithRecovery(endpoint, {}, () => this.getApiHeader());
		return res.ok ? await res.json() : null;
	}

	async postRaw<T = object>(endpoint: string, body: FormData | object): Promise<T> {
		const res = await this.fetchWithRecovery(
			endpoint,
			{ method: 'POST', body: typeof body === 'object' ? JSON.stringify(body) : body },
			() => (typeof body === 'object' ? this.getApiHeaderWithBody() : this.getApiHeader())
		);

		return await res.json() as Promise<T>;
	}

	async putRaw<T = object>(endpoint: string, body: object): Promise<T> {
		const res = await this.fetchWithRecovery(
			endpoint,
			{ method: 'PUT', body: JSON.stringify(body) },
			() => this.getApiHeaderWithBody()
		);

		return await res.json() as Promise<T>;
	}

	async put(endpoint: string, body: FormData | object): Promise<boolean> {
		const res = await this.fetchWithRecovery(
			endpoint,
			{ method: 'PUT', body: typeof body === 'object' ? JSON.stringify(body) : body },
			() => (typeof body === 'object' ? this.getApiHeaderWithBody() : this.getApiHeader())
		);

		return res.ok;
	}

	async postFormData(endpoint: string, body: FormData): Promise<boolean> {
		const res = await this.fetchWithRecovery(
			endpoint,
			{ method: 'POST', body },
			() => this.getAuthHeaderOnly()
		);

		return res.ok ? await res.json() : false;
	}

	async uploadFile(endpoint: string, id: string, body: FormData): Promise<CreateResponse | null> {
		const res = await this.fetchWithRecovery(
			endpoint.replace('%s', id),
			{ method: 'POST', body },
			() => this.getAuthHeaderOnly()
		);
		return res.ok ? await res.json() : null;
	}

	async image(endpoint: string): Promise<Blob | null> {
		const res = await this.fetchWithRecovery(endpoint, {}, () => this.getApiHeader());
		return res.ok ? await res.blob() : null;
	}

	async download(endpoint: string, accept: string): Promise<Blob | null> {
		const res = await this.fetchWithRecovery(endpoint, {}, () => ({
			Authorization: 'Bearer ' + this.authToken,
			Accept: accept,
			...this.getClientVersionHeader()
		}));
		return res.ok ? await res.blob() : null;
	}

	private getAuthHeaderOnly(): HeadersInit {
		return { Authorization: 'Bearer ' + this.authToken, ...this.getClientVersionHeader() };
	}

	private getApiHeader(): HeadersInit {
		if (!this.authToken) {
			return { Accept: 'application/json', ...this.getClientVersionHeader() };
		}

		return {
			Authorization: 'Bearer ' + this.authToken,
			Accept: 'application/json',
			...this.getClientVersionHeader()
		};
	}

	private getApiHeaderWithBody(): HeadersInit {
		if (!this.authToken) {
			return {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				...this.getClientVersionHeader()
			};
		}

		return {
			Authorization: 'Bearer ' + this.authToken,
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...this.getClientVersionHeader()
		};
	}

	// The API records the version on the auth token. A missing value is ignored
	// there, so the header is left out when PUBLIC_VERSION is unset or the
	// server is not known to accept it.
	private getClientVersionHeader(): Record<string, string> {
		return CLIENT_VERSION && this.clientVersionHeaderEnabled ? { 'X-Client-Version': CLIENT_VERSION } : {};
	}
}
