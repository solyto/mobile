<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import CompactEntry from '$lib/components/todos/views/CompactEntry.svelte';
	import NoTodos from '$lib/components/todos/NoTodos.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TodoGroupingService from '$lib/services/TodoGroupingService';

	const todos = getTodos();
	const ts = getTranslation();
	const grouping = new TodoGroupingService();

	let { handleCheck }: { handleCheck: (event: Event, todo: Todo) => Promise<void> } = $props();

	let groups = $derived(grouping.groupByCategory(todos.filteredTodos));
</script>

{#if todos.filteredTodos.length === 0}
	<NoTodos />
{:else}
	<div class="flex flex-col gap-8">
		{#each groups as group (group.category?.id ?? 'uncategorized')}
			<div in:fade>
				<h3 class="mb-3 text-lg font-bold text-c-neutral-7 dark:text-c-neutral-3">
					{group.category?.title ?? ts.get.todos.uncategorized}
					<span class="ml-2 text-sm font-normal text-c-neutral-4 dark:text-c-neutral-5">
						{group.todos.length}
					</span>
				</h3>
				<div class="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
					{#each group.todos as todo (todo.id)}
						<CompactEntry {todo} {handleCheck} minimal={true} />
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
