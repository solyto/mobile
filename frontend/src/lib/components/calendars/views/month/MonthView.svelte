<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import Week from '$lib/components/calendars/views/month/Week.svelte';
	import CalendarDragGhost from '$lib/components/calendars/dnd/CalendarDragGhost.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getWeekdayOrder } from '$lib/helpers/DateHelper';
	import type { WeekStart } from '$lib/types/auth';

	let { weekStart }: { weekStart: WeekStart } = $props();

	const calendars = getCalendars();
	const weekdays = getWeekdayOrder(weekStart);
	const ts = getTranslation();
</script>

<div class="calendar-view flex h-full w-full dark:bg-s-dark">
	<div class="flex h-full w-8 flex-col pt-8 max-sm:hidden">
		{#each calendars.month.weeks as week (week.number)}
			<div class="flex h-1/6 w-full items-center justify-center">
				<span class="text-sm">{week.number}</span>
			</div>
		{/each}
	</div>
	<div class="flex h-full w-full flex-col">
		<div class="flex w-full">
			<div class="flex h-8 w-full">
				{#each weekdays as day (day)}
					<div class="flex w-1/7 items-center justify-center">
						<span class="text-sm max-md:text-xs"
							>{ts.get.calendar.weekdays_short[day]}.</span
						>
					</div>
				{/each}
			</div>
		</div>
		<div class="h-full w-full shadow-lg">
			{#each calendars.month.weeks as week (week.number)}
				<Week {week} />
			{/each}
		</div>
	</div>
	<CalendarDragGhost />
</div>
