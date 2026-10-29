# Verdict: let the week start on Sunday

id: privacy
reviewer: @reviewer
date: 2026-10-29

## Review

Branch checked: `feature/privacy_let-the-week-start-on-sunday` (matches `brief.md`). The diff is `git diff main...HEAD` (no `base:` in the brief, `baseBranch: main`).

What I checked beyond reading the code: I ran the changed `DateHelper` functions directly (Node type stripping, no install) for every day from 1999 to 2030, with both week starts, in UTC, America/New_York, Europe/Berlin and America/Sao_Paulo (Sao Paulo has had DST at midnight). In every case:
- `getStartOfWeek` returns a Monday or a Sunday 0 to 6 days before the date.
- `getWeekNumberOfWeek` equals the ISO week of the Monday.
- `getCalendarWeek` starts on the right weekday.
- `getCalendarMonth` returns 42 days, starts on the right weekday, and has the correct number of in-month days.

0 failures. In Monday mode, `getStartOfWeek(1st, 'monday')` comes out the same as the old `(getDay() || 7) - 1` offset, so the Monday grid has not changed.

TASK-1: PASS
notes: `WeekStart`, `UserSettings.week_start`, `apiRoutes.users.settings.updateWeekStart`, and `Auth.updateWeekStart()`, which writes the value back and calls `save()` on success as required. `getWeekStart()` falls back to `'monday'`. The tests in `Auth.test.ts` cover the fallback, the write-back, and an API rejection. `const { week_start: _, ... }` is allowed by the eslint `ignoreRestSiblings: true` setting.

TASK-2: PASS
notes: `getStartOfWeek` builds local midnight with the `new Date(y, m, d - n)` constructor, so DST does not shift it (checked above). `isDateThisWeek` uses a half-open `[start, start+7)` range, so 23:59 on the last day is in the week and 00:00 on the next day is not. The tests cover both starts, a Sunday and a Monday as "today", and month/year boundaries.

TASK-3: PASS
notes: `getCalendarMonth(…, weekStart = 'monday')`, `getCalendarWeek(startOfWeek)`, `getWeekNumberOfWeek`, and `getWeekdayOrder`, which is shared by both month views. `CalendarDay.weekday` stays ISO. Every caller of the changed signature has been updated (grepped `src` and `tests`).

TASK-4: PASS
notes: The `Select` comes after time format. The option labels reuse `ts.get.calendar.weekdays[1]` and `[7]` (STANDARDS 2.3), so `settings.week_start` is the only new key. The label is in Title Case, the same as its sibling labels in `en`.

TASK-5: PASS
notes: The translator agent could not be run in that session. The developer added the one label to `de/es/fr/it` by hand and said so in `implementation.md`. Each is the standard term and matches the casing of the neighbouring `date_format`/`time_format`. I don't see this as a correctness problem.

TASK-6: PASS
notes: `DashboardView.svelte` uses `getStartOfWeek(new Date(), auth.getWeekStart())`. `TimeTrackingWidget` gets `weekStart` as a prop from `QuickGlance` instead of reading auth (STANDARDS 3.3). The `$derived.by` shape is unchanged.

TASK-7: PASS
notes: `weekStart` is a required parameter with no default. The callers that pass it are `Todos.useFilters()` and `YourDay.svelte`; YourDay's `new TodoFilterService()` is unchanged. The tests pin the clock and cover both starts, including "today is a Sunday".

TASK-8: PASS
notes: The summaries group by the `getUrlFormat(getStartOfWeek(d, weekStart))` string, not by `Date` identity. Last week is `getStartOfWeek(today - 7)`. In Monday mode the buckets are the same as before.

TASK-9: PASS
notes: `currentWeekStart` and the `currentWeekNumber` getter replace the ISO pair, and the `getISOWeeksInYear` wrap logic is gone. Both risks from `tasks.md` were checked and don't apply:
- `setCalendars()` runs in `routes/calendar/+layout.svelte` and `routes/+page.svelte`, not in the root layout, so the store is rebuilt with the current setting.
- `Auth` restores `user` synchronously.

The store tests add Sunday cases for navigation, the 52/53-week boundaries, the constructor and `goToToday` around New Year, and `loadMonth`.

TASK-10: PASS
notes: Both week views build from `calendars.currentWeekStart` and reset with `onMount(() => calendars.goToCurrentWeek())`, the same change in each, with no `$effect`. `WeekNavigation` and `MobileCalendarHeader` show `currentWeekNumber`.

TASK-11: PASS
notes: `MonthView` and `MobileMonthView` use `getWeekdayOrder(auth.getWeekStart())`.

TASK-12: PASS
notes: `startOfWeek={weekStart === 'sunday' ? 0 : 1}`. The developer checked the package source (0 = Sunday, the prop is reactive). All three `DueDate.svelte` uses pass the setting.

TASK-13: PARTIAL
notes: No `node_modules` in the worktree, so `npm run check`, `npm run lint` and `npm test` were not run, and there was no manual or rendered pass. I could not run them either: installing needs approval. The helper logic is covered by my own run above, and the store and component changes were reviewed by reading them.

Scope: everything in the diff matches a task. The extras are all needed by the type and signature changes and are listed in `implementation.md`:
- the `QuickGlance` prop pass-through
- `YourDay` passing the week start
- the `storeMocks` `getWeekStart` mock
- the `Auth.test` factory field

Nothing unrelated was refactored. The open questions from `tasks.md` (JournalArchivePicker, onboarding, `mobileWeekStart`) were left as they were, which is correct.

## Security

Not run. The change adds one user-settings PUT using the existing `ApiService`. No tokens or user data are logged.

## Overall

APPROVED

I found no code changes that are required. One step from the brief's "Safety" line is still open and must happen before merge: run `npm run check`, `npm run lint` and `npm test` with dependencies installed. Then do the manual pass in both modes, on a Sunday and on a Monday.
