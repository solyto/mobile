# Tasks: assessment: time tracking

id: whom
analyst: deepseek-flash
date: 2026-10-10

<!-- Produced by @analyst from brief.md. -->

## Context

The brief asks for a **thorough assessment** of the Time Tracking feature —
what's good, what's bad, functionally and visually — written to the `docs/`
folder. Following the precedent of the archived `drama_funnel-icon-assessment`
job (the only other assessment job in this repo), the deliverable is a single
document at `docs/jobs/whom_assessment-time-tracking/assessment.md` (the job
directory lives under `docs/`, which satisfies "the docs/ folder in the
workspace"). This is an **assessment-only job: no source files are changed.**

This repo is frontend-only; there is no backend to read. The authoritative
contract for the data model is `src/lib/types/time_tracking.ts` plus
`src/lib/config/apiRoutes.ts` (a `TimeTrackingProject` owns a many-to-many set
of `TimeTrackingCategory`s; a `TimeTrackingEntry` belongs to exactly one
project).

The assessment must be evidence-based — every claim backed by file/line
references — and must cover both **functional/IA** and **visual/consistency**
angles, and must call out what already works well, not only problems.

## Task breakdown

TASK-1: Audit the navigation and information architecture of Time Tracking: how `/time-tracking`, the `dashboard`/`entries` tabs, the per-project route `/time-tracking/[id]`, and the desktop/mobile navigation are structured, and how (or whether) view state is reflected in the URL (the active tab lives in the store's `$state`, both "Dashboard" and "Entries" nav links resolve to the same `urls.timeTracking` href and only mutate `activeTab`, so deep-linking/back-forward/reload do not restore the view). Document the project list/category-management affordances living inside the nav sidebar, the mobile drawer open/close mechanism (`style.display` toggle), and where each create/edit action is reachable. Compare against the navigation patterns used by other features (e.g. `todos/TodoNavigationMobile.svelte`, `notes/NoteNavigationMobile.svelte`, `calendar` views) to judge consistency.
     files: src/routes/time-tracking/+layout.svelte; src/routes/time-tracking/+page.svelte; src/routes/time-tracking/[id]/+page.svelte; src/lib/components/time-tracking/TimeTrackingNavigation.svelte; src/lib/config/navigation.ts; src/lib/config/urls.ts
     depends: none
     risk: low — read-only structural audit; criteria are concrete (URL-driven vs state-driven navigation)

TASK-2: Audit the data model and domain semantics against the brief's complaint that "the data model doesn't feel intuitive (the way you add projects, categories, entries, etc.)". Assess: global categories vs project-owned categories and the many-to-many `category_ids` linkage; entries requiring a `project_id` (no project-less/description-only entries, yet the UI has an `uncategorized` fallback path); recomputation of durations in components (`projectDurations`, `totalDuration`, breakdowns) despite the API exposing `project.total_duration` and `TimeTrackingStatistics`; the `has_exact_times` flag and the `date_range`/backdating semantics in `buildTimestamps()` (duration-only entries are anchored to *today's current wall-clock time*, so a past `date` cannot be honoured); how category colors are used (per-category color reused as the project's color in charts and breakdowns); and what the model makes easy vs. awkward for the user. Treat `types/time_tracking.ts` and `apiRoutes.ts` as the contract (no backend in this repo).
     files: src/lib/types/time_tracking.ts; src/lib/state/TimeTracking.svelte.ts; src/lib/config/apiRoutes.ts
     depends: none
     risk: medium — the core of the brief's complaint; requires judgement on model intuitiveness, not just enumeration

TASK-3: Audit the create/edit/manage flows and CRUD interactions for friction and inconsistency: `ProjectCreate` (create + edit via one modal), `EntryCreate`, and `EntryEdit` (which duplicates ~90% of `EntryCreate` and instead of `EntryCreate`), inline category add/rename (double-click, non-discoverable) and inline color picking in the nav, delete affordances (project delete confirms on the detail page via `ConfirmationModal` but is immediate/unconfirmed in the nav sidebar; category delete is immediate; entry delete is immediate), and where editing is and is not available (entries are editable from the Entries list but not from the dashboard "recent entries" or the project-detail page, whose `Entry` only shows delete). Note validation gaps (e.g. save silently no-ops when duration is 0 / no project) and the default-to-first-project behaviour in `TimerWidget`/`EntryCreate`/`EntryEdit`.
     files: src/lib/components/time-tracking/ProjectCreate.svelte; src/lib/components/time-tracking/EntryCreate.svelte; src/lib/components/time-tracking/EntryEdit.svelte; src/lib/components/time-tracking/Entry.svelte; src/lib/components/time-tracking/GroupedEntries.svelte; src/lib/components/time-tracking/TimeTrackingNavigation.svelte; src/routes/time-tracking/[id]/+page.svelte
     depends: TASK-2
     risk: low — concrete, file-by-file flow walkthrough

TASK-4: Audit the timer, dashboard, and statistics surfaces: the start/stop timer (`TimerWidget`, `ActiveTimer`), the client-only `PomodoroWidget` (a fourth timer concept that is not persisted and does not create or link to a time entry — inconsistent with the feature's purpose), the `DashboardView` composition (Timer, Pomodoro, Today, This-Week widgets plus recent entries plus full statistics all stacked on one page), `TimeBreakdownWidget`'s project grouping (uses first category color, falls back to hardcoded `#9ca3af`), `StatisticsView` (embedded in the dashboard rather than its own tab/route; category filter filters *projects* by their categories; raw `<input type="date">` with bespoke styling), and the dashboard-shell `TimeTrackingWidget` (duplicates the week-breakdown grouping logic from `DashboardView`). Assess whether timer state is honest (single active timer derived from `entries.find(stopped_at === null)`) and whether the dashboard answers the questions a user actually has.
     files: src/lib/components/time-tracking/TimerWidget.svelte; src/lib/components/time-tracking/ActiveTimer.svelte; src/lib/components/time-tracking/PomodoroWidget.svelte; src/lib/components/time-tracking/TimeBreakdownWidget.svelte; src/lib/components/time-tracking/DashboardView.svelte; src/lib/components/time-tracking/StatisticsView.svelte; src/lib/components/dashboard/widgets/TimeTrackingWidget.svelte
     depends: none
     risk: low — read-only behavioural audit of self-contained widgets

TASK-5: Audit visual and interaction consistency, and compare the feature's look-and-feel against sibling features and the shared UI kit: use of shared `forms/` controls vs. hand-rolled raw inputs (e.g. `EntryCreate`/`EntryEdit` duration and date inputs and `TimerWidget`'s description input vs. `TextInput`; `StatisticsView` date inputs), heading/spacing conventions, hover-only affordances (`group-hover` edit/delete in the nav) and touch/Mobile usability, color handling (hardcoded hex fallbacks `#1dbda5`, `#888`, `#9ca3af` across components), accessibility concerns (double-click-to-rename category, hover-revealed controls, icon-only buttons, color contrast of category chips), and i18n (unused keys such as `add_category`, `edit_category`, `color`, `duration_minutes`, `category`, `this_month`, and the unused `pomodoro_tip` feature-tip; verify all four locales stay in sync). This is the "visually confusing and inconsistent" part of the brief.
     files: src/lib/components/time-tracking/DashboardView.svelte; src/lib/components/time-tracking/EntryCreate.svelte; src/lib/components/time-tracking/EntryEdit.svelte; src/lib/components/time-tracking/Entry.svelte; src/lib/components/time-tracking/TimeTrackingNavigation.svelte; src/lib/components/time-tracking/StatisticsView.svelte; src/lib/i18n/en.ts; src/lib/i18n/de.ts; src/lib/i18n/es.ts; src/lib/i18n/fr.ts
     depends: none
     risk: medium — design/consistency judgement; findings must stay evidence-based (cite component + line) rather than subjective

TASK-6: Write `assessment.md` in the job directory, synthesising TASK-1–5 into a single, coherent, evidence-based report: an executive summary with the headline verdict on what's good and what's broken; sections for information architecture/navigation, data model, CRUD/edit flows, timer/dashboard/statistics, and visual/consistency + accessibility/i18n; per issue, the concrete file/line reference and a suggested direction (not code); and a prioritised list of recommended follow-up changes (ranked, with effort/impact noted) so a future implementation job can pick them up. Explicitly state that no source files were changed (assessment-only), consistent with the brief and the `drama` precedent. Re-read the final document once for factual accuracy against the code before finishing.
     files: docs/jobs/whom_assessment-time-tracking/assessment.md
     depends: TASK-1, TASK-2, TASK-3, TASK-4, TASK-5
     risk: low — documentation-only deliverable

## Notes / open questions

- **Deliverable location:** the brief says "the docs/ folder in the workspace". There is no established top-level `docs/assessments/` convention; the closest precedent (`docs/jobs/archive/drama_funnel-icon-assessment/assessment.md`) places `assessment.md` inside the job directory. TASK-6 uses that location. If the author wanted a different top-level path (e.g. `docs/time-tracking-assessment.md`), that is a one-line change to TASK-6 — flag it in the implementation notes rather than guessing silently.
- **No source changes.** Per the brief this is an assessment, not a refactor; implementations of any recommendation are out of scope and should become separate jobs.
- **No render report / screenshots exist for this job** (checked `docs/jobs/whom_assessment-time-tracking/screenshots/`), so the visual claims must be grounded in the component/template source, not in rendered screenshots.
