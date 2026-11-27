import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserManagement } from '$lib/state/UserManagement.svelte';
import { apiRoutes } from '$lib/config/apiRoutes';
import { api, resetStoreMocks } from '../setup/storeMocks';

beforeEach(() => {
	resetStoreMocks();
});

afterEach(() => {
	vi.useRealTimers();
});

function user(id: string, name: string, email: string) {
	return { id, name, email } as never;
}

function page(current_page: number, last_page: number, total: number, data: unknown[] = []) {
	const pagination = {
		current_page,
		last_page,
		per_page: UserManagement.PER_PAGE,
		total,
		from: null,
		to: null,
		has_more_pages: current_page < last_page
	};
	return { data, meta: { pagination } };
}

function requestedQuery(): URLSearchParams {
	const url = api.list.mock.calls.at(-1)?.[0] as string;
	return new URL(url).searchParams;
}

describe('UserManagement store', () => {
	describe('load', () => {
		it('requests the current page with page size and search', async () => {
			api.list.mockResolvedValue(page(2, 3, 60));
			const t = new UserManagement();
			t.page = 2;
			t.search = 'ali';
			await t.load();

			const query = requestedQuery();
			expect(query.get('page')).toBe('2');
			expect(query.get('per_page')).toBe(String(UserManagement.PER_PAGE));
			expect(query.get('search')).toBe('ali');
		});

		it('builds the list URL with page, page size and search, in that order', async () => {
			api.list.mockResolvedValue(page(2, 3, 60));
			const t = new UserManagement();
			t.page = 2;
			await t.load();
			t.search = 'ali b';
			await t.load();

			expect(api.list.mock.calls.map(([url]) => url)).toEqual([
				apiRoutes.admin.users.list + '?page=2&per_page=25',
				apiRoutes.admin.users.list + '?page=2&per_page=25&search=ali+b'
			]);
		});

		it('assigns users and pagination meta', async () => {
			api.list.mockResolvedValue(page(1, 40, 1000, [user('1', 'Alice', 'a@x.com')]));
			const t = new UserManagement();
			await t.load();

			expect(t.loaded).toBe(true);
			expect(t.users).toHaveLength(1);
			expect(t.lastPage).toBe(40);
			expect(t.total).toBe(1000);
		});

		it('keeps the previous state when the request fails', async () => {
			api.list.mockResolvedValue(null);
			const t = new UserManagement();
			t.users = [user('1', 'Alice', 'a@x.com')];
			await t.load();

			expect(t.loaded).toBe(false);
			expect(t.users).toHaveLength(1);
		});

		it('ignores a response that was overtaken by a newer request', async () => {
			let resolveFirst: (value: unknown) => void = () => {};
			api.list.mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)));
			api.list.mockResolvedValueOnce(page(2, 2, 30, [user('2', 'Bob', 'b@x.com')]));

			const t = new UserManagement();
			const first = t.load();
			await t.goToPage(2);
			resolveFirst(page(1, 2, 30, [user('1', 'Alice', 'a@x.com')]));
			await first;

			expect(t.page).toBe(2);
			expect(t.users.map((u) => u.id)).toEqual(['2']);
		});
	});

	describe('goToPage', () => {
		it('loads the given page', async () => {
			api.list.mockResolvedValue(page(3, 5, 120));
			const t = new UserManagement();
			await t.goToPage(3);

			expect(requestedQuery().get('page')).toBe('3');
			expect(t.page).toBe(3);
		});
	});

	describe('search', () => {
		it('loads the first page once typing pauses', async () => {
			vi.useFakeTimers();
			api.list.mockResolvedValue(page(1, 1, 1));
			const t = new UserManagement();
			t.page = 4;
			t.search = 'a';
			t.scheduleSearch();
			t.search = 'al';
			t.scheduleSearch();

			expect(api.list).not.toHaveBeenCalled();
			await vi.advanceTimersByTimeAsync(UserManagement.SEARCH_DELAY_MS);

			expect(api.list).toHaveBeenCalledTimes(1);
			expect(requestedQuery().get('page')).toBe('1');
			expect(requestedQuery().get('search')).toBe('al');
		});

		it('clears the search immediately and cancels a pending one', async () => {
			vi.useFakeTimers();
			api.list.mockResolvedValue(page(1, 40, 1000));
			const t = new UserManagement();
			t.search = 'al';
			t.scheduleSearch();
			await t.clearSearch();
			await vi.advanceTimersByTimeAsync(UserManagement.SEARCH_DELAY_MS);

			expect(api.list).toHaveBeenCalledTimes(1);
			expect(requestedQuery().has('search')).toBe(false);
		});

		it('destroy cancels a pending search', async () => {
			vi.useFakeTimers();
			const t = new UserManagement();
			t.scheduleSearch();
			t.destroy();
			await vi.advanceTimersByTimeAsync(UserManagement.SEARCH_DELAY_MS);

			expect(api.list).not.toHaveBeenCalled();
		});
	});

	describe('growth', () => {
		it('loads the growth series for the selected grouping', async () => {
			api.list.mockResolvedValue({ data: [{ period: '2026-W03', total: 12 }] });
			const t = new UserManagement();
			await t.loadGrowth('week');

			expect(api.list).toHaveBeenCalledWith(apiRoutes.admin.users.growth + '?group_by=week');
			expect(t.growth).toEqual([{ period: '2026-W03', total: 12 }]);
		});

		it('loads the current grouping by default', async () => {
			api.list.mockResolvedValue({ data: [] });
			const t = new UserManagement();
			await t.loadGrowth();

			expect(api.list).toHaveBeenCalledWith(apiRoutes.admin.users.growth + '?group_by=month');
		});

		it('switches the grouping only together with its data', async () => {
			let answer: (value: unknown) => void = () => {};
			api.list.mockImplementation(() => new Promise((resolve) => (answer = resolve)));
			const t = new UserManagement();

			const loading = t.loadGrowth('day');
			expect(t.growthGroupBy).toBe('month');

			answer({ data: [{ period: '2026-11-20', total: 12 }] });
			await loading;
			expect(t.growthGroupBy).toBe('day');
			expect(t.growth).toEqual([{ period: '2026-11-20', total: 12 }]);
		});

		it('ignores a grouping whose data arrives after a newer one was chosen', async () => {
			const answers: ((value: unknown) => void)[] = [];
			api.list.mockImplementation(() => new Promise((resolve) => answers.push(resolve)));
			const t = new UserManagement();

			const week = t.loadGrowth('week');
			const day = t.loadGrowth('day');
			answers[1]({ data: [{ period: '2026-11-20', total: 12 }] });
			answers[0]({ data: [{ period: '2026-W47', total: 12 }] });
			await Promise.all([week, day]);

			expect(t.growthGroupBy).toBe('day');
			expect(t.growth).toEqual([{ period: '2026-11-20', total: 12 }]);
		});
	});

	describe('updateRole', () => {
		it('updates the role and reloads', async () => {
			api.update.mockResolvedValue(true);
			api.list.mockResolvedValue(page(1, 1, 0));

			const t = new UserManagement();
			await t.updateRole(user('1', 'Alice', 'a@x.com'), 'admin');

			expect(api.update).toHaveBeenCalledWith(expect.stringContaining('users'), '1', {
				role: 'admin'
			});
			expect(api.list).toHaveBeenCalled();
		});

		it('returns false when the update fails', async () => {
			api.update.mockResolvedValue(false);
			const t = new UserManagement();
			await expect(t.updateRole(user('1', 'Alice', 'a@x.com'), 'admin')).resolves.toBe(false);
		});
	});
});
