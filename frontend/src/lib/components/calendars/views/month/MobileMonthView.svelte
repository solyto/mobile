<script lang="ts">
	import { blur } from 'svelte/transition';
	import IconPlus from '@lucide/svelte/icons/plus';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { isDateToday, formatDate, formatTime } from '$lib/helpers/DateHelper';
	import { SwipeNavigate } from '$lib/helpers/SwipeNavigate.svelte';
	import TodoEntry from '$lib/components/calendars/TodoEntry.svelte';

	const calendars = getCalendars();
	const ts = getTranslation();
	const weekdays = Array.from({ length: 7 }, (_, i) => i + 1);

	let selectedDate = $derived(calendars.mobileSelectedDate);
	let allDayEvents = $derived(calendars.getAllDayEventsForDate(selectedDate));
	let nonAllDayEvents = $derived(calendars.getNonAllDayEventsForDate(selectedDate));
	let todos = $derived(calendars.getTodosForDate(selectedDate));
	let hasEvents = $derived(
		allDayEvents.length > 0 || nonAllDayEvents.length > 0 || todos.length > 0
	);

	const swipe = new SwipeNavigate({
		onLeft: () => calendars.nextMonth(),
		onRight: () => calendars.lastMonth()
	});

	let contentEl: HTMLDivElement;
	$effect(() => { if (contentEl) swipe.setTarget(contentEl); });

	function isSelected(date: Date): boolean {
		return formatDate(date) === formatDate(selectedDate);
	}

	function hasEventsOnDate(date: Date): boolean {
		const events = calendars.getEventsForDate(date);
		const dateTodos = calendars.getTodosForDate(date);
		return events.length > 0 || dateTodos.length > 0;
	}

	function getEventDots(date: Date): string[] {
		const events = calendars.getEventsForDate(date);
		const colors: string[] = [];
		for (const event of events) {
			if (
				!calendars.isCalendarHidden(event.calendar_id) &&
				event.calendar_color &&
				!colors.includes(event.calendar_color)
			) {
				colors.push(event.calendar_color);
			}
			if (colors.length >= 3) break;
		}
		return colors;
	}

	function selectDay(date: Date): void {
		calendars.selectMobileDate(date);
	}
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-c-bg dark:bg-s-dark">
	<div
		class="w-full flex-shrink-0"
		style="touch-action: pan-y;"
		{...swipe.handlers}
	>
		<div
			class="grid w-full grid-cols-7 border-b border-c-neutral-1 bg-c-bg-surface dark:border-s-dark"
		>
			{#each weekdays as day (day)}
				<div class="flex items-center justify-center py-1">
					<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4"
						>{ts.get.calendar.weekdays_short[day]}.</span
					>
				</div>
			{/each}
		</div>
		<div class="w-full overflow-hidden bg-c-bg-surface">
			<div
				bind:this={contentEl}
				class="w-full"
				style={swipe.style}
			>
				{#each calendars.month.weeks as week (week.number)}
					<div class="grid grid-cols-7">
						{#each week.days as day (day.date.getTime())}
							<button
								class="relative flex cursor-pointer flex-col items-center py-1 transition-all"
								class:opacity-40={day.is_grayed_out}
								onclick={() => selectDay(day.date)}
							>
								<div
									class="flex size-8 items-center justify-center rounded-full text-sm transition-all"
									class:bg-c-primary={isDateToday(day.date) && !isSelected(day.date)}
									class:text-white={isDateToday(day.date)}
									class:bg-c-heading={isSelected(day.date)}
									class:dark:bg-c-primary={isSelected(day.date)}
									class:!text-white={isSelected(day.date)}
									class:font-bold={isDateToday(day.date) || isSelected(day.date)}
								>
									{day.number}
								</div>
								<div class="mt-0.5 flex h-1.5 gap-0.5">
									{#each getEventDots(day.date) as color (color)}
										<div
											class="size-1.5 rounded-full"
											style="background-color: {color};"
										></div>
									{/each}
									{#if !getEventDots(day.date).length && hasEventsOnDate(day.date)}
										<div class="size-1.5 rounded-full bg-c-neutral-4"></div>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div
		class="flex-1 overflow-y-auto border-t border-c-neutral-2 bg-c-bg-surface dark:border-s-dark"
	>
		<div
			class="sticky top-0 z-10 flex items-center justify-between border-b border-c-neutral-1 bg-white px-4 py-2 dark:border-s-dark dark:bg-s-dark-2"
		>
			<span class="text-sm font-bold text-c-heading dark:text-c-primary">
				{formatDate(selectedDate)}
			</span>
			<button
				class="cursor-pointer rounded-full p-2 transition-all hover:bg-c-primary hover:text-white"
				onclick={async () => await calendars.showSidebar(selectedDate)}
			>
				<IconPlus class="size-4" />
			</button>
		</div>
		{#if hasEvents}
			<div class="flex flex-col px-2">
				{#each allDayEvents as item (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
					{#if !calendars.isCalendarHidden(item.calendar_id)}
						<button
							class="my-0.5 flex w-full cursor-pointer items-center justify-start border-l-4 px-3 py-2.5 text-sm transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
							style="border-color: {item.calendar_color ?? 'var(--color-c-neutral-2)'}; background-color: {item.calendar_color ? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))` : ''};"
							onclick={async () => await calendars.showSidebar(null, item)}
							transition:blur
						>
							<span class="text-left">{item.title}</span>
						</button>
					{/if}
				{/each}
				{#each todos as todo (todo.id)}
					<TodoEntry {todo} />
				{/each}
				{#each nonAllDayEvents as item (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
					{#if !calendars.isCalendarHidden(item.calendar_id)}
						<button
							class="my-0.5 flex w-full cursor-pointer items-center justify-start border-l-4 px-3 py-2.5 text-sm transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
							style="border-color: {item.calendar_color ?? 'var(--color-c-neutral-2)'}; background-color: {item.calendar_color ? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))` : ''};"
							onclick={async () => await calendars.showSidebar(null, item)}
							transition:blur
						>
							<span class="mr-3 font-medium text-c-heading dark:text-c-primary"
								>{formatTime(item.start_date)}</span
							>
							<span class="text-left">{item.title}</span>
						</button>
					{/if}
				{/each}
			</div>
		{:else}
			<div
				class="flex items-center justify-center py-8 text-sm text-c-neutral-4 dark:text-c-neutral-5"
			>
				{ts.get.calendar.no_events}
			</div>
		{/if}
	</div>
</div>
