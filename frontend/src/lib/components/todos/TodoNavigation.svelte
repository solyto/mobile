<script lang="ts">
	import type { TodoNavigationSection } from '$lib/types/todo';
	import TodoNavigationDesktop from '$lib/components/todos/TodoNavigationDesktop.svelte';
	import TodoNavigationMobile from '$lib/components/todos/TodoNavigationMobile.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	const sections: TodoNavigationSection[] = [
		{
			header: ts.get.todos.due_at,
			items: [
				{ filter: { type: 'due', value: 'today' }, label: ts.get.todos.due_today },
				{ filter: { type: 'due', value: 'tomorrow' }, label: ts.get.todos.due_tomorrow },
				{ filter: { type: 'due', value: 'week' }, label: ts.get.todos.due_week },
				{ filter: { type: 'due', value: 'overdue' }, label: ts.get.todos.due_overdue }
			]
		},
		{
			header: ts.get.todos.priority,
			items: [
				{ filter: { type: 'priority', value: 'high' }, label: ts.get.todos.priority_high },
				{ filter: { type: 'priority', value: 'medium' }, label: ts.get.todos.priority_medium },
				{ filter: { type: 'priority', value: 'low' }, label: ts.get.todos.priority_low }
			]
		},
		{
			header: ts.get.todos.effort,
			items: [
				{ filter: { type: 'effort', value: 'low' }, label: ts.get.todos.effort_low },
				{ filter: { type: 'effort', value: 'medium' }, label: ts.get.todos.effort_medium },
				{ filter: { type: 'effort', value: 'high' }, label: ts.get.todos.effort_high }
			]
		},
		{
			header: ts.get.todos.status,
			items: [
				{ filter: { type: 'status', value: 'backlog' }, label: ts.get.todos.status_backlog },
				{ filter: { type: 'status', value: 'pending' }, label: ts.get.todos.status_pending },
				{ filter: { type: 'status', value: 'in-progress' }, label: ts.get.todos.status_in_progress },
				{ filter: { type: 'status', value: 'waiting' }, label: ts.get.todos.status_waiting },
				{ filter: { type: 'status', value: 'almost-done' }, label: ts.get.todos.status_almost_done }
			]
		},
	];
</script>

<TodoNavigationDesktop {sections} {ts} />
<TodoNavigationMobile {sections} {ts} />