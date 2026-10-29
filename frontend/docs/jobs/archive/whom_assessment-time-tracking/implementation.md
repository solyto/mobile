# Implementation: assessment: time tracking

id: whom
developer: deepseek-flash
date: 2026-10-10

<!-- Produced by @developer after implementation. -->

## Summary

Delivered the assessment-only job: a single evidence-based document at
`docs/jobs/whom_assessment-time-tracking/assessment.md`. Per the brief and the
`drama_funnel-icon-assessment` precedent, **no source files were changed** — the
deliverable is the report itself. The report covers navigation/IA, the data
model, CRUD flows, timer/dashboard/statistics, and visual/consistency/
accessibility/i18n, each claim cited to `file:line`, plus a ranked follow-up
table so a future implementation job can pick items up.

## Changes

- TASK-1 (navigation & IA): Audited `time-tracking/**` routes and
  `TimeTrackingNavigation.svelte`. Findings: view state lives in the store's
  `activeTab` (`TimeTracking.svelte.ts:26`) while both tabs share one href
  (`TimeTrackingNavigation.svelte:156-181`), so reload/deep-link/back do not
  restore the view; the mobile drawer is toggled via inline `style.display`
  (`:68-78`) unlike the `{#if open}`-plus-transition pattern in
  `TodoNavigationMobile`/`NoteNavigationMobile`; project/category management is
  hidden in the sidebar with hover-only and double-click affordances. Included
  an action-reachability matrix.
- TASK-2 (data model): `types/time_tracking.ts` and `apiRoutes.ts` treated as the
  contract. Findings: `project.total_duration` is never read while durations are
  recomputed in three places; the `uncategorized` fallback exists for a state the
  create API forbids; `has_exact_times` is absent from the update request and so
  cannot be edited; `buildTimestamps()` anchors duration-only entries to the
  current wall-clock time (can roll the start into the previous day); project
  colour is taken from the first category.
- TASK-3 (CRUD flows): Walked `ProjectCreate`, `EntryCreate`, `EntryEdit`,
  `Entry`, `GroupedEntries`. Findings: `EntryCreate`/`EntryEdit` are ~90%
  duplicate and disagree on timestamp/timezone handling and `has_exact_times`;
  silent validation no-ops (`EntryCreate:79`, `EntryEdit:64`,
  `ProjectCreate:44-45`); project delete is confirmed on the detail page but
  immediate in the sidebar; entries are editable from exactly one of three
  surfaces that display them; three components default to `tt.projects[0]`.
- TASK-4 (timer/dashboard/statistics): Findings: the real timer is honest and
  derived from entries; `PomodoroWidget` is a fourth, unintegrated,
  non-persisted timer that creates no entry; `DashboardView` stacks the full
  `StatisticsView` onto the dashboard; `groupByProject` is duplicated verbatim in
  `dashboard/widgets/TimeTrackingWidget.svelte`; statistics filters projects (not
  entries) by category and mixes units.
- TASK-5 (visual/consistency/accessibility/i18n): Findings: raw hand-styled
  inputs beside shared form controls; three different hard-coded colour
  fallbacks (`#1dbda5`, `#888`, `#9ca3af`); hover-only controls and
  double-click rename; missing labels/aria on icon buttons; colour-contrast risk
  on chips; six unused `timeTracking` i18n keys and an orphaned
  `dev.features.timeTracking` tip block. All four locales verified in sync.
- TASK-6 (deliverable): Wrote and re-checked `assessment.md` (executive summary,
  five audit sections, prioritised 15-item follow-up table, conclusion, and an
  explicit assessment-only scope note).

## Known issues / follow-ups

- Deliverable location: TASK-6 placed `assessment.md` inside the job directory
  (`docs/jobs/whom_assessment-time-tracking/`) matching the `drama` precedent, as
  the brief's "docs/ folder" has no established top-level `docs/assessments/`
  convention. Move it if a top-level path was intended.
- No screenshots/render report exist for this job, so all visual claims are
  grounded in template/class source rather than rendered pixels (stated in the
  report's Scope section).
- The report's recommendation to remove unused i18n keys would require also
  updating the `TimeTrackingRecords` type, which `npm run check` enforces; noted
  in the recommendation as a follow-up, not implemented here.
