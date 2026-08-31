<script lang="ts">
	import IconPlus from '@lucide/svelte/icons/plus';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import Entry from '$lib/components/calendars/views/month/Entry.svelte';
	import { formatDate, isDateToday } from '$lib/helpers/DateHelper';
	import type { CalendarDay } from '$lib/types/calendar';
	import TodoEntry from '$lib/components/calendars/TodoEntry.svelte';
	import CalendarDragGhost from '$lib/components/calendars/dnd/CalendarDragGhost.svelte';
	import { calendarDrag } from '$lib/components/calendars/dnd/CalendarDragState.svelte';

	const calendars = getCalendars();

	let { day } = $props<{ day: CalendarDay }>();

	const dateSlug = $derived(formatDate(day.date));
	const isDropTargetCell = $derived(
		calendarDrag.active && calendarDrag.target !== null
			? formatDate(calendarDrag.target.date) === dateSlug
			: false
	);
</script>

<div
	class="group relative flex w-1/7 flex-col overflow-y-auto border-1 border-c-neutral-1 dark:border-s-dark"
	class:bg-c-neutral={day.is_grayed_out}
	class:bg-c-bg-surface={!day.is_grayed_out}
	class:dark:bg-s-dark={day.is_grayed_out}
	data-calendar-day={dateSlug}
	data-grayed={day.is_grayed_out ? 'true' : 'false'}
>
	<div class="flex w-full flex-col items-start justify-start">
		<div class="flex w-full items-start justify-between">
			<div
				class="flex w-8 justify-center rounded-br-lg border-r-1 border-b-1 border-c-neutral-1 bg-c-neutral px-2 py-1 text-sm font-bold max-md:text-xs dark:border-s-dark dark:bg-s-dark-3"
				class:!bg-c-primary={isDateToday(day.date)}
				class:text-white={isDateToday(day.date)}
			>
				{day.number}
			</div>
			<button
				onclick={async () => {
					await calendars.showSidebar(day.date);
				}}
				class="mt-1 mr-1 cursor-pointer rounded-full p-2 font-bold opacity-0 transition-all group-hover:opacity-100 hover:bg-c-btn hover:text-white
			"
			>
				<IconPlus class="size-3" />
			</button>
		</div>
		<div class="mt-1 w-full">
			{#each calendars.getTodosForDate(day.date) as todo (todo.id)}
				<TodoEntry {todo} />
			{/each}
			{#each calendars.getAllDayEventsForDate(day.date) as item (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
				<Entry {item} date={day.date} />
			{/each}
			{#each calendars.getNonAllDayEventsForDate(day.date) as item (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
				<Entry {item} date={day.date} />
			{/each}
		</div>
	</div>
	{#if isDropTargetCell}
		<div
			class="pointer-events-none absolute inset-0 z-30 border-2 border-dashed border-c-action bg-d-lightblue/60"
		></div>
	{/if}
	<CalendarDragGhost sourceDateSlug={dateSlug} />
</div>
