# Tasks: time tracking improvements

id: joke
status: open
analyst: deepseek-v4-flash (opencode-go)
date: 2026-10-10

<!-- Produced by @analyst from brief.md. -->

## Context

The brief reworks the Time Tracking feature against `docs/tt-assessment.md`
(§6 table = line-level authority) and assumes the API changes in
`api-brief.md` land alongside this job. Two paths referenced by the brief are
**not present at the stated locations**; see "Source-of-truth docs" below.

The store/contract layer (`src/lib/state/TimeTracking.svelte.ts`) and
`ActiveTimer.svelte` are explicitly out of scope for rewriting — keep them. The
work is sequenced "foundation first, polish later": contract mirror + navigation
(TASK-1–3), single source of truth for durations/colours (TASK-4–5), unified
entry CRUD (TASK-6–9), dashboard/statistics composition (TASK-10–12), then
destructive actions / discoverability / a11y (TASK-13–14) and polish (TASK-15–18).

The repository already has `src/lib/components/forms/NumberInput.svelte` and
`DateInput.svelte` (plus `DateTimeInput.svelte`), so TASK-15 is "reuse the
existing shared controls", not "add new ones" (the assessment predates them).

## Task breakdown

TASK-1: Update the frontend contract mirror in `src/lib/types/time_tracking.ts` to the post-change API shape assumed by the brief — add an optional project `color` to `TimeTrackingProject` and to `Create`/`UpdateTimeTrackingProjectRequest`, add optional `has_exact_times` to `UpdateTimeTrackingEntryRequest`, and add the statistics category-filter parameter to `TimeTrackingStatistics`/the `loadStatistics` signature — keeping every addition optional/backward-compatible so the current API keeps type-checking.
     files: src/lib/types/time_tracking.ts; src/lib/state/TimeTracking.svelte.ts (loadStatistics signature); src/lib/config/apiRoutes.ts (only if the statistics route needs a param)
     depends: none
     risk: medium — the exact field/param names come from `api-brief.md`, which is not in this repo; confirm the shape before consuming it (see open questions).

TASK-2: Make the Dashboard/Entries view (and ideally the selected project) URL-driven — encode the active tab in the route or a `?tab=` search param, derive `activeTab` from `page.url` instead of the store's `$state`, and give the two nav links distinct targets so reload, deep-link and back/forward restore the view; keep the active-highlight in sync with the URL.
     files: src/routes/time-tracking/+page.svelte; src/routes/time-tracking/+layout.svelte; src/lib/components/time-tracking/TimeTrackingNavigation.svelte; src/lib/state/TimeTracking.svelte.ts; src/lib/config/urls.ts
     depends: none (touches the nav; coordinate ordering with TASK-3)
     risk: medium — changes how the feature is entered and requires a route-or-search-param decision.

TASK-3: Replace `TimeTrackingNavigation`'s inline `style.display` mobile toggle with the app's `open`-state + transition drawer pattern (as in `todos/TodoNavigationMobile.svelte` / `notes/NoteNavigationMobile.svelte`): an `open` `$state` flag, `{#if open}` with `transition:fly`, `HamburgerButton` and `CloseButton`.
     files: src/lib/components/time-tracking/TimeTrackingNavigation.svelte
     depends: TASK-2 (same file — land TASK-2 first to avoid conflicts)
     risk: medium — the current inline `display` competes with the `lg:flex` class and provides no transition/focus handling; must not regress desktop layout.

TASK-4: Extract the duplicated project grouping/colour logic into one pure, unit-tested service and use it everywhere — group entries by project using the project's own new `color` field (with a theme-variable fallback), drop the `uncategorized` fallback (entries always belong to a project), remove both `groupByProject` copies (`DashboardView` and the dashboard-shell `TimeTrackingWidget`), and add a Vitest unit test following the `TodoGroupingService` pattern.
     files: src/lib/services/TimeTrackingGroupingService.ts (new); tests/unit/services/TimeTrackingGroupingService.test.ts (new); src/lib/components/time-tracking/DashboardView.svelte; src/lib/components/dashboard/widgets/TimeTrackingWidget.svelte; src/lib/components/time-tracking/TimeBreakdownWidget.svelte
     depends: TASK-1 (project `color` field)
     risk: medium — shared logic consumed by two surfaces plus the shell widget; the unit test locks the colour/total rules.

TASK-5: Consume the authoritative duration instead of recomputing totals by hand — replace the sidebar `projectDurations` reduce and the project-detail `totalDuration` reduce with `project.total_duration` (and/or the statistics endpoint), leaving one source of truth for a project's total.
     files: src/lib/components/time-tracking/TimeTrackingNavigation.svelte; src/routes/time-tracking/[id]/+page.svelte; src/lib/state/TimeTracking.svelte.ts
     depends: TASK-1
     risk: medium — must confirm `total_duration` units/currency and that it is refreshed after entry mutations.

TASK-6: Unify `EntryCreate` and `EntryEdit` into one component taking an optional editing entry — send consistent ISO timestamps from both paths, send `has_exact_times` on create **and** update, expose a real date control, and update every call site.
     files: src/lib/components/time-tracking/EntryCreate.svelte; src/lib/components/time-tracking/EntryEdit.svelte; src/lib/components/time-tracking/GroupedEntries.svelte; src/routes/time-tracking/+page.svelte; src/routes/time-tracking/[id]/+page.svelte
     depends: TASK-1 (update can now carry `has_exact_times`)
     risk: high — merges two files that currently disagree on timezone handling, and touches all three surfaces that open the form.

TASK-7: Fix duration-only backdating semantics in the unified entry component — anchor a duration-only entry to a defined local time so the chosen day is honoured and never rolls into the previous calendar day, derive the displayed day from that anchor, make the date field meaningful or hidden when exact times are used, and stop computing the default date via `toISOString()` (UTC).
     files: the unified entry component from TASK-6 (currently `EntryCreate.svelte`/`EntryEdit.svelte`)
     depends: TASK-6
     risk: medium — subtle date/timezone behaviour that the assessment calls out as a concrete bug.

TASK-8: Stop silently defaulting entries and the timer to `tt.projects[0]` — require an explicit project choice (no first-project default) in the unified entry form and in `TimerWidget`, with user-visible feedback rather than a silent no-op.
     files: the unified entry component from TASK-6; src/lib/components/time-tracking/TimerWidget.svelte
     depends: TASK-6
     risk: low/medium — small change but affects the common "start a timer / add an entry" path and could surprise repeat users.

TASK-9: Make entries editable from every surface that shows them — add the edit affordance to the dashboard's recent entries and the project-detail page (the Entries tab already edits), wiring them to the unified entry component.
     files: src/lib/components/time-tracking/DashboardView.svelte; src/routes/time-tracking/[id]/+page.svelte; src/lib/components/time-tracking/GroupedEntries.svelte; src/lib/components/time-tracking/Entry.svelte
     depends: TASK-6
     risk: low/medium — presentational wiring once the component is unified.

TASK-10: Separate the working surface from analytics — move the full `StatisticsView` out of the dashboard body (its own view/tab/route) so the dashboard is the timer + entries and statistics is a distinct surface.
     files: src/lib/components/time-tracking/DashboardView.svelte; src/routes/time-tracking/+page.svelte
     depends: TASK-2 (view routing)
     risk: medium — re-homes an entire panel and changes what the dashboard is.

TASK-11: Give the Pomodoro a purpose or a home — either wire `PomodoroWidget` to create/link a real entry with shared timer UI, or move it out of the time-tracking dashboard so it no longer competes with the real timer.
     files: src/lib/components/time-tracking/PomodoroWidget.svelte; src/lib/components/time-tracking/DashboardView.svelte
     depends: none
     risk: medium — this is an unresolved product decision (wire-up vs move-out); do not guess, see open questions.

TASK-12: Make statistics consistent — one project colour source (project `color`, not first category), one date/unit convention (drop the hours-decimal category bars in favour of the shared duration format), a local-time default range instead of `toISOString()`, and a category filter that calls the statistics endpoint's category parameter instead of silently restricting projects client-side.
     files: src/lib/components/time-tracking/StatisticsView.svelte; src/lib/state/TimeTracking.svelte.ts; src/lib/config/apiRoutes.ts
     depends: TASK-1
     risk: medium — changes the filter semantics the user sees and touches the statistics request.

TASK-13: Confirm or offer undo for project, category and entry deletes everywhere — route the sidebar project delete (currently immediate) and the category/entry deletes through the same confirmation/undo treatment the project-detail page already uses, so the same action behaves the same from every surface.
     files: src/lib/components/time-tracking/TimeTrackingNavigation.svelte; src/lib/components/time-tracking/Entry.svelte; src/routes/time-tracking/[id]/+page.svelte
     depends: none (coordinate the shared file with TASK-3/TASK-14)
     risk: low/medium — adds a confirm step to currently-instant actions; watch for double-confirmation on the detail page.

TASK-14: Make project/category management discoverable and accessible — replace hover-only project controls and double-click-to-rename with explicit affordances reachable by touch and keyboard, and give icon-only buttons accessible names; apply the same to the shared `InlineEditButton`/`InlineDeleteButton` where they hide the real button on hover.
     files: src/lib/components/time-tracking/TimeTrackingNavigation.svelte; src/lib/components/ui/buttons/InlineEditButton.svelte; src/lib/components/ui/buttons/InlineDeleteButton.svelte; src/lib/components/time-tracking/Entry.svelte
     depends: TASK-3 (drawer structure), TASK-13 (same nav file)
     risk: medium — shared button components are used beyond time tracking; changes must not alter other features' behaviour.

TASK-15: Reuse the existing shared form controls and add explicit validation feedback — swap the raw number/date/timer inputs for `NumberInput`/`DateInput`/`TextInput`, associate labels with their inputs (`<label for>`), and replace the silent `return` guards with disabled-Save or a visible message in the entry, project and timer forms.
     files: the unified entry component from TASK-6; src/lib/components/time-tracking/ProjectCreate.svelte; src/lib/components/time-tracking/TimerWidget.svelte; src/lib/components/time-tracking/StatisticsView.svelte
     depends: TASK-6
     risk: low — mechanical reuse of existing controls, but the shared controls' prop shapes must be matched.

TASK-16: Guard category-chip contrast and replace the hard-coded colour literals (`#1dbda5`, `#888`, `#9ca3af`) with theme variables across the feature.
     files: src/routes/time-tracking/[id]/+page.svelte; src/lib/components/time-tracking/ProjectCreate.svelte; src/lib/components/time-tracking/StatisticsView.svelte; src/lib/components/time-tracking/TimeTrackingNavigation.svelte; the TASK-4 service and its consumers
     depends: TASK-4 (colour logic centralised)
     risk: low — styling/contrast only, but needs a readable-text rule for light category colours.

TASK-17: Remove (or wire up) the six unused `timeTracking` keys (`add_category`, `edit_category`, `color`, `duration_minutes`, `category`, `this_month`) and the orphaned `dev.features.timeTracking` tips across all four locales, updating the shared `TimeTrackingRecords` type — keys being removed must be dropped from `src/lib/types/translation.ts` or `npm run check` fails.
     files: src/lib/i18n/en.ts; src/lib/i18n/de.ts; src/lib/i18n/es.ts; src/lib/i18n/fr.ts; src/lib/types/translation.ts
     depends: none
     risk: low — but every key must be genuinely unreferenced (note `add_category` also exists in other i18n sections at line 234; only remove the `timeTracking` one).

TASK-18: Normalise headings and spacing via the shared `Heading` component — use it consistently for section titles on the dashboard, statistics, breakdown widget and project detail, and align the vertical rhythm between those surfaces.
     files: src/lib/components/time-tracking/DashboardView.svelte; src/lib/components/time-tracking/StatisticsView.svelte; src/lib/components/time-tracking/TimeBreakdownWidget.svelte; src/routes/time-tracking/[id]/+page.svelte
     depends: TASK-10 (dashboard composition settled)
     risk: low — presentational, but `Heading` expects a numeric `my` prop.

## Source-of-truth docs (verify before starting)

- **`docs/tt-assessment.md` is not present at that path.** The assessment the
  brief calls its line-level authority exists at
  `docs/jobs/archive/whom_assessment-time-tracking/assessment.md`; its §6 table
  is items 1–15 and maps to TASK-2 (1), TASK-6 (2), TASK-7 (3), TASK-4/5 (4),
  TASK-11 (5), TASK-13 (6), TASK-9 (7), TASK-3 (8), TASK-14 (9), TASK-15 (10),
  TASK-15 (11), TASK-4 (12), TASK-17 (13), TASK-7/12 (14), TASK-18 (15).
- **`api-brief.md` is not present anywhere in the repo.** The required API
  changes are enumerated only in the brief itself: an editable `has_exact_times`
  on the update payload, a first-class project `color`, an authoritative
  `total_duration`, a resolved project-less/cascade contract, and a
  category-filterable statistics endpoint. The brief says to consume the
  post-change contract directly and *not* to invent a frontend workaround. The
  missing `api-brief.md` is the main scope risk (see open questions).

## Open questions / risks

- **Exact API field and parameter names are unverified.** TASK-1/TASK-12 need
  the real names for the project `color` field and the statistics category
  parameter. The brief gives intent, not schema. Confirm against the API owner
  before coding; if the API change is not actually available, stop and flag it
  rather than approximating on the frontend.
- **Pomodoro disposition (TASK-11) is a product decision** — wire it to a real
  entry or move it out. The brief allows either; the developer should not guess.
  Recommend the least-risky option (move it out of the time-tracking dashboard)
  and note the choice in `implementation.md` if the author cannot confirm.
- **`total_duration` semantics** (TASK-5): units, update freshness after timer
  stop / entry edit, and whether it includes running entries need confirming.
- **Branch:** the brief names `feature/joke_time-tracking-improvements`. This
  read-only session has no shell, so the branch could not be executed; the
  worktree gitdir (`.../.git/worktrees/joke_time-tracking-improvements`)
  matches the job, consistent with the pipeline's per-job worktree.
- **No render report / screenshots exist for this job**, so all visual claims
  are grounded in component source, not rendered pixels.
- **Verification for every task:** `npm run check`, `npm run lint`, `npm test`;
  add/extend unit tests for any extracted grouping/duration/colour logic (this
  repo has no component tests). Keep all four i18n locales in sync and update
  the shared type whenever keys change.
