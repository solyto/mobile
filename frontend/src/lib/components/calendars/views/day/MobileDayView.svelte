<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { SwipeNavigate } from '$lib/helpers/SwipeNavigate.svelte';
	import CalendarWeekDay from '$lib/components/calendars/views/week/Day.svelte';

	const calendars = getCalendars();
	const ts = getTranslation();
	const hours = Array.from({ length: 24 }, (_, i) => i + 1).map((i) =>
		(i - 1).toString().padStart(2, '0')
	);

	const swipe = new SwipeNavigate({
		onLeft: () => calendars.nextDay(),
		onRight: () => calendars.lastDay(),
		duration: 120
	});

	let contentEl: HTMLDivElement;
	$effect(() => { if (contentEl) swipe.setTarget(contentEl); });
</script>

<div
	class="flex h-full w-full flex-col bg-c-bg dark:bg-s-dark"
	style="touch-action: pan-y;"
	{...swipe.handlers}
>
	<div class="flex flex-1 overflow-y-auto">
		<!-- hour label gutter -->
		<div class="flex w-8 flex-shrink-0 flex-col">
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

		<!-- animated day content -->
		<div class="min-w-0 flex-1" style="overflow-x: clip">
			<div
				bind:this={contentEl}
				class="flex w-full flex-col"
				style={swipe.style}
			>
				<div
					class="flex w-full flex-col border-1 border-c-neutral-1 bg-c-bg-surface dark:border-s-dark"
				>
					<CalendarWeekDay date={calendars.currentDate} fixedHeight />
				</div>
			</div>
		</div>
	</div>
</div>
