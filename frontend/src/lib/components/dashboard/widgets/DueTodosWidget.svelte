<script lang="ts">
	import IconListTodo from '@lucide/svelte/icons/list-todo';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import { Translation } from '$lib/state/Translation.svelte';
	import type { Todo } from '$lib/types/todo';

	let { dueTodos, handleCheck, ts, mt = false } = $props<{
		dueTodos: Todo[];
		handleCheck: (event: Event, todo: Todo) => Promise<void>;
		ts: Translation;
		mt: boolean;
	}>();
</script>

<div class:mt-12={mt}>
	<div class="mb-2 flex items-center gap-2">
		<IconListTodo size={15} class="text-c-heading dark:text-c-primary" />
		<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
			{ts.get.home.due_today}
		</span>
	</div>
	<div class="flex flex-col gap-1 pl-[1px]">
		{#each dueTodos as todo (todo.id)}
			<div class="flex items-center gap-2 py-0.5">
				<div
					class="h-2 w-2 shrink-0 rounded-full"
					class:bg-c-btn={todo.priority === 'medium' || todo.priority === null}
					class:bg-c-danger={todo.priority === 'high'}
					class:bg-c-success={todo.priority === 'low'}
				></div>
				<span
					class="truncate text-sm text-c-neutral-7 dark:text-c-neutral-3"
					class:line-through={todo.is_completed}
					class:opacity-50={todo.is_completed}
				>
					{todo.title}
				</span>
				<Checkbox
					isChecked={todo.is_completed}
					onchange={(e) => handleCheck(e, todo)}
					class="ml-auto"
				/>
			</div>
		{/each}
	</div>
</div>