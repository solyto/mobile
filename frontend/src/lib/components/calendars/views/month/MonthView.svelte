<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import Week from '$lib/components/calendars/views/month/Week.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const calendars = getCalendars();
	const weekdays = Array.from({ length: 7 }, (_, i) => i + 1);
	const ts = getTranslation();
</script>

<div class="flex h-full w-full dark:bg-s-dark" style="background-color: color-mix(in srgb, var(--color-c-primary) 12%, var(--color-c-bg));">
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
</div>
