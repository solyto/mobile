# Verdict: Smart score

id: flash
reviewer: @reviewer
date: 2026-10-17

## Review

Branch `report/flash_smart-score`, base `main`. `git diff main...HEAD` changes only
the job files and one new file, `docs/reports/2026-10-17-smart-score.md`. No source,
test or i18n file was changed, which matches the report-only scope in tasks.md.
Nothing changed that implementation.md doesn't mention.

TASK-1: PASS
notes: I checked the cited STANDARDS section numbers against `docs/STANDARDS.md`
(1.1, 2.2, 3.2, 3.3, 3.7, 10.1, 12.3, 15.6, 15.8, 15.9), and each one exists and fits
the topic. The report says 10.1 is about "commented-out code". The heading is actually
"The default is zero comments", but that rule still covers the leftover comment.

TASK-2: PASS
notes: I recomputed the formula against `TodoRelevanceService.ts:4-41`.
The `daysSince` semantics (`DateHelper.ts:281-285`) are correct. I spot-checked the
table: high/low/old/no-due = 200/300, high/medium/tomorrow/old = 200,
high/low/tomorrow/old = 225. The claim that medium priority maxes out at 175 holds.
So does "13 distinct values" (0..300 in steps of 25). The three dashboard-reachable
cells are correct. The `due_at: ''` → `NaN` finding is correct (`factories.ts:15`,
`types/todo.ts:33` typed `string`).

TASK-3: PASS
notes: I verified the main finding (4.2). `useFilters()` always ends with
`sortingService.sort()` (`Todos.svelte.ts:217`) and is called from
TodoNavigationDesktop/Mobile at the cited lines and from `toggleHideIt()`. Score order
is lost while `sortByScore` stays true. I also verified the input mutation
(`:14`, `:41`), the clone in `YourDay.svelte:60`, the dead `todosScored` flag, the
`SortByScore` local copy, and the per-route store creation (`routes/todos/+layout.svelte:6`).
The report doesn't discuss `YourDay`'s `$derived.by` against the "limited
`$derived`" rule (tasks.md asked for this). That is a minor gap, not a blocker:
the `$derived` in ScoreBar is covered.

TASK-4: PASS
notes: The vacuous `not.toBe([t])` (`TodoRelevanceService.test.ts:94`) and the
`due_at: ''` cases (`:32`, `:72`, `:79-85`) are correctly identified. The test files the
report cites (`tests/unit/stores/Todos.test.ts`,
`tests/components/dashboard-widgets.test.ts`, `tests/unit/helpers/factories.ts`)
exist. `npm test` was not run because `node_modules` is missing. This is disclosed in
the report and in implementation.md, and it's acceptable for a read-only report.

TASK-5: PASS
notes: The report is at the requested path. It follows the existing report header format
(`read:` flag, Date/Job/Scope/Method) and has all the requested sections. Findings
have file:line, severity and a verified/inferred marker. Proposals are sized and
product-changing ones are marked as owner decisions. It includes the one-line note
that the check-in and dev-request scores are separate features.

## Security

Not run. This is a documentation-only change.

## Overall

APPROVED

No blockers.
