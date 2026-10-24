# Verdict: hide it should apply to backlog

id: effort
status: reviewed
reviewer: claude (reviewer)
date: 2026-09-01

## Review

TASK-1: PASS
notes: Investigation-only task, correctly not reflected as a source diff.
implementation.md documents the repro (category filter → switch to backlog
status filter leaks hidden-workspace backlog todos through) and correctly
identifies the stale `this.activeFilters` read in `Todos.useFilters()`'s
hide-it guard as the cause. I independently traced the same code path in
`src/lib/state/Todos.svelte.ts` (pre-fix: `this.activeFilters = filters`
at line ~201, after the guard at ~189-194 that reads it via
`isCategoryFilterActive()`/`isTagFilterActive()`) and confirm the theory
is correct.

TASK-2: PASS
notes: `src/lib/state/Todos.svelte.ts` — `this.activeFilters = filters;`
moved to the top of `useFilters()`, before the hide-it guard. Verified this
makes the guard evaluate against the filters being applied in the current
call rather than the previous selection, fixing the backlog leak while
leaving every other status/filter combination's behaviour unchanged (the
guard's inputs — `filters` vs. `this.activeFilters` — are always identical
once reassignment happens first). Checked all `useFilters()` call sites
(`TodoNavigationDesktop.svelte`, `TodoNavigationMobile.svelte`, and internal
callers in `Todos.svelte.ts`) — no call site relies on `this.activeFilters`
still holding the previous value partway through `useFilters()`, so no
regression risk from the reordering. `npm run check` passes with 0
errors/warnings.

TASK-3: PASS
notes: `tests/unit/stores/Todos.test.ts` — two new tests added: (1) fresh
backlog-status-filter selection hides hidden-workspace backlog todos, (2)
the exact repro from TASK-1 (category filter → backlog filter switch). Ran
`npx vitest run tests/unit/stores/Todos.test.ts` — 21/21 pass, including
both new tests.

## Additional verification

- Ran the full suite (`npx vitest run`): 709 passed, 2 failed. Diffed
  `tests/unit/services/TodoFilterService.test.ts` and
  `tests/components/logic-leaves.test.ts` against `main` — byte-identical,
  confirming both failures are pre-existing and unrelated to this change,
  as disclosed in implementation.md.
- `npm run check` (svelte-check): 0 errors, 0 warnings.
- `npm run lint`: pre-existing prettier warnings across ~373 unrelated
  files repo-wide; neither `Todos.svelte.ts` nor `Todos.test.ts` appears in
  the warning list, so the change introduces no new lint issues.
- Diff scope (`git diff main...HEAD`) is limited to the job docs,
  `src/lib/state/Todos.svelte.ts` (3-line move), and the new test cases —
  no unrelated refactors, no scope creep. The Kanban "no backlog group"
  issue and `TodoGroupingService`/`activeWorkspace` observations from
  tasks.md/implementation.md were correctly left untouched as out of scope.

## Security

none

## Overall

APPROVED

No blockers. The fix is minimal, correctly targets the root cause
identified in the mandatory repro step, is covered by regression tests
that fail without the fix and pass with it, and stays within the scope
defined in tasks.md.
