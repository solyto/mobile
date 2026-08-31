<script lang="ts">
	import { blur } from 'svelte/transition';
	import IconPlus from '@lucide/svelte/icons/plus';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { formatDate, getDateDiffInMinutes } from '$lib/helpers/DateHelper';
	import type { CalendarEvent } from '$lib/types/calendar';
	import TodoEntry from '$lib/components/calendars/TodoEntry.svelte';
	import CalendarDragService from '$lib/services/CalendarDragService';
	import CalendarDragGhost from '$lib/components/calendars/dnd/CalendarDragGhost.svelte';
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
	const dragService = new CalendarDragService();
	const hours = Array.from({ length: 24 }, (_, i) => i + 1).map((i) =>
		(i - 1).toString().padStart(2, '0')
	);

	let { date, fixedHeight = false } = $props<{ date: Date; fixedHeight?: boolean }>();

	let entries = $derived(calendars.getEventsForDate(date));
	let allDayEntries = $derived(entries.filter((e) => e.is_all_day));
	let nonAllDayEntries = $derived(entries.filter((e) => !e.is_all_day));
	let entriesByHour = $derived(
		hours.map((hour) => ({
			hour: parseInt(hour),
			entries: nonAllDayEntries.filter(
				(entry) => entry.start_date?.getHours() === parseInt(hour)
			)
		}))
	);

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

	// --- drag & drop (desktop/tablet variants only; fixedHeight is the mobile layout) ---
	const dragEnabled = $derived(!fixedHeight);
	const dateSlug = $derived(formatDate(date));
	const isDropTargetColumn = $derived(
		dragEnabled && calendarDrag.active && calendarDrag.target !== null
			? formatDate(calendarDrag.target.date) === dateSlug
			: false
	);
	const indicatorTop = $derived.by(() => {
		const target = calendarDrag.target;
		if (!target) return 0;
		return (3 / 30 + (target.hour + target.minute / 60) * (1 / 27)) * 100;
	});
	const indicatorHeight = $derived.by(() => {
		const item = calendarDrag.event;
		if (!item) return (1 / 27) * 100;
		const durationMinutes = item.end_date
			? (item.end_date.getTime() - item.start_date.getTime()) / 60000
			: 60;
		return Math.max((durationMinutes / 60) * (1 / 27) * 100, 2);
	});

	function computeTarget(
		x: number,
		y: number,
		item: CalendarEvent,
		grabOffsetY: number
	): CalendarDragTarget | null {
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

	async function commitMove(item: CalendarEvent, target: CalendarDragTarget): Promise<void> {
		loadingIndicator.start();
		const ok = await calendars.moveEvent(item, target);
		loadingIndicator.stop();
		if (!ok) {
			notifications.error(ts.get.calendar.entry_move_error);
		}
	}

	const drag = createCalendarDragController({
		enabled: () => dragEnabled,
		sourceDateSlug: () => dateSlug,
		computeTarget,
		onDrop: commitMove
	});

	function isDragged(item: CalendarEvent): boolean {
		return (
			dragEnabled &&
			calendarDrag.active &&
			calendarDrag.sourceKey === getCalendarEventKey(item)
		);
	}

	async function onEventClick(item: CalendarEvent): Promise<void> {
		if (consumeCalendarDragClick()) return;
		await calendars.showSidebar(null, item);
	}
</script>

<div
	class="relative flex h-full w-full flex-col {isDropTargetColumn ? 'bg-d-lightblue/40' : ''}"
	data-calendar-day={dateSlug}
>
	<div class="group relative w-full {fixedHeight ? 'h-16' : 'h-3/30'}">
		<button
			onclick={async () => {
				await calendars.showSidebar(date);
			}}
			class="absolute top-0 right-0 z-50 cursor-pointer rounded-bl-lg border-r-1 border-b-1 border-c-neutral-1 p-2 font-bold opacity-0 transition-all group-hover:bg-c-btn group-hover:text-c-neutral group-hover:opacity-100 dark:border-s-dark
			"
		>
			<IconPlus class="size-3" />
		</button>
		{#each calendars.getTodosForDate(date) as todo (todo.id)}
			<TodoEntry {todo} />
		{/each}
		{#each allDayEntries as item (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
			{#if !calendars.isCalendarHidden(item.calendar_id)}
				<button
					class="flex w-full cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm transition-all select-none hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:!border-l-0={item.start_date < date}
					class:opacity-40={isDragged(item)}
					style="border-color: {item.calendar_color ??
						'var(--color-c-neutral-2)'}; background-color: {item.calendar_color
						? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))`
						: ''};"
					onclick={() => onEventClick(item)}
					onpointerdown={(e) => drag.onPointerDown(e, item)}
					onpointermove={drag.onPointerMove}
					onpointerup={drag.onPointerUp}
					onpointercancel={drag.onPointerCancel}
					in:blur
				>
					<span class="text-left">{item.title}</span>
				</button>
			{/if}
		{/each}
	</div>
	{#each hours as hour (hour)}
		{@const offHour = fixedHeight && (parseInt(hour) < 6 || parseInt(hour) >= 22)}
		<div
			class="group relative border-t-1 border-c-neutral-1 dark:border-s-dark {fixedHeight
				? offHour
					? 'h-6 bg-c-neutral dark:bg-s-dark-2'
					: 'h-14'
				: 'h-1/27'}"
		>
			<button
				onclick={async () => {
					await calendars.showSidebar(date);
				}}
				class="absolute top-1 right-1 z-50 cursor-pointer rounded-full p-2 font-bold opacity-0 transition-all group-hover:opacity-100 hover:bg-c-btn hover:text-white
			"
			>
				<IconPlus class="size-3" />
			</button>
			{#if entriesByHour[parseInt(hour)].entries.length > 0}
				{#each entriesByHour[parseInt(hour)].entries as item, i (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
					{#if !calendars.isCalendarHidden(item.calendar_id)}
						<button
							class="absolute z-40 flex w-2/3 cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm shadow-sm transition-all select-none hover:bg-c-neutral dark:hover:bg-s-dark-3"
							class:left-0={i === 0}
							class:right-0={i > 0}
							class:opacity-40={isDragged(item)}
							style="border-color: {item.calendar_color ??
								'var(--color-c-neutral-2)'}; background-color: {item.calendar_color
								? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))`
								: ''}; top: {getTop(item)}; height: {getHeight(item)};"
							onclick={() => onEventClick(item)}
							onpointerdown={(e) => drag.onPointerDown(e, item)}
							onpointermove={drag.onPointerMove}
							onpointerup={drag.onPointerUp}
							onpointercancel={drag.onPointerCancel}
							in:blur
						>
							<span class="text-left">{item.title}</span>
						</button>
					{/if}
				{/each}
			{/if}
		</div>
	{/each}
	{#if isDropTargetColumn && calendarDrag.event}
		{#if calendarDrag.event.is_all_day}
			<div
				class="pointer-events-none absolute inset-x-0 top-0 z-40 h-3/30 border-2 border-dashed border-c-action bg-d-lightblue/60"
			></div>
		{:else}
			<div
				class="pointer-events-none absolute inset-x-0 z-40 border-2 border-dashed border-c-action bg-d-lightblue/60"
				style="top: {indicatorTop}%; height: {indicatorHeight}%;"
			></div>
		{/if}
	{/if}
	<CalendarDragGhost sourceDateSlug={dateSlug} />
</div>
