import type { TodoPriority, TodoView } from '$lib/types/todo';

export const TODO_VIEWS_DESKTOP: TodoView[] = ['list', 'grouped', 'kanban', 'overview'];
export const TODO_VIEWS_MOBILE: TodoView[] = ['card', 'grouped', 'overview'];

export function getPriorityColorClass(priority: TodoPriority): string {
	switch (priority) {
		case 'high':
			return 'bg-c-danger';
		case 'low':
			return 'bg-c-success';
		case 'medium':
		default:
			return 'bg-c-btn';
	}
}
