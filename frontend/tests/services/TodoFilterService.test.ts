import { describe, it, expect } from 'vitest';
import TodoFilterService from '$lib/services/TodoFilterService';
import type { Todo, TodoCategory, TodoWorkspace } from '$lib/types/todo';
import type { Tag } from '$lib/types/tag';

function todo(overrides: Partial<Todo> = {}): Todo {
	return {
		id: '1',
		title: 'Test todo',
		description: '',
		link: null,
		priority: 'medium',
		status: 'pending',
		effort: null,
		progress: null,
		is_completed: false,
		due_at: '',
		category: null,
		tags: [],
		subtasks: [],
		relevance: null,
		recurrence_frequency: null,
		recurrence_interval: 1,
		recurrence_ends_at: null,
		parent_task_id: null,
		auto_generated: false,
		created_at: '',
		updated_at: '',
		completed_at: '',
		...overrides
	};
}

function category(id: number, title = 'Category'): TodoCategory {
	return { id, title, created_at: '', updated_at: '' };
}

function tag(id: number, name = 'tag'): Tag {
	return { id, name, color: '#000000', created_at: '', updated_at: '' };
}

function workspace(id: number, categories: TodoCategory[], hideable = false): TodoWorkspace {
	return { id, title: 'WS', is_hideable: hideable, categories, created_at: '', updated_at: '' };
}

const service = new TodoFilterService();

describe('filterByPriority', () => {
	it('keeps only todos with the matching priority', () => {
		const todos = [todo({ priority: 'high' }), todo({ priority: 'low' }), todo({ priority: 'high' })];
		expect(service.filterByPriority('high', todos)).toHaveLength(2);
		expect(service.filterByPriority('low', todos)).toHaveLength(1);
		expect(service.filterByPriority('medium', todos)).toHaveLength(0);
	});
});

describe('filterByStatus', () => {
	it('keeps only todos with the matching status', () => {
		const todos = [
			todo({ status: 'pending' }),
			todo({ status: 'in-progress' }),
			todo({ status: 'backlog' })
		];
		expect(service.filterByStatus('pending', todos)).toHaveLength(1);
		expect(service.filterByStatus('in-progress', todos)).toHaveLength(1);
		expect(service.filterByStatus('backlog', todos)).toHaveLength(1);
	});
});

describe('filterByEffort', () => {
	it('matches todos with the given effort', () => {
		const todos = [todo({ effort: 'low' }), todo({ effort: 'high' }), todo({ effort: null })];
		expect(service.filterByEffort('low', todos)).toHaveLength(1);
		expect(service.filterByEffort('high', todos)).toHaveLength(1);
	});

	it('treats null effort as medium', () => {
		const todos = [todo({ effort: null }), todo({ effort: 'medium' }), todo({ effort: 'low' })];
		expect(service.filterByEffort('medium', todos)).toHaveLength(2);
	});
});

describe('filterOutBacklog', () => {
	it('removes backlog todos and keeps the rest', () => {
		const todos = [todo({ status: 'backlog' }), todo({ status: 'pending' }), todo({ status: 'backlog' })];
		expect(service.filterOutBacklog(todos)).toHaveLength(1);
		expect(service.filterOutBacklog(todos)[0].status).toBe('pending');
	});
});

describe('filterByDueDate', () => {
	// TZ=UTC (set in vitest.config.ts) so YYYY-MM-DD strings parse as midnight local
	const todayStr = new Date().toISOString().split('T')[0];
	const tomorrowStr = (() => {
		const d = new Date();
		d.setDate(d.getDate() + 1);
		return d.toISOString().split('T')[0];
	})();

	it('filters by today', () => {
		const todos = [todo({ due_at: todayStr }), todo({ due_at: '2099-01-01' }), todo({ due_at: '' })];
		const result = service.filterByDueDate('today', todos);
		expect(result).toHaveLength(1);
		expect(result[0].due_at).toBe(todayStr);
	});

	it('filters by tomorrow', () => {
		const todos = [todo({ due_at: tomorrowStr }), todo({ due_at: todayStr })];
		expect(service.filterByDueDate('tomorrow', todos)).toHaveLength(1);
	});

	it('filters overdue (past dates only)', () => {
		const todos = [todo({ due_at: '2000-01-01' }), todo({ due_at: '2099-01-01' })];
		expect(service.filterByDueDate('overdue', todos)).toHaveLength(1);
	});

	it('filters today-overdue (today and past combined)', () => {
		const todos = [
			todo({ due_at: todayStr }),
			todo({ due_at: '2000-01-01' }),
			todo({ due_at: '2099-01-01' })
		];
		expect(service.filterByDueDate('today-overdue', todos)).toHaveLength(2);
	});

	it('excludes todos with an empty due date', () => {
		expect(service.filterByDueDate('today', [todo({ due_at: '' })])).toHaveLength(0);
	});
});

describe('filterByCategory', () => {
	it('keeps only todos in the given category', () => {
		const cat1 = category(1);
		const cat2 = category(2);
		const todos = [todo({ category: cat1 }), todo({ category: cat2 }), todo({ category: null })];
		expect(service.filterByCategory(1, todos)).toHaveLength(1);
		expect(service.filterByCategory(99, todos)).toHaveLength(0);
	});
});

describe('filterByTag', () => {
	it('keeps todos that have the given tag', () => {
		const t1 = tag(10);
		const t2 = tag(20);
		const todos = [todo({ tags: [t1, t2] }), todo({ tags: [t2] }), todo({ tags: [] })];
		expect(service.filterByTag(10, todos)).toHaveLength(1);
		expect(service.filterByTag(20, todos)).toHaveLength(2);
		expect(service.filterByTag(99, todos)).toHaveLength(0);
	});
});

describe('filterByWorkspace', () => {
	it('keeps todos whose category belongs to the workspace', () => {
		const cat1 = category(1);
		const cat2 = category(2);
		const ws = workspace(1, [cat1]);
		const todos = [todo({ category: cat1 }), todo({ category: cat2 }), todo({ category: null })];
		expect(service.filterByWorkspace(ws, todos)).toHaveLength(1);
	});
});

describe('filterByHideIt', () => {
	it('hides todos whose category is in a hideable workspace', () => {
		const cat = category(1);
		const hideable = workspace(1, [cat], true);
		const todos = [todo({ category: cat }), todo({ category: category(2) }), todo({ category: null })];
		const result = service.filterByHideIt(todos, [hideable]);
		expect(result).toHaveLength(2);
		expect(result.every((t) => t.category?.id !== 1)).toBe(true);
	});

	it('keeps todos with no category regardless of workspaces', () => {
		const hideable = workspace(1, [category(1)], true);
		expect(service.filterByHideIt([todo({ category: null })], [hideable])).toHaveLength(1);
	});

	it('does not hide todos from non-hideable workspaces', () => {
		const cat = category(1);
		const visible = workspace(1, [cat], false);
		expect(service.filterByHideIt([todo({ category: cat })], [visible])).toHaveLength(1);
	});
});

describe('filter (dispatch)', () => {
	it('routes priority filter correctly', () => {
		const todos = [todo({ priority: 'high' }), todo({ priority: 'low' })];
		expect(service.filter({ type: 'priority', value: 'high' }, todos)).toHaveLength(1);
	});

	it('routes status filter correctly', () => {
		const todos = [todo({ status: 'pending' }), todo({ status: 'backlog' })];
		expect(service.filter({ type: 'status', value: 'pending' }, todos)).toHaveLength(1);
	});

	it('returns all todos for unknown filter type', () => {
		// @ts-expect-error testing fallback path
		expect(service.filter({ type: 'unknown', value: '' }, [todo(), todo()])).toHaveLength(2);
	});
});
