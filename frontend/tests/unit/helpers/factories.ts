import type { Todo, TodoCategory } from '$lib/types/todo';
import type { Tag } from '$lib/types/tag';

export function todo(overrides: Partial<Todo> = {}): Todo {
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

export function category(id: number, title = 'Category'): TodoCategory {
	return { id, title, created_at: '', updated_at: '' };
}

export function tag(id: number, name = 'tag'): Tag {
	return { id, name, color: '#000000', created_at: '', updated_at: '' };
}
