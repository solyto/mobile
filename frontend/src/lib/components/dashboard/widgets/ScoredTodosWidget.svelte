<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { withDecimals } from '$lib/helpers/NumberHelper';
	import { Translation } from '$lib/state/Translation.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import IconTrendingUp from '@lucide/svelte/icons/trending-up';

	let { scoredTodos, handleCheck, ts, mt = false } = $props<{
		scoredTodos: Todo[];
		handleCheck: (event: Event, todo: Todo) => Promise<void>;
		ts: Translation;
		mt: boolean
	}>();
</script>


<div class:mt-12={mt}>
	<div class="mb-2 flex items-center gap-2">
		<IconTrendingUp size={15} class="text-c-heading dark:text-c-primary" />
		<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
			{ts.get.home.relevant}
		</span>
	</div>
	<div class="flex flex-col gap-1 pl-[1px]">
		{#each scoredTodos as todo (todo.id)}
			<div class="flex items-center gap-2 py-0.5">
				<div
					class="h-2 w-2 shrink-0 rounded-full"
					class:bg-c-btn={todo.priority === 'medium' ||
						todo.priority === null}
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
				<span class="text-xs text-c-neutral-4 dark:text-c-neutral-5">
					{withDecimals(todo.relevance, 2)}
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