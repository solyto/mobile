import { describe, it, expect, beforeEach } from 'vitest';
import { UserManagement } from '$lib/state/UserManagement.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';

beforeEach(() => {
	resetStoreMocks();
});

function user(id: number, name: string, email: string) {
	return { id, name, email } as never;
}

describe('UserManagement store', () => {
	describe('filterUsers', () => {
		it('returns all users when the search is empty', () => {
			const t = new UserManagement();
			t.users = [user(1, 'Alice', 'a@x.com'), user(2, 'Bob', 'b@x.com')];
			t.search = '';
			expect(t.filterUsers()).toHaveLength(2);
		});

		it('matches by name case-insensitively', () => {
			const t = new UserManagement();
			t.users = [user(1, 'Alice', 'a@x.com'), user(2, 'Bob', 'b@x.com')];
			t.search = 'alice';
			expect(t.filterUsers().map((u) => u.id)).toEqual([1]);
		});

		it('matches by email', () => {
			const t = new UserManagement();
			t.users = [user(1, 'Alice', 'a@x.com'), user(2, 'Bob', 'b@x.com')];
			t.search = 'b@x.com';
			expect(t.filterUsers().map((u) => u.id)).toEqual([2]);
		});
	});

	describe('load', () => {
		it('loads users via the admin endpoint', async () => {
			api.get.mockResolvedValue({ data: [user(1, 'Alice', 'a@x.com')] });
			const t = new UserManagement();
			await t.load();
			expect(t.loaded).toBe(true);
			expect(t.users).toHaveLength(1);
		});
	});

	describe('updateRole', () => {
		it('updates the role and reloads', async () => {
			api.update.mockResolvedValue(true);
			api.get.mockResolvedValue({ data: [] });

			const t = new UserManagement();
			await t.updateRole(user(1, 'Alice', 'a@x.com'), 'admin');

			expect(api.update).toHaveBeenCalledWith(expect.stringContaining('users'), 1, {
				role: 'admin'
			});
		});

		it('returns false when the update fails', async () => {
			api.update.mockResolvedValue(false);
			const t = new UserManagement();
			await expect(t.updateRole(user(1, 'Alice', 'a@x.com'), 'admin')).resolves.toBe(false);
		});
	});
});
