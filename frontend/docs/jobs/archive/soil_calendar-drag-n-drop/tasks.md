# Tasks: calendar drag'n'drop

id: soil
status: open
analyst:
date: 2026-08-28

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Research and decide the drag-and-drop approach (svelte-dnd-action vs the native HTML5 DnD pattern used in Note Navigation vs a pointer-events implementation) and define the drop-target model (which views, time-snapping granularity, drag-ghost behaviour); record the decision in implementation.md before wiring UI.
     files: docs/jobs/soil_calendar-drag-n-drop/implementation.md (decision notes)
     depends: none
     risk: medium — architectural choice; brief demands "flawless" behaviour and notes previous DnD attempts were broken, so the approach must be validated first. Note: svelte-dnd-action is list-reordering oriented (Kanban, calendar ordering) and does not naturally fit a free-form time grid; the "flies with my mouse + marks where it lands" acceptance criteria likely point to native HTML5 DnD (Note Navigation pattern) or a custom pointer-based drag.

TASK-2: Add a pure, unit-tested service (e.g. src/lib/services/CalendarDragService.ts) that computes the moved event's new start/end dates from a drop target (date + hour/minute), preserving duration, all-day and recurrence semantics (e.g. "this occurrence" start shift vs full-series shift).
     files: src/lib/services/CalendarDragService.ts (new), tests/unit/services/CalendarDragService.test.ts (new)
     depends: TASK-1
     risk: low — pure functions following existing tested-service patterns (TodoFilterService etc.).

TASK-3: Add a move method on the Calendars store (e.g. moveEvent) that builds the UpdateEventRequest from the existing event + new dates (reusing the etag), signals the caller when the event is recurring and needs the "this occurrence / all occurrences" decision, then calls the existing updateEvent/updateOccurrence, reloads events and surfaces failures; add store unit tests.
     files: src/lib/state/Calendars.svelte.ts, tests/unit/stores/Calendars.test.ts
     depends: TASK-2
     risk: medium — must mirror the EventEdit.svelte request/etag/occurrence contract exactly (formatFloatingDate, is_all_day handling) or the backend will reject the update.

TASK-4: Implement drag & drop in the shared week/day view component (views/week/Day.svelte, used by WeekView and DayView on desktop/tablet): make event blocks draggable, map pointer position to (day column, hour slot), render a drop-target indicator + a drag ghost that follows the pointer, suppress the existing click-to-edit after a drag, and gate DnD to non-mobile so the mobile fixedHeight variants keep working.
     files: src/lib/components/calendars/views/week/Day.svelte, possibly a small shared drag-indicator component
     depends: TASK-3
     risk: high — absolute-positioning math against the hour grid (top/height use %, hour slots are h-1/27), the component is shared with MobileWeekView/MobileDayView, and click-vs-drag interplay is exactly where previous attempts broke.

TASK-5: Implement drag & drop in month view (desktop/tablet): make month/Entry.svelte draggable, treat month/Day.svelte cells as drop zones, move events date-only (keep the time of timed events, preserve all-day semantics), and restrict drops to non-grayed days of the currently loaded month.
     files: src/lib/components/calendars/views/month/Entry.svelte, src/lib/components/calendars/views/month/Day.svelte
     depends: TASK-3
     risk: medium — simpler than the hour grid (date-only moves), but must preserve click-to-edit, hidden-calendar filtering and the grayed-out-day rendering.

TASK-6: Wire the recurring-event drag decision through the existing RecurrenceActionModal (this occurrence vs all occurrences) for week/day and month drops, reusing the modal's current 'edit' action without breaking the EventEdit flows.
     files: src/lib/components/calendars/views/week/Day.svelte, src/lib/components/calendars/views/month/Day.svelte, src/lib/components/calendars/RecurrenceActionModal.svelte (likely unchanged), src/lib/state/Calendars.svelte.ts
     depends: TASK-4, TASK-5
     risk: medium — the modal is currently only wired for edit/delete; the pending-move state must be carried through without regressing those flows.

TASK-7: Add any new UI strings required by the drag feature (minimally a move-failure notification, e.g. calendar.entry_move_error) to all four i18n files and to src/lib/types/translation.ts.
     files: src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts, src/lib/types/translation.ts
     depends: TASK-4, TASK-5 (final string list known after implementation)
     risk: low — mechanical; npm run check enforces the four-language sync.

TASK-8: Full verification pass: restore pinned dependencies with `npm ci` (node_modules is absent in this workspace; restoring the lockfile adds no new packages), run npm run check and npm test, then verify the drag flows (month/week/day) end-to-end — drop lands where indicated, click-to-edit still opens the sidebar, recurring decision appears, failure path shows the notification, mobile views unchanged.
     files: none (verification; fixes land in the files above as needed)
     depends: TASK-4, TASK-5, TASK-6, TASK-7
     risk: medium — full manual verification needs the backend at localhost:8000; if it is unavailable, fall back to check + unit tests + code review and note the limitation.

## Scope decisions / open questions (assumed unless the developer finds reason to change them)

- DnD is scoped to the desktop/tablet month, week and day views. Mobile views (MobileMonthView/MobileWeekView/MobileDayView) are separate components and touch DnD via native HTML5 is unreliable; they are a follow-up.
- List view (ListView) is out of scope for this job; it is a follow-up.
- Only moves (date/time change) are in scope; resizing events by dragging edges is not.
- Drops on grayed-out days (adjacent months) in month view are out of scope; cross-month navigation while dragging is not implemented.
- Time-snapping granularity for timed drops (15/30/60 min) and the exact ghost behaviour are decided in TASK-1 and must be recorded in implementation.md.