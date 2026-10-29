# Brief: 03 Clean up the calendar view components

type: feature
id: note
branch: feature/note_03-clean-up-the-calendar-view-components
date: 2026-10-13
author: Leander Muskalla

## What

Bring the week/day/month view components in line with the markup rules, without changing what they render.

- `views/week/Day.svelte`: `class:` instead of folded ternaries, helpers instead of `@const`, one snippet for the two near-identical event buttons, short style helpers.
- `views/week/MobileWeekView.svelte`: the sibling's one-line `$derived` instead of the effect with `prevYear`/`prevWeek`; use `day.weekday`; one const for the column width.
- `views/dnd/CalendarDragGhost.svelte`: render once in `WeekView`/`MonthView`, drop the `sourceDateSlug` prop and the dead `data-calendar-drag-ghost` attribute.
- Both week views: call `calendars.goToToday()` instead of re-implementing it in `onMount`.
- Remaining class-string ternaries and `@const` in calendar files.

## Why

These files are where the "folded ternary" and "effect instead of derived" patterns live; they are the reference bad examples in `STANDARDS.md` and should stop being that.

## Out of scope

Behaviour or layout changes. The drag feature's state (separate entry). `loadEvents` (separate entry).

## Notes

Depends on the helpers entry. No unit seam for markup; safety is `check` + `lint` + the existing `Calendars` store tests + a manual run on desktop and mobile. Rules: 1.1–1.9, 5.5, 6.1.
