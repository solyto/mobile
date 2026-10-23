import { describe, it, expect, beforeEach } from 'vitest';
import { Clipboard } from '$lib/state/Clipboard.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';

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
