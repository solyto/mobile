import type {
	Todo,
	TodoPriority,
	TodoStatus,
	TodoEffort,
	TodoDueAtFilter,
	TodoFilter,
	TodoWorkspace,
	TodoCategory
} from '$lib/types/todo';
import {
	isDateInThePast,
	isDateThisWeek,
	isDateToday,
	isDateTomorrow
} from '$lib/helpers/DateHelper';

export default class TodoFilterService {
	filter(request: TodoFilter, todos: Todo[]): Todo[] {
		switch (request.type) {
			case 'priority':
				return this.filterByPriority(request.value as TodoPriority, todos);
			case 'status':
				return this.filterByStatus(request.value as TodoStatus, todos);
			case 'effort':
				return this.filterByEffort(request.value as TodoEffort, todos);
			case 'due':
				return this.filterByDueDate(request.value as TodoDueAtFilter, todos);
			case 'category':
				return this.filterByCategory(Number(request.value), todos);
			case 'tag':
				return this.filterByTag(Number(request.value), todos);
			case 'workspace':
				return this.filterByWorkspace(request.value as TodoWorkspace, todos);
			default:
				return todos;
		}
	}

	filterOutBacklog(todos: Todo[]): Todo[] {
		return todos.filter((t) => t.status !== 'backlog');
	}

	filterByPriority(priority: TodoPriority, todos: Todo[]): Todo[] {
		return todos.filter((t) => t.priority === priority);
	}

	filterByStatus(status: TodoStatus, todos: Todo[]): Todo[] {
		return todos.filter((t) => t.status === status);
	}

	filterByEffort(effort: TodoEffort, todos: Todo[]): Todo[] {
		return todos.filter(
			(t) => t.effort === effort || (t.effort === null && effort === 'medium')
		);
	}

	filterByDueDate(due: TodoDueAtFilter, todos: Todo[]): Todo[] {
		switch (due) {
			case 'today':
				return todos.filter((t) => {
					return t.due_at ? isDateToday(new Date(t.due_at)) : false;
				});
			case 'tomorrow':
				return todos.filter((t) => {
					return t.due_at ? isDateTomorrow(new Date(t.due_at)) : false;
				});
			case 'week':
				return todos.filter((t) => {
					return t.due_at ? isDateThisWeek(new Date(t.due_at)) : false;
				});
			case 'overdue':
				return todos.filter((t) => {
					return t.due_at ? isDateInThePast(new Date(t.due_at)) : false;
				});
			case 'today-overdue':
				return todos.filter((t) => {
					return t.due_at
						? isDateToday(new Date(t.due_at)) || isDateInThePast(new Date(t.due_at))
						: false;
				});
			default:
				return todos;
		}
	}

	filterByCategory(categoryId: number, todos: Todo[]): Todo[] {
		return todos.filter((t) => {
			if (!t.category) return false;
			return t.category.id === categoryId;
		});
	}

	filterByWorkspace(workspace: TodoWorkspace, todos: Todo[]): Todo[] {
		return todos.filter((t) => {
			if (!t.category) return false;
			return workspace.categories.some((category) => category.id === t.category?.id);
		});
	}

	filterByTag(tagId: number, todos: Todo[]): Todo[] {
		return todos.filter((t) => {
			if (!t.tags) return false;
			return t.tags.some((tag) => tag.id === tagId);
		});
	}

	filterByHideIt(todos: Todo[], workspaces: TodoWorkspace[]): Todo[] {
		return todos.filter((t) => {
			if (!t.category) return true;
			for (const workspace of workspaces) {
				if (
					workspace.is_hideable &&
					workspace.categories.some((category) => category.id === t.category?.id)
				) {
					return false;
				}
			}
			return true;
		});
	}

	filterCategoriesByHideIt(
		categories: TodoCategory[],
		workspaces: TodoWorkspace[]
	): TodoCategory[] {
		return categories.filter((c) => {
			for (const workspace of workspaces) {
				if (
					workspace.is_hideable &&
					workspace.categories.some((category) => category.id === c.id)
				) {
					return false;
				}
			}
			return true;
		});
	}
}
