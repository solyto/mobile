import type { TodoPriority } from '$lib/types/todo';

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
