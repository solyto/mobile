## Summary

Fixed a bug where the "Hide It" toggle stopped filtering hidden-workspace
todos out of the list after the user switched filters — most visibly when
switching from a category filter to the "Backlog" status filter, which let
backlog items from hideable workspaces leak through even with Hide It on.

## Changes

TASK-1: Reproduced the bug via a temporary unit test (not committed) before
touching any source, per the task's mandatory-repro requirement. Confirmed
the analyst's theory: `Todos.useFilters()` guards the hide-it pass with
`isCategoryFilterActive()`/`isTagFilterActive()`, which read
`this.activeFilters` — but `this.activeFilters` was only reassigned to the
new `filters` argument at the *end* of `useFilters()`. So the guard evaluated
against the previous filter selection. Reproduced with: select a category
filter, then switch to the backlog status filter — hide-it wrongly skipped
itself because it still saw the stale "category filter active" state.

TASK-2: `src/lib/state/Todos.svelte.ts` — moved `this.activeFilters =
filters;` to the top of `useFilters()`, before the hide-it guard, instead of
at the end. The guard (`isCategoryFilterActive()`/`isTagFilterActive()`) now
always reflects the filters actually being applied in the current call, so
hide-it consistently applies to backlog (and every other status) regardless
of what was selected before.

TASK-3: `tests/unit/stores/Todos.test.ts` — added two regression tests: (1)
hide-it hides hidden-workspace backlog todos when the backlog status filter
is selected fresh, (2) hide-it still hides them after switching from a
category filter to the backlog filter (the exact repro from TASK-1).

## Known issues / follow-ups

- Two pre-existing, unrelated test failures observed in the full `vitest run`
  (not caused by this change, files untouched by it):
  `tests/unit/services/TodoFilterService.test.ts` ("keeps only todos due
  within the current week" — date-boundary flakiness tied to today's date)
  and `tests/components/logic-leaves.test.ts` ("StatisticWidget applies the
  requested color classes"). Both are out of scope for this job.
- Per the analyst's notes, `TodoGroupingService.groupByStatus()` never
  creates a `backlog` group, so backlog items never show on the Kanban
  board — unrelated to Hide It and left out of scope as flagged in
  `tasks.md`.
