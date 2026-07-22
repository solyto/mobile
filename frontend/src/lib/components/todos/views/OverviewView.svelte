<script lang="ts">
	import type { Todo, TodoCategory } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import CompactCard from '$lib/components/todos/views/CompactCard.svelte';
	import NoTodos from '$lib/components/todos/NoTodos.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const todos = getTodos();
	const ts = getTranslation();

	let { handleCheck } = $props<{ handleCheck: (event: Event, todo: Todo) => Promise<void> }>();

	interface CategoryGroup {
		category: TodoCategory | null;
		todos: Todo[];
	}

	let groups = $derived.by(() => {
		const map = new Map<number | null, CategoryGroup>();

		for (const todo of todos.filteredTodos) {
			const key = todo.category?.id ?? null;
			if (!map.has(key)) {
				map.set(key, { category: todo.category, todos: [] });
			}
			map.get(key)!.todos.push(todo);
		}

		const result: CategoryGroup[] = [];
		const uncategorized = map.get(null);

		for (const [key, group] of map) {
			if (key !== null) result.push(group);
		}

		result.sort((a, b) => a.category!.title.localeCompare(b.category!.title));

		if (uncategorized) result.push(uncategorized);

		return result;
	});
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
						<CompactCard {todo} {handleCheck} />
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
