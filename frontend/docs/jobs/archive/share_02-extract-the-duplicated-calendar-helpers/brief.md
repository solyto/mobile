# Brief: 02 Extract the duplicated calendar helpers

type: feature
id: share
branch: feature/share_02-extract-the-duplicated-calendar-helpers
date: 2026-10-13
author: Leander Muskalla

## What

Move the small pieces of logic that are copy-pasted across the calendar views into one place each, then replace every copy.

- Event border/background colour (the `color-mix(…)` expression, 10 copies in 8 files) → `helpers/ColorHelper.ts`.
- Off-hour rule (`< 6 || >= 22`, 5 copies) and the 24-entry `hours` array (6 copies incl. `forms/TimePicker`) → `DateHelper`.
- `eachDayBetween(start, end)` for the multi-day walk in `Calendars.loadEvents()`.
- `parseDateSlug` from `calendars/dnd/CalendarDragState.svelte.ts` → `DateHelper`, next to the `formatDate` it inverts.
- Keyboard height (`visualViewport` block, 3 copies in `BottomSheetModal`, `BottomSheetConfirmationModal`, `TipTapEditor`) → a getter on `Viewpoint`.

## Why

Every one of these is domain knowledge written out three to ten times; changing one copy and missing the others is how the calendar drifts.

## Out of scope

Restructuring the view components themselves (separate entry). Any visual change.

## Notes

Tests first: each helper is pure, so write its unit test before extracting, then replace call sites one file at a time with the gate green between files. Rules: `STANDARDS.md` 2.1, 2.2, 2.4, 12.4.
