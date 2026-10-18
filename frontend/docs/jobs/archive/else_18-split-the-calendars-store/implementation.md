# Implementation: 18 Split the Calendars store

id: else
developer: @developer
date: 2026-10-14

## Summary

The sharing/invite block and the import block of `Calendars` are now their own context stores, `CalendarSharing` and `CalendarImport`. Both are created in `src/routes/calendar/+layout.svelte` after `setCalendars()`. `Calendars` went from 621 to 551 lines.

The week views now use their own ISO week-year, `currentWeekYear`. The constructor and `goToToday()` set it from `getISODateInfo`. `nextWeek`/`lastWeek` wrap at the real number of weeks in the ISO year (new helper `getISOWeeksInYear`) and no longer touch `currentYear`/`currentMonth`. The week views read and write `currentWeekYear` instead of `currentYear`, so opening a week view no longer moves the month view.

TASK-5 (`goToToday()` in the week-view `onMount`s) was **not** done. It is blocked until the owner confirms.

**Not verified:** `npm test`, `npm run check` and `npm run lint` were not run. The worktree has no `node_modules`, and the project rules forbid installing packages without asking. Here is what I did check:
- `getISOWeeksInYear`, `getISODateInfo` and the new `nextWeek`/`lastWeek` logic, with Node's TypeScript stripping against the real `DateHelper.ts`. The results match every expectation in the new tests.
- A syntax-only parse of every changed `.ts` file.
- A grep showing that no `calendars.<moved member>` references are left in `src/` or `tests/`.

The full suite, `check` and `lint` still need to run after `npm ci`.

## Changes

TASK-1: Added `getISOWeeksInYear(isoYear)` to `src/lib/helpers/DateHelper.ts`. It returns the ISO week of 28 December. Tests in `tests/unit/helpers/DateHelper.test.ts`: 2020 → 53, 2025 → 52, 2026 → 53, 2027 → 52.

TASK-2: `tests/unit/stores/Calendars.test.ts`:
- Rewrote the two tests that checked the old buggy wrap (month 13/0, week 2, week 52 after week 1).
- Added `nextWeek` tests: 2025-W52 → 2026-W1 and 2026-W53 → 2027-W1.
- Added `lastWeek` tests: 2026-W1 → 2025-W52 and 2027-W1 → 2026-W53, with the expected `mobileWeekStart` where the helper gets it right (see known issues).
- Added a test that `currentYear`/`currentMonth` are left alone.
- Added a constructor test and a `goToToday()` test for each date from 2025-12-29 to 2026-01-04, plus `goToToday()` on 2027-01-01 (2026-W53).

TASK-3: `src/lib/state/Calendars.svelte.ts`:
- New `currentWeekYear` `$state`, set with `currentWeek` from `getISODateInfo` in the constructor and in `goToToday()`.
- `nextWeek`/`lastWeek` wrap with `currentWeekYear` and `getISOWeeksInYear`, and call `getCalendarWeek(currentWeekYear, …)`.
- `currentYear` is still the calendar year that the month path uses.

TASK-4: `WeekView.svelte` and `MobileWeekView.svelte` now call `getCalendarWeek(calendars.currentWeekYear, calendars.currentWeek)`, and their `onMount` sets `currentWeekYear` instead of `currentYear`.

TASK-5: Skipped. It is blocked on owner confirmation (see open question 1 in tasks.md).

TASK-6: New `src/lib/state/CalendarImport.svelte.ts`, which holds `importModal`, `startImport`, `selectImportCalendars` and `getImportState`. The methods are copied verbatim, with the 15.2 shape (constructor `auth`, `apiService`). The fields, methods and now-unused type imports were removed from `Calendars`.

TASK-7: Registered `setCalendarImport()` in `src/routes/calendar/+layout.svelte`. `ImportModal.svelte`, `CalendarNavigation.svelte` and `MobileCalendarHeader.svelte` now use `getCalendarImport()`. `ImportModal` keeps `getCalendars()` for the reload after an import finishes.

TASK-8: New `src/lib/state/CalendarSharing.svelte.ts`, with constructor `(auth = getAuth(), apiService = auth.apiService, calendars = getCalendars())`. It holds `shareModal`, `shareCalendarTarget`, `shareCalendar`, `revokeShare`, `unsubscribeFromCalendar`, `acceptInvite`, `declineInvite`, `openShareModal` and `closeShareModal`. The reloads go through `this.calendars`. These members and the `ShareCalendarRequest` import were removed from `Calendars`. `pendingInvites`, `ownedCalendars` and `acceptedSharedCalendars` stay in `Calendars` (open question 2).

TASK-9: Registered `setCalendarSharing()` after `setCalendars()` in the calendar layout. The callers now use `getCalendarSharing()`:
- `routes/calendar/+page.svelte`
- `CalendarEdit.svelte`
- `ShareCalendarModal.svelte` and `PendingCalendarInvite.svelte` (these two no longer need `getCalendars()`)

TASK-10: Moved the `revokeShare` and two `unsubscribeFromCalendar` tests to a new `tests/unit/stores/CalendarSharing.test.ts`. The assertions are unchanged. The store is built from a real `new Calendars()`'s `auth`/`apiService` plus that instance, so it needs no context and no casts.

TASK-11: Ran the greps described above. `npm test`/`check`/`lint` could not be run (see Summary).

Manual checks for the reviewer/owner (they need a live API):
- Share a calendar and revoke a share.
- Accept and decline an invite (`/calendar?invitations`).
- Unsubscribe from a shared calendar.
- The full import flow (start, select calendars, wait for the state, reload).
- Week/month navigation with the system date on 2025-12-29 … 2026-01-04. Open the week view, then switch to the month view: it must still show the calendar month, not December 2026.
- Week navigation across 2026-W53 → 2027-W1 and back.

## Known issues / follow-ups

- **`getCalendarWeek(year, week)` is off by one week for ISO years whose 1 January falls on a Friday, Saturday or Sunday** (2021, 2022, 2023, 2027, …). For example, `getCalendarWeek(2027, 1)` starts on Mon 2026-12-28 instead of Mon 2027-01-04, and `getCalendarWeek(2027, 10)` starts on 2027-03-01 instead of 2027-03-08. Cause: it takes the Thursday of the week containing `1 Jan + (week-1)*7`, which is one week early when 1 January belongs to the previous ISO year. This bug is older than this job. It will make the week views show the wrong days for all of 2027. I did not fix it because it is outside the brief. Because of it, the new `nextWeek` 2026-W53 → 2027-W1 test does not check `mobileWeekStart`. It should be a follow-up job: fix the helper and add tests for 2027-W1/W10.
- `npm ci` + `npm test`, `npm run check` and `npm run lint` still need to run (no `node_modules` in this worktree).
- TASK-5 is still open and waiting for the owner.
- Open questions 2–6 in tasks.md are unchanged. In particular, `setMobileWeekStart()` (no callers) still sets `currentWeek` without `currentWeekYear`.
- The worktree has an uncommitted change to `/workspace/.mcp.json` (context7 MCP config). It came from the session environment, not from this job, so I left it uncommitted on purpose.
