<script lang="ts">
	import { onMount } from 'svelte';
	import { getMobileHourRows } from '$lib/helpers/DateHelper';
	import MobileHourLabels from '$lib/components/calendars/views/MobileHourLabels.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { SwipeNavigate } from '$lib/helpers/SwipeNavigate.svelte';
	import CalendarWeekDay from '$lib/components/calendars/views/week/Day.svelte';
	import CalendarMarks from '$lib/components/calendars/CalendarMarks.svelte';

	const calendars = getCalendars();
	const mobileRows = `minmax(4rem, auto) ${getMobileHourRows()}`;

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
				<MobileHourLabels />
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
