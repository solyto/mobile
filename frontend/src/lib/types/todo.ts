import type { Tag } from './tag';

export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoStatus = 'backlog' | 'pending' | 'in-progress' | 'waiting' | 'almost-done';
export type TodoEffort = null | 'low' | 'medium' | 'high';
export type TodoRecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TodoDueAtFilter = 'today' | 'tomorrow' | 'week' | 'overdue' | 'today-overdue';
export type TodoFilterType =
	| 'status'
	| 'priority'
	| 'due'
	| 'effort'
	| 'category'
	| 'tag'
	| 'workspace';

export interface TodoFilter {
	type: TodoFilterType;
	value: string | number | TodoWorkspace;
}

export interface Todo {
	id: string;
	title: string;
	description: string;
	link: string | null;
	priority: TodoPriority;
	status: TodoStatus;
	effort: TodoEffort;
	progress: null | number;
	is_completed: boolean;
	due_at: string;
	category: TodoCategory | null;
	tags: Tag[];
	subtasks: TodoSubtask[];
	relevance: number | null;
	recurrence_frequency: TodoRecurrenceFrequency | null;
	recurrence_interval: number;
	recurrence_ends_at: string | null;
	parent_task_id: string | null;
	auto_generated: boolean;
	created_at: string;
	updated_at: string;
	completed_at: string;
}

export interface GroupedTodos {
	id: number;
	status: TodoStatus;
	todos: Todo[];
}

export interface CreateTodoRequest {
	title: string;
	tags?: number[];
	category_id?: number | null;
}

export interface UpdateTodoRequest {
	title?: string;
	description?: string;
	link?: string | null;
	tags?: number[];
	category_id?: number | null;
	priority?: TodoPriority | null;
	due_at?: string | null;
	status?: TodoStatus;
	progress?: number | null;
	effort?: TodoEffort | null;
	is_completed?: boolean;
	recurrence_frequency?: TodoRecurrenceFrequency | null;
	recurrence_interval?: number;
	recurrence_ends_at?: string | null;
}

export interface TodoCategory {
	id: number;
	title: string;
	created_at: string;
	updated_at: string;
}

export interface CreateTodoCategoryRequest {
	title: string;
}

export interface TodoNavigationItem {
	filter: TodoFilter | null;
	label: string;
}

export interface TodoNavigationSection {
	header: string;
	items: TodoNavigationItem[];
}

export interface TodoWorkspace {
	id: number;
	title: string;
	is_hideable: boolean;
	categories: TodoCategory[];
	created_at: string;
	updated_at: string;
}

export interface CreateTodoWorkspaceRequest {
	title: string;
}

export interface UpdateTodoWorkspaceRequest {
	is_hideable: boolean;
}

export interface TodoSubtask {
	id: number;
	title: string;
	is_completed: boolean;
	created_at: string;
	updated_at: string;
}

export interface CreateTodoSubtaskRequest {
	title: string;
}

export interface UpdateTodoSubtaskRequest {
	title?: string;
	is_completed?: boolean;
}
