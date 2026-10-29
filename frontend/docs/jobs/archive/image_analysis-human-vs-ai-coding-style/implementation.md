# Implementation: analysis: human vs ai coding style

id: image
developer: deepseek-v4-flash (opencode-go)
date: 2026-10-11

## Summary

Documentation/analysis job. Produced a single read-only report,
`docs/coding-style.md`, comparing the human-built `todos` feature against the
AI-built `time-tracking` feature. No source, test, or i18n file was changed.

## Changes

- **TASK-1 (inventory todos):** read `src/lib/state/Todos.svelte.ts`, the four
  `src/lib/services/Todo*Service.ts`, `src/lib/types/todo.ts`, both
  `src/routes/todos/**` files, all 34 `src/lib/components/todos/**` files and the
  todos tests; collected line/file counts and line-level observations.
- **TASK-2 (inventory time-tracking):** read `src/lib/state/TimeTracking.svelte.ts`,
  `src/lib/services/TimeTrackingGroupingService.ts`, `src/lib/types/time_tracking.ts`,
  all three `src/routes/time-tracking/**` files, all 11
  `src/lib/components/time-tracking/**` files and the time-tracking tests.
- **TASK-3/4 (compare + policy cross-check):** compared both stacks layer by
  layer and measured each observation against `docs/BEST_PRACTICES.md`,
  `STATE_SERVICES.md`, `COMPONENTS.md`, `DATA_LAYER.md` and `TESTING.md`,
  classifying each as "matches repo idiom" vs "deviates".
- **TASK-5:** wrote `docs/coding-style.md` — methodology, metrics snapshot,
  per-layer comparison, a convention-by-convention table, "what the human does
  that the AI doesn't" and the reverse, deviations for each author, a test
  coverage comparison, and a summary. Every claim is anchored to a real
  file/line or a reproducible count.
- **TASK-6 (verification):** re-read the report; confirmed every referenced
  path exists and every cited line range is within the file; confirmed
  `git status` shows no `src/**`, `tests/**` or i18n changes (report is purely
  additive). `npm run check` could **not** be run because the workspace has no
  `node_modules` and installing dependencies unattended is disallowed by the
  project's hard rules — see Known issues.

## Post-review fixes

The reviewer returned **NEEDS WORK** with three verifiable errors in
`docs/coding-style.md` (`verdict.md`); all are now fixed:

- **Component counts.** Corrected `35` → `34` component files in the §1 metrics
  table and §4, `15` → `14` `props/` components in §4, and `35` → `34` in the §8
  todos-components sentence. Re-verified with
  `find src/lib/components/todos -name '*.svelte' | wc -l` = 34
  (8 top-level + 14 `props/` + 8 `views/` + 4 `actions/`). The component LOC
  total (2848) was already correct, and the feature totals (3849 / 2132) and
  every other row of the metrics table were re-checked with `wc -l` and remain
  accurate.
- **§5 call-site citation.** `weekBreakdown()`/`todayBreakdown()` are invoked at
  `DashboardView.svelte:63`/`:58` respectively; the text now reads
  "`todayBreakdown()`/`weekBreakdown()` (`:58,63`)" instead of labelling both
  call sites as `weekBreakdown()`.
- **§11 `TESTING.md` misquote.** `docs/TESTING.md` does not name
  `TimeTrackingGroupingService` as covered pure logic; the sentence now lists the
  services it actually names (`TodoGroupingService`, `TodoRelevanceService`,
  `TodoFilterService`).

The same `35` count error in this file's TASK-1 entry was corrected to `34`.

## Known issues / follow-ups

- `npm run check` was not executed as the TASK-6 sanity pass: `node_modules` is
  absent in this workspace (`svelte-kit: not found`). Since the report changes
  no source, the type-check state is unchanged. Re-run `npm ci && npm run check`
  in an environment with dependencies to close the task literally.
- Leftover harness/earlier-agent files were committed to leave the worktree
  clean: `docs/jobs/image_analysis-human-vs-ai-coding-style/session.log`
  (grew during the analyst session), `tokens.json` (analyst token record), and
  the root `AGENTS.md` (synced to the committed `docs/AGENTS.md`, which already
  carried the added "Coding policies" section; the root copy was stale).
- The report notes that the policy doc `docs/BEST_PRACTICES.md` quotes two
  "why" comments from `Todos.svelte.ts` that no longer exist (they were removed
  in commit `a34275e`). That is a doc-vs-code drift that may be worth fixing
  separately — out of scope here.
