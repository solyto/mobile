<script lang="ts">
	import type { Todo, TodoPriority } from '$lib/types/todo';
	import IconUp from '@lucide/svelte/icons/circle-arrow-up';
	import IconRight from '@lucide/svelte/icons/circle-arrow-right';
	import IconDown from '@lucide/svelte/icons/circle-arrow-down';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import QuickSelectOverlay from '$lib/components/ui/QuickSelectOverlay.svelte';
	import { getPriorityColorClass } from '$lib/helpers/TodoHelper';

	let {
		todo,
		changePriority = true,
		expanded = false,
		simple = false,
		left = false,
		portal = false,
		compact = false,
		filled = false
	}: {
		todo: Todo;
		changePriority: boolean;
		expanded: boolean;
		simple?: boolean;
		left?: boolean;
		portal?: boolean;
		compact?: boolean;
		filled?: boolean;
	} = $props();

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();

	let priorityMenuVisible = $state<boolean>(false);
	let trigger = $state<HTMLDivElement | null>(null);

	function togglePriorityMenu(): void {
		priorityMenuVisible = !priorityMenuVisible;
	}

	async function handlePriorityChange(todo: Todo, priority: TodoPriority): Promise<void> {
		loadingIndicator.start();
		togglePriorityMenu();
		await todos.changePriority(todo, priority);
		await todos.load();

		loadingIndicator.stop();
	}

	function getIconClass(colorClass: string): string {
		if (filled) {
			return 'cursor-pointer text-white';
		}

		return `cursor-pointer rounded-full ${colorClass} hover:bg-c-neutral dark:hover:bg-s-dark-3`;
	}
</script>

<div
	bind:this={trigger}
	class="
		relative flex items-center rounded-l-md transition-all duration-300
		max-2xl:rounded-full {filled ? getPriorityColorClass(todo.priority) : ''}
	"
	class:justify-center={!left}
	class:justify-start={left}
	class:p-4={(todos.view === 'list' || todos.view === 'grouped') && !simple && !compact}
	class:2xl:w-full={(todos.view === 'list' || todos.view === 'grouped') && !compact}
	class:2xl:h-full={(todos.view === 'list' || todos.view === 'grouped') && !compact}
	class:rounded-bl-none={expanded}
	class:rounded-br-md={expanded}
>
	{#if changePriority}
		{#if todo.priority === 'high'}
			<IconUp
				class={getIconClass('text-c-danger')}
				onclick={togglePriorityMenu}
			/>
		{:else if todo.priority === 'medium'}
			<IconRight
				class={getIconClass('text-c-btn')}
				onclick={togglePriorityMenu}
			/>
		{:else if todo.priority === 'low'}
			<IconDown
				class={getIconClass('text-c-success')}
				onclick={togglePriorityMenu}
			/>
		{/if}
		{#if priorityMenuVisible}
			<QuickSelectOverlay onClose={() => (priorityMenuVisible = false)} {portal} target={trigger}>
				<IconUp
					class="cursor-pointer rounded-full text-c-danger hover:bg-c-neutral dark:hover:bg-s-dark-3"
					onclick={() => handlePriorityChange(todo, 'high')}
				/>
				<IconRight
					class="cursor-pointer rounded-full text-c-btn hover:bg-c-neutral dark:hover:bg-s-dark-3"
					onclick={() => handlePriorityChange(todo, 'medium')}
				/>
				<IconDown
					class="cursor-pointer rounded-full text-c-success hover:bg-c-neutral dark:hover:bg-s-dark-3"
					onclick={() => handlePriorityChange(todo, 'low')}
				/>
			</QuickSelectOverlay>
		{/if}
	{:else if todo.priority === 'high'}
		<IconUp class="text-c-danger" />
	{:else if todo.priority === 'medium'}
		<IconRight class="text-c-btn" />
	{:else if todo.priority === 'low'}
		<IconDown class="text-c-success" />
	{/if}
</div>
