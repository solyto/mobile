import type { TodoPriority, TodoStatus, TodoView } from '$lib/types/todo';
import type { CalendarRecords, TodoRecords } from '$lib/types/translation';

export const TODO_VIEWS_DESKTOP: TodoView[] = ['list', 'grouped', 'kanban', 'overview'];
export const TODO_VIEWS_MOBILE: TodoView[] = ['card', 'grouped', 'overview'];

const DUE_DATE_SUGGESTION_DAYS = 7;

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

export function getStatusLabel(status: TodoStatus, labels: TodoRecords): string {
	switch (status) {
		case 'backlog':
			return labels.status_backlog;
		case 'in-progress':
			return labels.status_in_progress;
		case 'waiting':
			return labels.status_waiting;
		case 'almost-done':
			return labels.status_almost_done;
		case 'pending':
		default:
			return labels.status_pending;
	}
}

export function getDueDateSuggestions(
	today: Date,
	labels: TodoRecords,
	weekdays: CalendarRecords['weekdays']
): { label: string; value: string }[] {
	return Array.from({ length: DUE_DATE_SUGGESTION_DAYS }, (_, offset) => {
		const date = new Date(today);
		date.setDate(today.getDate() + offset);
		return { label: dueDateSuggestionLabel(date, offset, labels, weekdays), value: date.toISOString().slice(0, 10) };
	});
}

function dueDateSuggestionLabel(
	date: Date,
	offset: number,
	labels: TodoRecords,
	weekdays: CalendarRecords['weekdays']
): string {
	if (offset === 0) return labels.due_today;
	if (offset === 1) return labels.due_tomorrow;
	return weekdays[date.getDay() === 0 ? 7 : date.getDay()];
}
