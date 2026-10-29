# Brief: 18 Split the Calendars store

type: feature
id: else
branch: feature/else_18-split-the-calendars-store
date: 2026-10-14
author: Leander Muskalla

## What

`state/Calendars.svelte.ts` is 621 lines with 55 public methods. Move the two self-contained blocks into their own stores:

- sharing and invites (`shareCalendar` … `declineInvite`, `openShareModal`, `closeShareModal`);
- import.

Also give the week view its own ISO week-year. `currentYear` is read as a calendar year by the month view (`loadMonth`, `loadEvents` builds `YYYY-MM`, `MonthNavigation`) and as an ISO week-year by the week views (`getCalendarWeek(currentYear, currentWeek)`). The two disagree around New Year, which causes three bugs:

- `goToToday()` and the constructor set `currentWeek = getWeekNumber(today)` but `currentYear = today.getFullYear()`. On 2025-12-29 (ISO week 1 of 2026) the week view shows week 1 of 2025.
- `WeekView` and `MobileWeekView` `onMount` set `currentYear` to the ISO year, so on the same dates the month view state jumps to December 2026.
- `nextWeek()` from week 53 sets week 1 and then increments, which lands on week 2, and bumps `currentMonth` without wrapping (13). `lastWeek()` from week 1 lands on 52, skipping 53. Both assume every year has a week 53.

Add a separate `currentWeekYear` used by the week views, `WeekNavigation`, `nextWeek`/`lastWeek` and `goToToday()`, set from `getISODateInfo`, with the number of weeks in an ISO year computed (the ISO week of Dec 28) rather than hard-coded 53. Once that is in place, the `onMount`s can call `goToToday()`; the owner dropped that in job 03, so confirm first.

## Why

It is now the largest store, bigger than `Auth` was when rule 11.5 was written about it. Source: audit report §5.4. The week-year bugs were found while checking backlog 17 (2026-10-14) and moved here because the fix changes the store's state.

## Out of scope

Navigation other than the week-year fix above, events CRUD, attachments, drag moves. `Auth` (483 lines) is also above the line but is a separate decision.

## Notes

New stores follow 15.2 (constructor injection) and are created in `+layout.svelte` like the others. Move the matching tests from `tests/unit/stores/Calendars.test.ts`. Tests first for the week-year boundary: Dec 29–Jan 4 dates, and `nextWeek`/`lastWeek` across a 52-week and a 53-week year (2026 has 53). Safety: tests, `check`, plus a manual run of share, accept/decline invite, import, and week/month navigation across New Year. Rule: 11.5.
