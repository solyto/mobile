<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import CalendarWeekDay from '$lib/components/calendars/views/week/Day.svelte';

	const calendars = getCalendars();
	const ts = getTranslation();
	const hours = Array.from({ length: 24 }, (_, i) => i + 1).map((i) =>
		(i - 1).toString().padStart(2, '0')
	);
</script>

<div class="flex h-full w-full dark:bg-s-dark" style="background-color: color-mix(in srgb, var(--color-c-primary) 12%, var(--color-c-bg));">
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
		<div
			class="flex h-full w-full flex-col border-1 border-c-neutral-1 bg-c-bg-surface shadow-lg dark:border-s-dark"
		>
			<CalendarWeekDay date={calendars.currentDate} />
		</div>
	</div>
</div>
