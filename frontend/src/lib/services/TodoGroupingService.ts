import type { GroupedTodos, Todo, TodoCategory } from '$lib/types/todo.ts';

export interface TodoCategoryGroup {
	category: TodoCategory | null;
	todos: Todo[];
}

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

	groupByCategory(todos: Todo[]): TodoCategoryGroup[] {
		const map = new Map<number | null, TodoCategoryGroup>();

		for (const todo of todos) {
			const key = todo.category?.id ?? null;
			if (!map.has(key)) {
				map.set(key, { category: todo.category, todos: [] });
			}
			map.get(key)!.todos.push(todo);
		}

		const result: TodoCategoryGroup[] = [];
		const uncategorized = map.get(null);

		for (const [key, group] of map) {
			if (key !== null) result.push(group);
		}

		result.sort((a, b) => a.category!.title.localeCompare(b.category!.title));

		if (uncategorized) result.push(uncategorized);

		return result;
	}
}
