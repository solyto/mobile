<script lang="ts">
	import { onMount } from 'svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatDateWithoutYear, getCalendarWeek, isDateToday, getHoursOfDay, isOffHour } from '$lib/helpers/DateHelper';
	import Day from '$lib/components/calendars/views/week/Day.svelte';

	const calendars = getCalendars();
	const ts = getTranslation();
	const hours = getHoursOfDay();
	const mobileRows = `minmax(4rem, auto) ${hours
		.map((hour) => (isOffHour(hour) ? '1.5rem' : '3.5rem'))
		.join(' ')}`;

	const columnWidth = 'calc((100vw - 2rem) / 3)';

	let week = $derived(getCalendarWeek(calendars.currentWeekStart));

	onMount(() => calendars.goToCurrentWeek());
</script>

<div class="h-full w-full overflow-auto bg-c-bg dark:bg-s-dark">
	<div class="flex min-w-max flex-col pb-4">
		<div class="sticky top-0 z-20 flex bg-c-bg dark:bg-s-dark">
			<div class="sticky left-0 z-30 w-8 flex-shrink-0 bg-c-bg dark:bg-s-dark"></div>
			{#each week as day (day.date.getTime())}
				<div
					class="flex h-8 flex-shrink-0 items-center justify-center"
					style="
						min-width: {columnWidth};
						max-width: {columnWidth};
					"
				>
					<span
						class="rounded-full px-2 py-0.5 text-xs"
						class:bg-c-primary={isDateToday(day.date)}
						class:text-white={isDateToday(day.date)}
						class:font-bold={isDateToday(day.date)}
					>
						{ts.get.calendar.weekdays_short[day.weekday]}
						{formatDateWithoutYear(day.date)}
					</span>
				</div>
			{/each}
		</div>

		<div
			class="grid"
			style="
				grid-template-columns: 2rem repeat(7, {columnWidth});
				grid-template-rows: {mobileRows};
			"
		>
			<div
				class="sticky left-0 z-10 grid row-span-full bg-c-bg dark:bg-s-dark"
				style="grid-template-rows: subgrid;"
			>
				<div class="flex items-center justify-center">
				</div>
				{#each hours as hour (hour)}
					<div class="flex items-center justify-center">
						<span
							class="text-xs"
							class:text-c-neutral-4={isOffHour(hour)}
							class:dark:text-s-dark-3={isOffHour(hour)}
						>
							{hour}
						</span>
					</div>
				{/each}
			</div>

			{#each week as day (day.date.getTime())}
				<div
					class="grid row-span-full overflow-hidden border-1 border-c-neutral-1 bg-c-bg-surface dark:border-s-dark"
					style="grid-template-rows: subgrid;"
				>
					<Day date={day.date} isMobile />
				</div>
			{/each}
		</div>
	</div>
</div>
