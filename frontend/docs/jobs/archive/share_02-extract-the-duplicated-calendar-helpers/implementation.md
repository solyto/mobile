# Implementation: 02 Extract the duplicated calendar helpers

id: share
developer: @developer
date: 2026-10-13

## Summary

Each piece of calendar/browser logic that had been copy-pasted is now in one place, and every copy has been replaced: event colours in `ColorHelper`; `getHoursOfDay`, `isOffHour`, `eachDayBetween` and `parseDateSlug` in `DateHelper`; keyboard height as `viewPoint.keyboardHeight`. Each helper was unit-tested before call sites were switched over. Every replacement returns the same output as the code it replaced, so nothing changes visually. All gates are green: `npm test` (807 tests), `npm run check`, `npm run lint`.

## Changes

TASK-1: Added `getEventBorderColor()` (falls back to `var(--color-c-neutral-2)`) and `getEventBackgroundColor()` (the `color-mix(… 25%, var(--color-c-bg-elevated))`, or `''` when there is no colour) to `src/lib/helpers/ColorHelper.ts`, with tests in `tests/unit/helpers/ColorHelper.test.ts`. Q1 was resolved by including the border fallback.
TASK-2: Switched `views/week/Day`, `views/month/Entry`, `views/list/Day`, `views/month/MobileMonthView` and `dnd/CalendarDragGhost` to the colour helpers. The `is_all_day` conditions stay at each call site.
TASK-3: `NavigationEntry.svelte` uses the colour helpers. The `hidden` branch is unchanged.
TASK-4: Added `getHoursOfDay()` (`'00'…'23'`) and `isOffHour(hour: string | number)` to `DateHelper`, with tests.
TASK-5: `DayView`, `MobileDayView`, `WeekView`, `MobileWeekView` and `week/Day` use `getHoursOfDay()` / `isOffHour()`. The `isMobile &&` gate in `week/Day` stays.
TASK-6: `forms/TimePicker.svelte` uses `getHoursOfDay()` instead of its own `hourOptions` array.
TASK-7: Added `eachDayBetween(start, end)` to `DateHelper`. It returns plain `Date`s and keeps the current boundary behaviour (the day that reaches `end` is included). Tested.
TASK-8: `Calendars.loadEvents()` walks multi-day events with `eachDayBetween`, and its `SvelteDate` loop is gone. Added an assertion to `tests/unit/stores/Calendars.test.ts` that pins the end boundary.
TASK-9: Moved `parseDateSlug` without changes from `CalendarDragState.svelte.ts` to `DateHelper`, placed next to `formatDate`. Added round-trip and invalid-input tests. Updated the imports in `month/Entry` and `week/Day`.
TASK-10: `ViewPoint` now registers one `visualViewport` resize+scroll listener in `initialize()`. It is guarded for a missing `visualViewport`, removed in `destroy()`, and exposed as `keyboardHeight` (0 at or below 60px). Tests are in `tests/unit/stores/Viewpoint.test.ts`.
TASK-11: `BottomSheetModal` and `BottomSheetConfirmationModal` read `getViewPoint().keyboardHeight`. Their own `onMount` listeners and `keyboardPadding` state are removed. (BottomSheetModal was committed in an earlier session under "chore: commit all".)
TASK-12: `TipTapEditor` reads `viewPoint.keyboardHeight` through a small `keyboardPadding()` function in the script, which keeps the markup short (STANDARDS section 1). The `viewPoint.isMobile` gate is kept. The viewport part of `onMount`/`onDestroy` is removed; the TipTap instance lifecycle is unchanged.
TASK-13: All gates are green. A grep finds no remaining copies of `25%, var(--color-c-bg-elevated)`, `< 6 ||`, `length: 24` or `visualViewport` outside the helpers and `Viewpoint`. `parseDateSlug` now only appears at its two call sites, imported from `DateHelper`.

## Known issues / follow-ups

- Small behaviour detail: before this change, the modals and TipTap read the keyboard height only while they were mounted, and TipTap checked `isMobile` once at mount. Now there is one app-wide listener, and TipTap's `isMobile` gate is reactive. The rendered output is the same.
- Q2: the four view backgrounds `color-mix(in srgb, var(--color-c-primary) 12%, var(--color-c-bg))` are still duplicated (STANDARDS 2.1). This could be a follow-up.
- Q3: `eachDayBetween` keeps the possible off-by-one for end-exclusive all-day events, as required by "no visual change".
- `parseDateSlug` still returns a `SvelteDate` (STANDARDS 14.1 backlog item). It was moved unchanged, as the brief asked.
- `/workspace/.mcp.json` has an uncommitted change that came from the session environment (a context7 MCP config). It is not part of this job and was not committed.
