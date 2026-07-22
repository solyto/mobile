<script lang="ts">
	import { blur } from 'svelte/transition';
	import { formatDate, formatTime } from '$lib/helpers/DateHelper';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import TodoEntry from '$lib/components/calendars/TodoEntry.svelte';

	let { day } = $props<{ day: Date }>();

	const calendars = getCalendars();

	let allDayEvents = $derived(calendars.getAllDayEventsForDate(day));
	let nonAllDayEvents = $derived(calendars.getNonAllDayEventsForDate(day));
</script>

{#if allDayEvents.length > 0 || nonAllDayEvents.length > 0}
	<div class="my-2 flex w-full flex-col gap-2">
		<span class="text-xl font-bold text-c-heading dark:text-c-primary">{formatDate(day)}</span>
		{#each calendars.getTodosForDate(day) as todo (todo.id)}
			<TodoEntry {todo} checkboxRight={false} />
		{/each}

		{#each allDayEvents as item (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
			{#if !calendars.isCalendarHidden(item.calendar_id)}
				<button
					class="flex w-full cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
					style="border-color: {item.calendar_color ?? 'var(--color-c-neutral-2)'}; background-color: {item.calendar_color && item.is_all_day ? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))` : ''};"
					onclick={async () => {
						await calendars.showSidebar(null, item);
					}}
					transition:blur
				>
					{#if !item.is_all_day}
						<span class="mr-2">{formatTime(item.start_date)}</span>
					{/if}
					<span class="text-left">{item.title}</span>
				</button>
			{/if}
		{/each}
		{#each nonAllDayEvents as item (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
			{#if !calendars.isCalendarHidden(item.calendar_id)}
				<button
					class="flex w-full cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
					style="border-color: {item.calendar_color ?? 'var(--color-c-neutral-2)'}; background-color: {item.calendar_color && item.is_all_day ? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))` : ''};"

					onclick={async () => {
						await calendars.showSidebar(null, item);
					}}
					transition:blur
				>
					{#if !item.is_all_day}
						<span class="mr-2">{formatTime(item.start_date)}</span>
					{/if}
					<span class="text-left">{item.title}</span>
				</button>
			{/if}
		{/each}
	</div>
{/if}
