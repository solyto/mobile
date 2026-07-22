<script lang="ts">
	import { blur } from 'svelte/transition';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { formatDate, formatTime, getNextXDays } from '$lib/helpers/DateHelper';
	import Day from '$lib/components/calendars/views/list/Day.svelte';

	const calendars = getCalendars();

	let days = $state<Date[]>(getNextXDays(30));
</script>

<div class="flex h-full w-full dark:bg-s-dark" style="background-color: color-mix(in srgb, var(--color-c-primary) 12%, var(--color-c-bg));">
	<div class="flex h-full w-8 flex-col pt-8 max-md:hidden"></div>
	<div class="flex h-full w-full flex-col">
		<div class="flex w-full">
			<div class="flex h-8 w-full items-center justify-center max-md:hidden"></div>
		</div>
		<div
			class="flex h-full w-full flex-col overflow-y-auto border-1 border-c-neutral-1 bg-c-bg-surface p-4 shadow-lg dark:border-s-dark"
		>
			{#each days as day (day.getTime())}
				<Day {day} />
			{/each}
		</div>
	</div>
</div>
