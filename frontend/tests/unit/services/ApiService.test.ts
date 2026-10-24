import { describe, it, expect, vi, afterEach } from 'vitest';
import ApiService, { NetworkError } from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

function jsonResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: vi.fn().mockResolvedValue(data),
		blob: vi.fn().mockResolvedValue(new Blob())
	};
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('headers', () => {
	it('sends a Bearer token when configured', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		const service = new ApiService('secret-token');
		await service.list('/todos');

		expect(fetchMock).toHaveBeenCalledWith('/todos', {
			headers: { Authorization: 'Bearer secret-token', Accept: 'application/json' }
		});
	});

	it('omits the Authorization header without a token', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		const service = new ApiService();
		await service.list('/todos');

		expect(fetchMock).toHaveBeenCalledWith('/todos', {
			headers: { Accept: 'application/json' }
		});
	});

	it('updates the token via updateAuthToken', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);

		const service = new ApiService('old');
		service.updateAuthToken('new');
		await service.list('/todos');

		expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer new');
	});
});

describe('list', () => {
	it('returns the parsed payload on success', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: [1, 2] })));
		await expect(new ApiService().list('/todos')).resolves.toEqual({ data: [1, 2] });
	});

	it('returns null on a failed request', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, false, 500)));
		await expect(new ApiService().list('/todos')).resolves.toBeNull();
	});
});

describe('get', () => {
	it('replaces the %s placeholder for string ids', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);
		await new ApiService().get('/todos/%s', 'abc');
		expect(fetchMock.mock.calls[0][0]).toBe('/todos/abc');
	});

	it('replaces the %d placeholder for numeric ids', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);
		await new ApiService().get('/todos/%d', 42);
		expect(fetchMock.mock.calls[0][0]).toBe('/todos/42');
	});

	it('returns null on a failed request', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, false, 404)));
		await expect(new ApiService().get('/todos/%s', 'abc')).resolves.toBeNull();
	});
});

describe('create', () => {
	it('posts a JSON body with the content-type header', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { id: 1 } }));
		vi.stubGlobal('fetch', fetchMock);

		const body = { title: 'Buy milk' };
		await new ApiService('tok').create('/todos', body);

		expect(fetchMock).toHaveBeenCalledWith('/todos', {
			method: 'POST',
			headers: {
				Authorization: 'Bearer tok',
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(body)
		});
	});

	it('returns null on a failed request', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, false, 422)));
		await expect(new ApiService().create('/todos', {})).resolves.toBeNull();
	});
});

describe('createWithStatus', () => {
	it('reports ok and status', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, true, 201)));
		await expect(new ApiService().createWithStatus('/todos', {})).resolves.toEqual({
			ok: true,
			status: 201
		});
	});

	it('reports failures', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, false, 400)));
		await expect(new ApiService().createWithStatus('/todos', {})).resolves.toEqual({
			ok: false,
			status: 400
		});
	});
});

describe('postWithStatus', () => {
	it('returns the parsed payload and status on success', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(jsonResponse({ data: { id: 1 } }, true, 200))
		);
		await expect(new ApiService('tok').postWithStatus('/refresh', {})).resolves.toEqual({
			ok: true,
			status: 200,
			data: { data: { id: 1 } }
		});
	});

	it('keeps the status and omits the payload on failure', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, false, 503));
		vi.stubGlobal('fetch', fetchMock);
		await expect(new ApiService('tok').postWithStatus('/refresh', {})).resolves.toEqual({
			ok: false,
			status: 503,
			data: null
		});
		// Refresh is an auth endpoint, so recovery must not run for it.
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it('sends FormData as it is, without a JSON content type', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, false, 413));
		vi.stubGlobal('fetch', fetchMock);
		const formData = new FormData();
		await new ApiService('tok').postWithStatus('/upload', formData);
		expect(fetchMock.mock.calls[0][1].body).toBe(formData);
		expect(fetchMock.mock.calls[0][1].headers).toEqual({
			Authorization: 'Bearer tok',
			Accept: 'application/json'
		});
	});
});

describe('delete', () => {
	it('replaces the id and uses the DELETE method', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, true, 204));
		vi.stubGlobal('fetch', fetchMock);
		await expect(new ApiService('tok').delete('/todos/%s', 'abc')).resolves.toBe(true);
		expect(fetchMock.mock.calls[0][0]).toBe('/todos/abc');
		expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
	});

	it('returns false on failure', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, false, 500)));
		await expect(new ApiService().delete('/todos/%s', 'abc')).resolves.toBe(false);
	});
});

describe('update', () => {
	it('sends a PUT with the JSON body', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, true, 200));
		vi.stubGlobal('fetch', fetchMock);
		const body = { is_completed: true };
		await expect(new ApiService('tok').update('/todos/%s', 'abc', body)).resolves.toBe(true);
		expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
		expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify(body));
	});
});

describe('post / postRaw / put', () => {
	it('posts an object as JSON', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: 1 }));
		vi.stubGlobal('fetch', fetchMock);
		const body = { foo: 'bar' };
		await new ApiService('tok').post('/x', body);
		expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
		expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify(body));
	});

	it('serializes FormData as JSON (current ApiService behaviour)', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
		vi.stubGlobal('fetch', fetchMock);
		const formData = new FormData();
		await new ApiService('tok').post('/x', formData);
		expect(fetchMock.mock.calls[0][1].body).toBe('{}');
		expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBe('application/json');
	});

	it('postRaw returns the parsed payload', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ hello: 'world' })));
		await expect(new ApiService().postRaw('/x', {})).resolves.toEqual({ hello: 'world' });
	});

	it('putRaw sends a PUT with the JSON body', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true }));
		vi.stubGlobal('fetch', fetchMock);
		const body = { current_password: 'a' };
		await new ApiService('tok').putRaw('/x', body);
		expect(fetchMock).toHaveBeenCalledWith('/x', {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer tok',
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(body)
		});
	});

	it('putRaw returns the parsed payload on failure too', async () => {
		const errorBody = { success: false, errors: { current_password: ['wrong'] } };
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(errorBody, false, 422)));
		await expect(new ApiService('tok').putRaw('/x', {})).resolves.toEqual(errorBody);
	});

	it('put returns the ok flag', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, true, 200)));
		await expect(new ApiService().put('/x', {})).resolves.toBe(true);
	});
});

describe('file uploads', () => {
	it('postFormData sends the body without JSON headers', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, true, 200));
		vi.stubGlobal('fetch', fetchMock);
		const formData = new FormData();
		await new ApiService('tok').postFormData('/upload', formData);
		expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer tok' });
		expect(fetchMock.mock.calls[0][1].body).toBe(formData);
	});

	it('uploadFile replaces %s and posts the form', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { id: 9 } }));
		vi.stubGlobal('fetch', fetchMock);
		const formData = new FormData();
		const result = await new ApiService('tok').uploadFile('/todos/%s/image', 'abc', formData);
		expect(fetchMock.mock.calls[0][0]).toBe('/todos/abc/image');
		expect(fetchMock.mock.calls[0][1].method).toBe('POST');
		expect(result).toEqual({ data: { id: 9 } });
	});
});

describe('image', () => {
	it('sends a GET with the bearer headers to the given endpoint', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').image('/clipboard/7/image');

		expect(fetchMock).toHaveBeenCalledWith('/clipboard/7/image', {
			headers: { Authorization: 'Bearer tok', Accept: 'application/json' }
		});
	});

	it('returns the blob on success and null on failure', async () => {
		const okResponse = { ok: true, blob: vi.fn().mockResolvedValue(new Blob(['x'])) };
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse));
		await expect(new ApiService().image('/img')).resolves.toBeInstanceOf(Blob);

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
		await expect(new ApiService().image('/img')).resolves.toBeNull();
	});
});

describe('download', () => {
	it('sends a GET with the bearer token and the given Accept type', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null));
		vi.stubGlobal('fetch', fetchMock);

		await new ApiService('tok').download('/export/7/download', 'application/zip');

		expect(fetchMock).toHaveBeenCalledWith('/export/7/download', {
			headers: { Authorization: 'Bearer tok', Accept: 'application/zip' }
		});
	});

	it('returns the blob on success and null on failure', async () => {
		const okResponse = { ok: true, blob: vi.fn().mockResolvedValue(new Blob(['x'])) };
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse));
		await expect(new ApiService().download('/file', 'application/zip')).resolves.toBeInstanceOf(Blob);

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
		await expect(new ApiService().download('/file', 'application/zip')).resolves.toBeNull();
	});
});

describe('401 recovery', () => {
	it('recovers once and retries with the fresh token', async () => {
		const service = new ApiService('old');
		const handler = vi.fn(async () => {
			service.updateAuthToken('new');
			return true;
		});
		service.setUnauthorizedHandler(handler);

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(null, false, 401))
			.mockResolvedValueOnce(jsonResponse({ data: [] }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(service.list('/todos')).resolves.toEqual({ data: [] });
		expect(handler).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer new');
	});

	it('does not retry when recovery declines', async () => {
		const service = new ApiService('old');
		const handler = vi.fn(async () => false);
		service.setUnauthorizedHandler(handler);

		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, false, 401));
		vi.stubGlobal('fetch', fetchMock);

		await expect(service.list('/todos')).resolves.toBeNull();
		expect(handler).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('never runs recovery for auth endpoints', async () => {
		const service = new ApiService('old');
		const handler = vi.fn(async () => true);
		service.setUnauthorizedHandler(handler);

		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, false, 401));
		vi.stubGlobal('fetch', fetchMock);

		await service.post(apiRoutes.auth.login, {});
		expect(handler).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('does not run recovery on a network error', async () => {
		const service = new ApiService('old');
		const handler = vi.fn(async () => true);
		service.setUnauthorizedHandler(handler);

		const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
		vi.stubGlobal('fetch', fetchMock);

		await expect(service.list('/todos')).rejects.toThrow('offline');
		expect(handler).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('wraps a rejected fetch in a NetworkError that keeps the cause', async () => {
		const cause = new TypeError('Failed to fetch');
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));

		const error = await new ApiService('tok').list('/todos').catch((e) => e);

		expect(error).toBeInstanceOf(NetworkError);
		expect(error.cause).toBe(cause);
	});
});

describe('401 recovery retry headers', () => {
	function recoveringService(nextToken: string | null): ApiService {
		const service = new ApiService('old');
		service.setUnauthorizedHandler(async () => {
			service.updateAuthToken(nextToken);
			return true;
		});
		return service;
	}

	function unauthorizedThenOk() {
		return vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(null, false, 401))
			.mockResolvedValueOnce(jsonResponse({ data: {} }));
	}

	it('rebuilds the JSON body headers with the fresh token', async () => {
		const fetchMock = unauthorizedThenOk();
		vi.stubGlobal('fetch', fetchMock);

		const body = { title: 'Buy milk' };
		await recoveringService('new').create('/todos', body);

		expect(fetchMock.mock.calls[1]).toEqual([
			'/todos',
			{
				method: 'POST',
				headers: {
					Authorization: 'Bearer new',
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify(body)
			}
		]);
	});

	it('rebuilds the bodyless headers with the fresh token', async () => {
		const fetchMock = unauthorizedThenOk();
		vi.stubGlobal('fetch', fetchMock);

		await recoveringService('new').list('/todos');

		expect(fetchMock.mock.calls[1]).toEqual([
			'/todos',
			{ headers: { Authorization: 'Bearer new', Accept: 'application/json' } }
		]);
	});

	it('rebuilds the auth-only headers of a form upload with the fresh token', async () => {
		const fetchMock = unauthorizedThenOk();
		vi.stubGlobal('fetch', fetchMock);

		const formData = new FormData();
		await recoveringService('new').postFormData('/upload', formData);

		expect(fetchMock.mock.calls[1][1]).toEqual({
			method: 'POST',
			headers: { Authorization: 'Bearer new' },
			body: formData
		});
	});

	it('drops the Authorization header from JSON body headers when recovery leaves no token', async () => {
		const fetchMock = unauthorizedThenOk();
		vi.stubGlobal('fetch', fetchMock);

		await recoveringService(null).create('/todos', {});

		expect(fetchMock.mock.calls[1][1].headers).toEqual({
			'Content-Type': 'application/json',
			Accept: 'application/json'
		});
	});

	it('drops the Authorization header from bodyless headers when recovery leaves no token', async () => {
		const fetchMock = unauthorizedThenOk();
		vi.stubGlobal('fetch', fetchMock);

		await recoveringService(null).list('/todos');

		expect(fetchMock.mock.calls[1][1].headers).toEqual({ Accept: 'application/json' });
	});
});

describe('426 upgrade required', () => {
	function upgradeRequiredResponse(body: unknown) {
		const json = typeof body === 'string'
			? vi.fn().mockRejectedValue(new SyntaxError('not json'))
			: vi.fn().mockResolvedValue(body);
		const response = { ok: false, status: 426, json };
		return { ...response, clone: vi.fn(() => ({ ...response })) };
	}

	const envelope = { message: 'Please update the app.', meta: { min_client_version: '2.4.0' } };

	function serviceWithHandlers() {
		const service = new ApiService('tok');
		const upgradeHandler = vi.fn();
		const unauthorizedHandler = vi.fn(async () => true);
		service.setUpgradeRequiredHandler(upgradeHandler);
		service.setUnauthorizedHandler(unauthorizedHandler);
		return { service, upgradeHandler, unauthorizedHandler };
	}

	it('reports the minimum version from the error envelope', async () => {
		const fetchMock = vi.fn().mockResolvedValue(upgradeRequiredResponse(envelope));
		vi.stubGlobal('fetch', fetchMock);
		const { service, upgradeHandler } = serviceWithHandlers();

		await service.list('/todos');

		expect(upgradeHandler).toHaveBeenCalledTimes(1);
		expect(upgradeHandler).toHaveBeenCalledWith('2.4.0');
	});

	it('reports null when the body has no minimum version', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upgradeRequiredResponse({ message: 'x' })));
		const { service, upgradeHandler } = serviceWithHandlers();

		await service.list('/todos');

		expect(upgradeHandler).toHaveBeenCalledWith(null);
	});

	it('reports null when the body is not JSON', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upgradeRequiredResponse('<html>')));
		const { service, upgradeHandler } = serviceWithHandlers();

		await expect(service.list('/todos')).resolves.toBeNull();
		expect(upgradeHandler).toHaveBeenCalledWith(null);
	});

	it('never runs 401 recovery and never retries', async () => {
		const fetchMock = vi.fn().mockResolvedValue(upgradeRequiredResponse(envelope));
		vi.stubGlobal('fetch', fetchMock);
		const { service, unauthorizedHandler } = serviceWithHandlers();

		await service.update('/todos/%s', 'abc', {});

		expect(unauthorizedHandler).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('keeps the failure results of the callers', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upgradeRequiredResponse(envelope)));
		const { service } = serviceWithHandlers();

		await expect(service.list('/todos')).resolves.toBeNull();
		await expect(service.get('/todos/%s', 'abc')).resolves.toBeNull();
		await expect(service.update('/todos/%s', 'abc', {})).resolves.toBe(false);
		await expect(service.delete('/todos/%s', 'abc')).resolves.toBe(false);
	});

	it('leaves the body readable for postRaw', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upgradeRequiredResponse(envelope)));
		const { service } = serviceWithHandlers();

		await expect(service.postRaw('/x', {})).resolves.toEqual(envelope);
	});

	it('is a no-op without a handler', async () => {
		const response = upgradeRequiredResponse(envelope);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

		await expect(new ApiService('tok').list('/todos')).resolves.toBeNull();
		expect(response.clone).not.toHaveBeenCalled();
	});
});
