<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { formatDate, getCalendarWeek, getISODateInfo, getHoursOfDay } from '$lib/helpers/DateHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Day from '$lib/components/calendars/views/week/Day.svelte';
	import CalendarMarks from '$lib/components/calendars/CalendarMarks.svelte';
	import CalendarDragGhost from '$lib/components/calendars/dnd/CalendarDragGhost.svelte';
	import { onMount } from 'svelte';

	const calendars = getCalendars();
	const ts = getTranslation();
	const hours = getHoursOfDay();
	const rows = '10% repeat(24, calc(100% / 27))';

	let week = $derived(getCalendarWeek(calendars.currentWeekYear, calendars.currentWeek));

	onMount(() => {
		const iso = getISODateInfo(new Date());
		calendars.currentWeekYear = iso.year;
		calendars.currentWeek = iso.week;
	});
</script>

<div class="calendar-view flex h-full w-full" style="background-color: color-mix(in srgb, var(--color-c-primary) 12%, var(--color-c-bg));">
	<div class="grid h-full w-8 pt-8" style="grid-template-rows: {rows};">
		<div class="flex items-center justify-center">
			
		</div>
		{#each hours as hour (hour)}
			<div class="flex items-center justify-center">
				<span class="text-sm">{hour}</span>
			</div>
		{/each}
	</div>
	<div class="flex h-full w-full flex-col">
		<div class="flex w-full">
			<div class="flex h-8 w-full">
				{#each week as day (day.date)}
					<div class="flex w-1/7 items-center justify-center relative">
						<span class="text-sm">
							{ts.get.calendar.weekdays_short[day.weekday]}. {formatDate(day.date)}
						</span>
						<CalendarMarks
							date={day.date}
							showJournal={calendars.journalMarksEnabled}
							showCheckIn={calendars.checkInMarksEnabled}
							class="absolute right-2"
						/>
					</div>
				{/each}
			</div>
		</div>
		<div class="flex h-full w-full shadow-lg">
			{#each week as day (day.date)}
				<div
					class="flex w-1/7 flex-col border-1 border-c-neutral-1 bg-c-bg-surface dark:border-s-dark"
				>
					<Day date={day.date} />
				</div>
			{/each}
		</div>
	</div>
	<CalendarDragGhost />
</div>
