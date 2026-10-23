<script lang="ts">
	import { blur } from 'svelte/transition';
	import IconPlus from '@lucide/svelte/icons/plus';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { formatDate, getDateDiffInMinutes, getHoursOfDay, isOffHour, parseDateSlug } from '$lib/helpers/DateHelper';
	import { getEventBackgroundColor, getEventBorderColor } from '$lib/helpers/ColorHelper';
	import type { CalendarEvent, NewEventPreset } from '$lib/types/calendar';
	import type { ClassValue } from 'svelte/elements';
	import TodoEntry from '$lib/components/calendars/TodoEntry.svelte';
	import CalendarDragService from '$lib/services/CalendarDragService';
	import { getCalendarDrag } from '$lib/state/CalendarDrag.svelte';
	import type { CalendarDropTarget } from '$lib/services/CalendarDragService';
	import { createDraggableEvent, findCalendarDayElement } from '$lib/helpers/CalendarDragHelper';
	import { getCalendarEventKey } from '$lib/helpers/CalendarEventHelper';
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

	let { date, isMobile = false }: { date: Date; isMobile?: boolean } = $props();

	let entries = $derived(calendars.getEventsForDate(date));
	let entriesByHour = $derived(
		hours.map((hour) => ({
			hour: parseInt(hour),
			entries: entries.filter(
				(entry) => !entry.is_all_day && entry.start_date?.getHours() === parseInt(hour)
			)
		}))
	);

	function isShadedHour(hour: string): boolean {
		return isMobile && isOffHour(hour);
	}

	function getTop(entry: CalendarEvent): string {
		if (entry.start_date?.getMinutes() === 0) {
			return '0';
		}

		return entry.start_date?.getMinutes() + '%';
	}

	function getHeight(entry: CalendarEvent): string {
		if (!entry.end_date) {
			return '65%';
		}

		const h = getDateDiffInMinutes(entry.start_date, entry.end_date) / 0.6;

		return h > 65 ? h + '%' : '65%';
	}

	const dragEnabled = !isMobile;
	const dateSlug = $derived(formatDate(date));
	const isDropTargetColumn = $derived(
		dragEnabled && drag.active && drag.target !== null
			? formatDate(drag.target.date) === dateSlug
			: false
	);

	function getIndicatorTop(): number {
		const target = drag.target;
		if (!target) return 0;
		return (3 / 30 + (target.hour + target.minute / 60) * (1 / 27)) * 100;
	}

	function getIndicatorHeight(): number {
		const item = drag.event;
		if (!item) return (1 / 27) * 100;
		const durationMinutes = item.end_date
			? (item.end_date.getTime() - item.start_date.getTime()) / 60000
			: 60;
		return Math.max((durationMinutes / 60) * (1 / 27) * 100, 2);
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
		const allDayHeight = rect.height * (3 / 30);
		const hourHeight = rect.height * (1 / 27);
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
		const ok = await calendars.moveEvent(item, target);
		loadingIndicator.stop();
		if (!ok) {
			notifications.error(ts.get.calendar.entry_move_error);
		}
	}

	const draggableEvent = createDraggableEvent(drag, {
		enabled: () => dragEnabled,
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

	async function onCellDoubleClick(event: MouseEvent, preset: NewEventPreset): Promise<void> {
		if (isMobile || (event.target as HTMLElement).closest('button, a')) return;
		await calendars.showSidebar(date, null, preset);
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
	<div class="group relative w-full select-none" ondblclick={(e) => onCellDoubleClick(e, { allDay: true })}>
		<button
			onclick={async () => {
				await calendars.showSidebar(date, null, { allDay: true });
			}}
			class="absolute top-0 right-0 z-50 cursor-pointer rounded-bl-lg border-r-1 border-b-1 border-c-neutral-1 p-2 font-bold opacity-0 transition-all group-hover:bg-c-btn group-hover:text-c-neutral group-hover:opacity-100 dark:border-s-dark
			"
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
			ondblclick={(e) => onCellDoubleClick(e, { hour: parseInt(hour) })}
		>
			<button
				onclick={async () => {
					await calendars.showSidebar(date, null, { hour: parseInt(hour) });
				}}
				class="absolute top-1 right-1 z-50 cursor-pointer rounded-full p-2 font-bold opacity-0 transition-all group-hover:opacity-100 hover:bg-c-btn hover:text-white
			"
			>
				<IconPlus class="size-3" />
			</button>
			{#if entriesByHour[parseInt(hour)].entries.length > 0}
				{#each entriesByHour[parseInt(hour)].entries as item, i (getCalendarEventKey(item))}
					{#if !calendars.isCalendarHidden(item.calendar_id)}
						{@render eventButton(item, ['absolute z-40 w-2/3 shadow-sm', i === 0 ? 'left-0' : 'right-0'], getTop(item), getHeight(item))}
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
				style="top: {getIndicatorTop()}%; height: {getIndicatorHeight()}%;"
			></div>
		{/if}
	{/if}
</div>
