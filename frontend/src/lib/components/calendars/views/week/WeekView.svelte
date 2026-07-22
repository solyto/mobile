<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { formatDate, getCalendarWeek, getISODateInfo } from '$lib/helpers/DateHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Day from '$lib/components/calendars/views/week/Day.svelte';
	import { onMount } from 'svelte';

	const calendars = getCalendars();
	const ts = getTranslation();
	const hours = Array.from({ length: 24 }, (_, i) => i + 1).map((i) =>
		(i - 1).toString().padStart(2, '0')
	);

	let week = $derived(getCalendarWeek(calendars.currentYear, calendars.currentWeek));

	onMount(() => {
		const iso = getISODateInfo(new Date());
		calendars.currentYear = iso.year;
		calendars.currentWeek = iso.week;
	});
</script>

<div class="flex h-full w-full" style="background-color: color-mix(in srgb, var(--color-c-primary) 12%, var(--color-c-bg));">
	<div class="flex h-full w-8 flex-col pt-8">
		<div class="flex h-3/30 w-full items-center justify-center">
			<span class="px-1 text-center text-sm">{ts.get.calendar.is_all_day}</span>
		</div>
		{#each hours as hour (hour)}
			<div class="flex h-1/27 w-full items-center justify-center">
				<span class="text-sm">{hour}</span>
			</div>
		{/each}
	</div>
	<div class="flex h-full w-full flex-col">
		<div class="flex w-full">
			<div class="flex h-8 w-full">
				{#each week as day (day.date)}
					<div class="flex w-1/7 items-center justify-center">
						<span class="text-sm"
							>{ts.get.calendar.weekdays_short[day.weekday]}. {formatDate(
								day.date
							)}</span
						>
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
</div>
