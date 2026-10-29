# Brief: time tracking improvements

type: feature
id: joke
branch: feature/joke_time-tracking-improvements
date: 2026-10-10
author: Leander Muskalla

## What

Rework time tracking so its UI stops hiding, duplicating, and contradicting the
data model it already has. The domain model is sound (projects own many
categories; a single running timer derived from entries), and the store/contract
layer plus `ActiveTimer` are solid — keep them. This job addresses the full set
of findings in `docs/tt-assessment.md` (its §6 table is the line-level
authority): navigation and information architecture, the create/edit flows,
dashboard and statistics composition, and visual/accessibility/i18n consistency.
The assessment changed no source; this is the follow-up implementation.

Notable changes, grouped as workstreams:

- **URL-driven navigation.** Move the Dashboard/Entries view (and ideally the
  selected project) into the route or a search param so reload, deep-linking, and
  back/forward restore the view; derive the active tab from the URL instead of
  store state. Replace the sidebar's inline `display` toggle with the app's
  `open`-state + transition drawer pattern used by todos/notes.
- **Discoverable management.** Stop hiding project/category actions behind hover
  and double-click; give icon-only buttons accessible names and make the same
  actions reachable by touch and keyboard.
- **Single source of truth for durations and colours.** Consume
  `project.total_duration` and/or the statistics endpoint instead of recomputing
  totals by hand; remove the duplicated `groupByProject` (including the
  dashboard-shell widget's copy); colour each project from its own `color` field
  (added per `api-brief.md`), never from its first category; replace the
  `#1dbda5`/`#888`/`#9ca3af` literals with theme variables.
- **Correct domain semantics.** Fix backdating so a duration-only entry anchors
  to a defined time and lands on the day the user chose (never rolling into the
  previous day); make the date field meaningful or hidden when exact times are
  used; send `has_exact_times` on both create and update (the update field is
  added per `api-brief.md`) and rely on the clarified anchor rule for
  duration-only entries; assume the cascade contract (entries are deleted with
  their project, per `api-brief.md`) and drop the `uncategorized` fallback in
  the breakdown widgets; and stop silently defaulting entries/timers to
  `tt.projects[0]`.
- **Unified entry CRUD.** Replace `EntryCreate`/`EntryEdit` with one component
  (optional editing entry) that sends consistent timestamps and exposes a real
  date control, and make entries editable from every surface that shows them
  (dashboard recent entries, project detail, entries tab).
- **Dashboard and statistics.** Separate the working surface (timer, entries)
  from analytics; move or repurpose the unintegrated Pomodoro so it no longer
  competes with the real timer; and make statistics consistent — one project
  colour source, one date/unit convention, a local-time default range, and a
  category filter that uses the statistics endpoint's category param (added per
  `api-brief.md`) so it filters entries by category rather than silently
  restricting projects.
- **Safe destructive actions.** Confirm or offer undo for project, category, and
  entry deletes everywhere (detail page and sidebar must behave the same).
- **Consistency, a11y, i18n.** Reuse shared form controls (or add
  `NumberInput`/`DateInput` in the existing `forms/` layer) for number, date, and
  timer inputs; guard category-chip contrast; add explicit validation feedback
  instead of silent no-ops; associate labels with inputs; remove or wire up the
  six unused `timeTracking` keys and the orphaned `dev.features.timeTracking`
  tips across all four locales; normalise headings and spacing via the shared
  `Heading` component.

## Why

Time tracking is solyto's least usable feature: its navigation, data model, and
CRUD flows are hidden, duplicated, or inconsistent with the rest of the app, so
users cannot reliably add, find, edit, or trust their tracked time.

## Out of scope

- **Backend/API changes.** This repo consumes a REST API owned elsewhere, so a
  frontend job cannot add server fields or endpoints. The contract changes this
  job needs are tracked in `api-brief.md` and are assumed to land: an editable
  `has_exact_times` on the update payload, a first-class project `color`, an
  authoritative `total_duration`, a resolved project-less/cascade contract, and
  a category-filterable statistics endpoint. The frontend must consume the
  post-change contract directly — update `src/lib/types/time_tracking.ts` (and
  `apiRoutes.ts` where relevant) to match — rather than falling back to
  frontend-only approximations. If a required change is missing on the API or
  consuming it would break something on the frontend, stop and flag it; do not
  invent a workaround.
- **Rewriting the store/contract layer or `ActiveTimer`** — both are sound
  foundations (assessment §"What works well"); a rewrite would add risk without
  fixing any reported problem.
- **Redesigning the app-wide visual language.** The brief is about time tracking
  feeling inconsistent *with the rest of the app*; changing the app-wide language
  would move the inconsistency rather than resolve it. Shared-component additions
  are allowed only if they do not alter other features' behaviour.
- **Net-new product features** (recurring entries, new reporting, etc.) — this job
  makes the existing model usable and coherent; new capability is a separate
  decision.

## Notes

- The API changes in `api-brief.md` are assumed to be fulfilled alongside this
  job; do not code against the current contract's gaps (e.g. the un-editable
  `has_exact_times`, the missing project `color`) as if they were permanent.
- Frontend-only repo: `src/lib/types/time_tracking.ts` and
  `src/lib/config/apiRoutes.ts` mirror the API contract. Update the type mirrors
  to the post-change contract (all new fields optional/backward-compatible) in
  the same job that consumes them.
- Every claim in `docs/tt-assessment.md` is already verified to `file:line`; use
  its §6 table as the checklist and the body for detail.
- Follow existing patterns: one runes store per domain, pure logic extracted to
  `src/lib/services/` and unit-tested (see `TodoGroupingService`), shared
  controls in `src/lib/components/forms/`.
- Keep all four i18n locales in sync and update the shared type when removing
  keys — `npm run check` enforces both.
- This is intentionally one large job with distinct workstreams: land the
  foundation (navigation, data model, unified CRUD) before the polish. If a
  workstream balloons, flag it rather than silently expanding scope.
- Verify with `npm run check`, `npm run lint`, and `npm test`; add unit tests for
  any extracted grouping/duration/colour logic (this repo has no component
  tests).
- Preserve the parts the assessment called out as good: the store's parallel
  load-and-reload, the single-timer-derived-from-entries model, and the honest
  `ActiveTimer`.
