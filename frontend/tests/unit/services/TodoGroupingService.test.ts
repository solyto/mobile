import { describe, it, expect } from 'vitest';
import TodoGroupingService from '$lib/services/TodoGroupingService';
import { todo } from '../helpers/factories';

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
