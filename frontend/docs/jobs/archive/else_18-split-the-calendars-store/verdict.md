# Verdict: 18 Split the Calendars store

id: else
reviewer: @reviewer
date: 2026-10-14

Branch verified: `feature/else_18-split-the-calendars-store`. Reviewed `git diff main...HEAD`.
Every changed file in the diff is listed in implementation.md. Nothing changed outside the planned scope.

## Review

TASK-1: PASS
notes: `getISOWeeksInYear` (DateHelper.ts:351) returns the ISO week of 28 Dec. I ran it against the real helper with Node type-stripping (TZ=UTC). Results: 2020→53, 2021→52, 2025→52, 2026→53, 2027→52, 2032→53. Tests match the plan.

TASK-2: PASS
notes: The buggy wrap tests (month 13/0, week 2, week 52) are rewritten. The new tests cover:
- constructor and `goToToday` for 2025-12-29 … 2026-01-04;
- `goToToday` on 2027-01-01 (2026-W53);
- `nextWeek`/`lastWeek` across a 52-week year and a 53-week year;
- `currentYear`/`currentMonth` left alone.
`afterEach` calls `vi.useRealTimers()` (line 38). The expected `mobileWeekStart` values match what `getCalendarWeek` returns (Dec 29 2025, Dec 22 2025, Dec 28 2026). I checked these by running the helper.

TASK-3: PASS
notes: `currentWeekYear` is set from `getISODateInfo` in the constructor and in `goToToday()`. `nextWeek`/`lastWeek` wrap on `getISOWeeksInYear(currentWeekYear)` and no longer touch `currentYear`/`currentMonth`. The month path is unchanged. `getWeekNumber` is still imported because it is still used (lines 114, 251).

TASK-4: PASS
notes: `WeekView` and `MobileWeekView` read and write `currentWeekYear`. No `currentYear` references are left in the week views.

TASK-5: NOT DONE (blocked by design)
notes: This is correctly left out until the owner confirms, as the brief and tasks.md require. It is not a blocker for this job.

TASK-6: PASS
notes: `CalendarImport.svelte.ts` has the 15.2 shape. The methods are copied verbatim, and the unused type imports were removed from `Calendars`.

TASK-7: PASS
notes: The store is registered in the calendar `+layout.svelte`. All three callers are switched, and `ImportModal` keeps `getCalendars()` for the reload. `contacts/+page.svelte` uses `components/contacts/ImportModal`, a different component, so it is not affected.

TASK-8: PASS
notes: `CalendarSharing` takes `calendars = getCalendars()` as a default, and the reloads go through `this.calendars`. The method bodies are otherwise verbatim. `ShareCalendarRequest` was removed from `Calendars`.

TASK-9: PASS
notes: `setCalendarSharing()` is registered after `setCalendars()`. None of the sharing components are reachable from the dashboard (`src/routes/+page.svelte`): `CalendarEdit` and `PendingCalendarInvite` are only used via `ManageCalendars`, which only appears in the `/calendar` headers. So the context exists wherever it is read. A grep finds no leftover `calendars.<moved member>` references.

TASK-10: PASS
notes: The three tests were moved to `CalendarSharing.test.ts` with their assertions unchanged, and they were removed from `Calendars.test.ts`.

TASK-11: PARTIAL (environment, not code)
notes: The worktree has no `node_modules`, so neither the developer nor the reviewer could run `npm test`, `check` or `lint`. Installing packages without asking is forbidden. I checked the helper logic directly, and I found no unused imports or dangling references by reading the code. The owner still has to run tests/check/lint and the manual checks in implementation.md before merging.

## Security

none (not run)

## Overall

APPROVED

No code changes required. Before merging, the owner has to:
- run `npm ci && npm test && npm run check && npm run lint`, since they could not run in the agent worktree;
- do the manual checks listed in implementation.md.

The pre-existing `getCalendarWeek` off-by-one-week bug for ISO years whose 1 Jan falls on Fri/Sat/Sun is out of scope. It is correctly recorded as a follow-up.
