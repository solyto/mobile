# Tasks: 06 Calendar drag state as a store and an action

id: position
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

## Context (read before starting)

- Branch verified: worktree HEAD is `feature/position_06-calendar-drag-state-as-a-store-and-an-action`.
- The dependencies listed in the brief have already landed:
  - `parseDateSlug` is in `DateHelper` (archived job share_02).
  - The ghost is rendered once per view, in `DayView`/`WeekView`/`MonthView` (archived job note_03).
  - Both STANDARDS_BACKLOG items for them (lines 58 and 73) are still unticked. That is outside this job, so leave them alone.
- Current shape of the feature:
  - `src/lib/components/calendars/dnd/CalendarDragState.svelte.ts` contains:
    - the module-level `$state` `calendarDrag`
    - `begin/update/finish/cancel/clear/consumeCalendarDragClick`
    - `getCalendarEventKey`
    - `findCalendarDayElement` (DOM query)
    - the `createCalendarDragController` closure (threshold, rAF throttling, pointer capture, and the `setTimeout` click-suppression safety net)
- Importers of the module:
  - `dnd/CalendarDragGhost.svelte`: reads only.
  - `views/month/Day.svelte`: reads only, `isDropTargetCell`.
  - `views/month/Entry.svelte`: controller, consume-click, `isDragged`.
  - `views/week/Day.svelte`: the same, through the `eventButton` snippet, which has the four `onpointer*` attributes once. It also reads drag state for the drop indicator. It is used by WeekView, DayView, MobileWeekView and MobileDayView. Drag is disabled on mobile via `dragEnabled = !isMobile`.
- All calendar views render under `src/routes/calendar/+layout.svelte`, which already calls `setCalendars()`. The dashboard (`src/routes/+page.svelte`) also calls `setCalendars()` but renders no calendar view. That makes `routes/calendar/+layout.svelte` the owner of the new store's lifetime (rule 11.1).
- Svelte actions run at mount, not during component init, so they **cannot call `getContext`**. The action therefore has to be created in the component script, where `getCalendarDrag()` is available, and then used as `use:draggableEvent={item}`. See TASK-4.
- Rules: STANDARDS 11.1–11.3. Also 10.1, because the new code must not carry over the JSDoc and `// ---` separators. Keep only the two *why* comments: the grayed-out drop rejection and the "browser may not fire click" safety net. Do not add `$derived`/`$effect`.
- Behaviour must not change. That covers the 5 px threshold, the touch/right-button rejection, rAF throttling, flush on pointer-up, click suppression including the `setTimeout(…, 0)` reset, and that mobile stays disabled.

## Task breakdown

TASK-1: Write the unit tests for the new `CalendarDrag` store first. Cover these cases:
  - `begin` sets all fields and clears `suppressClick`.
  - `update` is ignored while inactive.
  - `finish` resets every field and sets `suppressClick`.
  - `cancel` resets every field without setting `suppressClick`.
  - `consumeClick` returns `true` exactly once after `finish` and `false` after `cancel`.
  - After `finish` or `cancel`, the state equals a freshly constructed store, so no field is forgotten (rule 11.3).
  - Add a test for each read helper the store exposes (e.g. `isDragged(item)` by event key).
  files: tests/unit/stores/CalendarDrag.test.ts (new)
  depends: none (the tests are expected to fail until TASK-2)
  risk: low. These are pure class tests in node env, using the same pattern as `tests/unit/stores/Viewpoint.test.ts`.

TASK-2: Create the `CalendarDrag` context store:
  - A class with `$state` fields `active, event, sourceDateSlug, sourceKey, ghost, target, suppressClick`.
  - Methods `begin/update/finish/cancel/consumeClick`. `finish`/`cancel` reset by assigning from one `INITIAL` constant (`Object.assign(this, INITIAL)` or equivalent).
  - `setCalendarDrag()`/`getCalendarDrag()` with a `Symbol` key, in the style of `LoadingIndicator.svelte.ts`.
  - Move the `CalendarDragGhost` and `CalendarDragTarget` types here, plus `getCalendarEventKey` (or an `isDragged(item)` method that uses it).
  - No DOM access and no comments beyond rule 10.1.
  files: src/lib/state/CalendarDrag.svelte.ts (new)
  depends: TASK-1
  risk: low. This is a straight move of existing logic into the repo's standard store shape, and TASK-1 covers it.

TASK-3: Register the store by calling `setCalendarDrag()` in the calendar route layout, next to `setCalendars()`.
  files: src/routes/calendar/+layout.svelte
  depends: TASK-2
  risk: low. This is a one-line bootstrap addition. The dashboard does not render drag-capable views, so it does not need the store.

TASK-4: Create the pointer-wiring Svelte action:
  - A factory takes the `CalendarDrag` store plus the per-view options (`enabled`, `sourceDateSlug`, `computeTarget`, `onDrop`) and returns an action `draggableEvent(node, item)`.
  - The action attaches `pointerdown/move/up/cancel` listeners to `node` and holds the controller closure: threshold, grab offsets, rAF, pointer capture, and the `setTimeout` suppress reset.
  - It implements `update(item)` so the current `item` is always used.
  - `destroy()` removes the listeners and cancels any pending rAF.
  - Move `findCalendarDayElement` here.
  - Follow the `portalToBody` precedent in `helpers/PortalHelper.ts` for the location (see Q1).
  files: src/lib/helpers/CalendarDragHelper.ts (new; name/location see Q1)
  depends: TASK-2
  risk: medium. Pointer capture, rAF and click-suppression timing are only verified manually. A missing `update()` or `destroy()` would leave a stale item or leaked listeners.

TASK-5: Move the read-only consumers to the store. `CalendarDragGhost.svelte` and `month/Day.svelte` replace the `calendarDrag` import with `const drag = getCalendarDrag()` and read the same fields.
  files: src/lib/components/calendars/dnd/CalendarDragGhost.svelte, src/lib/components/calendars/views/month/Day.svelte
  depends: TASK-3
  risk: low. Only the source changes. The existing `$derived` in `month/Day.svelte` stays as it is, since this job does not refactor it.

TASK-6: Move `month/Entry.svelte` to the store and action:
  - Create the action through the TASK-4 factory, keeping `computeTarget` and `commitMove` local as they are.
  - Replace the four `onpointer*` attributes with `use:draggableEvent={item}`.
  - Use the store for `isDragged` and click consumption.
  - Remove the `// --- drag & drop … ---` separator (rule 10.1).
  files: src/lib/components/calendars/views/month/Entry.svelte
  depends: TASK-4, TASK-5
  risk: medium. This is the month-view drag path. The click-vs-drag distinction must keep working, and it can only be checked manually.

TASK-7: Move `week/Day.svelte` to the store and action:
  - Create the action through the factory with `enabled: () => dragEnabled`.
  - Replace the four `onpointer*` attributes in the `eventButton` snippet with `use:draggableEvent={item}`.
  - Read `drag.active/target/event` from the store for `isDropTargetColumn`, the indicator and `isDragged`.
  - Use the store's click consumption.
  - `computeTarget` and `commitMove` stay in the component (see Q3).
  files: src/lib/components/calendars/views/week/Day.svelte
  depends: TASK-4, TASK-5
  risk: medium. Four views use this component (Week, Day, MobileWeek, MobileDay). Desktop drag must keep working and mobile must stay disabled.

TASK-8: Delete the old module and the now-empty exports. Confirm with these greps:
  - `grep -rn 'CalendarDragState' src` is empty.
  - `grep -rn '^export const .* = \$state' src` is empty (rule 11.1 check).
  - `grep -rnE 'onpointer(down|move|up|cancel)=' src/lib/components/calendars` is empty.
  files: src/lib/components/calendars/dnd/CalendarDragState.svelte.ts (delete)
  depends: TASK-5, TASK-6, TASK-7
  risk: low. This is mechanical once every importer has moved. `npm run check` catches any leftover import.

TASK-9: Update `docs/STANDARDS_BACKLOG.md`:
  - Tick the "Calendar drag feature: `state/CalendarDrag.svelte.ts` store …" item (line ~107).
  - In the comment-audit item (line ~129), mark `CalendarDragState` as done (backlog 06).
  - Do not touch any other items.
  files: docs/STANDARDS_BACKLOG.md
  depends: TASK-8
  risk: low. This is a docs-only change.

TASK-10: Run the final gates:
  - `npm test`, `npm run check` and `npm run lint` must be green.
  - Manually verify pointer behaviour in desktop **week**, **day** and **month** views:
    - drag moves the event and the ghost follows
    - the drop indicator shows on the target column/cell
    - grayed-out month cells reject the drop
    - a plain click still opens the sidebar
    - a drag does not open the sidebar
    - a cancelled gesture (pointercancel) aborts without a move
  - On mobile week/day views, check that drag does not start.
  - Record the results in implementation.md.
  files: none (verification only)
  depends: TASK-1 … TASK-9
  risk: low. This is verification only. The brief explicitly requires manual pointer checks.

## Open questions / decisions taken conservatively

- **Q1: Location and name of the action.** STANDARDS 11.2 names `use:portalToBody` in `helpers/PortalHelper.ts` as the precedent, so the plan uses `src/lib/helpers/CalendarDragHelper.ts`. The alternative is to keep it in `components/calendars/dnd/`. If the owner prefers that, only TASK-4's path changes.
- **Q2: Factory vs. plain action.** The brief says `use:draggableEvent={item}` with only `item` as the parameter. An action cannot call `getContext`, so the store and the per-view callbacks are bound by a factory called in the component script. The markup then still reads `use:draggableEvent={item}`. The alternative, passing `{ item, drag, computeTarget, … }` as the parameter, would contradict the brief's syntax.
- **Q3: `computeTarget`/`commitMove` stay in the views.** STANDARDS 11.2 lists the ~100 lines in `week/Day.svelte` as part of the "spread". The brief, however, only asks for the store and the action, and says snapping must not change. Moving the target math into `CalendarDragService`, or de-duplicating `commitMove`, is **not** planned here. If wanted, it should be a follow-up job.
- **Q4: Duplicate target type.** `CalendarDragTarget` (state) and `CalendarDropTarget` (`CalendarDragService`) have the same shape. The plan keeps `CalendarDragTarget` and moves it into the store unchanged. Unifying the two types is a small, separate cleanup and is not done here.
- **Q5: Controller state per node vs. per view.** Today one controller per `Day`/`Entry` instance is shared by all of its buttons. In the action, the per-gesture locals live per node. Pointer capture routes move/up/cancel to the pressed node, so behaviour is the same. The reviewer should still check this manually (TASK-10).
