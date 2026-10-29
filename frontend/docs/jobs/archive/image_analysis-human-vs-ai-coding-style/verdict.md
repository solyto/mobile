# Verdict: analysis: human vs ai coding style

id: image
reviewer: deepseek-v4-flash (opencode-go)
date: 2026-10-11

## Review

This is a re-review after the previous NEEDS WORK. The three blocking items
from the prior verdict are all fixed and independently re-verified below.

TASK-1: PASS
notes: The miscounts are corrected. `docs/coding-style.md` now states **34**
component files (§1 metrics, §4, §8) and **14** `props/` components (§4); the
tree confirms 34 `.svelte` files (8 top-level + 14 `props/` + 8 `views/` +
4 `actions/`) and exactly 14 under `props/`. Spot-checked inventory references
all resolve: store DI `Todos.svelte.ts:62-72`, service fields `:57-60`,
`SvelteDate` pipeline `:165-171`, `load()` `:74-97`, `loadWorkspaces` retry
`:107-118`, `quickCreate` `:249-278`; spinner leaks at `Title.svelte:59-61`,
`Description.svelte:93-95`, `Subtask.svelte:66-68`, `ListAndAdd.svelte:60-62`
(with `Category.svelte:69-72` as the correct counter-example); error surfaces
`Category.svelte:78-86`, `Tags.svelte:73-83`; `getBgColor` duplicated
`Card.svelte:31-40` / `CompactCard.svelte:15-24`; `ScoreBar.svelte:29`
commented-out fragment; hardcoded strings `Counter.svelte:8`,
`KanbanView.svelte:27-40`, `Recurrence.svelte:116,125,144,150`,
`TodoCreate.svelte:121,131,135,139,143,147,159`; nav split
`TodoNavigationDesktop` 149 LOC / `TodoNavigationMobile` 216 LOC.

TASK-2: PASS
notes: Verified end to end: store 171 LOC, field-initialiser DI `:26-31`,
`load()` `:33-40`, `formatDuration` `:155-160`, hand-built query string
`:146-153`; service docblock `TimeTrackingGroupingService.ts:13-17`, service 46
LOC; `groupByDate` duplicated verbatim in `GroupedEntries.svelte:18-30` and
`[id]/+page.svelte:67-79`; `$derived(() => …)` at `DashboardView.svelte:24,35,
37,46` with call sites `todayBreakdown()` `:58` / `weekBreakdown()` `:63` and
`StatisticsView.svelte:52` with call sites `:66,67`; `aria-label` at
`TimeTrackingNavigation.svelte:184,212,224,245,300,308` and
`ProjectCreate.svelte:102,113`; `TimeTrackingNavigation.svelte` 363 LOC,
`[id]/+page.svelte` 205 LOC; `PomodoroWidget.svelte` (211 LOC) imported nowhere
in `src/` (grep); dead `TimeTrackingStatisticsRequest`
(`time_tracking.ts:74-78`, single occurrence); no `notifications.*` anywhere in
the feature.

TASK-3: PASS
notes: The §5 call-site citation is now correct — "`todayBreakdown()`/
`weekBreakdown()` (`:58,63`)" matches `DashboardView.svelte:58`/`:63`. The
layer-by-layer comparison remains supported by the evidence (mixed return
semantics `Todos.svelte.ts:280-317` vs `:331-359`; `$derived.by` used correctly
at `OverviewView.svelte:19-42` but `$derived(() => …)` misused in
time-tracking; loading discipline; i18n/a11y reversal; test footprint).
See the minor non-blocking note below.

TASK-4: PASS
notes: Policy quotations check out. `BEST_PRACTICES.md:155-167` still quotes the
two `Todos.svelte.ts` comments and `git log -S "Restore synchronously"` shows
them introduced in `d7d4d92` and removed in `a34275e` — so §8's "stale doc
reference" claim is exactly right. `STATE_SERVICES.md` reference points (Todos
as DI reference, member ordering, service delegation, `load()`+`loaded`) and
`DATA_LAYER.md`/`COMPONENTS.md` points hold. The §11 tests paragraph now lists
`TodoGroupingService`, `TodoRelevanceService`, `TodoFilterService` — the three
services `docs/TESTING.md` §"Covered so far" actually names; the previous
`TimeTrackingGroupingService` misquote is gone.

TASK-5: PASS
notes: `docs/coding-style.md` (575 lines) is the only deliverable, purely
additive, and now free of the earlier count/citation/misquote errors. Metrics
table is arithmetically consistent: todos 523+249+133+2848+96 = 3849;
time-tracking 171+46+97+1517+301 = 2132; routes 96 (11+85) and 301
(53+43+205); test LOC verified (`Todos.test.ts` 367, service suites 280/116/96,
`TimeTracking.test.ts` 64, `TimeTrackingGroupingService.test.ts` 96). Commit
references `b25801c` (33 files, +2441/−579) and `48cea28` exist as described.

TASK-6: PASS
notes: `git diff main...HEAD` contains only `docs/coding-style.md` plus the job
artifacts (brief/implementation/session.log/tasks/tokens/verdict) — no
`src/**`, `tests/**` or i18n file changed. Every referenced path and line range
I checked exists. `npm run check` was not run, but `node_modules` is absent in
this workspace and a docs-only change cannot alter the type-check state; the
documented reason holds.

### Minor observation (non-blocking)

§2.2 says "every mutator is `const res = await …; if (res) await this.load…;
return res;`". In fact 5 of the 11 time-tracking mutators return
`res !== null` (`createCategory` `:60-67`, `createProject` `:85-92`,
`createEntry` `:110-117`, `startTimer` `:131-135`, `stopTimer` `:137-144`) and
the rest return `res`. The conclusion the sentence supports — the AI never adds
the redundant `Promise.resolve(...)` wrapper the human uses — is correct and
the §13 table states that precisely, so this is an over-broad shorthand rather
than a wrong finding. Not worth blocking merge; a one-word touch-up
("mutators follow the same shape, `return res`/`res !== null`, with no
`Promise.resolve` wrapping") would make it exact.

## Security

none — documentation-only change.

## Overall

APPROVED

All three prior blockers are fixed and independently verified:

1. Component counts now 34 / 14 (verified against the tree).
2. §5 citation now `todayBreakdown()`/`weekBreakdown()` (`:58,63`).
3. §11 now names `TodoGroupingService`, `TodoRelevanceService`,
   `TodoFilterService` — matching `docs/TESTING.md`.

The report is accurate on every file/line reference and metric I checked, is
purely additive, and does not touch `src/**`, `tests/**` or i18n. No changes
required before merge.
