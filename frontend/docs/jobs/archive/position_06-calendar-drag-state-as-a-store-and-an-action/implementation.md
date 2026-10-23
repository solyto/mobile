## Summary

The calendar drag feature now follows STANDARDS 11.1–11.3:

- The module-level `$state` in `components/calendars/dnd/CalendarDragState.svelte.ts` is gone. It is replaced by a `CalendarDrag` context store in `src/lib/state/`, which `routes/calendar/+layout.svelte` registers.
- The four `onpointer*` attributes on the event buttons are replaced by one `use:draggableEvent={item}` action. A factory in `helpers/CalendarDragHelper.ts` creates it, following the `portalToBody` precedent.
- The pure math stays in `services/CalendarDragService.ts`.
- `computeTarget`/`commitMove` stay in the views, as the analyst decided (Q3).

## Changes

TASK-1: Added `tests/unit/stores/CalendarDrag.test.ts`, written before the store. It covers:
- `begin`, `update` (both active and inactive), `finish` and `cancel`
- equality with a freshly constructed store after a reset (rule 11.3)
- `consumeClick` returning true exactly once after `finish` and false after `cancel`
- `isDragged`, including the key that tells recurring occurrences apart

TASK-2: Added `src/lib/state/CalendarDrag.svelte.ts`:
- A class with seven `$state` fields, all initialised from one `INITIAL` constant.
- `begin`, `finish` and `cancel` all reset through `Object.assign(this, INITIAL, …)`.
- `begin` now derives `sourceKey` from the event itself, so it is no longer a separate parameter.
- Also contains `update`, `consumeClick`, `isDragged(item)` and `setCalendarDrag`/`getCalendarDrag` (Symbol key, same style as `LoadingIndicator`).
- The `CalendarDragGhost`/`CalendarDragTarget` types and `getCalendarEventKey` moved here.
- No DOM access and no comments.

TASK-3: `src/routes/calendar/+layout.svelte` calls `setCalendarDrag()` next to `setCalendars()`. Every drag-capable view renders only under `/calendar` (via `CalendarView`, used only by `routes/calendar/+page.svelte`).

TASK-4: Added `src/lib/helpers/CalendarDragHelper.ts`:
- `createDraggableEvent(drag, { enabled, sourceDateSlug, computeTarget, onDrop })` returns the action `(node, item) => { update, destroy }`.
- The action holds the old controller closure, with the gesture state kept per node.
- Unchanged from before: the 5 px threshold (now the constant `DRAG_THRESHOLD_PX` instead of a comment), touch and non-primary-button rejection, rAF throttling, flush on pointer-up, pointer capture, and the `setTimeout(…, 0)` click-suppression safety net (its *why* comment is kept).
- `update` swaps in the current item. `destroy` removes all four listeners and cancels any pending rAF.
- `findCalendarDayElement` moved here.

TASK-5: `dnd/CalendarDragGhost.svelte` and `views/month/Day.svelte` now read from `getCalendarDrag()`. The existing `$derived` is unchanged.

TASK-6: `views/month/Entry.svelte`:
- uses the store and `use:draggableEvent={item}`
- `drag.isDragged(item)` and `drag.consumeClick()` replace the local helpers
- the `// --- drag & drop … ---` separator is removed
- the comment on grayed-out drop rejection is kept

TASK-7: `views/week/Day.svelte`:
- the `eventButton` snippet uses `use:draggableEvent={item}`
- the drop indicator, `isDropTargetColumn` and `isDragged` read the store
- `enabled: () => dragEnabled` keeps drag off on mobile

TASK-8: Deleted `components/calendars/dnd/CalendarDragState.svelte.ts`. Grep results:
- `grep -rn 'CalendarDragState' src`: empty.
- `grep -rn '^export const .* = \$state' src`: empty.
- `grep -rnE 'onpointer(down|move|up|cancel)=' src/lib/components/calendars`: two hits remain, both in `ManageCalendars.svelte:68-69`. They belong to the svelte-dnd-action reorder handle in calendar management and have nothing to do with event drag, so they are out of scope.

TASK-9: In `docs/STANDARDS_BACKLOG.md`, ticked the "Calendar drag feature" item and marked `CalendarDragState` as done in the comment-audit item. Lines 58 and 73 were left alone, as the tasks asked.

TASK-10 (rework after the NEEDS WORK verdict): the brief now allows `npm ci`, so I ran it and then ran every gate. Nothing in `src` needed to change.
- `npm test`: 62 files and 907 tests pass, including `tests/unit/stores/CalendarDrag.test.ts`.
- `npm run check`: 0 errors and 2 warnings. Both warnings are in `EventEdit.svelte:67` (`state_referenced_locally` on `form`). That file is untouched on this branch; the warning comes from job 05.
- `npm run lint`: clean.
- Pointer checks. There is no API in this environment, so I ran them against `npm run dev` with Playwright (Chromium, real mouse input, TZ=UTC). Every `/api/v1/*` request was answered with mock data: a seeded auth token, one calendar, and one event "Drag Me" on 13.10.2026 from 10:00 to 11:00. I captured the PUT requests. The script was a throwaway and is not committed. Results:
  - Desktop week (1600 px):
    - A press that moves less than 5 px does not start a drag, sends no PUT and opens the sidebar.
    - A real drag shows the ghost, the dashed drop indicator and the highlighted target column, and fades the source button (`opacity-40`).
    - On release it sends one PUT, moving the event to 14.10.2026 12:15–13:15. The sidebar does not open, and the ghost goes away.
  - Desktop day: the same results. A vertical drag sends one PUT with 13:15–14:15 on the same day.
  - Desktop month:
    - Dragging onto 15.10. shows the ghost and the indicator, fades the source and sends one PUT with 15.10.2026 10:00–11:00 (time unchanged). The sidebar does not open.
    - Dropping onto a grayed-out cell (08.11.2026) shows no indicator and sends no PUT.
  - pointercancel, in week, day and month: I dispatched it mid-drag on the dragged button. The ghost disappears straight away, and the following mouseup sends no PUT. A click still fires afterwards and opens the sidebar. That is expected: a synthetic pointercancel followed by a real mouseup still makes the browser fire a click, and `cancel` does not suppress clicks, the same as before.
  - A plain click opens the sidebar in week, day and month.
  - Mobile week and mobile day (375 px): a mouse drag shows no ghost or indicator, does not fade the source and sends no PUT. So `enabled: () => dragEnabled` keeps drag off, even for a non-touch pointer.
  - Per-button gesture state (Q5) behaved the same as before in every case above.
  - The only page errors came from the test harness:
    - `param_value.startsWith is not a function` in `EventAttachments.svelte`. It appears when the sidebar opens, because my catch-all mock returns `[]` for attachment endpoints.
    - A one-off Vite "Failed to fetch dynamically imported module" on the first cold load.

## Known issues / follow-ups

- Small behaviour difference in `cancel`. It now resets `suppressClick` to false, because the whole state resets from `INITIAL` (rule 11.3 and the TASK-1 expectation). The old `cancelCalendarDrag` left it alone. It can only differ if a pointercancel lands between a finished drag and the 0 ms safety-net reset, which in practice cannot happen.
- Gesture state is now per button rather than per `Day`/`Entry` instance (Q5). The Playwright pointer checks under TASK-10 confirmed it behaves the same.
- Still open from the analyst's notes: unifying `CalendarDragTarget` with `CalendarDropTarget` (Q4), and moving `computeTarget`/`commitMove` out of the views (Q3).
- `.mcp.json` in the repo root was already modified by the session environment before I started. I left it uncommitted on purpose because it is not part of this job.
