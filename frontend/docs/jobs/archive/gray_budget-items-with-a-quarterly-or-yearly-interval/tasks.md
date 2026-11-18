# Tasks: budget items with a quarterly or yearly interval

id: gray
analyst: analyst
date: 2026-11-17

Branch verified: worktree HEAD is `feature/gray_budget-items-with-a-quarterly-or-yearly-interval`, which matches `brief.md`.

## Open question (blocks TASK-8 only)

The brief says to hide the interval picker on older servers and points to
`docs/backlog/hide-features-on-older-servers.md`. That backlog item is **not
implemented**: there is no `serverSupports()` helper and no feature/min-version list.
Its two decisions are also still open: hide vs. disable-with-hint, and what to do
when the version is unknown. The brief also doesn't say **which API version**
adds `interval`.

A human has to decide one of these:
- (a) Gate on the server version: needs the API version that ships `budget-interval`.
  This job could add only a minimal `serverSupports()` in `VersionHelper.ts`, or it
  could implement the backlog item first.
- (b) Detect the field: show the picker only if the loaded budgets carry an
  `interval` key. This breaks when the user has no budgets yet.
- (c) Ship without gating for now and track the gating as a follow-up.

TASK-1 to TASK-7 and TASK-9 don't depend on this decision.

## Task breakdown

TASK-1: Add `BudgetInterval = 'monthly' | 'quarterly' | 'yearly'` and an `interval` field: optional on `Budget` (older servers omit it), optional on `CreateBudgetRequest` and `UpdateBudgetRequest`.
  files: src/lib/types/finance.ts
  depends: none
  risk: low — additive type change; it is optional, so existing call sites still compile.

TASK-2: Add one pure helper that returns a budget's monthly amount (`value`, `value / 3`, `value / 12`; a missing `interval` counts as monthly) and leaves the result unrounded.
  files: new src/lib/services/BudgetIntervalService.ts (or a function in an existing finance helper/service; there is no budget service yet, and FinanceHistoryService.ts is the closest neighbour)
  depends: TASK-1
  risk: low — small pure function.

TASK-3: Use the helper in `getBudgetTotal()`, `getBudgetIncomeTotal()` and `getBudgetExpenseTotal()`.
  files: src/lib/state/Finances.svelte.ts
  depends: TASK-2
  risk: medium — this also changes the numbers on the finance dashboard (`src/routes/finances/+page.svelte:56,83`, total and income-vs-expenses chart). That matches "monthly view", but it is a visible side effect outside the budget page.

TASK-4: In `loadIncome()`, sort `income` and `expenses` by monthly amount, largest first.
  files: src/lib/state/Finances.svelte.ts
  depends: TASK-2
  risk: low — today the client keeps the server's order. The server presumably sorts by `value`, so client-side sorting is needed once intervals differ.

TASK-5: Add i18n keys to `FinanceRecords` for the three interval labels (monthly/quarterly/yearly), the "/ month", "/ quarter" and "/ year" suffixes, and an "Interval" label if the picker needs one. Write `en` and hand the other five locales (de, es, fr, it, ru) to the `translator` agent.
  files: src/lib/types/translation.ts, src/lib/i18n/{en,de,es,fr,it,ru}.ts
  depends: none
  risk: low — `npm run check` catches missing keys.

TASK-6: In `BudgetField.svelte`, base the percentage bar (`getShare()`) on the monthly amount. For non-monthly items, show "<monthly> / month · <entered> / <interval>". Monthly items stay unchanged.
  files: src/lib/components/finances/BudgetField.svelte
  depends: TASK-2, TASK-5
  risk: low — display only; round only through `europeanFormat`.

TASK-7: Add an interval picker to `AddBudget.svelte` (the existing `SegmentedControl` fits), default `monthly`, on both the desktop inline form and the mobile bottom sheet. Send `interval` in the create request and reset it to `monthly` after a successful submit.
  files: src/lib/components/finances/AddBudget.svelte
  depends: TASK-1, TASK-5
  risk: medium — the desktop inline form closes on blur and uses Enter/Escape key handlers, so clicking a picker must not close the form or break Enter-to-submit.

TASK-8: Hide the interval picker (TASK-7, TASK-9) on servers without `interval`, and don't send the field to them.
  files: depends on the decision above (likely src/lib/helpers/VersionHelper.ts plus the two picker locations)
  depends: TASK-7, TASK-9, **open question above**
  risk: medium — the approach is undecided, and the server version can arrive only after the first render.

TASK-9: Add an interval control to the history modal on the budget page. It calls `finances.updateBudget(historyBudget, { interval })` and updates `historyBudget` locally, the same way `renameHistoryBudget` does. History values stay as entered.
  files: src/routes/finances/budget/+page.svelte (control as modal child next to `FinanceHistory`), possibly src/lib/components/finances/FinanceHistory.svelte if it belongs inside that layout
  depends: TASK-1, TASK-5
  risk: medium — `ContentModal` only forwards `onRename` and children, so the placement must fit both the popup and the bottom-sheet variant.

TASK-10: Unit tests: the conversion helper (all three intervals plus a missing `interval`), and store totals with mixed intervals, including a budget without `interval` (e.g. yearly 120 + monthly 10 → expense total 20), plus the sort order from `loadIncome()`.
  files: new tests/unit/services/BudgetIntervalService.test.ts (match TASK-2's location), tests/unit/stores/Finances.test.ts
  depends: TASK-2, TASK-3, TASK-4
  risk: low — the existing `budget()` fixture in Finances.test.ts can take an optional interval.
