<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import type { CalendarEvent } from '$lib/types/calendar';
	import { blur } from 'svelte/transition';
	import { onMount } from 'svelte';
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
	import { getAuth } from '$lib/state/Auth.svelte';

	const todos = getTodos();
	const calendars = getCalendars();
	const auth = getAuth();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const filterService = new TodoFilterService();
	const relevanceService = new TodoRelevanceService();
	const sortingService = new TodoSortingService();

	const today = new Date();

	let allEvents = $state<CalendarEvent[]>([]);
	let todayEvents = $derived(
		allEvents
			.filter((e) => {
				const d = new Date(e.start_date);
				return (
					d.getDate() === today.getDate() &&
					d.getMonth() === today.getMonth() &&
					d.getFullYear() === today.getFullYear()
				);
			})
			.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
	);
	let upcomingEvents = $derived(
		allEvents
			.filter((e) => {
				const d = new Date(e.start_date);
				return (
					d.getDate() !== today.getDate() ||
					d.getMonth() !== today.getMonth() ||
					d.getFullYear() !== today.getFullYear()
				);
			})
			.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
	);
	let dueTodos = $derived(filterService.filterByDueDate('today-overdue', todos.filteredTodos));
	let scoredTodos = $state<Todo[]>([]);

	$effect(() => {
		const cloned = todos.filteredTodos.map((t) => ({ ...t }));
		const scored = sortingService.sortByScore(relevanceService.getScoredTodos(cloned));
		scoredTodos = scored
			.filter(
				(t) =>
					t.relevance !== null &&
					t.relevance !== undefined &&
					t.relevance > 0.6 &&
					!dueTodos.some((d) => d.id === t.id)
			)
			.slice(0, 5);
	});

	onMount(() => {
		calendars.getWidgetEvents().then((events) => {
			if (events) allEvents = events;
		});
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

<div class="flex flex-col gap-12">
	<WeatherWidget {ts} {auth} />

	{#if todos.loaded}
		<div in:blur>
			{#if todayEvents.length > 0}
				<EventsTodayWidget {todayEvents} {ts} />
			{/if}

			{#if dueTodos.length > 0}
				<DueTodosWidget {dueTodos} {handleCheck} {ts} mt={todayEvents.length > 0} />
			{/if}

			{#if scoredTodos.length > 0}
				<ScoredTodosWidget {scoredTodos} {handleCheck} {ts} mt={todayEvents.length > 0 || dueTodos.length > 0} />
			{/if}

			{#if upcomingEvents.length > 0}
				<UpcomingEventsWidget {upcomingEvents} {ts} {auth} mt={todayEvents.length > 0 || dueTodos.length > 0 || scoredTodos.length > 0} />
			{/if}

			{#if todayEvents.length === 0 && dueTodos.length === 0 && scoredTodos.length === 0 && upcomingEvents.length === 0}
				<p class="text-sm text-c-neutral-4 dark:text-c-neutral-5">{ts.get.home.nothing_today}</p>
			{/if}
		</div>
	{/if}
</div>