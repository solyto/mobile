## Summary

Budget items carry an interval (`monthly`, `quarterly`, `yearly`). The budget page stays a monthly view: totals, the share bar and the item order use the monthly amount, and non-monthly items show "<monthly> / month · <entered> / <interval>". The interval is picked when creating an item and can be changed in the history modal. TASK-8 (hiding the picker on older servers) is not needed: newer frontends don't support older APIs, so `interval` is always sent.

## Changes

TASK-1: `src/lib/types/finance.ts` — `BudgetInterval` type; optional `interval` on `Budget`, `CreateBudgetRequest`, `UpdateBudgetRequest`.
TASK-2: new `src/lib/services/BudgetIntervalService.ts` — `intervalOf` (missing → monthly), `monthlyAmount` (unrounded), `monthlyTotal`, `sortByMonthlyAmount`, plus `options()` / `suffix()` that build the picker options and display suffix from `FinanceRecords` (moved here once both AddBudget and the budget page needed the options).
TASK-3: `src/lib/state/Finances.svelte.ts` — the store holds a `budgetIntervals` service; the three budget totals use `monthlyTotal`. This also changes the numbers on the finance dashboard, as intended for a monthly view.
TASK-4: `Finances.loadIncome()` sorts by monthly amount, largest first, before splitting into income/expenses.
TASK-5: `types/translation.ts` + all six locales — `interval_monthly|quarterly|yearly`, `per_month|quarter|year`. No "Interval" label needed; the segmented options explain themselves.
TASK-6: `components/finances/BudgetField.svelte` — share bar and amount use the monthly amount; non-monthly items add the "/ month · entered / interval" line.
TASK-7: `components/finances/AddBudget.svelte` — `SegmentedControl` interval picker in the desktop inline form and the mobile bottom sheet, default `monthly`, sent as `interval`, reset after submit.
TASK-8: not needed (human decision: no frontend support for older API versions). No code change.
TASK-9: `routes/finances/budget/+page.svelte` — `SegmentedControl` above `FinanceHistory` in the history modal; calls `finances.updateBudget(historyBudget, { interval })` and updates `historyBudget` on success. History values are untouched.
TASK-10: `tests/unit/services/BudgetIntervalService.test.ts` (new) and `tests/unit/stores/Finances.test.ts` — conversion for every interval and a missing one, no rounding/drift, mixed-interval totals (yearly 120 + monthly 10 → 20), sorting, labels.

## Known issues / follow-ups

- **Not verified with tooling:** `node_modules` is missing in this worktree, and installing packages needs approval, so `npm run check`, `npm run lint` and `npm test` were not run. The service logic was checked with Node's type stripping (yearly 120 + monthly 10 → 20; after switching to monthly → 130). The UI was not rendered (no API running), so the space for the desktop inline form with the extra picker in the section header still needs a visual check.
- **Translations (rework after review):** the `translator` agent isn't callable in these sessions, so the locales were done by hand following `docs/agents/translator.md` and `docs/I18N.md`; they should get the usual owner review. Fixes after review: `de` and `ru` interval labels were over the ~30% length rule (`Quartalsweise`, `Ежеквартально`, `Ежемесячно`), so both now use the period nouns common in period pickers — `de` Monat / Quartal / Jahr, `ru` Месяц / Квартал / Год (back-translation: "Month / Quarter / Year"). `ru` `per_month` is now `/ месяц` instead of the abbreviated `/ мес.`, matching `/ квартал` and `/ год`. es/fr/it are within the length rule and unchanged.
- **Unchanged and out of scope:** `AddBudget` keeps its hardcoded `"Title"` / `"Value"` placeholders (rule 8.1). If the interval update in the history modal fails, the segmented control still shows the new choice until the modal is reopened.
