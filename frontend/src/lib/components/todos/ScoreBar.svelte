<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { slide } from 'svelte/transition';
	import { getTodos } from '$lib/state/Todos.svelte';

	let { todo } = $props<{ todo: Todo }>();

	const todos = getTodos();

	let show = $derived(todos.sortByScore && todos.todosScored);
</script>

{#if show}
	<div
		class="absolute top-0 z-10 h-[2px] rounded-full bg-gradient-to-r from-c-success via-c-warning to-c-danger {todos.view ===
		'list'
			? 'left-[56px]'
			: 'left-[2px]'}"
		style={todos.view === 'list' ? 'width: calc(100% - 60px);' : 'width: calc(100% - 6px);'}
		in:slide={{ axis: 'x' }}
		out:slide={{ axis: 'x' }}
	></div>
	<div
		class="absolute top-0 right-[4px] z-20 h-[2px] rounded-full bg-white"
		style="width: calc({(1 - todo.relevance) * 100}% - 60px);"
	></div>
{/if}

<!-- left[-56px] left-2px -->
