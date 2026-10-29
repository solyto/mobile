# Implementation: Smart score

id: flash
developer: @developer
date: 2026-10-17

## Summary

This is a report-only job. I reviewed the todo "Smart Score" (algorithm, store wiring, UI, dashboard widget, tests) against `docs/STANDARDS.md` and `docs/TESTING.md`, and wrote the findings and proposals to `docs/reports/2026-10-17-smart-score.md`. No source, test or i18n file was changed.

## Changes

TASK-1: Read STANDARDS (themes, sections 1–3, 5, 10–12, 15) and TESTING. The applicable rules are cross-referenced in report section 6. No backlog entry touches this feature. No file changes.
TASK-2: Documented the formula and the `daysSince` rolling-24h semantics. Computed the full 72-cell score table with a script. Showed that only 3 cells (all high priority, all older than 30 days) can pass the dashboard's `> 0.6` threshold. Listed ignored inputs and the date-boundary/timezone edge cases. Report sections 2.1–2.4.
TASK-3: Traced the store, toggle, ScoreBar, dashboard and widget. Main finding: `useFilters()` silently drops score order on every navigation/hide-it click (`Todos.svelte.ts:217`). Also covered: input mutation, the duplicate scoring call site, the dead `todosScored` flag, and standards violations in ScoreBar/SortByScore/ScoredTodosWidget. Report section 4.
TASK-4: Reviewed the tests. The "returns a new array" assertion is vacuous. The "no due date" cases test `NaN` (`due_at: ''`), not `null`. There are no boundary or time zone tests, and the dashboard selection is untested. Report section 5. `npm test` could not be run because `node_modules` is not installed in this worktree, and installing packages needs approval.
TASK-5: Wrote `docs/reports/2026-10-17-smart-score.md` (new). It includes the summary, formula and table, good/bad findings with file:line and severity, 9 proposals sized as separate jobs (product-changing ones framed as owner decisions), and open questions.

## Known issues / follow-ups

- The test suite was not executed (no `node_modules`). The test findings come from reading the tests.
- The ScoreBar dark-mode finding (4.9) is inferred from the classes. It was not rendered with `shot`, because rendering needs a running API with todo data.
- Open owner questions are listed in report section 8 (dashboard intent, effort weighting, completed todos, `due_at` format, the `relevance` API field, toggle persistence, and whether to file backlog entries).
