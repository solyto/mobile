# Implementation: let the week start on Sunday

id: privacy
developer: @developer
date: 2026-10-29

## Summary

A per-user "First Day of the Week" setting (`week_start`: `monday` | `sunday`, default and fallback `monday`). It is read from `auth.getWeekStart()` where it is used and passed as a parameter into pure `DateHelper` functions. One helper, `getStartOfWeek(date, weekStart)`, replaces the separate inline week calculations. The setting now drives the calendar month and week views (desktop and mobile), the todo date picker, time tracking "this week" (page and dashboard widget), the todo "due this week" filter and the check-in week summaries. Week numbers stay ISO: a week is labelled by the ISO week of its Monday.

The calendar store no longer tracks the week as ISO `currentWeek`/`currentWeekYear`. It tracks one `currentWeekStart` date that moves by ±7 days, and `currentWeekNumber` is a getter derived from it.

## Changes

TASK-1: `types/auth.ts` adds `WeekStart` and `UserSettings.week_start`. `apiRoutes.ts` adds `users.settings.updateWeekStart` (`PUT /users/me/settings/week-start`). `Auth.svelte.ts` adds `updateWeekStart()`, which on success writes the value back to `user.settings` and calls `save()` (unlike date/time format), and `getWeekStart()`, which falls back to `'monday'`.

TASK-2: `DateHelper.ts` adds `getStartOfWeek(date, weekStart)` (local midnight of the Monday or Sunday on or before the date). `isDateThisWeek(date, weekStart)` is built on it, which fixes the old Sunday-start inconsistency. In `DateHelperExtended.test.ts`, the old Sunday pin is replaced with tests for both starts (every weekday, Sunday/Monday edges, month and year boundaries).

TASK-3: In `DateHelper.ts`, `getCalendarMonth(year, month, weekStart = 'monday')` starts the grid on the chosen day. `getCalendarWeek(startOfWeek)` now takes a start date instead of an ISO year/week. New: `getWeekNumberOfWeek(startOfWeek)` (ISO week of the Monday inside the week) and `getWeekdayOrder(weekStart)` (header order shared by desktop and mobile). `CalendarDay.weekday` stays ISO. Tests cover both starts and the December/January boundary, plus a 2000–2100 check that week labels match the Monday's ISO week.

TASK-4: `LocalizationSettings.svelte` gets a "First Day of the Week" `Select` after the time format, wired to `auth.updateWeekStart()`. The option labels reuse `ts.get.calendar.weekdays[1]` and `[7]` (STANDARDS 2.3), so the only new key is `settings.week_start` in `types/translation.ts` and `en.ts`. Unlike its siblings, the new select has no unused `bind:input` state.

TASK-5: `week_start` was added to `de`, `es`, `fr` and `it`. See known issues: the translator agent could not be invoked from this session.

TASK-6: `time-tracking/DashboardView.svelte` uses `getStartOfWeek(new Date(), auth.getWeekStart())`. `dashboard/widgets/TimeTrackingWidget.svelte` gets a `weekStart` prop (a leaf must not read auth, STANDARDS 3.3), and `QuickGlance.svelte` passes it.

TASK-7: `TodoFilterService.filter()` and `filterByDueDate()` take a required `weekStart` (no default). `Todos.useFilters()` and `YourDay.svelte` pass `auth.getWeekStart()`; the `new TodoFilterService()` line in `YourDay` is unchanged. `TodoFilterService.test.ts` pins the clock and covers both starts. `tests/unit/setup/storeMocks.ts` gets `auth.getWeekStart` (resets to `'monday'`).

TASK-8: `CheckInSummaries.svelte` groups days by `getUrlFormat(getStartOfWeek(d, weekStart))` instead of ISO week/year. Nothing changes for Monday users.

TASK-9: In `Calendars.svelte.ts`, `currentWeek`/`currentWeekYear` are replaced by `currentWeekStart` plus a `currentWeekNumber` getter. `nextWeek`/`lastWeek` move by ±7 days, so the `getISOWeeksInYear` wrap logic is no longer needed. The constructor, `goToToday()` and `setMobileWeekStart()` use `getStartOfWeek`. A new `goToCurrentWeek()` gives the views a method for their on-mount reset instead of writing store fields. `loadMonth()` passes the week start and labels rows by their Monday. `Calendars.test.ts` is rewritten for the new state, with Sunday cases next to the Monday ones (navigation, year wrap, constructor and `goToToday` around New Year, `loadMonth`).
  The two risks from the task list turned out not to apply. `Calendars` is a feature store created in `routes/calendar/+layout.svelte` (and on the dashboard), so it is rebuilt with the current setting every time `/calendar` mounts, and `/calendar/+page.svelte` did not need a `loadMonth()` call. `Auth` restores `user` from localStorage synchronously in its constructor, before its first `await`, so the setting is there when `Calendars` is constructed.

TASK-10: `WeekView.svelte`/`MobileWeekView.svelte` build days from `calendars.currentWeekStart` and reset with `onMount(() => calendars.goToCurrentWeek())`; both variants changed the same way. `WeekNavigation.svelte` and `MobileCalendarHeader.svelte` show `currentWeekNumber`.

TASK-11: `MonthView.svelte`/`MobileMonthView.svelte` use `getWeekdayOrder(auth.getWeekStart())` for the header row.

TASK-12: `forms/DatePicker.svelte` takes a `weekStart` prop and maps it to `startOfWeek={weekStart === 'sunday' ? 0 : 1}`. Its three uses in `todos/props/DueDate.svelte` pass `auth.getWeekStart()`. I checked the package source of `@svelte-plugins/datepicker@1.0.11` (downloaded with `npm pack` into a temp directory, not installed): `startOfWeek` is a number, `0` is Sunday (`dowLabels` starts with `Su`), and it is reactive (`$: calendarize(…, startOfWeek)`).

Extra (needed by TASK-1): `tests/unit/auth/Auth.test.ts` adds `week_start` to the `user()` factory, which is now required by the type, plus tests for `getWeekStart()` (fallback and stored value) and `updateWeekStart()` (write-back and persist on success, unchanged on API rejection).

TASK-13: only partly done, see below.

## Known issues / follow-ups

- **Not verified with the real toolchain.** `node_modules` is not in the worktree and installing packages needs approval, so `npm run check`, `npm run lint` and `npm test` were **not** run. Please run all three before merging. What I did instead:
  - I ran `tests/unit/helpers/DateHelperExtended.test.ts` (55/55) and `tests/unit/services/TodoFilterService.test.ts` (26/26) under Node's type stripping with a small throwaway vitest shim outside the repo.
  - The store tests (`Calendars.test.ts`, `Auth.test.ts`) need the Svelte compiler and could not run. I checked their expected dates and week numbers against the helpers separately.
  - I grepped every caller of each changed signature and checked the changed files for trailing commas.
- **No manual or rendered run.** There is no API and no dev server here, so the manual pass from the brief and `shot` renders were not done: both settings, on a Sunday and on a Monday, across calendar month and week (desktop and mobile), the date picker, time tracking and its widget, the todo "this week" filter and the check-in summaries.
- **Translations were not done by the translator agent.** No sub-agent tool was available in this session. I added the one new label myself, following `docs/I18N.md` (sentence case, matching the neighbouring `date_format`/`time_format` keys): de "Erster Wochentag", es "Primer día de la semana", fr "Premier jour de la semaine", it "Primo giorno della settimana". Please review, or re-run the translator agent on `settings.week_start`.
- **Behaviour change for every user.** The todo "due this week" filter used to cover Sunday to Saturday. With the default `monday` it now covers Monday to Sunday, as the brief intends.
- **Now unused in `src/`:** `getISOWeeksInYear()` and `getISODateInfo()` in `DateHelper.ts` (only their tests still use them). I left them in place to keep scope tight; removing them is a small follow-up.
- **Open questions from `tasks.md`, left as they were:**
  - `JournalArchivePicker.svelte` stays Monday-first through the `getCalendarMonth` default.
  - `mobileWeekStart`/`setMobileWeekStart()` are kept consistent but still look unused.
  - Onboarding does not ask for the week start.
- **API dependency.** The setting only saves once the API from `api/docs/backlog/user-setting-week-start.md` returns and accepts `week_start`. Until then everything falls back to Monday.
