# Verdict: 06 Calendar drag state as a store and an action

id: position
reviewer: @reviewer
date: 2026-10-13

## Review

Reviewed against `git diff main...HEAD` on `feature/position_06-calendar-drag-state-as-a-store-and-an-action`.
Nothing changed that `implementation.md` does not mention. The two `chore: commit all` commits only touch
`brief.md` and `tasks.md`. `.mcp.json` is modified in the worktree but is not committed and is not part of the diff.

TASK-1: PASS
notes: `tests/unit/stores/CalendarDrag.test.ts` covers everything the task listed:
- `begin`, plus `update` both active and inactive
- `finish` and `cancel`, each compared against `snapshot(new CalendarDrag())`, which is the rule 11.3 check
- `consumeClick` returning true once after `finish` and false after `cancel`
- `isDragged`, including the recurring-occurrence key

It follows the `Viewpoint.test.ts` pattern. I could not run it (see TASK-10).

TASK-2: PASS
notes: `src/lib/state/CalendarDrag.svelte.ts`:
- It has seven `$state` fields initialised from one `INITIAL` object.
- `begin`, `finish` and `cancel` all reset via `Object.assign(this, INITIAL, …)`. Svelte 5 class `$state` fields compile to accessors, so `Object.assign` goes through the setters and stays reactive.
- It uses a Symbol-keyed `setCalendarDrag`/`getCalendarDrag`.
- The types and `getCalendarEventKey` moved here.
- It has no DOM access and no comments.

Deriving `sourceKey` inside `begin` is a small signature change. It keeps the same semantics, since the old controller computed the same key from the same item.

TASK-3: PASS
notes: `routes/calendar/+layout.svelte` calls `setCalendarDrag()` next to `setCalendars()`. Every consumer is under this route. I checked the following, and all of them are reached only through `CalendarView` → `routes/calendar/+page.svelte`:
- `CalendarDragGhost`
- `month/Day`
- `month/Entry`
- `week/Day`, including the mobile views

TASK-4: PASS
notes: `src/lib/helpers/CalendarDragHelper.ts` matches the plan:
- The factory takes the store and the per-view options.
- `update(item)` swaps in the current item, and `destroy()` cancels the rAF and removes all four listeners.
- These behaviours are unchanged: the 5 px threshold, rejection of touch and non-primary mouse buttons, rAF throttling, flush on pointer-up, pointer capture, and the `setTimeout(…, 0)` reset.
- Of the comments, only the "safety net" *why* comment remains.
- `node` replaces `e.currentTarget`, which is the same element.

TASK-5: PASS
notes: `CalendarDragGhost.svelte` and `month/Day.svelte` read from `getCalendarDrag()`. The existing `$derived` is untouched.

TASK-6: PASS
notes: `month/Entry.svelte`:
- now uses `use:draggableEvent={item}`, `drag.isDragged(item)` and `drag.consumeClick()`
- no longer has the separator comment
- keeps `computeTarget`/`commitMove` and the grayed-out rejection comment

TASK-7: PASS
notes: `week/Day.svelte`:
- The `eventButton` snippet uses `use:draggableEvent={item}`.
- `enabled: () => dragEnabled` keeps mobile disabled.
- The indicator, `isDropTargetColumn` and `isDragged` read from the store.

TASK-8: PASS
notes: The old module is deleted, and the first two greps come back empty. The third grep still finds `ManageCalendars.svelte:68-69`. Those lines belong to the svelte-dnd-action reorder handle, which existed before this job and is unrelated to event drag. The deviation is justified and documented.

TASK-9: PASS
notes: In `STANDARDS_BACKLOG.md`, only the two intended items changed: line 107 is ticked and the comment-audit note at line 132 is updated.

TASK-10: PASS
notes: Re-review after rework (commit `cccccd4`). I re-ran the gates myself in the worktree:
- `npm test`: 62 files, 907 tests pass, including `tests/unit/stores/CalendarDrag.test.ts`.
- `npm run check`: 0 errors, 2 warnings, both `state_referenced_locally` in `EventEdit.svelte`, a file this branch does not touch.
- `npm run lint`: clean.

`implementation.md` records the manual pointer checks (Playwright against `npm run dev` with mocked API) for desktop week/day/month and mobile week/day. They cover every case the task listed: drag + ghost, drop indicator, grayed-out cell rejection, plain click opens the sidebar, drag does not, pointercancel aborts without a PUT, and drag stays off on mobile. The rework commits only touch `implementation.md` and `brief.md`; `src` is unchanged since the first review, so the static findings above still hold.

## Security

Not run. The change is client-only UI state with no new inputs, storage or network surface.

## Overall

APPROVED

No blockers. Everything listed in the previous NEEDS WORK verdict has been done and checked.
