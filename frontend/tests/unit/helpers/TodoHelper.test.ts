import { describe, it, expect } from 'vitest';
import { getDueDateSuggestions, getPriorityColorClass, getStatusLabel } from '$lib/helpers/TodoHelper';
import { en } from '$lib/i18n/en';

describe('getStatusLabel', () => {
	it.each([
		['backlog', 'Backlog'],
		['pending', 'Pending'],
		['in-progress', 'In Progress'],
		['waiting', 'Waiting'],
		['almost-done', 'Almost done']
	] as const)('labels %s', (status, label) => {
		expect(getStatusLabel(status, en.todos)).toBe(label);
	});
});

describe('getPriorityColorClass', () => {
	it.each([
		['high', 'bg-c-danger'],
		['medium', 'bg-c-btn'],
		['low', 'bg-c-success']
	] as const)('colours %s', (priority, colorClass) => {
		expect(getPriorityColorClass(priority)).toBe(colorClass);
	});
});

describe('getDueDateSuggestions', () => {
	it('offers today, tomorrow and the next five weekdays by name', () => {
		const suggestions = getDueDateSuggestions(new Date('2026-11-23T12:00:00Z'), en.todos, en.calendar.weekdays);
		expect(suggestions).toEqual([
			{ label: 'Today', value: '2026-11-23' },
			{ label: 'Tomorrow', value: '2026-11-24' },
			{ label: 'Wednesday', value: '2026-11-25' },
			{ label: 'Thursday', value: '2026-11-26' },
			{ label: 'Friday', value: '2026-11-27' },
			{ label: 'Saturday', value: '2026-11-28' },
			{ label: 'Sunday', value: '2026-11-29' }
		]);
	});
});
