# Tasks: let the week start on Sunday

id: privacy
analyst: @analyst
date: 2026-10-29

<!-- Produced by @analyst from brief.md. -->

Branch checked: the worktree HEAD is `feature/privacy_let-the-week-start-on-sunday`, which matches `brief.md`.

## Design notes (read before starting)

- **One type, one default.** `WeekStart = 'monday' | 'sunday'`. Wherever the user setting is missing (older API, logged-out store construction, tests), it falls back to `'monday'`. That way the Monday behaviour stays byte-for-byte the same.
- **Where the setting is read.** Read it from `auth.user?.settings?.week_start` at the point of use, the same way `date_format`/`time_format` are read today. Do not copy it into store state (STANDARDS 3.7). An `Auth` getter next to `getDateInUserPreferredFormat()` is the existing pattern for this.
- **Helpers stay pure.** The `DateHelper` functions take `weekStart` as a parameter and never read `auth`. Stores and components pass it in.
- **Week numbers stay ISO.** A displayed row or week is labelled with `getWeekNumber()` of the **Monday inside it**. In Sunday mode that is `start + 1 day`; in Monday mode it is `start`. In a 6-row month grid the labels stay unique (keyed `{#each ... (week.number)}` in `MonthView`/`MobileMonthView`).
- **Calendar week state.** In Sunday mode a week is not an ISO week, so the `currentWeek`/`currentWeekYear` pair cannot describe it. Replace it with one start date that moves by ±7 days. The CW number is computed from that date (Monday rule above). This removes the need for `getISOWeeksInYear()` wrap logic in the store.

## Task breakdown

TASK-1: Add the `week_start` user setting to the data model, the API routes and the `Auth` store: the `WeekStart` type, `UserSettings.week_start`, `apiRoutes.users.settings.updateWeekStart` (`PUT /users/me/settings/week-start`, body `{ week_start }`), `auth.updateWeekStart()`, and a getter that returns the setting or `'monday'`.
     files: src/lib/types/auth.ts, src/lib/config/apiRoutes.ts, src/lib/state/Auth.svelte.ts
     depends: none
     risk: medium. Unlike `updateDateFormat()`/`updateTimeFormat()`, which never write the new value back to `this.user.settings`, this one must update `this.user.settings.week_start` and call `this.save()` on success (like `updateBooleanSetting` does). Otherwise the calendar, filters and summaries keep the old week until the next reload or login.

TASK-2: Add `getStartOfWeek(date, weekStart)` to `DateHelper.ts` (local midnight of the Monday or Sunday on or before `date`). Rewrite `isDateThisWeek(date, weekStart)` on top of it, and add unit tests for both week starts: every weekday, a Sunday, a Monday, and across month and year boundaries.
     files: src/lib/helpers/DateHelper.ts, tests/unit/helpers/DateHelperExtended.test.ts (or a new tests/unit/helpers/ file for getStartOfWeek)
     depends: TASK-1 (for the `WeekStart` type only)
     risk: low. These are pure functions with tests. The current Sunday-start pin in `DateHelperExtended.test.ts:101-118` has to be rewritten for both starts, and is expected to change (the brief calls it an inconsistency).

TASK-3: Make the calendar grid helpers week-start aware. `getCalendarMonth(year, month, weekStart = 'monday')` starts the 42-day grid on the chosen day. `getCalendarWeek` changes from `(isoYear, isoWeek)` to taking a week start date and returning 7 days from it. Add a small helper for the rotated weekday header order (`[1..7]` vs `[7,1..6]`) so desktop and mobile month views share it (STANDARDS 6.2). Add tests for both starts, including the December/January boundary.
     files: src/lib/helpers/DateHelper.ts, tests/unit/helpers/DateHelperExtended.test.ts
     depends: TASK-1 (type), TASK-2 (`getStartOfWeek`)
     risk: medium. Changing `getCalendarWeek`'s signature breaks its callers (`Calendars.svelte.ts`, `WeekView.svelte`, `MobileWeekView.svelte`) and the tests at `DateHelperExtended.test.ts:182-215`. Those are fixed in TASK-9/TASK-10, so TASK-3 to TASK-10 do not type-check or pass tests on their own and should land together. `CalendarDay.weekday` must stay the ISO weekday (Mon=1 … Sun=7), because the views index `weekdays_short` with it.

TASK-4: Add a "First day of the week" `Select` (Monday / Sunday) to `LocalizationSettings.svelte`, after the time format section, wired to `auth.updateWeekStart()`. Add the new strings (label plus the two option labels) to `types/translation.ts` and `en.ts` only.
     files: src/lib/components/settings/LocalizationSettings.svelte, src/lib/types/translation.ts, src/lib/i18n/en.ts
     depends: TASK-1
     risk: low. This copies the existing date/time format sections. Check first whether `ts.get.calendar.weekdays` (or similar) already holds full weekday names that could serve as option labels (STANDARDS 2.3) before adding new keys.

TASK-5: Hand the new strings to the `translator` agent for `de`, `es`, `fr`, `it` (per `docs/I18N.md`). Do not translate by hand.
     files: src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts, src/lib/i18n/it.ts
     depends: TASK-4
     risk: low. `npm run check` fails until all locale files match, so this has to be done before the job is checked.

TASK-6: Replace the copied inline Monday calculation in the time tracking "this week" breakdown and the dashboard widget with `getStartOfWeek(new Date(), <user week start>)`.
     files: src/lib/components/time-tracking/DashboardView.svelte (line 28), src/lib/components/dashboard/widgets/TimeTrackingWidget.svelte (line 23)
     depends: TASK-1, TASK-2
     risk: low. Same result in Monday mode. Keep the existing `$derived.by` shape and do not restructure it.

TASK-7: Make the todo "due this week" filter use the user's week start. `TodoFilterService.filterByDueDate`/`filter` pass `weekStart` into `isDateThisWeek()`, and `Todos.svelte.ts` (which already holds `auth`) supplies it. Update `tests/unit/services/TodoFilterService.test.ts:227` to cover both starts.
     files: src/lib/services/TodoFilterService.ts, src/lib/state/Todos.svelte.ts, tests/unit/services/TodoFilterService.test.ts
     depends: TASK-1, TASK-2
     risk: medium. This changes behaviour for every existing user: today "this week" is Sunday to Saturday, and with the default `'monday'` it becomes Monday to Sunday (intended per the brief's "Why"). Prefer a method parameter over constructor injection so `YourDay.svelte`'s `new TodoFilterService()` (which only uses `'today-overdue'`) stays untouched. Do not add a default parameter if that would hide a missing pass-through.

TASK-8: Make the check-in "this week / last week" summaries group days by `getStartOfWeek(d, weekStart)` (this week = start of today, last week = that minus 7 days) instead of `getISODateInfo().week/year`.
     files: src/lib/components/check-in/overview/CheckInSummaries.svelte
     depends: TASK-1, TASK-2
     risk: low. The component already has `auth`. In Monday mode, ISO-week grouping and Monday-start grouping give the same buckets, so nothing changes for Monday users. Compare dates with `getUrlFormat()` or timestamps, not with `Date` object identity.

TASK-9: Change the `Calendars` store's week navigation from ISO `currentWeek`/`currentWeekYear` to one week start date. The constructor, `goToToday()` and `setMobileWeekStart()` use `getStartOfWeek(…, weekStart)`. `nextWeek`/`lastWeek` move it by ±7 days. The CW number comes from the Monday inside the week. `loadMonth()` passes the week start to `getCalendarMonth()` and labels each row by the ISO week of its Monday. Update `tests/unit/stores/Calendars.test.ts` (week navigation, year wrap, `goToToday`, `loadMonth`), with Sunday cases next to the existing Monday ones.
     files: src/lib/state/Calendars.svelte.ts, tests/unit/stores/Calendars.test.ts (lines ~45-100, 353-525), possibly src/routes/calendar/+page.svelte (see risk)
     depends: TASK-1, TASK-3
     risk: high. This is the biggest change: about 15 store tests pin the ISO week state, and `currentWeek` is read by three components. Two concerns:
       1. The store is created once in the root layout, and its constructor runs `loadMonth()`. A user who changes the setting and then opens `/calendar` gets a stale grid, because the page only calls `loadEvents`/`loadMarks`, not `loadMonth`. The page probably needs to call `calendars.loadMonth()` on mount (and before `loadMarks`, which reads the grid's first and last day).
       2. Check whether `auth.user` is already populated when the constructor runs. If not, the initial week start falls back to Monday until the next navigation or reload.

TASK-10: Update the week views and week labels to the new store state. `WeekView.svelte`/`MobileWeekView.svelte` build their days from the store's week start date, and their `onMount` resets to the current week via `getStartOfWeek` instead of ISO week fields. `WeekNavigation.svelte` and `MobileCalendarHeader.svelte` show the derived CW number.
     files: src/lib/components/calendars/views/week/WeekView.svelte, src/lib/components/calendars/views/week/MobileWeekView.svelte, src/lib/components/calendars/views/week/WeekNavigation.svelte, src/lib/components/calendars/MobileCalendarHeader.svelte
     depends: TASK-9
     risk: medium. The `onMount` resets currently write store state from the component. Keep the same behaviour (reset to today's week on mount) and do not add any `$effect`. The desktop and mobile variants must change the same way (STANDARDS 6.1).

TASK-11: Rotate the weekday header row in the month views to match the grid, using the shared order helper from TASK-3 instead of `Array.from({ length: 7 }, (_, i) => i + 1)`.
     files: src/lib/components/calendars/views/month/MonthView.svelte, src/lib/components/calendars/views/month/MobileMonthView.svelte
     depends: TASK-3, TASK-9
     risk: low. Header only. The grid rows come from `calendars.month`, which TASK-9 already builds with the right start.

TASK-12: Pass the user's week start to the date picker: `startOfWeek="0"` for Sunday, `"1"` for Monday.
     files: src/lib/components/forms/DatePicker.svelte
     depends: TASK-1
     risk: low/medium. `node_modules` is not present in the worktree, so I could not check that `@svelte-plugins/datepicker@1.0.11` takes `"0"` for Sunday and whether it reacts to the prop. The developer should check the package source or docs before relying on it.

TASK-13: Verify: `npm run check`, `npm run lint`, `npm test`, then a manual run with both settings, on a Sunday and on a Monday (system clock or pinned date). Cover calendar month and week views (desktop and mobile), the date picker, the time tracking dashboard and dashboard widget, the todo "this week" filter, and the check-in summaries. Also check that CW labels match the Monday layout, and that switching the setting while the app is open updates the calendar without a reload.
     files: none (verification only)
     depends: TASK-1 – TASK-12
     risk: low. Verification only. It is the only place the UI-level behaviour gets checked, because there are no component tests.

## Open questions (not decided here; not in the brief)

1. **Journal archive picker.** `src/lib/components/notes/journal/JournalArchivePicker.svelte` also uses `getCalendarMonth()` and a hardcoded `[1..7]` weekday header, but the brief does not list it. With the `'monday'` default parameter from TASK-3 it stays on Monday. The brief says the setting applies "wherever the app has a notion of the week", so the owner should decide whether it should follow the setting (that would be one more small task, the same as TASK-11).
2. **`mobileWeekStart` / `setMobileWeekStart()`.** Nothing outside the store and its tests reads `mobileWeekStart`, and nothing calls `setMobileWeekStart()`. They look like dead code. TASK-9 should keep them consistent with the new week start, not delete them, unless the owner says otherwise (removing them is an unrelated refactor).
3. **Onboarding.** `dashboard/onboarding-modal/OnboardingModalStepLocalization.svelte` asks for date and time format at sign-up. The brief only names `LocalizationSettings.svelte`, so the week start is **not** added to onboarding.
4. **API availability.** The client depends on the API backlog item `api/docs/backlog/user-setting-week-start.md`. Until the API returns `week_start` and accepts the PUT, the setting will not save. The `'monday'` fallback keeps the app working in the meantime.
