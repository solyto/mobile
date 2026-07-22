<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import Card from '$lib/components/todos/views/Card.svelte';
	import NoTodos from '$lib/components/todos/NoTodos.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';

	const todos = getTodos();

	let { handleCheck } = $props<{ handleCheck: (event: Event, todo: Todo) => Promise<void> }>();
</script>

<div class="flex flex-col items-center justify-between space-y-4">
	{#each todos.filteredTodos as todo (todo.id)}
		<Card {todo} {handleCheck} />
	{/each}
	{#if todos.filteredTodos.length === 0}
		<NoTodos />
	{/if}
</div>
