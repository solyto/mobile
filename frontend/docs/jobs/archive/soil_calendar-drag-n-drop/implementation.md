# Implementation: calendar drag'n'drop

id: soil
status: open
developer:
date: 2026-08-28

<!-- Produced by @developer after implementation. -->

## Summary

Implemented drag & drop for the calendar: events can now be dragged between
days and time slots in the desktop month, week and day views, with a drag
ghost that follows the pointer and a live drop-target indicator. The approach
is a custom pointer-events implementation (see TASK-1 decision below); a drop
moves the event via the existing update API (this-occurrence vs all-occurrences
for recurring events through the RecurrenceActionModal), preserves duration /
all-day / recurrence semantics, keeps click-to-edit working, and is gated off
on the mobile (fixedHeight) view variants. All 21 Playwright end-to-end checks
pass against a stub backend; unit tests and `npm run check` are green.
Review blocker fixed: week/day view drops onto adjacent-month days (first/last
week of the loaded month) are now rejected in `computeTarget`, mirroring the
month view's grayed-out-day rejection — previously such a move succeeded
server-side but the post-move reload only covers the loaded month, so the moved
event silently vanished from the view.

Follow-up fixes (same branch, after review):

- Drop-offset bug: in the week/day hour grid the drop time was computed from the
  raw pointer position, but the drag ghost follows the pointer minus the grab
  offset (where the event was grabbed). Dropping without moving therefore
  landed the event `grabOffsetY` lower than it appeared — e.g. half an event
  height (~30 min for a 1 h event grabbed mid-way) later. `computeTarget` now
  receives the grab offset and anchors the drop time to the ghost's top edge,
  so the event lands exactly where the ghost indicates.
- The shared DnD infrastructure moved from
  `src/lib/components/calendars/views/dnd/` to
  `src/lib/components/calendars/dnd/` (it is calendar-level, not a view); all
  callers updated.

## Changes

- TASK-1: Researched svelte-dnd-action vs native HTML5 DnD vs pointer events;
  chose pointer events and recorded the drop-target model (15-min snapping,
  ghost behaviour, all-day handling, grayed-out-day rejection) in the
  "TASK-1 decision" section below.
- TASK-2: New `src/lib/services/CalendarDragService.ts` — pure, unit-tested
  helpers: `snapToMinutes`, `buildMoveRequest` (computes new start/end from a
  drop target, preserving duration, all-day and recurrence semantics, returns
  null for no-op drops). New `tests/unit/services/CalendarDragService.test.ts`
  (12 tests).
- TASK-3: `src/lib/state/Calendars.svelte.ts` — added `moveEvent(target)`
  (builds the request, defers recurring occurrences into `pendingMove`),
  `applyEventMove`, `resolvePendingMove(occurrenceOnly)`, `cancelPendingMove`
  and `pendingMove` state, mirroring the EventEdit etag/`formatFloatingDate`/
  `original_start_date` contract. Store tests added to
  `tests/unit/stores/Calendars.test.ts` (8 tests).
- TASK-4: New shared DnD infrastructure under
  `src/lib/components/calendars/views/dnd/` — `CalendarDragState.svelte.ts`
  (module-level reactive drag state + `createCalendarDragController` with
  5px press-vs-drag threshold, pointer capture, rAF-throttled moves, click
  suppression) and `CalendarDragGhost.svelte` (fixed-position ghost).
  `views/week/Day.svelte` (shared by WeekView + DayView) maps the pointer to
  (day column, hour slot) via `data-calendar-day` + the existing `h-3/30` /
  `h-1/27` grid fractions, renders the drop indicator (duration bar / all-day
  strip), dims the source block and gates DnD to `!fixedHeight`.
- TASK-5: `views/month/Entry.svelte` (drag sources) and `views/month/Day.svelte`
  (drop zones) — date-only moves (timed events keep their time of day),
  grayed-out (adjacent-month) cells reject drops.
- TASK-6: `RecurrenceActionModal.svelte` gained a `'move'` action (new
  `recurring_move_question`); `src/routes/calendar/+page.svelte` renders the
  modal when `calendars.pendingMove` is set, resolving this-occurrence via
  `updateOccurrence` and all-occurrences via `updateEvent`.
- TASK-7: i18n — added `calendar.entry_move_error` and
  `calendar.recurring_move_question` to `en`/`de`/`es`/`fr` and
  `src/lib/types/translation.ts` (pulled forward into TASK-4/TASK-6 since the
  components need them to compile).
- TASK-8: Verification — `npm ci` (restored pinned deps; no new packages),
  `npm run check` (0 errors), `npm test` (708 passed; 1 pre-existing failure
  in `tests/components/logic-leaves.test.ts`, untouched by this job),
  `npm run build` (success). End-to-end Playwright verification against a stub
  backend on localhost:8000 (the real backend was unavailable): month/week/day
  drags (ghost + indicator + correct PUT payloads), 15-min snapping, all-day
  chip drag, click-to-edit still opening the sidebar, recurring modal +
  occurrence PUT, grayed-out-day rejection, and the mobile variants rendering
  unchanged. 21/21 checks pass.
- Follow-up (drop-offset fix): `CalendarDragControllerOptions.computeTarget`
  now receives the drag's `grabOffsetY` (4th argument, passed from
  `onPointerDown`'s captured offset at all three call sites in
  `CalendarDragState.svelte.ts`), and `views/week/Day.svelte`'s `computeTarget`
  subtracts it when mapping the pointer to the hour grid (`gridY =
  y - grabOffsetY - rect.top - allDayHeight`). The column hit-test still uses
  the real pointer coordinates, so the offset cannot break element lookup near
  the top of the viewport. Month view's `computeTarget` ignores the extra
  argument (date-only moves).
- Follow-up (folder move): `src/lib/components/calendars/views/dnd/` →
  `src/lib/components/calendars/dnd/`; imports updated in
  `views/week/Day.svelte`, `views/month/Entry.svelte`, `views/month/Day.svelte`.

## TASK-1 decision: drag-and-drop approach

**Chosen approach: custom pointer-events drag (no library, no native HTML5 DnD).**

Research summary:

- `svelte-dnd-action` (`dndzone`, used by Todo Kanban / ManageCalendars /
  ManageShortcuts) is list-reordering oriented: it operates on `items` arrays
  and `consider`/`finalize` index events. A calendar time grid positions
  events absolutely over a 24-hour × N-day surface; there is no "list index"
  to drop onto. The library's own author recommends implementing absolutely
  positioned drags from scratch when no list re-sorting is involved
  (isaacHagoel/svelte-dnd-action issue #354).
- Native HTML5 DnD (used by Note Navigation / LinkEntry) gives a browser-owned
  drag image, does not fire on touch, is inconsistent across browsers
  (drag-image throttling, `draggable` quirks on `<button>`), and makes the
  "ghost follows the pointer + live drop target" requirement hard to control.
- Pointer events give full control over both required UX behaviours: a
  fixed-position ghost that follows the pointer, and a precise drop-target
  indicator. Click-vs-drag is disambiguated with a movement threshold, so the
  existing click-to-edit keeps working. Best-practice guidance from
  calendar-drag implementations (svelte-calendar v0.14 release notes):
  throttle pointer moves to one per animation frame, measure the grid rect
  once per frame, keep the original block dimmed in place while dragging, and
  flush the pending frame on pointerup so the drop commits the newest position.

Drop-target model:

- **Week/day views** (`views/week/Day.svelte`, shared by WeekView + DayView,
  `fixedHeight=false`): drop target = (day column, hour slot). Pointer mapped
  to the column via `elementsFromPoint` + a `data-calendar-day` attribute on
  each column root; hour/minute from the pointer's Y relative to that column's
  rect using the grid fractions already in use (`h-3/30` all-day header,
  `h-1/27` per hour row). Timed events snap to **15-minute** slots and keep
  their duration; all-day events move date-only (target time ignored).
- **Month view** (`views/month/Day.svelte` cells as drop zones, `Entry.svelte`
  as drag source): date-only move — timed events keep their time of day,
  all-day events stay all-day. Drops on grayed-out (adjacent-month) days are
  rejected.
- **Ghost**: fixed-position clone of the dragged event that follows the
  pointer (grab-offset preserved), `pointer-events: none`, high z-index; the
  original block stays in place, dimmed.
- **Drop indicator**: in week/day, a bar in the target column spanning the
  event's new start→end (duration preserved), plus a subtle column tint; in
  month, the target cell is highlighted. Indicator hidden when the target is
  invalid (no column, grayed-out month day, or no-op = same date+time).
- **Recurring events**: a drop on a recurring occurrence opens the existing
  RecurrenceActionModal ("this occurrence" → `updateOccurrence` with
  `original_start_date`, "all occurrences" → `updateEvent`), mirroring the
  EventEdit contract exactly (`formatFloatingDate`, etag, `is_all_day`).
- **Gating**: DnD is active only when `fixedHeight=false` in week/day (mobile
  variants use `fixedHeight`); month DnD is active only in the desktop
  `MonthView` (the mobile month view is a separate component). List view is
  untouched (out of scope).

## Known issues / follow-ups

- Review blocker (fixed): adjacent-month days shown in the week/day views
  (first/last week of the loaded month) reject drops, consistent with the
  month view's grayed-out-day handling; dropping there is not possible until
  the user navigates to that month. Cross-month navigation while dragging is
  not implemented (out of scope per tasks.md).
- The 15-min drop snapping in week/day uses the existing (approximate) grid
  fractions (`h-3/30` header, `h-1/27` hour rows); the pre-existing event
  block positioning math (`getTop`/`getHeight` in `views/week/Day.svelte`)
  is left untouched and can misplace events visually — out of scope.
- The follow-up drop-offset fix was verified via `npm run check` + `npm run
  build` + unit tests; the backend/stub used for the original end-to-end
  Playwright pass was no longer available, so no interactive drag re-check
  was possible in this session. The change is pure offset math (gridY minus
  the grab offset the ghost already applies) and does not alter hit-testing
  or snapping.
- Mobile / tablet views (`MobileMonthView`/`MobileWeekView`/`MobileDayView`)
  intentionally have no drag & drop (fixedHeight gate); the list view is
  untouched. Both are follow-ups.
- Cross-month navigation while dragging and drop-resizing of events are not
  implemented (out of scope per tasks.md).
- `npm run lint` reports pre-existing style issues across 335 files (including
  `viewPoint` unused in `calendar/+page.svelte` and `Promise<any>` in
  `RecurrenceActionModal.svelte`); only files changed by this job were
  formatted. The single failing test (`logic-leaves.test.ts`) is pre-existing.
- The real backend (localhost:8000) was unavailable during verification; the
  end-to-end checks ran against a throwaway stub API (in /tmp/soilverif,
  outside the repo).
