import { describe, it, expect } from 'vitest';
import TodoSortingService from '$lib/services/TodoSortingService';
import type { Todo, TodoCategory } from '$lib/types/todo';

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

function category(id: number, title: string): TodoCategory {
	return { id, title, created_at: '', updated_at: '' };
}

const service = new TodoSortingService();

describe('sort', () => {
	it('puts incomplete todos before completed ones', () => {
		const todos = [
			todo({ id: '1', is_completed: true, priority: 'high' }),
			todo({ id: '2', is_completed: false, priority: 'low' })
		];
		const result = service.sort(todos);
		expect(result[0].id).toBe('2');
		expect(result[1].id).toBe('1');
	});

	it('orders by priority high → medium → low within the same completion state', () => {
		const todos = [
			todo({ id: 'low', priority: 'low' }),
			todo({ id: 'high', priority: 'high' }),
			todo({ id: 'medium', priority: 'medium' })
		];
		const result = service.sort(todos);
		expect(result.map((t) => t.id)).toEqual(['high', 'medium', 'low']);
	});

	it('completed todos are sorted by priority among themselves', () => {
		const todos = [
			todo({ id: 'c-low', is_completed: true, priority: 'low' }),
			todo({ id: 'c-high', is_completed: true, priority: 'high' }),
			todo({ id: 'active', is_completed: false, priority: 'low' })
		];
		const result = service.sort(todos);
		expect(result[0].id).toBe('active');
		expect(result[1].id).toBe('c-high');
		expect(result[2].id).toBe('c-low');
	});

	it('does not mutate the original array', () => {
		const todos = [todo({ id: '1', priority: 'low' }), todo({ id: '2', priority: 'high' })];
		const original = [...todos];
		service.sort(todos);
		expect(todos[0].id).toBe(original[0].id);
	});
});

describe('sortByScore', () => {
	it('orders by relevance descending', () => {
		const todos = [
			todo({ id: 'low', relevance: 1 }),
			todo({ id: 'high', relevance: 100 }),
			todo({ id: 'mid', relevance: 50 })
		];
		const result = service.sortByScore(todos);
		expect(result.map((t) => t.id)).toEqual(['high', 'mid', 'low']);
	});

	it('treats null relevance as 0', () => {
		const todos = [todo({ id: 'null', relevance: null }), todo({ id: 'scored', relevance: 1 })];
		const result = service.sortByScore(todos);
		expect(result[0].id).toBe('scored');
	});

	it('does not mutate the original array', () => {
		const todos = [todo({ id: '1', relevance: 5 }), todo({ id: '2', relevance: 10 })];
		service.sortByScore(todos);
		expect(todos[0].id).toBe('1');
	});
});

describe('sortCategories', () => {
	it('sorts alphabetically case-insensitively', () => {
		const cats = [category(1, 'Work'), category(2, 'apple'), category(3, 'Budget')];
		const result = service.sortCategories(cats);
		expect(result.map((c) => c.title)).toEqual(['apple', 'Budget', 'Work']);
	});

	it('does not mutate the original array', () => {
		const cats = [category(1, 'Z'), category(2, 'A')];
		service.sortCategories(cats);
		expect(cats[0].title).toBe('Z');
	});
});
