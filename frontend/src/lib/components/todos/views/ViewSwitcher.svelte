<script lang="ts">
	import { getTodos } from '$lib/state/Todos.svelte';
	import type { TodoView } from '$lib/types/todo';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ViewSwitcher from '$lib/components/ui/ViewSwitcher.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';

	const todos = getTodos();
	const ts = getTranslation();

	let quickCreateOpen = $derived(todos.quickCreateOpen);


	const viewPoint = getViewPoint();

	const viewsDesktop = [
		{ type: 'list' as const, title: ts.get.todos.view_list },
		{ type: 'grouped' as const, title: ts.get.todos.view_grouped },
		{ type: 'kanban' as const, title: ts.get.todos.view_kanban },
		{ type: 'overview' as const, title: ts.get.todos.view_overview }
	];

	const viewsMobile = [
		{ type: 'card' as const, title: ts.get.todos.view_card },
		{ type: 'grouped' as const, title: ts.get.todos.view_grouped },
		{ type: 'overview' as const, title: ts.get.todos.view_overview }
	];

	const views = viewPoint.isDesktop ? viewsDesktop : viewsMobile;
</script>

<div
	class="absolute top-7 left-20 2xl:top-10 2xl:left-8 z-30 2xl:block"
>
	{#if !quickCreateOpen}
		<div class="transition-opacity duration-150 ease-in-out">
			<ViewSwitcher
				views={views}
				currentlySelected={todos.view}
				onChange={(type) => todos.changeView(type as TodoView)}
			/>
		</div>
	{/if}
</div>
