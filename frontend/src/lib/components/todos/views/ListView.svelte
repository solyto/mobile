<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import ListEntry from '$lib/components/todos/views/ListEntry.svelte';
	import NoTodos from '$lib/components/todos/NoTodos.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';

	const todos = getTodos();

	let { handleCheck } = $props<{ handleCheck: (event: Event, todo: Todo) => Promise<void> }>();
</script>

<div class="flex flex-col items-center justify-between space-y-2">
	{#each todos.filteredTodos as todo (todo.id)}
		<ListEntry {todo} {handleCheck} />
	{/each}
	{#if todos.filteredTodos.length === 0}
		<NoTodos />
	{/if}
</div>
