# Verdict: 12 Use SvelteDate only where a date is mutated in place

id: tune
reviewer: @reviewer
date: 2026-10-13

## Review

Review surface: `git diff main...HEAD`. Gates were re-run on the branch:
`npm run check` 0 errors / 0 warnings, `npm run lint` clean, `npm test`
56 files / 781 tests passed.

`SvelteDate` now remains only in `EventEdit.svelte`, `SvelteDateInput.svelte`,
`WeatherWidget.svelte` (`time`) and `types/calendar.ts` (`EventForm`). This
matches the target list in tasks.md. The only `bind:date` users are EventEdit's
`form.start_date/end_date`. No component calls a setter on the store fields
that were changed.

TASK-1: PASS
notes: `DateHelper.ts`: only the constructors were swapped, `getDaysInMonth`
now returns `Date[]`, and the import was removed. No logic changed.

TASK-2: PASS
notes: `CalendarDay.date` and `OutOfScopeCalendarDay.date` are now `Date`.
`EventForm` keeps `SvelteDate`.

TASK-3: PASS
notes: The `CalendarMarks` and `ChooseRecurrenceRule` props and the
`parseDateSlug` return are now `Date`, and the unused imports were removed.

TASK-4: PASS
notes: `Calendars.svelte.ts`: field types, `loadEvents()` dates, locals and
reassignments were all swapped. The loop and casts are unchanged.
`nextDay`/`lastDay` still reassign the `$state` field right after the in-place
`setDate`, so reactivity is carried by the reassignment. `showSidebar` uses
`new Date(selectedDate as Date)`. This is a type-level cast only, and `null`
still gives the epoch, as before.

TASK-5: PASS
notes: Todos, Notes, Auth (keeps `SvelteMap`), CheckInData and
WealthStatisticsService were swapped. The `as string` casts in CheckInData and
Auth (`expires_at: string | null`) are type-only and keep runtime behaviour
unchanged. The developer disclosed the Auth casts as call sites the analyst
had not listed.

TASK-6: PASS
notes: CheckInSummaries and the three check-in routes were swapped.
WeatherWidget `date` is now `Date` and `time` stays `SvelteDate`.
`check-in/date/[date]` uses type-only `as string` casts (disclosed).

TASK-7: PASS
notes: The new test `goToToday navigates to a pinned system date` uses
`vi.useFakeTimers({ toFake: ['Date'] })` and `vi.setSystemTime`, and asserts
fixed year, month, week and date plus the `/calendars/events/2026-03` request.
`afterEach` calls `vi.useRealTimers()`. Existing tests are unchanged.

Scope: no changes outside tasks.md. `.mcp.json` is modified in the working tree
but was not committed, so it is not part of this branch.

## Security

none (not run)

## Overall

APPROVED

No blockers.
