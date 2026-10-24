import { describe, it, expect } from 'vitest';
import TodoGroupingService from '$lib/services/TodoGroupingService';
import { todo, category } from '../helpers/factories';

const service = new TodoGroupingService();

describe('groupByStatus', () => {
	it('buckets todos by their status', () => {
		const todos = [
			todo({ id: '1', status: 'pending' }),
			todo({ id: '2', status: 'in-progress' }),
			todo({ id: '3', status: 'waiting' }),
			todo({ id: '4', status: 'almost-done' }),
			todo({ id: '5', status: 'backlog' })
		];

		const result = service.groupByStatus(todos);

		expect(result).toHaveLength(4);
		expect(result.map((g) => g.status)).toEqual([
			'pending',
			'in-progress',
			'waiting',
			'almost-done'
		]);
		expect(result[0].todos.map((t) => t.id)).toEqual(['1']);
		expect(result[1].todos.map((t) => t.id)).toEqual(['2']);
		expect(result[2].todos.map((t) => t.id)).toEqual(['3']);
		expect(result[3].todos.map((t) => t.id)).toEqual(['4']);
	});

	it('ignores backlog todos', () => {
		const result = service.groupByStatus([todo({ status: 'backlog' })]);
		expect(result.every((g) => g.todos.length === 0)).toBe(true);
	});

	it('returns empty buckets for an empty input', () => {
		const result = service.groupByStatus([]);
		expect(result.every((g) => g.todos.length === 0)).toBe(true);
	});

	it('does not mutate the input array', () => {
		const todos = [todo({ status: 'pending' }), todo({ status: 'waiting' })];
		const original = [...todos];
		service.groupByStatus(todos);
		expect(todos).toEqual(original);
	});
});

describe('groupByCategory', () => {
	it('groups todos by category, sorted alphabetically, uncategorized last', () => {
		const home = category(1, 'Home');
		const work = category(2, 'Work');
		const todos = [
			todo({ id: '1', category: home }),
			todo({ id: '2', category: work }),
			todo({ id: '3', category: null }),
			todo({ id: '4', category: work })
		];

		const result = service.groupByCategory(todos);

		expect(result.map((g) => g.category?.title ?? null)).toEqual(['Home', 'Work', null]);
		expect(result[0].todos.map((t) => t.id)).toEqual(['1']);
		expect(result[1].todos.map((t) => t.id)).toEqual(['2', '4']);
		expect(result[2].todos.map((t) => t.id)).toEqual(['3']);
	});

	it('returns an empty array for an empty input', () => {
		expect(service.groupByCategory([])).toEqual([]);
	});

	it('does not mutate the input array', () => {
		const todos = [todo({ category: category(1) })];
		const original = [...todos];
		service.groupByCategory(todos);
		expect(todos).toEqual(original);
	});
});
