import { SvelteDate } from 'svelte/reactivity';
import type { CalendarEvent } from '$lib/types/calendar';

export interface CalendarDragGhost {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface CalendarDragTarget {
	date: Date;
	hour: number;
	minute: number;
}

interface CalendarDragStateValue {
	active: boolean;
	event: CalendarEvent | null;
	sourceDateSlug: string | null;
	sourceKey: string | null;
	ghost: CalendarDragGhost | null;
	target: CalendarDragTarget | null;
	suppressClick: boolean;
}

/** Shared, module-level drag state for the calendar views (week/day/month). */
export const calendarDrag = $state<CalendarDragStateValue>({
	active: false,
	event: null,
	sourceDateSlug: null,
	sourceKey: null,
	ghost: null,
	target: null,
	suppressClick: false
});

export function beginCalendarDrag(
	event: CalendarEvent,
	sourceDateSlug: string,
	sourceKey: string,
	ghost: CalendarDragGhost,
	target: CalendarDragTarget | null
): void {
	calendarDrag.active = true;
	calendarDrag.event = event;
	calendarDrag.sourceDateSlug = sourceDateSlug;
	calendarDrag.sourceKey = sourceKey;
	calendarDrag.ghost = ghost;
	calendarDrag.target = target;
	calendarDrag.suppressClick = false;
}

export function updateCalendarDrag(
	ghost: CalendarDragGhost,
	target: CalendarDragTarget | null
): void {
	if (!calendarDrag.active) return;
	calendarDrag.ghost = ghost;
	calendarDrag.target = target;
}

/** Ends the drag and marks the immediately following click (same element) as consumed. */
export function finishCalendarDrag(): void {
	calendarDrag.suppressClick = true;
	clearCalendarDrag();
}

/** Ends the drag without suppressing the next click (gesture was cancelled). */
export function cancelCalendarDrag(): void {
	clearCalendarDrag();
}

function clearCalendarDrag(): void {
	calendarDrag.active = false;
	calendarDrag.event = null;
	calendarDrag.sourceDateSlug = null;
	calendarDrag.sourceKey = null;
	calendarDrag.ghost = null;
	calendarDrag.target = null;
}

export function consumeCalendarDragClick(): boolean {
	const suppress = calendarDrag.suppressClick;
	calendarDrag.suppressClick = false;
	return suppress;
}

export function getCalendarEventKey(item: CalendarEvent): string {
	return item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime();
}

/** Finds the calendar day element (data-calendar-day) under the given viewport point. */
export function findCalendarDayElement(x: number, y: number): HTMLElement | null {
	for (const el of document.elementsFromPoint(x, y)) {
		const day = (el as HTMLElement).closest('[data-calendar-day]');
		if (day) return day as HTMLElement;
	}
	return null;
}

/** Parses the "dd.mm.YYYY" value of a data-calendar-day attribute back into a Date. */
export function parseDateSlug(slug: string): Date | null {
	const parts = slug.split('.');
	if (parts.length !== 3) return null;
	const day = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10);
	const year = parseInt(parts[2], 10);
	if (!day || !month || !year) return null;
	return new SvelteDate(year, month - 1, day);
}

export interface CalendarDragControllerOptions {
	enabled: () => boolean;
	sourceDateSlug: () => string;
	computeTarget: (
		x: number,
		y: number,
		item: CalendarEvent,
		grabOffsetY: number
	) => CalendarDragTarget | null;
	onDrop: (item: CalendarEvent, target: CalendarDragTarget) => void | Promise<void>;
}

export interface CalendarDragController {
	onPointerDown(e: PointerEvent, item: CalendarEvent): void;
	onPointerMove(e: PointerEvent): void;
	onPointerUp(e: PointerEvent): void;
	onPointerCancel(e: PointerEvent): void;
}

const DRAG_THRESHOLD = 5; // px of movement before a press becomes a drag

export function createCalendarDragController(
	options: CalendarDragControllerOptions
): CalendarDragController {
	let dragging = false;
	let dragEvent: CalendarEvent | null = null;
	let dragKey: string | null = null;
	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let lastY = 0;
	let grabOffsetX = 0;
	let grabOffsetY = 0;
	let ghostWidth = 0;
	let ghostHeight = 0;
	let rafId: number | null = null;

	function ghostFor(x: number, y: number): CalendarDragGhost {
		return { x: x - grabOffsetX, y: y - grabOffsetY, width: ghostWidth, height: ghostHeight };
	}

	function scheduleProcessMove(): void {
		if (rafId !== null) return;
		rafId = requestAnimationFrame(() => {
			rafId = null;
			if (!dragging || !calendarDrag.active || !dragEvent) return;
			const x = lastX;
			const y = lastY;
			updateCalendarDrag(ghostFor(x, y), options.computeTarget(x, y, dragEvent, grabOffsetY));
		});
	}

	function flushMove(): void {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		if (!calendarDrag.active || !dragEvent) return;
		updateCalendarDrag(
			ghostFor(lastX, lastY),
			options.computeTarget(lastX, lastY, dragEvent, grabOffsetY)
		);
	}

	return {
		onPointerDown(e: PointerEvent, item: CalendarEvent): void {
			if (!options.enabled()) return;
			if (e.pointerType === 'touch') return;
			if (e.pointerType === 'mouse' && e.button !== 0) return;
			const el = e.currentTarget as HTMLElement;
			const rect = el.getBoundingClientRect();
			grabOffsetX = e.clientX - rect.left;
			grabOffsetY = e.clientY - rect.top;
			startX = e.clientX;
			startY = e.clientY;
			lastX = e.clientX;
			lastY = e.clientY;
			ghostWidth = rect.width;
			ghostHeight = rect.height;
			dragEvent = item;
			dragKey = getCalendarEventKey(item);
			dragging = true;
			try {
				el.setPointerCapture(e.pointerId);
			} catch {
				dragging = false;
			}
		},

		onPointerMove(e: PointerEvent): void {
			if (!dragging || !dragEvent) return;
			lastX = e.clientX;
			lastY = e.clientY;
			if (!calendarDrag.active) {
				if (Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) {
					return;
				}
				beginCalendarDrag(
					dragEvent,
					options.sourceDateSlug(),
					dragKey!,
					ghostFor(lastX, lastY),
					options.computeTarget(lastX, lastY, dragEvent, grabOffsetY)
				);
			}
			scheduleProcessMove();
		},

		onPointerUp(): void {
			if (!dragging) return;
			flushMove();
			dragging = false;
			if (calendarDrag.active) {
				const item = calendarDrag.event;
				const target = calendarDrag.target;
				finishCalendarDrag();
				if (item && target) void options.onDrop(item, target);
				// Safety net in case the browser does not fire a click after the drag.
				setTimeout(() => (calendarDrag.suppressClick = false), 0);
			}
		},

		onPointerCancel(): void {
			if (!dragging) return;
			dragging = false;
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			cancelCalendarDrag();
		}
	};
}
