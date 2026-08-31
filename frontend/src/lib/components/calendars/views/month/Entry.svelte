<script lang="ts">
	import { blur } from 'svelte/transition';
	import { formatDate, formatTime } from '$lib/helpers/DateHelper';
	import type { CalendarEvent } from '$lib/types/calendar';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import {
		calendarDrag,
		consumeCalendarDragClick,
		createCalendarDragController,
		findCalendarDayElement,
		getCalendarEventKey,
		parseDateSlug
	} from '$lib/components/calendars/dnd/CalendarDragState.svelte';
	import type { CalendarDragTarget } from '$lib/components/calendars/dnd/CalendarDragState.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const calendars = getCalendars();
	const notifications = getUiNotifications();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let { item, date } = $props<{ item: CalendarEvent; date: Date }>();

	const dateSlug = $derived(formatDate(date));

	// --- drag & drop (month view is desktop-only) ---
	function computeTarget(x: number, y: number): CalendarDragTarget | null {
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

	async function commitMove(moved: CalendarEvent, target: CalendarDragTarget): Promise<void> {
		loadingIndicator.start();
		const ok = await calendars.moveEvent(moved, target);
		loadingIndicator.stop();
		if (!ok) {
			notifications.error(ts.get.calendar.entry_move_error);
		}
	}

	const drag = createCalendarDragController({
		enabled: () => true,
		sourceDateSlug: () => dateSlug,
		computeTarget,
		onDrop: commitMove
	});

	function isDragged(): boolean {
		return calendarDrag.active && calendarDrag.sourceKey === getCalendarEventKey(item);
	}

	async function onEntryClick(): Promise<void> {
		if (consumeCalendarDragClick()) return;
		await calendars.showSidebar(null, item);
	}
</script>

{#if !calendars.isCalendarHidden(parseInt(item.calendar_id))}
	<button
		class="flex w-full cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm transition-all select-none hover:bg-c-neutral max-md:text-xs dark:hover:bg-s-dark-3"
		style="border-color: {item.calendar_color ??
			'var(--color-c-neutral-2)'}; background-color: {item.calendar_color && item.is_all_day
			? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))`
			: ''};"
		class:!border-l-0={item.is_all_day && item.start_date < date}
		class:opacity-40={isDragged()}
		onclick={onEntryClick}
		onpointerdown={(e) => drag.onPointerDown(e, item)}
		onpointermove={drag.onPointerMove}
		onpointerup={drag.onPointerUp}
		onpointercancel={drag.onPointerCancel}
		transition:blur
	>
		{#if !item.is_all_day}
			<span class="mr-2">{formatTime(item.start_date)}</span>
		{/if}
		<span class="text-left">{item.title}</span>
	</button>
{/if}
