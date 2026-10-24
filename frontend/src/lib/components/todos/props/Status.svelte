<script lang="ts">
	import type { Todo, TodoStatus } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import QuickSelectOverlay from '$lib/components/ui/QuickSelectOverlay.svelte';

	let { todo, changeStatus, portal = false }: {
		todo: Todo;
		changeStatus: boolean;
		portal?: boolean;
	} = $props();

	const todos = getTodos();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	const statuses: TodoStatus[] = ['backlog', 'pending', 'in-progress', 'waiting', 'almost-done'];

	let statusMenuVisible = $state<boolean>(false);
	let trigger = $state<HTMLDivElement | null>(null);

	function toggleStatusMenu(): void {
		statusMenuVisible = !statusMenuVisible;
	}

	async function handleStatusChange(todo: Todo, status: TodoStatus): Promise<void> {
		loadingIndicator.start();
		await todos.changeStatus(todo.id, status);
		await todos.load();

		toggleStatusMenu();
		loadingIndicator.stop();
	}

	function getDotColor(status: TodoStatus): string {
		switch (status) {
			case 'pending':
			case 'backlog':
			default:
				return 'bg-c-neutral-4';
			case 'in-progress':
				return 'bg-c-action';
			case 'waiting':
				return 'bg-c-primary';
			case 'almost-done':
				return 'bg-c-success';
		}
	}

	function getLabel(status: TodoStatus): string {
		switch (status) {
			case 'pending':
			default:
				return ts.get.todos.status_pending;
			case 'backlog':
				return ts.get.todos.status_backlog;
			case 'in-progress':
				return ts.get.todos.status_in_progress;
			case 'waiting':
				return ts.get.todos.status_waiting;
			case 'almost-done':
				return ts.get.todos.status_almost_done;
		}
	}
</script>

{#snippet label(status: TodoStatus)}
	<span class="size-2 shrink-0 rounded-full {getDotColor(status)}"></span>
	{getLabel(status)}
{/snippet}

<div bind:this={trigger} class="relative">
	{#if changeStatus}
		<button
			type="button"
			class="flex cursor-pointer items-center gap-1.5 2xl:gap-2 text-sm transition-all hover:opacity-80"
			onclick={toggleStatusMenu}
		>
			{@render label(todo.status)}
		</button>
		{#if statusMenuVisible}
			<QuickSelectOverlay
				onClose={() => (statusMenuVisible = false)}
				class="w-48 text-c-neutral-7 dark:text-white"
				{portal}
				target={trigger}
			>
				<div class="flex flex-col">
					{#each statuses as status (status)}
						<button
							type="button"
							class="flex cursor-pointer items-center gap-1.5 2xl:gap-2 rounded-lg px-2 py-1 text-left text-sm hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
							onclick={() => handleStatusChange(todo, status)}
						>
							{@render label(status)}
						</button>
					{/each}
				</div>
			</QuickSelectOverlay>
		{/if}
	{:else}
		<div class="flex items-center gap-1.5 2xl:gap-2 text-sm">
			{@render label(todo.status)}
		</div>
	{/if}
</div>
