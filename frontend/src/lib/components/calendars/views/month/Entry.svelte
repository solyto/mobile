<script lang="ts">
	import { blur } from 'svelte/transition';
	import { formatTime } from '$lib/helpers/DateHelper';
	import type { CalendarEvent } from '$lib/types/calendar';
	import { getCalendars } from '$lib/state/Calendars.svelte';

	const calendars = getCalendars();

	let { item, date } = $props<{ item: CalendarEvent; date: Date }>();
</script>

{#if !calendars.isCalendarHidden(parseInt(item.calendar_id))}
	<button
		class="flex w-full cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm transition-all hover:bg-c-neutral max-md:text-xs dark:hover:bg-s-dark-3"
		style="border-color: {item.calendar_color ?? 'var(--color-c-neutral-2)'}; background-color: {item.calendar_color && item.is_all_day ? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))` : ''};"
		class:!border-l-0={item.is_all_day && item.start_date < date}
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
