<script lang="ts">
	import { blur } from 'svelte/transition';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import type { Todo } from '$lib/types/todo';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';

	const calendars = getCalendars();

	let {
		todo,
		checkboxRight = true,
		showPriority = true,
		px = true
	} = $props<{
		todo: Todo;
		checkboxRight?: boolean;
		showPriority?: boolean;
		px?: boolean;
	}>();

	async function check(): Promise<void> {
		await calendars.changeTodoCompleted(todo, !todo.is_completed);
	}
</script>

<button
	class="flex w-full cursor-pointer flex-nowrap items-center justify-start gap-1.5 py-1 text-sm text-nowrap transition-all hover:bg-c-neutral max-md:text-xs max-sm:pl-1 dark:hover:bg-s-dark-3"
	class:px-2={px}
	class:max-sm:pl-1={px}
	class:bg-c-neutral-1={todo.is_completed}
	class:dark:bg-s-dark-3={todo.is_completed}
	in:blur
>
	{#if showPriority}
		<span
			class="size-2 shrink-0 rounded-full"
			class:bg-c-danger={todo.priority === 'high'}
			class:bg-c-btn={todo.priority === 'medium'}
			class:bg-c-success={todo.priority === 'low'}
		></span>
	{/if}
	{#if !checkboxRight}
		<Checkbox isChecked={todo.is_completed} onchange={check} class="scale-80" />
	{/if}
	<span class="grow text-left">{todo.title}</span>
	{#if checkboxRight}
		<Checkbox isChecked={todo.is_completed} onchange={check} class="scale-80" />
	{/if}
</button>
