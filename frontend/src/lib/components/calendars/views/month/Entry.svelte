<script lang="ts">
	import { blur } from 'svelte/transition';
	import { formatDate, formatTime, parseDateSlug } from '$lib/helpers/DateHelper';
	import { getEventBackgroundColor, getEventBorderColor } from '$lib/helpers/ColorHelper';
	import type { CalendarEvent } from '$lib/types/calendar';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getCalendarDrag } from '$lib/state/CalendarDrag.svelte';
	import type { CalendarDropTarget } from '$lib/services/CalendarDragService';
	import { createDraggableEvent, findCalendarDayElement } from '$lib/helpers/CalendarDragHelper';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const calendars = getCalendars();
	const notifications = getUiNotifications();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const drag = getCalendarDrag();

	let { item, date }: { item: CalendarEvent; date: Date } = $props();

	const dateSlug = $derived(formatDate(date));

	function computeTarget(x: number, y: number): CalendarDropTarget | null {
		const cell = findCalendarDayElement(x, y);
		if (!cell) return null;
		// Grayed-out days belong to the adjacent month; drops there are rejected.
		if (cell.dataset.grayed === 'true') return null;
		const targetDate = parseDateSlug(cell.dataset.calendarDay ?? '');
		if (!targetDate) return null;
		return {
			date: targetDate,
			hour: item.start_date.getHours(),
			minute: item.start_date.getMinutes()
		};
	}

	async function commitMove(moved: CalendarEvent, target: CalendarDropTarget): Promise<void> {
		loadingIndicator.start();
		const ok = await calendars.moveEvent(moved, target);
		loadingIndicator.stop();
		if (!ok) {
			notifications.error(ts.get.calendar.entry_move_error);
		}
	}

	const draggableEvent = createDraggableEvent(drag, {
		enabled: () => true,
		sourceDateSlug: () => dateSlug,
		computeTarget,
		onDrop: commitMove
	});

	async function onEntryClick(): Promise<void> {
		if (drag.consumeClick()) return;
		await calendars.showSidebar(null, item);
	}
</script>

{#if !calendars.isCalendarHidden(item.calendar_id)}
	<button
		class="flex w-full cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm transition-all select-none hover:bg-c-neutral max-md:text-xs dark:hover:bg-s-dark-3"
		style="
			border-color: {getEventBorderColor(item.calendar_color)};
			background-color: {item.is_all_day ? getEventBackgroundColor(item.calendar_color) : ''};
		"
		class:!border-l-0={item.is_all_day && item.start_date < date}
		class:opacity-40={drag.isDragged(item)}
		onclick={onEntryClick}
		use:draggableEvent={item}
		transition:blur
	>
		{#if !item.is_all_day}
			<span class="mr-2">{formatTime(item.start_date)}</span>
		{/if}
		<span class="text-left">{item.title}</span>
	</button>
{/if}
