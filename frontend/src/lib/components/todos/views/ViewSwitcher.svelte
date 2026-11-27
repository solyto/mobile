<script lang="ts">
	import { getTodos } from '$lib/state/Todos.svelte';
	import type { TodoView } from '$lib/types/todo';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ViewSwitcher from '$lib/components/ui/ViewSwitcher.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import { TODO_VIEWS_DESKTOP, TODO_VIEWS_MOBILE } from '$lib/helpers/TodoHelper';

	const todos = getTodos();
	const ts = getTranslation();
	const viewPoint = getViewPoint();

	const titles: Record<TodoView, string> = {
		list: ts.get.todos.view_list,
		grouped: ts.get.todos.view_grouped,
		kanban: ts.get.todos.view_kanban,
		overview: ts.get.todos.view_overview,
		card: ts.get.todos.view_card
	};

	const views = (viewPoint.isDesktop ? TODO_VIEWS_DESKTOP : TODO_VIEWS_MOBILE).map((type) => ({
		type,
		title: titles[type]
	}));

	function changeView(type: string): void {
		todos.changeView(type as TodoView);
	}
</script>

<div class="todo-view-switcher absolute top-7 left-20 2xl:top-10 2xl:left-8 z-30 2xl:block">
	{#if !todos.quickCreateOpen}
		<div class="transition-opacity duration-150 ease-in-out">
			<ViewSwitcher {views} currentlySelected={todos.view} onChange={changeView} />
		</div>
	{/if}
</div>
