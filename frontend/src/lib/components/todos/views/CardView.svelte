<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import CompactEntry from '$lib/components/todos/views/CompactEntry.svelte';
	import NoTodos from '$lib/components/todos/NoTodos.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';

	const todos = getTodos();

	let { handleCheck }: { handleCheck: (event: Event, todo: Todo) => Promise<void> } = $props();
</script>

<div class="flex flex-col items-center justify-between space-y-4">
	{#each todos.filteredTodos as todo (todo.id)}
		<CompactEntry {todo} {handleCheck} minimal={false} />
	{/each}
	{#if todos.filteredTodos.length === 0}
		<NoTodos />
	{/if}
</div>
