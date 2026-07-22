import type { CreateResponse, GetResponse, ListResponse, PostResponse } from '$lib/types/api';

export default class ApiService {
	authToken: string | null = null;

	constructor(authToken: string | null = null) {
		this.authToken = authToken;
	}

	updateAuthToken(authToken: string): void {
		this.authToken = authToken;
	}

	async list(endpoint: string): Promise<ListResponse | null> {
		const res = await fetch(endpoint, { headers: this.getApiHeader() });
		return res.ok ? await res.json() : null;
	}

	async get(endpoint: string, id: string | number | null): Promise<GetResponse | null> {
		if (typeof id === 'string') {
			endpoint = endpoint.replace('%s', id);
		} else if (typeof id === 'number') {
			endpoint = endpoint.replace('%d', id.toString());
		}

		const res = await fetch(endpoint, { headers: this.getApiHeader() });
		return res.ok ? await res.json() : null;
	}

	async create(endpoint: string, body: object): Promise<CreateResponse | null> {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: this.getApiHeaderWithBody(),
			body: JSON.stringify(body)
		});

		return res.ok ? await res.json() : null;
	}

	async createWithStatus(endpoint: string, body: object): Promise<{ ok: boolean; status: number }> {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: this.getApiHeaderWithBody(),
			body: JSON.stringify(body)
		});

		return { ok: res.ok, status: res.status };
	}

	async delete(endpoint: string, id: string | number): Promise<boolean> {
		const res = await fetch(
			typeof id === 'string'
				? endpoint.replace('%s', id)
				: endpoint.replace('%d', id.toString()),
			{ method: 'DELETE', headers: this.getApiHeader() }
		);

		return Promise.resolve(res.ok);
	}

	async update(endpoint: string, id: string | number, body: object): Promise<boolean> {
		const res = await fetch(
			typeof id === 'string'
				? endpoint.replace('%s', id)
				: endpoint.replace('%d', id.toString()),
			{ method: 'PUT', headers: this.getApiHeaderWithBody(), body: JSON.stringify(body) }
		);

		return Promise.resolve(res.ok);
	}

	async post(endpoint: string, body: FormData | object): Promise<PostResponse | null> {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: typeof body === 'object' ? this.getApiHeaderWithBody() : this.getApiHeader(),
			body: typeof body === 'object' ? JSON.stringify(body) : body
		});

		return res.ok ? await res.json() : null;
	}

	async postRaw<T = object>(endpoint: string, body: FormData | object): Promise<T> {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: typeof body === 'object' ? this.getApiHeaderWithBody() : this.getApiHeader(),
			body: typeof body === 'object' ? JSON.stringify(body) : body
		});

		return await res.json() as Promise<T>;
	}

	async put(endpoint: string, body: FormData | object): Promise<boolean> {
		const res = await fetch(endpoint, {
			method: 'PUT',
			headers: typeof body === 'object' ? this.getApiHeaderWithBody() : this.getApiHeader(),
			body: typeof body === 'object' ? JSON.stringify(body) : body
		});

		return res.ok;
	}

	async postFormData(endpoint: string, body: FormData): Promise<boolean> {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: this.getAuthHeaderOnly(),
			body: body
		});

		return res.ok ? await res.json() : false;
	}

	async uploadFile(endpoint: string, id: string, body: FormData): Promise<CreateResponse | null> {
		const res = await fetch(endpoint.replace('%s', id), {
			method: 'POST',
			headers: this.getAuthHeaderOnly(),
			body
		});
		return res.ok ? await res.json() : null;
	}

	async image(endpoint: string): Promise<Blob | null> {
		const res = await fetch(endpoint, { headers: this.getApiHeader() });
		return res.ok ? await res.blob() : null;
	}

	private getAuthHeaderOnly(): HeadersInit {
		return { Authorization: 'Bearer ' + this.authToken };
	}

	private getApiHeader(): HeadersInit {
		if (!this.authToken) {
			return { Accept: 'application/json' };
		}

		return { Authorization: 'Bearer ' + this.authToken, Accept: 'application/json' };
	}

	private getApiHeaderWithBody(): HeadersInit {
		if (!this.authToken) {
			return { 'Content-Type': 'application/json', Accept: 'application/json' };
		}

		return {
			Authorization: 'Bearer ' + this.authToken,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};
	}
}
