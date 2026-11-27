<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { blur } from 'svelte/transition';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TodoFilterService from '$lib/services/TodoFilterService';
	import TodoRelevanceService from '$lib/services/TodoRelevanceService';
	import TodoSortingService from '$lib/services/TodoSortingService';
	import WeatherWidget from '$lib/components/dashboard/widgets/WeatherWidget.svelte';
	import EventsTodayWidget from '$lib/components/dashboard/widgets/EventsTodayWidget.svelte';
	import DueTodosWidget from '$lib/components/dashboard/widgets/DueTodosWidget.svelte';
	import ScoredTodosWidget from '$lib/components/dashboard/widgets/ScoredTodosWidget.svelte';
	import UpcomingEventsWidget from '$lib/components/dashboard/widgets/UpcomingEventsWidget.svelte';
	import confetti from 'canvas-confetti';
	import { createConfettiOptions } from '$lib/effects/confetti';
	import { eventsNotStartingOn, eventsStartingOn } from '$lib/helpers/CalendarEventHelper';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getNavigation } from '$lib/state/Navigation.svelte';

	const RELEVANCE_THRESHOLD = 0.6;
	const MAX_SCORED_TODOS = 5;

	const todos = getTodos();
	const calendars = getCalendars();
	const auth = getAuth();
	const nav = getNavigation();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const filterService = new TodoFilterService();
	const relevanceService = new TodoRelevanceService();
	const sortingService = new TodoSortingService();

	const today = new Date();

	let todayEvents = $derived(eventsStartingOn(calendars.widgetEvents, today));
	let upcomingEvents = $derived(eventsNotStartingOn(calendars.widgetEvents, today));
	let dueTodos = $derived(filterService.filterByDueDate('today-overdue', todos.filteredTodos, auth.getWeekStart()));
	let scoredTodos = $derived.by(() => {
		const cloned = todos.filteredTodos.map((t) => ({ ...t }));
		const scored = sortingService.sortByScore(relevanceService.getScoredTodos(cloned));
		return scored.filter(isRelevantAndNotDue).slice(0, MAX_SCORED_TODOS);
	});

	function isRelevantAndNotDue(todo: Todo): boolean {
		return (todo.relevance ?? 0) > RELEVANCE_THRESHOLD && !dueTodos.some((due) => due.id === todo.id);
	}

	function isLoaded(): boolean {
		return todos.loaded || !nav.features.todos;
	}

	function hasNothingToday(): boolean {
		return todayEvents.length === 0 && visibleDueTodos().length === 0 && visibleScoredTodos().length === 0 && upcomingEvents.length === 0;
	}

	function visibleDueTodos(): Todo[] {
		return nav.features.todos ? dueTodos : [];
	}

	function visibleScoredTodos(): Todo[] {
		return nav.features.todos ? scoredTodos : [];
	}

	function hasWidgetAboveScoredTodos(): boolean {
		return todayEvents.length > 0 || visibleDueTodos().length > 0;
	}

	function hasWidgetAboveUpcomingEvents(): boolean {
		return hasWidgetAboveScoredTodos() || visibleScoredTodos().length > 0;
	}

	async function handleCheck(event: Event, todo: Todo): Promise<void> {
		loadingIndicator.start();
		const checkbox = event.target as HTMLInputElement;

		if (checkbox.checked) {
			const rect = checkbox.getBoundingClientRect();
			const x = (rect.left + rect.right) / 2 / window.innerWidth;
			const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
			confetti(createConfettiOptions({ x, y }, 'default'));
		}

		try {
			await todos.changeCompleted(todo, checkbox.checked);
			todo.is_completed = checkbox.checked;
		} finally {
			loadingIndicator.stop();
		}
	}
</script>

<div class="flex flex-col gap-12">
	<WeatherWidget {ts} {auth} />

	{#if isLoaded() && (nav.features.todos || nav.features.calendar)}
		<div in:blur>
			{#if todayEvents.length > 0}
				<EventsTodayWidget {todayEvents} {ts} />
			{/if}

			{#if visibleDueTodos().length > 0}
				<DueTodosWidget dueTodos={visibleDueTodos()} {handleCheck} {ts} mt={todayEvents.length > 0} />
			{/if}

			{#if visibleScoredTodos().length > 0}
				<ScoredTodosWidget scoredTodos={visibleScoredTodos()} {handleCheck} {ts} mt={hasWidgetAboveScoredTodos()} />
			{/if}

			{#if upcomingEvents.length > 0}
				<UpcomingEventsWidget {upcomingEvents} {ts} {auth} mt={hasWidgetAboveUpcomingEvents()} />
			{/if}

			{#if hasNothingToday()}
				<p class="text-sm text-c-neutral-4 dark:text-c-neutral-5">{ts.get.home.nothing_today}</p>
			{/if}
		</div>
	{/if}
</div>
