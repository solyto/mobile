# Verdict: budget items with a quarterly or yearly interval

id: gray
reviewer: reviewer
date: 2026-11-17
round: 2

Branch verified: `feature/gray_budget-items-with-a-quarterly-or-yearly-interval`.
Reviewed with `git diff main...HEAD`. Every source change is covered by tasks.md and implementation.md, and nothing is out of scope. Since round 1 the only change is `eef9b48`, which touches `de.ts`, `ru.ts` and implementation.md.

## Review

TASK-1: PASS
notes: `types/finance.ts`: `BudgetInterval` plus an optional `interval` on `Budget`, `CreateBudgetRequest` and `UpdateBudgetRequest`.

TASK-2: PASS
notes: `services/BudgetIntervalService.ts` is a pure class and returns unrounded values (STANDARDS 15.8). Holding it on the store as `budgetIntervals` follows the existing pattern (`Calendars.eventService`, `BookLibrary.filterService`).

TASK-3: PASS
notes: `Finances.svelte.ts:65-75`: all three totals go through `monthlyTotal`. The dashboard numbers change with them, which is intended.

TASK-4: PASS
notes: `loadIncome()` sorts a copy by monthly amount before splitting. Every CRUD method reloads through `loadIncome()`, so an interval change updates both the order and the totals. This covers the brief's check: 120 yearly + 10 monthly gives 20, and switching to monthly gives 130.

TASK-5: PASS
notes: The keys are in `types/translation.ts` and all six locales. The round-1 findings are fixed. `de` now uses Monat / Quartal / Jahr, which is within the length rule. `ru` uses Месяц / Квартал / Год with an unabbreviated `/ месяц`, so the three suffixes are consistent. es/fr/it follow `docs/I18N.md` (length, voice, no abbreviations). The `translator` agent cannot be called in these sessions. The developer applied the guide by hand and gave back-translations for the strings that were rephrased, so the result meets rule 8.2. Under the I18N.md workflow, the owner reviews `de` as usual.

TASK-6: PASS
notes: `BudgetField.svelte:30,62-67`: the share bar and the main amount use the monthly amount. Non-monthly items show "10,00 € / month · 120,00 € / year", and monthly items are unchanged. Rounding only happens in `europeanFormat`.

TASK-7: PASS
notes: `AddBudget.svelte`: there is a `SegmentedControl` in both the desktop form and the bottom sheet. It defaults to `monthly`, sends `interval`, and resets after submit. Binding a narrow union to the control has precedent (`Recurrence.svelte:130`, `NavigationOrder.svelte:90`).

TASK-8: PASS (not required)
notes: A human decided that newer frontends don't support older APIs, so `interval` is always sent and the picker is never hidden.

TASK-9: PASS
notes: `budget/+page.svelte:61-68,160-166`: `changeHistoryInterval` calls `finances.updateBudget(historyBudget, { interval })`, stops the loading indicator on every path (STANDARDS 15.7), and updates `historyBudget` on success. History values are not converted.

TASK-10: PASS
notes: The tests cover every interval, a missing interval, no drift, mixed totals (yearly 120 + monthly 10 → 20), sorting without mutating the input, labels, and the order from `loadIncome()`. `node_modules` is still missing from the worktree, so `npm test`/`check`/`lint` could not be run, either by the developer or by me.

## Overall

APPROVED

No blockers remain.
