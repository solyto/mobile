<script lang="ts">
	import { blur } from 'svelte/transition';
	import IconPlus from '$lib/icons/lucide/plus.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { formatDate, getDateDiffInMinutes, getHoursOfDay, getMobileTimeOffsetRem, isOffHour, parseDateSlug } from '$lib/helpers/DateHelper';
	import { getEventBackgroundColor, getEventBorderColor } from '$lib/helpers/ColorHelper';
	import type { CalendarEvent } from '$lib/types/calendar';
	import type { ClassValue } from 'svelte/elements';
	import TodoEntry from '$lib/components/calendars/TodoEntry.svelte';
	import CalendarDragService from '$lib/services/CalendarDragService';
	import { getCalendarDrag } from '$lib/state/CalendarDrag.svelte';
	import type { CalendarDropTarget } from '$lib/services/CalendarDragService';
	import { createDraggableEvent, findCalendarDayElement } from '$lib/helpers/CalendarDragHelper';
	import { getCalendarEventKey, isDraggableOnDate, moveErrorMessage } from '$lib/helpers/CalendarEventHelper';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const calendars = getCalendars();
	const notifications = getUiNotifications();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const drag = getCalendarDrag();
	const dragService = new CalendarDragService();
	const hours = getHoursOfDay();
	const desktopRows = '10% repeat(24, calc(100% / 27))';
	const ALL_DAY_ROW_SHARE = 3 / 30;
	const HOUR_ROW_SHARE = 1 / 27;
	const MIN_EVENT_ROW_SHARE = 0.65;
	const MIN_EVENT_HEIGHT = `${MIN_EVENT_ROW_SHARE * 100}%`;

	let { date, isMobile = false }: { date: Date; isMobile?: boolean } = $props();

	const dragEnabled = !isMobile;
	const dateSlug = $derived(formatDate(date));
	const isDropTargetColumn = $derived(
		dragEnabled && drag.active && drag.target !== null
			? formatDate(drag.target.date) === dateSlug
			: false
	);
	let entries = $derived(calendars.getEventsForDate(date));
	let entriesByHour = $derived(
		hours.map((hour) => ({
			hour: parseInt(hour),
			entries: entries.filter(
				(entry) => !entry.is_all_day && segmentOnThisDay(entry).start.getHours() === parseInt(hour)
			)
		}))
	);

	function isShadedHour(hour: string): boolean {
		return isMobile && isOffHour(hour);
	}

	function segmentOnThisDay(entry: CalendarEvent): { start: Date; end: Date } {
		const dayStart = new Date(date);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(dayStart);
		dayEnd.setDate(dayEnd.getDate() + 1);

		return {
			start: entry.start_date > dayStart ? entry.start_date : dayStart,
			end: entry.end_date < dayEnd ? entry.end_date : dayEnd
		};
	}

	// Percentages resolve against the hour row's inner height, which excludes its 1px border-t,
	// so one hour of grid spacing is 100% + 1px.
	function hoursToRowSpan(hours: number): string {
		return `calc(${hours} * (100% + 1px))`;
	}

	function getTop(entry: CalendarEvent): string {
		const minutes = segmentOnThisDay(entry).start.getMinutes();

		if (minutes === 0) {
			return '0';
		}

		return hoursToRowSpan(minutes / 60);
	}

	function getHeight(entry: CalendarEvent): string {
		if (!entry.end_date) {
			return MIN_EVENT_HEIGHT;
		}

		const segment = segmentOnThisDay(entry);
		const hours = getDateDiffInMinutes(segment.start, segment.end) / 60;

		if (hours <= MIN_EVENT_ROW_SHARE) {
			return MIN_EVENT_HEIGHT;
		}

		return isMobile ? getMobileHeight(segment) : hoursToRowSpan(hours);
	}

	// Mobile hour rows have different heights (off hours are compressed), so a multiple of the
	// start row's height is wrong there. Measure the actual rows between start and end instead.
	function getMobileHeight(segment: { start: Date; end: Date }): string {
		const start = toHourOfDay(segment.start);
		const end = toHourOfDay(segment.end);

		return `${getMobileTimeOffsetRem(end) - getMobileTimeOffsetRem(start)}rem`;
	}

	// A segment that runs to the end of this column's day ends at the next midnight, which is 24 here.
	function toHourOfDay(time: Date): number {
		if (formatDate(time) !== dateSlug) {
			return 24;
		}

		return time.getHours() + time.getMinutes() / 60;
	}

	function getIndicatorTop(): number {
		const target = drag.target;
		if (!target) return 0;
		return (ALL_DAY_ROW_SHARE + (target.hour + target.minute / 60) * HOUR_ROW_SHARE) * 100;
	}

	function getIndicatorHeight(): number {
		const item = drag.event;
		if (!item) return HOUR_ROW_SHARE * 100;
		const durationMinutes = item.end_date
			? (item.end_date.getTime() - item.start_date.getTime()) / 60000
			: 60;
		const height = Math.max((durationMinutes / 60) * HOUR_ROW_SHARE * 100, 2);
		return Math.min(height, 100 - getIndicatorTop());
	}

	function computeTarget(
		x: number,
		y: number,
		item: CalendarEvent,
		grabOffsetY: number
	): CalendarDropTarget | null {
		const column = findCalendarDayElement(x, y);
		if (!column) return null;
		const targetDate = parseDateSlug(column.dataset.calendarDay ?? '');
		if (!targetDate) return null;

		if (item.is_all_day) {
			return { date: targetDate, hour: 0, minute: 0 };
		}

		const rect = column.getBoundingClientRect();
		const allDayHeight = rect.height * ALL_DAY_ROW_SHARE;
		const hourHeight = rect.height * HOUR_ROW_SHARE;
		const gridY = y - grabOffsetY - rect.top - allDayHeight;

		if (gridY < 0) {
			return { date: targetDate, hour: 0, minute: 0 };
		}

		let hour = Math.min(Math.floor(gridY / hourHeight), 23);
		let minute = dragService.snapToMinutes(
			Math.round(((gridY % hourHeight) / hourHeight) * 60)
		);

		if (minute >= 60) {
			minute = 0;
			hour = Math.min(hour + 1, 23);
		}

		return { date: targetDate, hour, minute };
	}

	async function commitMove(item: CalendarEvent, target: CalendarDropTarget): Promise<void> {
		loadingIndicator.start();
		const result = await calendars.moveEvent(item, target);
		loadingIndicator.stop();
		if (result !== 'ok') {
			notifications.error(moveErrorMessage(result, ts.get.calendar));
		}
	}

	const draggableEvent = createDraggableEvent(drag, {
		enabled: (item) => dragEnabled && isDraggableOnDate(item, date) && !calendars.isEventReadOnly(item),
		sourceDateSlug: () => dateSlug,
		computeTarget,
		onDrop: commitMove
	});

	function isDragged(item: CalendarEvent): boolean {
		return dragEnabled && drag.isDragged(item);
	}

	async function onEventClick(item: CalendarEvent): Promise<void> {
		if (drag.consumeClick()) return;
		await calendars.showSidebar(null, item);
	}

	async function addAllDayEvent(): Promise<void> {
		await calendars.showSidebar(date, null, { allDay: true });
	}

	async function addEventAt(hour: string): Promise<void> {
		await calendars.showSidebar(date, null, { hour: parseInt(hour) });
	}

	function isEmptyCellClick(event: MouseEvent): boolean {
		return !isMobile && !(event.target as HTMLElement).closest('button, a');
	}

	async function onAllDayDoubleClick(event: MouseEvent): Promise<void> {
		if (isEmptyCellClick(event)) await addAllDayEvent();
	}

	async function onHourDoubleClick(event: MouseEvent, hour: string): Promise<void> {
		if (isEmptyCellClick(event)) await addEventAt(hour);
	}
</script>

{#snippet eventButton(item: CalendarEvent, variantClass: ClassValue, top?: string, height?: string)}
	<button
		class={['flex cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm transition-all select-none hover:bg-c-neutral dark:hover:bg-s-dark-3', variantClass]}
		class:opacity-40={isDragged(item)}
		style="
			border-color: {getEventBorderColor(item.calendar_color)};
			background-color: {getEventBackgroundColor(item.calendar_color)};
		"
		style:top
		style:height
		onclick={() => onEventClick(item)}
		use:draggableEvent={item}
		in:blur
	>
		<span class="text-left">{item.title}</span>
	</button>
{/snippet}

<div
	class={['relative grid grid-cols-1', isMobile ? 'row-span-full' : 'h-full w-full', isDropTargetColumn && 'bg-d-lightblue/40']}
	data-calendar-day={dateSlug}
	style={isMobile ? 'grid-template-rows: subgrid' : `grid-template-rows: ${desktopRows}`}
>
	<div class="group relative w-full select-none" ondblclick={onAllDayDoubleClick}>
		<button
			onclick={addAllDayEvent}
			class="absolute top-0 right-0 z-40 cursor-pointer rounded-bl-lg border-r-1 border-b-1 border-c-neutral-1 p-2 font-bold opacity-0 transition-all group-hover:bg-c-btn group-hover:text-c-neutral group-hover:opacity-100 dark:border-s-dark"
		>
			<IconPlus class="size-3" />
		</button>
		{#each calendars.getTodosForDate(date) as todo (todo.id)}
			<TodoEntry {todo} />
		{/each}
		{#each entries.filter((e) => e.is_all_day) as item (getCalendarEventKey(item))}
			{#if !calendars.isCalendarHidden(item.calendar_id)}
				{@render eventButton(item, ['w-full', item.start_date < date && '!border-l-0'])}
			{/if}
		{/each}
	</div>
	{#each hours as hour (hour)}
		<div
			class="group relative border-t-1 border-c-neutral-1 select-none dark:border-s-dark"
			class:bg-c-neutral={isShadedHour(hour)}
			class:dark:bg-s-dark-2={isShadedHour(hour)}
			ondblclick={(event) => onHourDoubleClick(event, hour)}
		>
			<button
				onclick={() => addEventAt(hour)}
				class="absolute top-1 right-1 z-40 cursor-pointer rounded-full p-2 font-bold opacity-0 transition-all group-hover:opacity-100 hover:bg-c-btn hover:text-white"
			>
				<IconPlus class="size-3" />
			</button>
			{#if entriesByHour[parseInt(hour)].entries.length > 0}
				{#each entriesByHour[parseInt(hour)].entries as item, i (getCalendarEventKey(item))}
					{#if !calendars.isCalendarHidden(item.calendar_id)}
						{@render eventButton(item, ['absolute z-30 w-2/3 shadow-sm', i === 0 ? 'left-0' : 'right-0'], getTop(item), getHeight(item))}
					{/if}
				{/each}
			{/if}
		</div>
	{/each}
	{#if isDropTargetColumn && drag.event}
		{#if drag.event.is_all_day}
			<div
				class="pointer-events-none absolute inset-x-0 top-0 z-40 h-3/30 border-2 border-dashed border-c-action bg-d-lightblue/60"
			></div>
		{:else}
			<div
				class="pointer-events-none absolute inset-x-0 z-40 border-2 border-dashed border-c-action bg-d-lightblue/60"
				style="
					top: {getIndicatorTop()}%;
					height: {getIndicatorHeight()}%;
				"
			></div>
		{/if}
	{/if}
</div>
