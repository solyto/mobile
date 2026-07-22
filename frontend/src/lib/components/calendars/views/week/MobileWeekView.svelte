<script lang="ts">
	import { onMount } from 'svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatDateWithoutYear, getCalendarWeek, getISODateInfo, isDateToday } from '$lib/helpers/DateHelper';
	import Day from '$lib/components/calendars/views/week/Day.svelte';

	const calendars = getCalendars();
	const ts = getTranslation();
	const hours = Array.from({ length: 24 }, (_, i) => i + 1).map((i) =>
		(i - 1).toString().padStart(2, '0')
	);

	let displayedWeek = $state(getCalendarWeek(calendars.currentYear, calendars.currentWeek));
	let prevYear = calendars.currentYear;
	let prevWeek = calendars.currentWeek;

	$effect(() => {
		const newYear = calendars.currentYear;
		const newWeek = calendars.currentWeek;
		if (newYear === prevYear && newWeek === prevWeek) return;
		prevYear = newYear;
		prevWeek = newWeek;
		displayedWeek = getCalendarWeek(newYear, newWeek);
	});

	onMount(() => {
		const iso = getISODateInfo(new Date());
		prevYear = iso.year;
		prevWeek = iso.week;
		calendars.currentYear = iso.year;
		calendars.currentWeek = iso.week;
		displayedWeek = getCalendarWeek(iso.year, iso.week);
	});

	function getWeekdayShort(date: Date): string {
		const weekday = date.getDay() || 7;
		return ts.get.calendar.weekdays_short[
			weekday as keyof typeof ts.get.calendar.weekdays_short
		];
	}
</script>

<div class="h-full w-full overflow-auto bg-c-bg dark:bg-s-dark">
	<div class="flex min-w-max flex-col pb-4">
		<!-- Header row: sticky to top -->
		<div class="sticky top-0 z-20 flex bg-c-bg dark:bg-s-dark">
			<div class="sticky left-0 z-30 w-8 flex-shrink-0 bg-c-bg dark:bg-s-dark"></div>
			{#each displayedWeek as day (day.date.getTime())}
				<div
					class="flex h-8 flex-shrink-0 items-center justify-center"
					style="min-width: calc((100vw - 2rem) / 3); max-width: calc((100vw - 2rem) / 3)"
				>
					<span
						class="rounded-full px-2 py-0.5 text-xs"
						class:bg-c-primary={isDateToday(day.date)}
						class:text-white={isDateToday(day.date)}
						class:font-bold={isDateToday(day.date)}
					>
						{getWeekdayShort(day.date)}
						{formatDateWithoutYear(day.date)}
					</span>
				</div>
			{/each}
		</div>

		<!-- Body: time gutter + day columns -->
		<div class="flex">
			<!-- Time gutter: sticky to left -->
			<div class="sticky left-0 z-10 flex w-8 flex-shrink-0 flex-col bg-c-bg dark:bg-s-dark">
				<div class="flex h-16 w-full flex-shrink-0 items-center justify-center">
					<span class="px-1 text-center text-xs">{ts.get.calendar.is_all_day}</span>
				</div>
				{#each hours as hour (hour)}
					{@const offHour = parseInt(hour) < 6 || parseInt(hour) >= 22}
					<div class="flex {offHour ? 'h-6' : 'h-14'} w-full flex-shrink-0 items-center justify-center">
						<span class="text-xs {offHour ? 'text-c-neutral-4 dark:text-s-dark-3' : ''}">{hour}</span>
					</div>
				{/each}
			</div>

			<!-- Day columns -->
			<div class="flex">
				{#each displayedWeek as day (day.date.getTime())}
					<div
						class="flex-shrink-0 overflow-hidden border-1 border-c-neutral-1 bg-c-bg-surface dark:border-s-dark"
						style="min-width: calc((100vw - 2rem) / 3); max-width: calc((100vw - 2rem) / 3)"
					>
						<Day date={day.date} fixedHeight />
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
