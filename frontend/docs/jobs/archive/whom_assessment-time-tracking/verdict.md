# Verdict: assessment: time tracking

id: whom
reviewer: deepseek-flash
date: 2026-10-10

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

TASK-1: PASS
notes: Navigation/IA audit is accurate on every spot-checked point. `activeTab`
default is `TimeTracking.svelte.ts:26`; both nav links share
`resolve(urls.timeTracking)` and only mutate state
(`TimeTrackingNavigation.svelte:156-181`); mobile drawer uses inline
`style.display` (`:68-78`) with the `hidden … lg:flex` container (`:143`) — the
report's "inline display outranks lg:flex after a resize" bug is real. Action
matrix entries (`+page.svelte:23-26`, `[id]/+page.svelte:139-179`,
`TimeTrackingNavigation.svelte:189-238`) all match the source.

TASK-2: PASS
notes: Data-model claims verified. `total_duration` (`types/time_tracking.ts:14`)
is never read while durations are recomputed in `TimeTrackingNavigation:38-47`,
`[id]/+page.svelte:44-50`, `DashboardView:43-65`, `TimeTrackingWidget:41-52`;
`has_exact_times` is on `CreateTimeTrackingEntryRequest` (`:58`) but absent from
`UpdateTimeTrackingEntryRequest` (`:62-68`); the `uncategorized` fallback
(`DashboardView:32-33`, `TimeTrackingWidget:31`) exists despite `project_id`
being required (`:53-60`); `buildTimestamps` (`EntryCreate:65-76`) anchors to
`now` wall-clock and can roll `started_at` into the previous day; project colour
is first-category colour (`DashboardView:33`) vs. server `color` in
`StatisticsView:47`. Contract/API-REST surface (`apiRoutes.ts:271-294`) matches.

TASK-3: PASS
notes: All CRUD findings reproduce. Silent guards at `EntryCreate:79` and
`EntryEdit:64`; `ProjectCreate:44-45`; the create/edit drift table matches
(`EntryCreate:30,33,63,67,89,130-139` vs `EntryEdit:31-33,68-77`); the timezone
mismatch (raw `datetime-local` vs `toISOString()`, and
`entry.started_at.slice(0,16)` fed to a `datetime-local`) is correctly
identified; delete-confirmation inconsistency (`[id]/+page.svelte:90-100` vs
`TimeTrackingNavigation:229-238`, `Entry.svelte:64-66`); default-to-first-project
in `TimerWidget:14`, `EntryCreate:33`, `EntryEdit:31`.

TASK-4: PASS
notes: Timer/dashboard/statistics claims verified. `ActiveTimer` derives elapsed
and clears its interval (`ActiveTimer.svelte:15-33`); `PomodoroWidget` imports
only `getTranslation` and creates no entry (`PomodoroWidget.svelte:1-126`);
`DashboardView` stacks timer/pomodoro/two breakdowns/recent/full
`StatisticsView` (`DashboardView.svelte:68-97`) with the grid classes as
described (`:69-70,73`; `TimeBreakdownWidget.svelte:18`); `groupByProject` is
duplicated verbatim (`DashboardView:26-41`, `TimeTrackingWidget:24-39`); the
statistics category filter filters *projects* (`StatisticsView:30-37`), the
donut uses server colour (`:47`), bars use hours (`:67`), date defaults use
`toISOString()` (`:15-19`), and `loadStatistics` interpolates raw
(`TimeTracking.svelte.ts:147-152`).

TASK-5: PASS
notes: Visual/a11y/i18n claims hold. Raw inputs vs shared controls table matches
(`EntryCreate:119-138`, `EntryEdit:105-111`, `TimerWidget:43-48`,
`StatisticsView:89-103`, `TimeTrackingNavigation:290-296`); the three hard-coded
fallbacks `#1dbda5`/`#888`/`#9ca3af` are at the cited lines; hover-only and
double-click affordances (`TimeTrackingNavigation:216,300`); `InlineEditButton`
/`InlineDeleteButton` reveal the real button only on `group-hover` with an inert
icon underneath (`:12-18`); missing `<label for>`/aria as cited. i18n is in sync
across all four locales and the six `timeTracking` keys
(`add_category`, `edit_category`, `color`, `duration_minutes`, `category`,
`this_month`) and the `dev.features.timeTracking` tips are genuinely unreferenced
anywhere in `src/` (confirmed by grep) — the report's line numbers match.

TASK-6: PASS
notes: `docs/jobs/whom_assessment-time-tracking/assessment.md` is a single,
coherent, evidence-based report covering the executive summary, all five audit
angles, a prioritised 15-item follow-up table, and an explicit assessment-only
scope note, exactly as planned. Every sampled `file:line` reference resolved to
the described code. Scope is honoured: `git diff main...HEAD` adds only the job
directory (brief/tasks/implementation/assessment/session.log/tokens.json/verdict)
— **no source files changed**, matching the brief and the `drama` precedent.

## Security

none

## Overall

APPROVED

The deliverable is the assessment document itself; it is thorough, covers both
the functional/IA and visual/consistency angles the brief asked for, calls out
what works as well as what does not, and is grounded in verifiable `file:line`
references. No source files were touched and no scope creep is present. Nothing
blocks merge.
