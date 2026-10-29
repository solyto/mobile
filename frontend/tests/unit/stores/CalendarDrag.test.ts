import { describe, it, expect } from 'vitest';
import { CalendarDrag } from '$lib/state/CalendarDrag.svelte';
import type { CalendarEvent } from '$lib/types/calendar';

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
	return {
		id: 1,
		uri: 'event-1.ics',
		title: 'Meeting',
		description: '',
		location: '',
		start_date: new Date('2026-10-13T09:00:00Z'),
		end_date: new Date('2026-10-13T10:00:00Z'),
		is_all_day: false,
		is_recurring: false,
		recurrence_rule: null,
		recurrence_end: null,
		original_start_date: null,
		created_at: null,
		updated_at: null,
		calendar_id: 1,
		calendar_name: 'Work',
		calendar_color: '#ff0000',
		etag: 'etag',
		...overrides
	};
}

const ghost = { x: 10, y: 20, width: 100, height: 30 };
const target = { date: new Date('2026-10-14T00:00:00Z'), hour: 9, minute: 15 };

function snapshot(drag: CalendarDrag) {
	return {
		active: drag.active,
		event: drag.event,
		sourceDateSlug: drag.sourceDateSlug,
		sourceKey: drag.sourceKey,
		ghost: drag.ghost,
		target: drag.target,
		suppressClick: drag.suppressClick
	};
}

describe('CalendarDrag', () => {
	it('begin sets all fields and clears suppressClick', () => {
		const drag = new CalendarDrag();
		const event = makeEvent();
		drag.suppressClick = true;
		drag.begin(event, '2026-10-13', ghost, target);
		expect(drag.active).toBe(true);
		expect(drag.event).toEqual(event);
		expect(drag.sourceDateSlug).toBe('2026-10-13');
		expect(drag.sourceKey).toBe('event-1.ics-' + event.start_date.getTime());
		expect(drag.ghost).toEqual(ghost);
		expect(drag.target).toEqual(target);
		expect(drag.suppressClick).toBe(false);
	});

	it('update moves ghost and target while active', () => {
		const drag = new CalendarDrag();
		drag.begin(makeEvent(), '2026-10-13', ghost, null);
		const nextGhost = { ...ghost, x: 50 };
		drag.update(nextGhost, target);
		expect(drag.ghost).toEqual(nextGhost);
		expect(drag.target).toEqual(target);
	});

	it('update is ignored while inactive', () => {
		const drag = new CalendarDrag();
		drag.update(ghost, target);
		expect(drag.ghost).toBeNull();
		expect(drag.target).toBeNull();
	});

	it('finish resets every field and sets suppressClick', () => {
		const drag = new CalendarDrag();
		drag.begin(makeEvent(), '2026-10-13', ghost, target);
		drag.finish();
		expect(snapshot(drag)).toEqual({ ...snapshot(new CalendarDrag()), suppressClick: true });
	});

	it('cancel resets every field without setting suppressClick', () => {
		const drag = new CalendarDrag();
		drag.begin(makeEvent(), '2026-10-13', ghost, target);
		drag.cancel();
		expect(snapshot(drag)).toEqual(snapshot(new CalendarDrag()));
	});

	it('consumeClick returns true exactly once after finish', () => {
		const drag = new CalendarDrag();
		drag.begin(makeEvent(), '2026-10-13', ghost, target);
		drag.finish();
		expect(drag.consumeClick()).toBe(true);
		expect(drag.consumeClick()).toBe(false);
		expect(snapshot(drag)).toEqual(snapshot(new CalendarDrag()));
	});

	it('consumeClick returns false after cancel', () => {
		const drag = new CalendarDrag();
		drag.begin(makeEvent(), '2026-10-13', ghost, target);
		drag.cancel();
		expect(drag.consumeClick()).toBe(false);
	});

	it('isDragged matches the dragged event by key', () => {
		const drag = new CalendarDrag();
		const event = makeEvent();
		expect(drag.isDragged(event)).toBe(false);
		drag.begin(event, '2026-10-13', ghost, target);
		expect(drag.isDragged(makeEvent())).toBe(true);
		expect(drag.isDragged(makeEvent({ uri: 'event-2.ics' }))).toBe(false);
		drag.finish();
		expect(drag.isDragged(event)).toBe(false);
	});

	it('isDragged distinguishes recurring occurrences by original start', () => {
		const drag = new CalendarDrag();
		const first = makeEvent({ original_start_date: new Date('2026-10-13T09:00:00Z') });
		const second = makeEvent({ original_start_date: new Date('2026-10-20T09:00:00Z') });
		drag.begin(first, '2026-10-13', ghost, target);
		expect(drag.isDragged(first)).toBe(true);
		expect(drag.isDragged(second)).toBe(false);
	});
});
