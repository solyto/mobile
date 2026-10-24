import type { CalendarEvent } from '$lib/types/calendar';
import type { CalendarDrag, CalendarDragGhost } from '$lib/state/CalendarDrag.svelte';
import type { CalendarDropTarget } from '$lib/services/CalendarDragService';

export type DraggableEventOptions = {
	enabled: () => boolean;
	sourceDateSlug: () => string;
	computeTarget: (
		x: number,
		y: number,
		item: CalendarEvent,
		grabOffsetY: number
	) => CalendarDropTarget | null;
	onDrop: (item: CalendarEvent, target: CalendarDropTarget) => void | Promise<void>;
};

export type DraggableEventAction = (
	node: HTMLElement,
	item: CalendarEvent
) => { update: (item: CalendarEvent) => void; destroy: () => void };

const DRAG_THRESHOLD_PX = 5;

export function findCalendarDayElement(x: number, y: number): HTMLElement | null {
	for (const el of document.elementsFromPoint(x, y)) {
		const day = (el as HTMLElement).closest('[data-calendar-day]');
		if (day) return day as HTMLElement;
	}
	return null;
}

export function createDraggableEvent(
	drag: CalendarDrag,
	options: DraggableEventOptions
): DraggableEventAction {
	return (node, initialItem) => {
		let item = initialItem;
		let dragging = false;
		let dragEvent: CalendarEvent | null = null;
		let startX = 0;
		let startY = 0;
		let lastX = 0;
		let lastY = 0;
		let grabOffsetX = 0;
		let grabOffsetY = 0;
		let ghostWidth = 0;
		let ghostHeight = 0;
		let rafId: number | null = null;

		function ghostAt(x: number, y: number): CalendarDragGhost {
			return { x: x - grabOffsetX, y: y - grabOffsetY, width: ghostWidth, height: ghostHeight };
		}

		function cancelPendingFrame(): void {
			if (rafId === null) return;
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		function scheduleMove(): void {
			if (rafId !== null) return;
			rafId = requestAnimationFrame(() => {
				rafId = null;
				if (!dragging || !drag.active || !dragEvent) return;
				drag.update(
					ghostAt(lastX, lastY),
					options.computeTarget(lastX, lastY, dragEvent, grabOffsetY)
				);
			});
		}

		function flushMove(): void {
			cancelPendingFrame();
			if (!drag.active || !dragEvent) return;
			drag.update(
				ghostAt(lastX, lastY),
				options.computeTarget(lastX, lastY, dragEvent, grabOffsetY)
			);
		}

		function onPointerDown(e: PointerEvent): void {
			if (!options.enabled()) return;
			if (e.pointerType === 'touch') return;
			if (e.pointerType === 'mouse' && e.button !== 0) return;
			const rect = node.getBoundingClientRect();
			grabOffsetX = e.clientX - rect.left;
			grabOffsetY = e.clientY - rect.top;
			startX = e.clientX;
			startY = e.clientY;
			lastX = e.clientX;
			lastY = e.clientY;
			ghostWidth = rect.width;
			ghostHeight = rect.height;
			dragEvent = item;
			dragging = true;
			try {
				node.setPointerCapture(e.pointerId);
			} catch {
				dragging = false;
			}
		}

		function onPointerMove(e: PointerEvent): void {
			if (!dragging || !dragEvent) return;
			lastX = e.clientX;
			lastY = e.clientY;
			if (!drag.active) {
				if (Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD_PX) return;
				drag.begin(
					dragEvent,
					options.sourceDateSlug(),
					ghostAt(lastX, lastY),
					options.computeTarget(lastX, lastY, dragEvent, grabOffsetY)
				);
			}
			scheduleMove();
		}

		function onPointerUp(): void {
			if (!dragging) return;
			flushMove();
			dragging = false;
			if (!drag.active) return;
			const dropped = drag.event;
			const target = drag.target;
			drag.finish();
			if (dropped && target) void options.onDrop(dropped, target);
			// Safety net in case the browser does not fire a click after the drag.
			setTimeout(() => (drag.suppressClick = false), 0);
		}

		function onPointerCancel(): void {
			if (!dragging) return;
			dragging = false;
			cancelPendingFrame();
			drag.cancel();
		}

		node.addEventListener('pointerdown', onPointerDown);
		node.addEventListener('pointermove', onPointerMove);
		node.addEventListener('pointerup', onPointerUp);
		node.addEventListener('pointercancel', onPointerCancel);

		return {
			update(nextItem) {
				item = nextItem;
			},
			destroy() {
				cancelPendingFrame();
				node.removeEventListener('pointerdown', onPointerDown);
				node.removeEventListener('pointermove', onPointerMove);
				node.removeEventListener('pointerup', onPointerUp);
				node.removeEventListener('pointercancel', onPointerCancel);
			}
		};
	};
}
