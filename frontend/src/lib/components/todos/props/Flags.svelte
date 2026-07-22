<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import IconStickyNote from '@lucide/svelte/icons/sticky-note';
	import IconListTodo from '@lucide/svelte/icons/list-todo';
	import IconLink from '@lucide/svelte/icons/link';

	let { todo } = $props<{
		todo: Todo;
	}>();
</script>

{#if todo.description !== null || todo.subtasks.length > 0 || todo.link !== null}
	<div class="absolute top-[-12px] right-0 flex gap-1">
		{#if todo.description !== null}
			<div
				class="flex size-6 items-center justify-center rounded-full bg-c-neutral-1 p-[5px] shadow-sm dark:bg-s-dark-3"
			>
				<IconStickyNote />
			</div>
		{/if}
		{#if todo.subtasks.length > 0}
			<div
				class="flex size-6 items-center justify-center rounded-full bg-c-neutral-1 p-[5px] shadow-sm dark:bg-s-dark-3"
			>
				<IconListTodo size="14" />
			</div>
		{/if}
		{#if todo.link !== null}
			<div
				class="flex size-6 items-center justify-center rounded-full bg-c-neutral-1 p-[5px] shadow-sm dark:bg-s-dark-3"
			>
				<IconLink size="14" />
			</div>
		{/if}
	</div>
{/if}
