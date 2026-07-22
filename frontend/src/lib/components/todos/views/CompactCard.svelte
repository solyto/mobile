<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import DueDate from '$lib/components/todos/props/DueDate.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';

	let { todo, handleCheck } = $props<{
		todo: Todo;
		handleCheck: (event: Event, todo: Todo) => Promise<void>;
	}>();

	const todos = getTodos();

	function getBgColor(todo: Todo): string {
		switch (todo.priority) {
			case 'low':
				return 'bg-c-success';
			case 'high':
				return 'bg-c-danger';
			default:
				return 'bg-c-btn';
		}
	}
</script>

<div
	class="relative flex items-center gap-3 rounded-lg border-1 bg-c-bg-surface px-4 py-2 shadow-sm transition-all {todos.recentlyCreated === todo.id ? 'border-c-btn-hover' : 'border-d-lightblue dark:border-s-dark'}"
	class:opacity-50={todo.is_completed}
	in:fade
>
	<div class="absolute top-0 left-0 h-full w-1 rounded-l-md {getBgColor(todo)}"></div>
	<span class="flex-1 truncate font-medium" class:line-through={todo.is_completed}>
		{todo.title}
	</span>
	{#if todo.due_at}
		<div class="shrink-0">
			<DueDate {todo} reversed={true} />
		</div>
	{/if}
	<div class="shrink-0">
		<Checkbox isChecked={todo.is_completed} onchange={(e: Event) => handleCheck(e, todo)} />
	</div>
</div>
