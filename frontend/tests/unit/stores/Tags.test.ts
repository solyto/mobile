import { describe, it, expect, beforeEach } from 'vitest';
import { Tags } from '$lib/state/Tags.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';

beforeEach(() => {
	resetStoreMocks();
});

function tag(id: number, name: string) {
	return { id, name, color: '#000000', created_at: '', updated_at: '' };
}

describe('Tags store', () => {
	it('loads and sorts tags case-insensitively', async () => {
		api.list.mockResolvedValue({ data: [tag(3, 'zeta'), tag(1, 'Alpha'), tag(2, 'beta')] });

		const t = new Tags();
		await t.load();

		expect(t.loaded).toBe(true);
		expect(t.tags.map((x) => x.name)).toEqual(['Alpha', 'beta', 'zeta']);
	});

	it('sorts without mutating the stored order', () => {
		const t = new Tags();
		t.tags = [tag(1, 'z'), tag(2, 'a')];
		t.sort();
		expect(t.tags.map((x) => x.name)).toEqual(['a', 'z']);
	});

	it('creates a tag and reloads', async () => {
		api.create.mockResolvedValue({ data: tag(9, 'new') });
		api.list.mockResolvedValue({ data: [tag(9, 'new')] });

		const t = new Tags();
		const created = await t.create('new');

		expect(created?.id).toBe(9);
		expect(api.create).toHaveBeenCalled();
		expect(t.tags).toHaveLength(1);
	});

	it('returns null when creation fails', async () => {
		api.create.mockResolvedValue(null);
		const t = new Tags();
		await expect(t.create('new')).resolves.toBeNull();
	});

	it('changes a tag color and reloads', async () => {
		api.update.mockResolvedValue(true);
		api.list.mockResolvedValue({ data: [] });

		const t = new Tags();
		await t.changeColor(tag(1, 'x'), '#ff0000');

		expect(api.update).toHaveBeenCalledWith(expect.stringContaining('tags'), 1, {
			color: '#ff0000'
		});
	});

	it('deletes a tag', async () => {
		api.delete.mockResolvedValue(true);
		api.list.mockResolvedValue({ data: [] });

		const t = new Tags();
		await expect(t.delete(5)).resolves.toBe(true);
		expect(api.delete).toHaveBeenCalled();
	});
});
