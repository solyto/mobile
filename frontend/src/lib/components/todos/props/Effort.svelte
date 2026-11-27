<script lang="ts">
	import type { Todo, TodoEffort } from '$lib/types/todo';
	import IconClock from '$lib/icons/lucide/clock.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import QuickSelectOverlay from '$lib/components/ui/QuickSelectOverlay.svelte';

	let { todo, changeEffort = true, left = false, portal = false, compact = false }: {
		todo: Todo;
		changeEffort: boolean;
		left?: boolean;
		portal?: boolean;
		compact?: boolean;
	} = $props();

	const EFFORTS: TodoEffort[] = ['low', 'medium', 'high'];

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();

	let effortMenuVisible = $state<boolean>(false);
	let trigger = $state<HTMLDivElement | null>(null);

	function toggleEffortMenu(): void {
		effortMenuVisible = !effortMenuVisible;
	}

	function closeEffortMenu(): void {
		effortMenuVisible = false;
	}

	async function handleEffortChange(todo: Todo, effort: TodoEffort): Promise<void> {
		loadingIndicator.start();
		try {
			await todos.changeEffort(todo, effort);
			toggleEffortMenu();
		} finally {
			loadingIndicator.stop();
		}
	}

	function fillsRow(): boolean {
		return todos.isRowView && !compact;
	}

	function getColor(effort: TodoEffort): string {
		switch (effort) {
			case 'medium':
			default:
				return 'text-c-btn';
			case 'high':
				return 'text-c-danger';
			case 'low':
				return 'text-c-success';
		}
	}
</script>

<div
	bind:this={trigger}
	class="relative flex items-center p-4"
	class:justify-center={!left}
	class:justify-start={left}
	class:2xl:w-full={fillsRow()}
	class:2xl:h-full={fillsRow()}
	class:p-4={fillsRow()}
>
	{#if changeEffort}
		<IconClock class="cursor-pointer transition-colors duration-300 {getColor(todo.effort)}" onclick={toggleEffortMenu} />
		{#if effortMenuVisible}
			<QuickSelectOverlay onClose={closeEffortMenu} {portal} target={trigger}>
				{#each EFFORTS as effort (effort)}
					<IconClock
						class="cursor-pointer rounded-full hover:bg-c-neutral dark:hover:bg-s-dark-3 {getColor(effort)}"
						onclick={() => handleEffortChange(todo, effort)}
					/>
				{/each}
			</QuickSelectOverlay>
		{/if}
	{:else}
		<IconClock class={getColor(todo.effort)} />
	{/if}
</div>
