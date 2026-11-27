<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import IconStickyNote from '$lib/icons/lucide/sticky-note.svelte';
	import IconListTodo from '$lib/icons/lucide/list-todo.svelte';
	import IconLink from '$lib/icons/lucide/link.svelte';
	import IconRepeat from '$lib/icons/lucide/repeat.svelte';

	let { todo }: {
		todo: Todo;
	} = $props();

	function hasFlags(): boolean {
		return todo.description !== null || todo.subtasks.length > 0 || todo.link !== null || todo.recurrence_frequency !== null;
	}
</script>

{#snippet badge(Icon: typeof IconListTodo, size?: string)}
	<div class="flex size-6 items-center justify-center rounded-full bg-c-neutral-1 p-[5px] shadow-sm dark:bg-s-dark-3">
		<Icon {size} />
	</div>
{/snippet}

{#if hasFlags()}
	<div class="absolute top-[-12px] right-0 z-30 flex gap-2">
		{#if todo.description !== null}
			{@render badge(IconStickyNote)}
		{/if}
		{#if todo.subtasks.length > 0}
			{@render badge(IconListTodo, '14')}
		{/if}
		{#if todo.link !== null}
			{@render badge(IconLink, '14')}
		{/if}
		{#if todo.recurrence_frequency !== null}
			{@render badge(IconRepeat, '14')}
		{/if}
	</div>
{/if}
