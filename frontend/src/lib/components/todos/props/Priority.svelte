<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { Todo, TodoPriority } from '$lib/types/todo';
	import IconUp from '$lib/icons/lucide/circle-arrow-up.svelte';
	import IconRight from '$lib/icons/lucide/circle-arrow-right.svelte';
	import IconDown from '$lib/icons/lucide/circle-arrow-down.svelte';
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

	type PriorityOption = {
		priority: TodoPriority;
		icon: typeof IconUp;
		color: string;
		filledColor: string;
	};

	const PRIORITIES: PriorityOption[] = [
		{ priority: 'high', icon: IconUp, color: 'text-c-danger', filledColor: 'text-c-danger-icon' },
		{ priority: 'medium', icon: IconRight, color: 'text-c-btn', filledColor: 'text-c-btn-icon' },
		{ priority: 'low', icon: IconDown, color: 'text-c-success', filledColor: 'text-c-success-icon' }
	];

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();

	let priorityMenuVisible = $state<boolean>(false);
	let trigger = $state<HTMLDivElement | null>(null);
	let current = $derived(PRIORITIES.find((option) => option.priority === todo.priority));

	function togglePriorityMenu(): void {
		priorityMenuVisible = !priorityMenuVisible;
	}

	function closePriorityMenu(): void {
		priorityMenuVisible = false;
	}

	async function handlePriorityChange(todo: Todo, priority: TodoPriority): Promise<void> {
		loadingIndicator.start();
		togglePriorityMenu();
		try {
			await todos.changePriority(todo, priority);
		} finally {
			loadingIndicator.stop();
		}
	}

	function getIconClass(option: PriorityOption): string {
		if (filled) {
			return `cursor-pointer ${option.filledColor}`;
		}

		return `cursor-pointer rounded-full ${option.color} hover:bg-c-neutral dark:hover:bg-s-dark-3`;
	}

	function fillsRow(): boolean {
		return todos.isRowView && !compact;
	}
</script>

<div
	bind:this={trigger}
	class={[
		'relative flex items-center rounded-l-md transition-all duration-300 max-2xl:rounded-full',
		filled && getPriorityColorClass(todo.priority)
	]}
	class:justify-center={!left}
	class:justify-start={left}
	class:p-4={fillsRow() && !simple}
	class:2xl:w-full={fillsRow()}
	class:2xl:h-full={fillsRow()}
	class:rounded-bl-none={expanded}
	class:rounded-br-md={expanded}
>
	{#if changePriority}
		{#key todo.priority}
			<span class="flex" in:scale={{ start: 0.6, duration: 250 }}>
				{#if current}
					<current.icon class={getIconClass(current)} onclick={togglePriorityMenu} />
				{/if}
			</span>
		{/key}
		{#if priorityMenuVisible}
			<QuickSelectOverlay onClose={closePriorityMenu} {portal} target={trigger}>
				{#each PRIORITIES as option (option.priority)}
					<option.icon
						class="cursor-pointer rounded-full {option.color} hover:bg-c-neutral dark:hover:bg-s-dark-3"
						onclick={() => handlePriorityChange(todo, option.priority)}
					/>
				{/each}
			</QuickSelectOverlay>
		{/if}
	{:else if current}
		<current.icon class={current.color} />
	{/if}
</div>
