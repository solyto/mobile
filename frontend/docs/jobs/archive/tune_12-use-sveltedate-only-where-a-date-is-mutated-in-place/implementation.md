# Implementation: 12 Use SvelteDate only where a date is mutated in place

id: tune
developer: @developer
date: 2026-10-13

## Summary

Replaced `SvelteDate` with plain `Date` everywhere no setter is called on a
value while it is rendered (STANDARDS 14.1). This covers loaded API data,
helper return values, read-only props, and throwaway locals. Only the
constructor or type was swapped; no date logic changed. `SvelteDate` now
remains only in `EventEdit.svelte`, `SvelteDateInput.svelte`,
`WeatherWidget.svelte` (`time`, ticked with `setTime`) and `types/calendar.ts`
(`EventForm.start_date/end_date`), which matches the analyst's target list.
I added one store test that pins "today" with `vi.setSystemTime`.

Gates after every task: `npm run check` (0 errors, 0 warnings), `npm run lint`
(clean), `npm test` (781 tests pass: the 780 baseline tests plus the new one).
`node_modules` was missing in the worktree, so I ran `npm ci` to install the
pinned lockfile set. No packages were added or changed.

## Changes

TASK-1: `src/lib/helpers/DateHelper.ts`: every `new SvelteDate(...)` is now
`new Date(...)`, `getDaysInMonth` returns `Date[]`, and the import is removed.

TASK-2: `src/lib/types/calendar.ts`: `CalendarDay.date` and
`OutOfScopeCalendarDay.date` are now `Date`. `EventForm` keeps `SvelteDate`.

TASK-3: `CalendarMarks.svelte` (`date` prop), `ChooseRecurrenceRule.svelte`
(`startDate` prop, `import type`) and `dnd/CalendarDragState.svelte.ts`
(`parseDateSlug` return) now use `Date`, and the imports are removed.

TASK-4: `src/lib/state/Calendars.svelte.ts`: the field types
(`currentDate`, `selectedDate`, `mobileSelectedDate`, `mobileWeekStart`), the
four per-event dates in `loadEvents()`, and all locals and reassignments now use
`Date`. A grep confirmed that no component calls a setter on those four fields.
The only `bind:date` is EventEdit's own form state. In `showSidebar`,
`new SvelteDate(selectedDate)` became `new Date(selectedDate as Date)`. This is
a type-level cast only, because `SvelteDate`'s constructor is typed `any[]` and
its runtime is just `super(...params)`. A `null` input still gives the 1970
epoch, as before.

TASK-5: `Todos`, `Notes`, `Auth` (keeps `SvelteMap`), `CheckInData` and
`WealthStatisticsService` now use `Date`. In `CheckInData.getDayData`, the
`string | undefined` argument gets a type-level `as string`, and runtime is
unchanged (an `undefined` input still gives an Invalid Date).

TASK-6: `CheckInSummaries.svelte`, `routes/check-in/{trends,history,date/[date]}/+page.svelte`
and `WeatherWidget.svelte` (`date` only) now use `Date`.

TASK-7: `tests/unit/stores/Calendars.test.ts`: new test
`goToToday navigates to a pinned system date`. It uses
`vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime(2026-03-04 12:00)`
and asserts year/month/ISO week 10/`currentDate` and the
`/calendars/events/2026-03` request. A file-level `afterEach` calls
`vi.useRealTimers()`. Existing tests are unchanged. To check the test proves the
point, I temporarily restored the pre-job `Calendars.svelte.ts`,
`DateHelper.ts` and `calendar.ts`. Against those files the new test fails, and
against the job's code it passes. The files were then restored from HEAD.

## Known issues / follow-ups

- **Three more nullable call sites the analyst didn't list.** Each got the same
  type-level `as string` cast, with runtime unchanged:
  - `Auth.svelte.ts`, 3×: `new Date(authToken.expires_at as string)`. The type
    is `expires_at: string | null`.
  - `routes/check-in/date/[date]/+page.svelte`, 2×: `new Date(date as string)`.
    The value comes from `page.params.date`, typed `string | undefined`.

  These casts keep the existing behaviour, which may itself be a latent bug.
  A `null` `expires_at` becomes epoch, so the token is treated as expired.
  `showSidebar(null, …)` sets `selectedDate` to 1970-01-01. Fixing either one
  would be a logic change, so I left it for the owner.
- The tasks said the fake-timer tests in `tests/unit/helpers/DateHelperExtended.test.ts`
  currently fail. They already passed at baseline (backlog 01 has been closed)
  and still pass after this job.
- Possibly stale docs, left for the owner as instructed:
  - `STANDARDS.md` 14.1 ("16 files today"; it is 4 now).
  - The `TESTING.md` §7 caveat about `SvelteDate` and `vi.setSystemTime`.
  - The matching `STANDARDS_BACKLOG.md` checkbox.
- The tests in `tests/unit/stores/Calendars.test.ts` still build their fixtures with `SvelteDate`.
  They pass, so they weren't rewritten.
- `.mcp.json` shows as modified in the worktree. It was not changed by this
  job (it appears to be session tooling config), so I left it uncommitted.
