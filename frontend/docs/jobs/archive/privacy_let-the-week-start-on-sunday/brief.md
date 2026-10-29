# Brief: let the week start on Sunday

type: feature
id: privacy
branch: feature/privacy_let-the-week-start-on-sunday
date: 2026-10-29
author: Leander Muskalla

## What

A per-user "First day of the week" setting: Monday (current behaviour, default) or Sunday (user request). It lives in Localization settings and applies wherever the app has a notion of "the week".

When set to Sunday:

- **Calendar month view** (desktop and mobile): the grid starts each row on Sunday, and the weekday header row is rotated to match.
- **Calendar week view** (desktop and mobile): shows Sunday to Saturday. Next/previous week and "today" move in those weeks.
- **Calendar date picker** (`forms/DatePicker.svelte`, `startOfWeek="1"`): starts on Sunday.
- **Time tracking "this week"**: `time-tracking/DashboardView.svelte:28` and `dashboard/widgets/TimeTrackingWidget.svelte:23` (same copied Monday line).
- **Todo "due this week" filter**: `isDateThisWeek()` in `DateHelper.ts`, used by `TodoFilterService.ts:70`.
- **Check-in "this week / last week" summaries**: `check-in/overview/CheckInSummaries.svelte:57-68`, which currently groups days by ISO week.

Week numbers stay ISO ("CW 44"), even though a Sunday-to-Saturday row spans two ISO weeks. Label a row or week by the ISO week of its Monday, so the number stays the same as in the Monday layout.

## Why

In many countries (US, Canada, Brazil, Japan, ...) the week starts on Sunday, and a calendar starting on Monday feels wrong there. Requested by a user. Since the setting sits in Localization, every "this week" in the app should follow it, not just the calendar.

It also fixes an existing inconsistency: `isDateThisWeek()` currently uses a Sunday-start week (`today - getDay()`), while the rest of the app uses Monday. With the setting, all of them use the same week.

## Out of scope

- US-style week numbering, or hiding week numbers in Sunday mode.
- Other first days (e.g. Saturday), although the API stores a string so they can be added later.
- The admin user growth chart (`admin/UserGrowthChart.svelte`): stays grouped by ISO week.
- The weekday checkbox order in `ChooseRecurrenceRule.svelte` (MO to SU).

## Notes

**Shared helper.** Add one function to `DateHelper.ts`, e.g. `getStartOfWeek(date, weekStart)`, and use it in time tracking, the dashboard widget, `isDateThisWeek()` and the check-in summaries instead of the separate inline calculations.

**Calendar, where Monday is hardcoded:**

- `src/lib/helpers/DateHelper.ts`: `getCalendarMonth()` (`// Monday = 0`) and `getCalendarWeek(year, week)`, which derives the days from an ISO week number.
- `src/lib/state/Calendars.svelte.ts`: the week view tracks its position as ISO `currentWeek`/`currentWeekYear` (`nextWeek`/`lastWeek` via `getISOWeeksInYear`, constructor, `goToToday`, `setMobileWeekStart`). This is the biggest part: a Sunday week is not an ISO week, so the week state probably has to become a start date that moves by ±7 days, with the CW number derived from it.
- `WeekView.svelte` / `MobileWeekView.svelte` reset to the current ISO week in `onMount`.
- `MonthView.svelte` / `MobileMonthView.svelte`: `const weekdays = Array.from({ length: 7 }, (_, i) => i + 1)` (always Mon to Sun).
- Week numbers shown in `WeekNavigation.svelte`, `MobileCalendarHeader.svelte` and `loadMonth()` (`getWeekNumber`).

**Setting.** Stored per user, like the other localization settings (date format, time format), so it applies on every device. API side: `api/docs/backlog/user-setting-week-start.md` (`week_start`: `monday` | `sunday`, `PUT /users/me/settings/week-start`). In the app: `types/auth.ts`, `apiRoutes.ts`, a "First day of the week" `Select` in `settings/LocalizationSettings.svelte` after the time format, and the new strings in every i18n file.

**Tests.** The current Sunday behaviour of `isDateThisWeek()` is pinned by `tests/unit/services/TodoFilterService.test.ts:227` and `tests/unit/helpers/DateHelperExtended.test.ts`. Update them for both week starts. Add unit tests for `getStartOfWeek()`, the month grid and the week days with both starts, including year boundaries.

Safety: `check`, `test`, plus a manual run with both settings: calendar month and week views (desktop and mobile), the date picker, time tracking and the dashboard widget, the todo "this week" filter and the check-in summaries, on a Sunday and on a Monday.
