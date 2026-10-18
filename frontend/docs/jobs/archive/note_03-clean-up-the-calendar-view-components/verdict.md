# Verdict: 03 Clean up the calendar view components

id: note
reviewer: @reviewer
date: 2026-10-13 (third review, after the DayView ghost rework `2e1e754`)

## Review

I reviewed the full `git diff main...HEAD` on `feature/note_03-clean-up-the-calendar-view-components` (base `main` from `.manigot/manigot.json`). In `src/`, only the files named in `tasks.md` changed, plus `views/day/DayView.svelte`, which is the fix the previous verdict asked for. `implementation.md` describes it. Everything that changed is described in `implementation.md`. The only uncommitted change is `.mcp.json` (environment config), which is not part of this branch.

I ran the tooling myself on HEAD `9165847`: `npm run check` reported 0 errors and 0 warnings, `npm run lint` was clean, and `npm test` passed 59 files / 841 tests.

TASK-1: PASS
notes: The previous blocker is fixed. `DayView.svelte:6,36` now renders one `<CalendarDragGhost />` at the end of its root, like `WeekView.svelte:63` and `MonthView.svelte:38`. I checked every parent of the two `Day` components:
- `week/Day` is used by `WeekView`, `DayView` and `MobileDayView` (`isMobile`, so `dragEnabled` is false).
- `month/Day` is used only through `month/Week` → `MonthView`.

So every view where drag can start has exactly one ghost. `grep -rn 'calendar-drag-ghost' src` returns nothing. The `sourceDateSlug` prop is gone. `isGhostVisible()` and `ghostStyle()` are local to the component, and `CalendarDragState.svelte.ts` was not touched.

TASK-2: PASS
notes: The root of `week/Day.svelte` uses the array form. `isShadedHour(hour)` keeps `isMobile &&`. The `class:bg-c-neutral` / `class:dark:bg-s-dark-2` directives render the same classes as the old code.

TASK-3: PASS
notes: The `eventButton` snippet keeps the base classes, `opacity-40`, the colour styles, all four pointer handlers, `onclick` and `in:blur`. The variant classes match the old ones (`i === 0 ? 'left-0' : 'right-0'` is the same as the old `left-0`/`right-0` directives). `style:top`/`style:height` are left out for all-day buttons. The keys and the `{#if isCalendarHidden}` structure are unchanged.

TASK-4: PASS
notes: `MobileWeekView` now uses the one-line `$derived` from `WeekView`, and `onMount` keeps only the two store writes. `day.weekday` (1–7, `DateHelper.ts:368`) indexes `weekdays_short`, and the label still has no trailing `.`. There is one `columnWidth` const.

TASK-5: PASS
notes: In `MobileWeekView` and `MobileDayView`, `class:` directives with `isOffHour(hour)` inline replace the old markup. In `MobileCalendarHeader`, the array form is used on the component, which is correct because `class:` does not work on components. Both greps from the task return nothing.

TASK-6: dropped by the owner (option a, no behaviour changes). This is not a finding.

## Security

none (markup-only change, no new data flow).

## Overall

APPROVED

There are no code blockers left. I am no longer listing the manual desktop/mobile run from the brief as a review blocker. The developer cannot do it here, because the API at `localhost:8000` is not reachable, so no follow-up task on this branch could close it. It is still the owner's step before merging: week, month and day view on desktop (the drag ghost should follow the pointer above all columns), and week view (on first open and after moving between weeks) plus day view on mobile.
