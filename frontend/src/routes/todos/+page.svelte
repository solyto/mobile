<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { onMount } from 'svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import confetti from 'canvas-confetti';
	import { createConfettiOptions } from '$lib/effects/confetti';
	import TodoCreate from '$lib/components/todos/actions/TodoCreate.svelte';
	import ViewSwitcher from '$lib/components/todos/views/ViewSwitcher.svelte';
	import KanbanView from '$lib/components/todos/views/KanbanView.svelte';
	import ListView from '$lib/components/todos/views/ListView.svelte';
	import CardView from '$lib/components/todos/views/CardView.svelte';
	import OverviewView from '$lib/components/todos/views/OverviewView.svelte';
	import Counter from '$lib/components/todos/Counter.svelte';
	import SortByScore from '$lib/components/todos/actions/SortByScore.svelte';
	import HideIt from '$lib/components/todos/actions/HideIt.svelte';
	import TodoNavigation from '$lib/components/todos/TodoNavigation.svelte';

	const viewPoint = getViewPoint();
	const todos = getTodos();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();

	let view = $derived(todos.view);

	onMount(async () => {
		if (!viewPoint.isDesktop) {
			todos.view = 'card';
		}

		loadingIndicator.start();
		await todos.load();
		loadingIndicator.stop();
		await Promise.all([tags.load()]);
	});

	async function handleCheck(event: Event, todo: Todo): Promise<void> {
		loadingIndicator.start();
		const checkbox = event.target as HTMLInputElement;

		if (checkbox.checked) {
			const rect = checkbox.getBoundingClientRect();
			const x = (rect.left + rect.right) / 2 / window.innerWidth;
			const y = (rect.top + rect.bottom) / 2 / window.innerHeight;

			confetti(createConfettiOptions({ x, y }, 'default'));
		}

		await todos.changeCompleted(todo, checkbox.checked);
		todo.is_completed = checkbox.checked;
		loadingIndicator.stop();
	}
</script>

<div class="flex h-full w-full flex-row">
	<TodoNavigation />
	<div class="relative max-h-full w-full overflow-y-auto p-4 lg:p-8">
		<ViewSwitcher />
		<TodoCreate />
		<div class="relative w-full px-1 pb-2">
			<div class="mb-4 flex w-full items-center gap-4">
				<SortByScore />
				<HideIt />
				<Counter todos={todos.filteredTodos} />
			</div>
		</div>
		{#if viewPoint.isDesktop}
			{#if view === 'list'}
				<ListView {handleCheck} />
			{:else if view === 'kanban'}
				<KanbanView {handleCheck} />
			{:else if view === 'overview'}
				<OverviewView {handleCheck} />
			{/if}
		{:else}
			{#if view === 'overview'}
				<OverviewView {handleCheck} />
			{:else if view === 'card'}
				<CardView {handleCheck} />
			{/if}
		{/if}
	</div>
</div>
