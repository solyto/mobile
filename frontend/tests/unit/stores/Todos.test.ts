import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Todos } from '$lib/state/Todos.svelte';
import { api, storage, pageState, resetStoreMocks } from '../setup/storeMocks';
import { todo, category } from '../helpers/factories';

beforeEach(() => {
	resetStoreMocks();
	pageState.pathname = '/todos';
});

afterEach(() => {
	vi.useRealTimers();
});

describe('Todos store', () => {
	it('constructs with the mocked defaults', () => {
		const t = new Todos();
		expect(t.auth.getToken()).toBe('test-token');
		expect(t.apiService).toBeDefined();
	});

	it('loads todos, categories and workspaces', async () => {
		api.list.mockImplementation(async (endpoint: string) => {
			if (endpoint.includes('categories')) return { data: [category(1, 'Work')] };
			if (endpoint.includes('workspaces')) return { data: [] };
			return { data: [todo({ id: '1', status: 'pending' })] };
		});

		const t = new Todos();
		await t.load();

		expect(t.loaded).toBe(true);
		expect(t.todos).toHaveLength(1);
		expect(t.categories.map((c) => c.id)).toEqual([1]);
		expect(t.groupedTodos.find((g) => g.status === 'pending')?.todos).toHaveLength(1);
	});

	describe('useFilters', () => {
		it('removes backlog todos unless a backlog filter is active', () => {
			const t = new Todos();
			t.todos = [todo({ id: '1', status: 'backlog' }), todo({ id: '2', status: 'pending' })];

			t.useFilters([]);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['2']);

			t.useFilters([{ type: 'status', value: 'backlog' }]);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['1']);
		});

		it('applies category and tag filters', () => {
			const cat = category(1, 'Work');
			const t = new Todos();
			t.todos = [
				todo({ id: '1', category: cat }),
				todo({ id: '2', category: null }),
				todo({
					id: '3',
					tags: [{ id: 5, name: 'x', color: '#fff', created_at: '', updated_at: '' }]
				})
			];

			t.useFilters([{ type: 'category', value: 1 }]);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['1']);

			t.useFilters([{ type: 'tag', value: 5 }]);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['3']);
		});

		it('hides todos from hideable workspaces when hide-it is active', () => {
			const cat1 = category(1);
			const hideable = {
				id: 1,
				title: 'Hidden',
				is_hideable: true,
				categories: [cat1],
				created_at: '',
				updated_at: ''
			};
			const t = new Todos();
			t.workspaces = [hideable];
			t.hideItActive = true;
			t.todos = [todo({ id: '1', category: cat1 }), todo({ id: '2', category: null })];

			t.useFilters([]);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['2']);
		});

		it('hides backlog todos from hideable workspaces when hide-it is active and the backlog filter is selected', () => {
			const cat1 = category(1);
			const cat2 = category(2);
			const hideable = {
				id: 1,
				title: 'Hidden',
				is_hideable: true,
				categories: [cat1],
				created_at: '',
				updated_at: ''
			};
			const t = new Todos();
			t.workspaces = [hideable];
			t.hideItActive = true;
			t.todos = [
				todo({ id: '1', status: 'backlog', category: cat1 }),
				todo({ id: '2', status: 'backlog', category: cat2 })
			];

			t.useFilters([{ type: 'status', value: 'backlog' }]);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['2']);
		});

		it('re-evaluates hide-it against the filters being applied, not the previous selection', () => {
			// Regression test: selecting a category filter and then switching to
			// the backlog status filter used to leak hidden-workspace backlog
			// items through, because the hide-it guard read the stale
			// this.activeFilters from before the switch.
			const cat1 = category(1);
			const cat2 = category(2);
			const hideable = {
				id: 1,
				title: 'Hidden',
				is_hideable: true,
				categories: [cat1],
				created_at: '',
				updated_at: ''
			};
			const t = new Todos();
			t.workspaces = [hideable];
			t.hideItActive = true;
			t.todos = [
				todo({ id: '1', status: 'backlog', category: cat1 }),
				todo({ id: '2', status: 'backlog', category: cat2 })
			];

			t.useFilters([{ type: 'category', value: 2 }]);
			t.useFilters([{ type: 'status', value: 'backlog' }]);

			expect(t.filteredTodos.map((x) => x.id)).toEqual(['2']);
		});

		it('keeps only auto-generated todos due within the visibility window', () => {
			const far = new Date();
			far.setDate(far.getDate() + 10);
			const near = new Date();
			near.setDate(near.getDate() + 1);

			const t = new Todos();
			t.todos = [
				todo({ id: '1', auto_generated: true, due_at: far.toISOString().split('T')[0] }),
				todo({ id: '2', auto_generated: true, due_at: near.toISOString().split('T')[0] }),
				todo({ id: '3', auto_generated: false, due_at: far.toISOString().split('T')[0] })
			];

			t.useFilters([]);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['2', '3']);
		});
	});

	describe('filter management', () => {
		it('adds, removes and clears filters', () => {
			const t = new Todos();
			const filter = { type: 'priority' as const, value: 'high' as const };

			t.addFilter(filter);
			expect(t.isFilterActive(filter)).toBe(true);

			t.removeFilter(filter);
			expect(t.isFilterActive(filter)).toBe(false);

			t.addFilter(filter);
			t.clearFilters();
			expect(t.activeFilters).toEqual([]);
		});

		it('applies a filter coming from the URL', () => {
			pageState.searchParams.set('filterType', 'priority');
			pageState.searchParams.set('filterValue', 'high');

			const t = new Todos();
			t.todos = [todo({ id: '1', priority: 'high' }), todo({ id: '2', priority: 'low' })];

			t.checkUrlForFilter();
			expect(t.activeFilters).toEqual([{ type: 'priority', value: 'high' }]);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['1']);
		});

		it('ignores workspace filters from the URL', () => {
			pageState.searchParams.set('filterType', 'workspace');
			pageState.searchParams.set('filterValue', '1');

			const t = new Todos();
			t.todos = [todo()];
			t.checkUrlForFilter();
			expect(t.activeFilters).toEqual([]);
		});
	});

	describe('quickCreate', () => {
		it('creates a todo and reports ignored recurrence', async () => {
			vi.useFakeTimers();
			api.create.mockResolvedValue({ data: todo({ id: '99' }) });

			const t = new Todos();
			const res = await t.quickCreate('Buy milk repeat:weekly');

			expect(res).toEqual({ ok: true, recurrenceIgnored: true });
			expect(api.create).toHaveBeenCalledWith(expect.stringContaining('todos'), {
				title: 'Buy milk repeat:weekly'
			});
			expect(t.recentlyCreated).toBe('99');

			vi.runAllTimers();
			expect(t.recentlyCreated).toBeNull();
		});

		it('reports failure when creation fails', async () => {
			api.create.mockResolvedValue(null);
			const t = new Todos();
			const res = await t.quickCreate('Buy milk');
			expect(res).toEqual({ ok: false, recurrenceIgnored: false });
		});
	});

	describe('sort by score', () => {
		it('enables score sorting and orders by relevance', () => {
			const t = new Todos();
			t.todos = [
				todo({ id: 'low', priority: 'low', created_at: '2020-01-01' }),
				todo({ id: 'high', priority: 'high', created_at: '2020-01-01' })
			];

			t.toggleSortByScore();

			expect(t.sortByScore).toBe(true);
			expect(t.todosScored).toBe(true);
			expect(t.filteredTodos[0].id).toBe('high');
		});
	});

	describe('hide-it flag', () => {
		it('reads the persisted flag from storage', () => {
			storage.getBool.mockReturnValue(true);
			const t = new Todos();
			t.todos = [todo()];
			t.loadHideIt();
			expect(t.hideItActive).toBe(true);
		});

		it('defaults to inactive when storage returns null', () => {
			storage.getBool.mockReturnValue(null);
			const t = new Todos();
			t.loadHideIt();
			expect(t.hideItActive).toBe(false);
		});

		it('persists the flag when toggled', () => {
			const t = new Todos();
			t.todos = [todo()];
			t.toggleHideIt();
			expect(storage.setBool).toHaveBeenCalledWith(Todos.LS_HIDE_IT_KEY, true);
		});
	});

	describe('hide-it restore on load', () => {
		const hideableWorkspace = (cat: ReturnType<typeof category>) => ({
			id: 1,
			title: 'Hidden',
			is_hideable: true,
			categories: [cat],
			created_at: '',
			updated_at: ''
		});

		it('restores the flag at construction and hides after load()', async () => {
			storage.getBool.mockReturnValue(true);
			const cat = category(1, 'Chores');
			api.list.mockImplementation(async (endpoint: string) => {
				if (endpoint.includes('categories')) return { data: [cat] };
				if (endpoint.includes('workspaces')) return { data: [hideableWorkspace(cat)] };
				return { data: [todo({ id: '1', category: cat }), todo({ id: '2' })] };
			});

			const t = new Todos();
			// flag already restored before any request resolved
			expect(t.hideItActive).toBe(true);

			await t.load();

			expect(t.filteredTodos.map((x) => x.id)).toEqual(['2']);
			expect(t.filteredCategories.map((c) => c.id)).toEqual([]);
		});

		it('retries a failed workspaces fetch and still hides', async () => {
			storage.getBool.mockReturnValue(true);
			const cat = category(1);
			let workspaceCalls = 0;
			api.list.mockImplementation(async (endpoint: string) => {
				if (endpoint.includes('categories')) return { data: [cat] };
				if (endpoint.includes('workspaces')) {
					workspaceCalls++;
					return workspaceCalls === 1 ? null : { data: [hideableWorkspace(cat)] };
				}
				return { data: [todo({ id: '1', category: cat })] };
			});

			const t = new Todos();
			await t.load();

			expect(workspaceCalls).toBe(2);
			expect(t.filteredTodos.map((x) => x.id)).toEqual([]);
			expect(t.filteredCategories.map((c) => c.id)).toEqual([]);
		});

		it('still completes load() when the workspaces fetch fails for good', async () => {
			storage.getBool.mockReturnValue(true);
			api.list.mockImplementation(async (endpoint: string) => {
				if (endpoint.includes('workspaces')) return null;
				if (endpoint.includes('categories')) return { data: [category(1)] };
				return { data: [todo({ id: '1' })] };
			});

			const t = new Todos();
			await t.load();

			// graceful degradation: the flag is still restored (toggle shows the
			// correct state) even though hiding cannot apply without workspaces
			expect(t.loaded).toBe(true);
			expect(t.hideItActive).toBe(true);
		});

		it('respects a toggle issued while load() is in flight', async () => {
			let stored = true;
			storage.getBool.mockImplementation(() => stored);
			storage.setBool.mockImplementation((_key: string, value: boolean) => {
				stored = value;
			});

			const cat = category(1);
			let resolveTodos: (value: { data: unknown[] }) => void = () => {};
			const todosResponse = new Promise<{ data: unknown[] }>((resolve) => {
				resolveTodos = resolve;
			});
			api.list.mockImplementation(async (endpoint: string) => {
				if (endpoint.includes('categories')) return { data: [cat] };
				if (endpoint.includes('workspaces')) return { data: [hideableWorkspace(cat)] };
				return todosResponse;
			});

			const t = new Todos();
			expect(t.hideItActive).toBe(true);

			const loading = t.load();
			t.toggleHideIt(); // user turns it off before any data arrived
			resolveTodos({ data: [todo({ id: '1', category: cat }), todo({ id: '2' })] });
			await loading;

			// the toggle wins over the constructor restore, nothing is hidden
			expect(t.hideItActive).toBe(false);
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['1', '2']);
			expect(t.filteredCategories.map((c) => c.id)).toEqual([1]);

			// one toggle is enough to re-hide now that workspaces are loaded
			t.toggleHideIt();
			expect(t.filteredTodos.map((x) => x.id)).toEqual(['2']);
			expect(t.filteredCategories.map((c) => c.id)).toEqual([]);
		});
	});
});
