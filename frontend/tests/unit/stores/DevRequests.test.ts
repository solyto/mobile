import { describe, it, expect, beforeEach } from 'vitest';
import { DevRequests } from '$lib/state/DevRequests.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';
import { devRequest } from '../helpers/factories';

beforeEach(() => {
	resetStoreMocks();
});

describe('DevRequests store', () => {
	describe('createComment', () => {
		it('reloads the entries so the comment count is current', async () => {
			const store = new DevRequests();
			store.entries = [devRequest({ comment_count: 1 })];
			api.post.mockResolvedValue({ data: {} });
			api.list.mockResolvedValue({ data: [devRequest({ comment_count: 2, created_by_user_id: null })] });

			expect(await store.createComment(store.entries[0], 'Same here')).toBe(true);
			expect(store.entries[0].comment_count).toBe(2);
		});

		it('keeps the entries when the comment fails', async () => {
			const store = new DevRequests();
			store.entries = [devRequest({ comment_count: 1 })];
			api.post.mockResolvedValue(null);

			expect(await store.createComment(store.entries[0], 'Same here')).toBe(false);
			expect(api.list).not.toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('reloads the entries and reports success', async () => {
			const store = new DevRequests();
			store.entries = [devRequest()];
			api.update.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [devRequest({ fixed_in_version: '1.2.0' })] });

			expect(await store.update(store.entries[0], { fixed_in_version: '1.2.0' })).toBe(true);
			expect(store.entries[0].fixed_in_version).toBe('1.2.0');
		});

		it('reports failure and keeps the entries when the save fails', async () => {
			const store = new DevRequests();
			store.entries = [devRequest()];
			api.update.mockResolvedValue(false);

			expect(await store.update(store.entries[0], { fixed_in_version: '1.2.0' })).toBe(false);
			expect(api.list).not.toHaveBeenCalled();
		});
	});
});
