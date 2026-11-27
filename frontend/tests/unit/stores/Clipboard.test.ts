import { describe, it, expect, beforeEach } from 'vitest';
import { Clipboard } from '$lib/state/Clipboard.svelte';
import { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { api, resetStoreMocks } from '../setup/storeMocks';
import { clipboardEntry } from '../helpers/factories';

beforeEach(() => {
	resetStoreMocks();
});

function image(): File {
	return new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
}

describe('Clipboard createImage', () => {
	it('uploads the image as form data and reloads', async () => {
		api.postWithStatus.mockResolvedValue({ ok: true, status: 201, data: {} });
		api.list.mockResolvedValue({ data: [] });

		const result = await new Clipboard().createImage(image());

		expect(result).toBe('ok');
		expect(api.postWithStatus.mock.calls[0][1].get('image')).toBeInstanceOf(File);
		expect(api.list).toHaveBeenCalled();
	});

	it('reports a 413 as too large', async () => {
		api.postWithStatus.mockResolvedValue({ ok: false, status: 413, data: null });
		expect(await new Clipboard().createImage(image())).toBe('too_large');
	});

	it('reports a network error as too large', async () => {
		api.postWithStatus.mockRejectedValue(new TypeError('Failed to fetch'));
		expect(await new Clipboard().createImage(image())).toBe('too_large');
	});

	it('reports other failures as an error', async () => {
		api.postWithStatus.mockResolvedValue({ ok: false, status: 500, data: null });
		expect(await new Clipboard().createImage(image())).toBe('error');
		expect(api.list).not.toHaveBeenCalled();
	});
});

function document(name = 'report.pdf', size = 3): File {
	const file = new File(['abc'], name, { type: 'application/pdf' });
	Object.defineProperty(file, 'size', { value: size });
	return file;
}

describe('Clipboard load', () => {
	it('asks for file entries', async () => {
		api.list.mockResolvedValue({ data: [] });
		await new Clipboard().load();
		expect(api.list.mock.calls[0][0]).toContain('include_files=1');
	});
});

describe('Clipboard createFile', () => {
	it('uploads the file as form data and reloads', async () => {
		api.postWithStatus.mockResolvedValue({ ok: true, status: 201, data: {} });
		api.list.mockResolvedValue({ data: [] });

		const result = await new Clipboard().createFile(document());

		expect(result).toBe('ok');
		expect(api.postWithStatus.mock.calls[0][0]).toBe(apiRoutes.clipboard.createFile);
		expect(api.postWithStatus.mock.calls[0][1].get('file')).toBeInstanceOf(File);
		expect(api.list).toHaveBeenCalled();
	});

	it('rejects an oversized file without uploading', async () => {
		const result = await new Clipboard().createFile(document('big.pdf', Clipboard.MAX_FILE_BYTES + 1));
		expect(result).toBe('too_large');
		expect(api.postWithStatus).not.toHaveBeenCalled();
	});

	it('rejects an unsupported extension without uploading', async () => {
		expect(await new Clipboard().createFile(document('script.html'))).toBe('invalid_type');
		expect(api.postWithStatus).not.toHaveBeenCalled();
	});

	it('maps 413 to too large and 422 to invalid type', async () => {
		api.postWithStatus.mockResolvedValueOnce({ ok: false, status: 413, data: null });
		expect(await new Clipboard().createFile(document())).toBe('too_large');
		api.postWithStatus.mockResolvedValueOnce({ ok: false, status: 422, data: null });
		expect(await new Clipboard().createFile(document())).toBe('invalid_type');
	});

	it('lets a network error propagate', async () => {
		api.postWithStatus.mockRejectedValue(new NetworkError(new TypeError('Failed to fetch')));
		await expect(new Clipboard().createFile(document())).rejects.toBeInstanceOf(NetworkError);
	});

	it('lets the daily limit propagate', async () => {
		api.postWithStatus.mockRejectedValue(new RateLimitedError(3600, 'too_many_requests'));
		await expect(new Clipboard().createFile(document())).rejects.toBeInstanceOf(RateLimitedError);
	});

	it('reports other failures as an error', async () => {
		api.postWithStatus.mockResolvedValue({ ok: false, status: 500, data: null });
		expect(await new Clipboard().createFile(document())).toBe('error');
		expect(api.list).not.toHaveBeenCalled();
	});
});

describe('Clipboard getFile', () => {
	it('downloads through the authenticated endpoint', async () => {
		api.download.mockResolvedValue(new Blob(['x']));
		const entry = clipboardEntry({ id: 7, type: 'file', mime_type: 'application/pdf' });

		await new Clipboard().getFile(entry);

		expect(api.download).toHaveBeenCalledWith(apiRoutes.clipboard.getFile.replace('%d', '7'), 'application/pdf');
	});
});
