<script lang="ts">
	import type { Todo, TodoEffort } from '$lib/types/todo';
	import IconClock from '@lucide/svelte/icons/clock';
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

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();

	let effortMenuVisible = $state<boolean>(false);
	let trigger = $state<HTMLDivElement | null>(null);

	function toggleEffortMenu(): void {
		effortMenuVisible = !effortMenuVisible;
	}

	async function handleEffortChange(todo: Todo, effort: TodoEffort): Promise<void> {
		loadingIndicator.start();
		await todos.changeEffort(todo, effort);
		await todos.load();

		toggleEffortMenu();
		loadingIndicator.stop();
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
	class:2xl:w-full={(todos.view === 'list' || todos.view === 'grouped') && !compact}
	class:2xl:h-full={(todos.view === 'list' || todos.view === 'grouped') && !compact}
	class:p-4={(todos.view === 'list' || todos.view === 'grouped') && !compact}
>
	{#if changeEffort}
		<IconClock class="cursor-pointer {getColor(todo.effort)}" onclick={toggleEffortMenu} />
		{#if effortMenuVisible}
			<QuickSelectOverlay onClose={() => (effortMenuVisible = false)} {portal} target={trigger}>
				<IconClock
					class="cursor-pointer rounded-full hover:bg-c-neutral dark:hover:bg-s-dark-3 {getColor(
						'low'
					)}"
					onclick={() => handleEffortChange(todo, 'low')}
				/>
				<IconClock
					class="cursor-pointer rounded-full hover:bg-c-neutral dark:hover:bg-s-dark-3 {getColor(
						'medium'
					)}"
					onclick={() => handleEffortChange(todo, 'medium')}
				/>
				<IconClock
					class="cursor-pointer rounded-full hover:bg-c-neutral dark:hover:bg-s-dark-3 {getColor(
						'high'
					)}"
					onclick={() => handleEffortChange(todo, 'high')}
				/>
			</QuickSelectOverlay>
		{/if}
	{:else}
		<IconClock class={getColor(todo.effort)} />
	{/if}
</div>
