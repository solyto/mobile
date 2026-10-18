<script lang="ts">
	import { onMount } from 'svelte';
	import { getHoursOfDay, isOffHour } from '$lib/helpers/DateHelper';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { SwipeNavigate } from '$lib/helpers/SwipeNavigate.svelte';
	import CalendarWeekDay from '$lib/components/calendars/views/week/Day.svelte';
	import CalendarMarks from '$lib/components/calendars/CalendarMarks.svelte';

	const calendars = getCalendars();
	const hours = getHoursOfDay();
	const mobileRows = `minmax(4rem, auto) ${hours
		.map((hour) => (isOffHour(hour) ? '1.5rem' : '3.5rem'))
		.join(' ')}`;

	const swipe = new SwipeNavigate({
		onLeft: () => calendars.nextDay(),
		onRight: () => calendars.lastDay(),
		duration: 120
	});

	let contentEl: HTMLDivElement;
	onMount(() => swipe.setTarget(contentEl));
</script>

<div
	class="flex h-full w-full flex-col bg-c-bg dark:bg-s-dark"
	style="touch-action: pan-y;"
	{...swipe.handlers}
>
	<div class="flex overflow-y-auto">
		<div class="grid w-full self-start" style="grid-template-columns: 2rem 1fr; grid-template-rows: {mobileRows};">
			<div class="grid row-span-full bg-c-bg dark:bg-s-dark" style="grid-template-rows: subgrid;">
				<div class="flex items-center justify-center">
					<CalendarMarks
						date={calendars.currentDate}
						showJournal={calendars.journalMarksEnabled}
						showCheckIn={calendars.checkInMarksEnabled}
						size={20}
						class="flex flex-col"
					/>
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
			<div
				bind:this={contentEl}
				class="grid row-span-full border-1 border-c-neutral-1 bg-c-bg-surface shadow-lg dark:border-s-dark"
				style="grid-template-rows: subgrid; overflow-x: clip;"
			>
				<div
					class="grid row-span-full"
					style="grid-template-rows: subgrid; {swipe.style}"
				>
					<CalendarWeekDay date={calendars.currentDate} isMobile />
				</div>
			</div>
		</div>
	</div>
</div>
