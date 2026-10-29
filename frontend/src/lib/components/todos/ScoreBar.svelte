<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { slide } from 'svelte/transition';
	import { getTodos } from '$lib/state/Todos.svelte';

	let { todo }: { todo: Todo } = $props();

	const todos = getTodos();

	let show = $derived(todos.sortByScore && todos.todosScored);
</script>

{#if show}
	<div
		class="absolute top-0 left-[2px] z-10 h-[2px] rounded-full bg-gradient-to-r from-c-success via-c-warning to-c-danger"
		style="width: calc(100% - 6px);"
		in:slide={{ axis: 'x' }}
		out:slide={{ axis: 'x' }}
	></div>
	<div
		class="absolute top-0 right-[4px] z-20 h-[2px] rounded-full bg-white"
		style="width: calc({(1 - (todo.relevance ?? 0)) * 100}% - 6px);"
	></div>
{/if}

<!-- left[-56px] left-2px -->
