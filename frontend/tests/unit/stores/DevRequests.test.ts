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
});
