<script lang="ts">
	import Day from '$lib/components/calendars/views/month/Day.svelte';
	import type { CalendarWeek } from '$lib/types/calendar';

	let { week } = $props<{ week: CalendarWeek }>();
</script>

<div class="relative flex h-1/6 w-full">
	{#each week.days as day (day.number)}
		<Day {day} />
	{/each}
</div>
