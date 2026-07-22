<script lang="ts">
	import type { Todo, TodoStatus } from '$lib/types/todo';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import QuickSelectOverlay from '$lib/components/ui/QuickSelectOverlay.svelte';

	let { todo, changeStatus } = $props<{ todo: Todo; changeStatus: boolean }>();

	const todos = getTodos();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let statusMenuVisible = $state<boolean>(false);

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

	function getColor(status: TodoStatus): string {
		switch (status) {
			case 'pending':
			default:
				return 'border-2 border-c-neutral-2 dark:border-s-dark-3';
			case 'backlog':
				return 'border-2 border-c-neutral-2 dark:border-s-dark-3';
			case 'in-progress':
				return 'border-2 border-c-action';
			case 'waiting':
				return 'border-2 border-c-primary';
			case 'almost-done':
				return 'border-2 border-c-success';
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

<div class="relative">
	{#if changeStatus}
		<button
			type="button"
			class="cursor-pointer rounded-lg px-2 py-1 text-xs font-bold text-c-neutral-7 dark:text-white {getColor(todo.status)}"
			onclick={toggleStatusMenu}
		>
			{getLabel(todo.status)}
		</button>
		{#if statusMenuVisible}
			<QuickSelectOverlay
				onClose={() => (statusMenuVisible = false)}
				class="w-48 font-bold text-c-neutral-7 dark:text-white"
			>
				<button
					type="button"
					class="cursor-pointer text-left rounded-lg px-2 py-1 text-xs dark:text-white {getColor('backlog')}"
					onclick={() => handleStatusChange(todo, 'backlog')}
				>
					{getLabel('backlog')}
				</button>
				<button
					type="button"
					class="cursor-pointer text-left rounded-lg px-2 py-1 text-xs {getColor('pending')}"
					onclick={() => handleStatusChange(todo, 'pending')}
				>
					{getLabel('pending')}
				</button>
				<button
					type="button"
					class="cursor-pointer text-left rounded-lg px-2 py-1 text-xs {getColor('in-progress')}"
					onclick={() => handleStatusChange(todo, 'in-progress')}
				>
					{getLabel('in-progress')}
				</button>
				<button
					type="button"
					class="cursor-pointer text-left rounded-lg px-2 py-1 text-xs {getColor('waiting')}"
					onclick={() => handleStatusChange(todo, 'waiting')}
				>
					{getLabel('waiting')}
				</button>
				<button
					type="button"
					class="cursor-pointer text-left rounded-lg px-2 py-1 text-xs {getColor('almost-done')}"
					onclick={() => handleStatusChange(todo, 'almost-done')}
				>
					{getLabel('almost-done')}
				</button>
			</QuickSelectOverlay>
		{/if}
	{:else}
		<div class="rounded-lg px-2 py-1 text-xs {getColor(todo.status)}">
			{getLabel(todo.status)}
		</div>
	{/if}
</div>
