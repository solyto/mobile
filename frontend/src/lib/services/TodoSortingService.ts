import type { Todo, TodoCategory } from '$lib/types/todo';

export default class TodoSortingService {
	sort(todos: Todo[]): Todo[] {
		const order = ['high', 'medium', 'low'] as const;
		const rank = (p: unknown) => {
			const i = order.indexOf(String(p).toLowerCase() as (typeof order)[number]);
			return i === -1 ? order.length : i;
		};

		return [...todos].sort((a, b) => {
			if (a.is_completed !== b.is_completed) {
				return Number(a.is_completed) - Number(b.is_completed);
			}
			return rank(a.priority) - rank(b.priority);
		});
	}

	sortByScore(todos: Todo[]): Todo[] {
		return [...todos].sort((a, b) => {
			return (b.relevance ?? 0) - (a.relevance ?? 0);
		});
	}

	sortCategories(categories: TodoCategory[]): TodoCategory[] {
		return [...categories].sort((a, b) => {
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		});
	}
}
