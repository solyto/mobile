# Implementation: time tracking improvements

id: joke
developer: deepseek-v4-flash (opencode-go)
date: 2026-10-10

## Summary

Reworked the Time Tracking feature end to end so its UI matches the domain
model: URL-driven navigation, discoverable/accessible management, one source of
truth for durations and colours, a single unified entry component with correct
backdating, editing everywhere entries are shown, a separated statistics
surface, confirmed destructive actions, shared form controls, and cleaner
i18n/heading conventions. The store/contract layer and `ActiveTimer` were kept
as-is (only additive contract-mirror changes).

## Changes

TASK-1: Updated the contract mirror in `src/lib/types/time_tracking.ts` — added
optional `color` to `TimeTrackingProject` and to the create/update project
requests, added optional `has_exact_times` to `UpdateTimeTrackingEntryRequest`,
and added a `TimeTrackingStatisticsRequest` type. `loadStatistics` in
`src/lib/state/TimeTracking.svelte.ts` now takes an optional `categoryIds` array
and appends it as the statistics category filter.

TASK-2: Made the view URL-driven. Removed `activeTab` from the store; the active
tab is derived from `?tab=` in both `src/routes/time-tracking/+page.svelte` and
`TimeTrackingNavigation.svelte`, and the nav links now have distinct targets
(`/time-tracking` vs `?tab=entries`), so reload/deep-link/back-forward work.

TASK-3: Replaced the sidebar's inline `style.display` toggle with the app's
`open` `$state` + `{#if open}` + `transition:fly` drawer pattern (a shared
`{#snippet sidebar()}` renders into both the desktop column and the mobile
drawer), matching todos/notes.

TASK-4: Added `src/lib/services/TimeTrackingGroupingService.ts` (pure,
unit-tested) that groups entries by project using the project's own `color`
(theme-variable fallback), drops the impossible `uncategorized` state, and sorts
by minutes. Replaced both `groupByProject` copies (`DashboardView`,
`dashboard/widgets/TimeTrackingWidget`) and typed `TimeBreakdownWidget` from the
service. New test: `tests/unit/services/TimeTrackingGroupingService.test.ts`.

TASK-5: Replaced the sidebar and project-detail duration reduces with
`project.total_duration`.

TASK-6/7/8 (landed together; same file): Unified `EntryCreate`/`EntryEdit` into
one `EntryCreate.svelte` with an optional `entry` prop and deleted
`EntryEdit.svelte`. Both paths send consistent ISO timestamps and
`has_exact_times` on create *and* update. Duration-only entries anchor to local
noon of the chosen day (never rolling into the previous day); the date field is
hidden when exact times are used; default dates are local, not `toISOString()`.
Removed the `tt.projects[0]` defaults from the entry form and `TimerWidget`, and
both now disable Save/Start plus require an explicit project.

TASK-9: Entries are now editable from the dashboard's recent entries and the
project-detail page (the Entries tab already was), all wired to the unified
component.

TASK-10: Moved `StatisticsView` out of `DashboardView` onto its own
`?tab=statistics` surface with a sidebar link.

TASK-11: Removed `PomodoroWidget` from the time-tracking dashboard so it no
longer competes with the real timer. The component file is left in place,
currently unreferenced — see follow-ups.

TASK-12: Statistics now uses the project's own colour, passes the category
filter to the statistics endpoint (`category_ids`) instead of restricting
projects client-side, defaults its range in local time, and reports the category
bar in the shared duration format rather than hours-with-decimals.

TASK-13: Routed sidebar project/category deletes and all entry deletes through
`ConfirmationModal`, so the same action behaves the same from every surface
(the detail page already confirmed project deletes).

TASK-14: Removed the hover-only project controls (always visible now), replaced
double-click-to-rename with an explicit pencil button, labelled the colour
picker, and added `aria-label`s to all icon-only controls. `InlineEditButton`/
`InlineDeleteButton` gained an optional `label` prop (accessible name) and
`focus-visible:opacity-100`, without changing other features' behaviour.

TASK-15: Reused `NumberInput`/`DateInput`/`TextInput` across the entry, timer,
statistics and project forms, wrapped fields in `<label>` for implicit
association, and replaced silent no-ops with disabled Save buttons (entry,
timer, project).

TASK-16: Added `isLightColor`/`getReadableTextColor` to `ColorHelper` (+ tests)
and used it to guard category-chip/pill contrast; replaced the `#888`/`#9ca3af`
literals with theme variables and centralised the category default.

TASK-17: Removed the genuinely unused `timeTracking` keys `duration_minutes`,
`category`, and `this_month` from all four locales and the shared type.

TASK-18: Used the shared `Heading` for the dashboard title, statistics heading,
breakdown-widget title and project-detail title, and spaced the dashboard with a
consistent vertical rhythm.

## Known issues / follow-ups

- **API contract names are assumed.** `api-brief.md` is not present anywhere in
  the repo, so the post-change contract was mirrored from the brief's intent:
  project `color`, update `has_exact_times`, and the statistics filter were named
  `category_ids` (consistent with the project `category_ids` field). These are
  all optional/backward-compatible; confirm the real names with the API owner.
- **`project.total_duration` unit assumed to be minutes** (formatted with the
  existing `formatDuration`, which takes minutes). Confirm the unit.
- **Pomodoro (TASK-11) has no home yet.** Per the brief's "move it out" option it
  was removed from the time-tracking dashboard; `PomodoroWidget.svelte` is now
  unreferenced and awaits a product decision (wire to a real entry vs. relocate).
- **TASK-17 scope reduction.** `add_category`, `edit_category`, and `color` are
  now referenced by TASK-14 (the brief allows "remove *or* wire up"), and the
  `welcome_tour.steps.timeTracking` tips are consumed by `WelcomeTour.svelte`
  (the task's "orphaned `dev.features.timeTracking`" does not exist in the repo),
  so those were kept.
- **Pre-existing verification failures** (present before this job, unrelated):
  `tests/components/logic-leaves.test.ts` "StatisticWidget" colour-class test
  fails, and `npm run lint` fails prettier across ~450 untouched files. There are
  also pre-existing eslint errors in untouched files (e.g. `Calendars.svelte.ts`).
  `npm run check` is clean and all time-tracking/new tests pass.
- `node_modules` was absent; `npm ci` was run to restore the pinned dependencies
  purely to execute the project's own `check`/`test`/`lint` commands. No
  dependency was added or changed.
