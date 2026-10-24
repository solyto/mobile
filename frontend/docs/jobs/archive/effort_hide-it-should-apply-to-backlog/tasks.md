# Tasks: hide it should apply to backlog

id: effort
status: open
analyst: claude (analyst)
date: 2026-09-01

<!-- Produced by @analyst from brief.md. -->

## Context / findings

The "Hide It" toggle (`src/lib/components/todos/actions/HideIt.svelte`, state in
`src/lib/state/Todos.svelte.ts`) hides todos whose category belongs to a
workspace flagged `is_hideable` (`TodoFilterService.filterByHideIt`). Backlog
items are normally kept out of the main todo list entirely
(`TodoFilterService.filterOutBacklog`, applied in `Todos.useFilters()`) and are
only shown when the user explicitly picks the "Backlog" status filter from
`TodoNavigation` (`{ type: 'status', value: 'backlog' }`).

Reading `Todos.useFilters()` line by line, the hide-it filter (`filterByHideIt`)
is applied to `filteredTodos` regardless of which status filter is selected —
on paper it should already apply once "Backlog" is selected. However, I found
one concrete, reproducible defect in that same method that plausibly explains
inconsistent behaviour (including for backlog) and should be the starting
point for the developer:

- `useFilters(filters)` guards the hide-it pass with
  `!this.isCategoryFilterActive() && !this.isTagFilterActive()`, and those two
  helpers read `this.activeFilters` — but `this.activeFilters` is only updated
  to the new `filters` argument at the *end* of `useFilters()` (line ~201).
  So the hide-it guard is evaluated against the *previous* filter selection,
  not the one being applied. E.g.: select a category filter, then switch to
  the "Backlog" status filter — the hide-it pass sees the stale "category
  filter active" state and skips itself, so hidden-workspace backlog items
  leak through even though hide-it is on and no category filter is actually
  active anymore.

I could **not** find a code path where hide-it is unconditionally skipped for
backlog in a simple/fresh case (no prior category or tag filter) — that combo
traces through `useFilters()` as working correctly. I was not able to run the
app or the test suite to empirically confirm the exact repro steps (no
execution tooling available to this role), so TASK-1 below is a mandatory
reproduction step before any fix is written — do not assume the stale-filter
theory is the full story until it's confirmed against the running app.

Also noted, likely unrelated but worth a mention: `TodoGroupingService.groupByStatus()`
never creates a `backlog` group even though `KanbanView.svelte` has label/colour
handling for the `'backlog'` status — so backlog items never appear on the
Kanban board at all, independent of hide-it. Not proposing a task for this
since it doesn't match "Hide It should apply to backlog" and would expand
scope; flagging so the developer doesn't confuse it with the reported bug.

## Task breakdown

TASK-1: Reproduce the reported bug against the running app (or by writing a
    failing unit test first) to pin down the exact steps under which Hide It
    fails to hide backlog items, confirming or ruling out the stale
    `this.activeFilters` read in `Todos.useFilters()` as the cause.
    files: none changed; investigation only (`src/lib/state/Todos.svelte.ts`,
    `src/lib/services/TodoFilterService.ts`, `tests/unit/stores/Todos.test.ts`)
    depends: none
    risk: low — read-only investigation, but the whole job's correctness
    depends on getting this right, so don't skip it.

TASK-2: Fix `Todos.useFilters()` so the hide-it pass is evaluated against the
    filters actually being applied (the `filters` argument) instead of the
    stale `this.activeFilters`, ensuring hide-it consistently filters backlog
    items the same way it does every other status. Exact fix depends on
    TASK-1's findings — likely either reordering so `this.activeFilters =
    filters` happens before the hide-it guard, or having
    `isCategoryFilterActive`/`isTagFilterActive` take the `filters` argument
    directly.
    files: src/lib/state/Todos.svelte.ts
    depends: TASK-1
    risk: medium — `useFilters()` is the shared filtering path for every todo
    view (list, kanban, card, overview) and every filter type, so a change
    here has broad blast radius even though the fix itself is small.

TASK-3: Add/extend unit test coverage for hide-it + backlog interaction in
    `tests/unit/stores/Todos.test.ts` (e.g. hide-it on, backlog status filter
    selected, hidden-workspace category present in a backlog todo → todo is
    filtered out; plus the category-filter-then-backlog-filter switch
    scenario from TASK-1/2) so the fix is regression-proof.
    files: tests/unit/stores/Todos.test.ts
    depends: TASK-2
    risk: low — test-only change.

## Out of scope (per brief, left unfilled — flagging for confirmation)

- Kanban board not rendering a "Backlog" column at all
  (`TodoGroupingService.groupByStatus`) — separate issue, not mentioned in
  the brief.
- Any change to what "Hide It" hides (i.e. the workspace/category-based
  hiding rule itself) — this job is only about making it apply consistently
  to the backlog status.
