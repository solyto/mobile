import { describe, it, expect, vi, afterEach } from 'vitest';
import ApiService from '$lib/services/ApiService';

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
	it('returns the blob on success and null on failure', async () => {
		const okResponse = { ok: true, blob: vi.fn().mockResolvedValue(new Blob(['x'])) };
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse));
		await expect(new ApiService().image('/img')).resolves.toBeInstanceOf(Blob);

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
		await expect(new ApiService().image('/img')).resolves.toBeNull();
	});
});
