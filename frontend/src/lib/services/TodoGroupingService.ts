import type { GroupedTodos, Todo } from '$lib/types/todo.ts';

export default class TodoGroupingService {
	groupByStatus(todos: Todo[]): GroupedTodos[] {
		const pending: Todo[] = [],
			inProgress: Todo[] = [],
			waiting: Todo[] = [],
			almostDone: Todo[] = [];

		for (const todo of todos) {
			switch (todo.status) {
				case 'pending':
					pending.push(todo);
					break;
				case 'in-progress':
					inProgress.push(todo);
					break;
				case 'waiting':
					waiting.push(todo);
					break;
				case 'almost-done':
					almostDone.push(todo);
					break;
			}
		}

		return [
			{ id: 1, status: 'pending', todos: pending },
			{ id: 2, status: 'in-progress', todos: inProgress },
			{ id: 3, status: 'waiting', todos: waiting },
			{ id: 4, status: 'almost-done', todos: almostDone }
		];
	}
}
