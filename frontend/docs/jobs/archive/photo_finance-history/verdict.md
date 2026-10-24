# Verdict: Finance History

id: photo
reviewer: @reviewer
date: 2026-10-15

## Review

Reviewed against `git diff main...HEAD`. On this branch, `npm test` (69 files,
1020 tests), `npm run check` (0 errors, 0 warnings) and `npm run lint` all pass.

`tasks.md` was marked BLOCKED until the API contract was known. The frontend
brief says the API part is done and points to `github.com/solyto/api`. The
developer took the contract from there and wrote down the decisions in
`implementation.md`: the endpoints, `Y-m-d` dates, both income and expense, and
future dates blocked. That answers the analyst's three questions in a way that
fits the brief. I could not check the API repository myself from this
environment, so the endpoint shapes are reviewed as documented.

TASK-1: PASS
notes: `FinanceValue`, `FinanceValueForm` and the store/update request types in `src/lib/types/finance.ts` match the documented contract. Replacing `UpdateWealthValueRequest` with `StoreFinanceValueRequest` is consistent, and no references are left.

TASK-2: PASS
notes: In `apiRoutes.ts`, wealth `updateValue` was renamed to `storeValue` and the old caller was updated. The routes with two ids follow the existing `.replace('%d', …)` + `ApiService` pattern, and `ApiService` was not touched.

TASK-3: PASS
notes: `FinanceHistoryService` is pure and covered by 13 tests. It sorts by the day string, so there is no timezone shift.

TASK-4: PARTIAL
notes:
- `src/lib/state/Finances.svelte.ts` `addWealthValue` (line ~153–160): `apiService.update` returns a `boolean`, but the method returns `res !== null`, which is always `true`. It also uses that value as the reload guard. This was harmless before. Now `FinanceHistory.add()` resets the add row only `if (await onAdd(request))`, so a rejected add on a wealth field (network error, 422) clears the user's date and amount as if the save had worked. The new `updateWealthValue`/`deleteWealthValue` correctly use `res`. `addWealthValue` needs the same fix (`if (res)` / `return res`). The existing test "addWealthValue sends the optional date" does not cover the failure case.
- `loadBudgetValues` keeps the old `budgetValues` when the request fails (`if (res) …`). See TASK-8 for the effect.

TASK-5: PASS
notes: There are nine keys in the translation type and in all four languages, and `check` passes.

TASK-6: PASS
notes: `FinanceHistory.svelte` is a presentational leaf. It uses only shared primitives (`DateInput`, `NumberInput`, `TextButton`, `InlineEdit/DeleteButton`, `ConfirmationModal`, `SmoothLineChart`) and keeps the conversion in the service. Two shared components were changed outside the task's file list, and both are justified and documented in `implementation.md`:
- `DateInput` gained a `max` prop (STANDARDS 7.2).
- `SmoothLineChart` now redraws when its inputs change. Without that, the history chart would stay stale after an edit. The other users only gain the redraw.

TASK-7: PASS
notes: The modal is rendered once at page level, and the field is looked up by id from the store, so it stays fresh after reloads. The loading indicator stops on every path, and the double-click flow is unchanged. This page is also affected by the `addWealthValue` return-value bug under TASK-4.

TASK-8: PARTIAL
notes: `src/routes/finances/budget/+page.svelte` `openHistory()` always sets `historyBudget = budget` after `loadBudgetValues`, even if the load failed. Combined with `loadBudgetValues` keeping the previous state on failure, this causes a bug. If a user opens item A's history, closes it, and then opens item B while the values request fails, the modal shows **A's values under B's title**. Its edit/delete actions then send A's value ids to B's URLs, and the "replaces X" hint reports A's amount. Either open the modal only when the load succeeded, or clear `budgetValues` before or when the load fails.

TASK-9: PASS
notes: `check`, `lint` and `test` were re-run by the reviewer and pass.

## Security

Not run.

## Overall

NEEDS WORK

Must change before merge:
1. `Finances.addWealthValue` must return the real result of `apiService.update` (and reload only on success). Today it always returns `true`, so `FinanceHistory` clears the add row on a failed save. Add a failure test like the existing ones for budget values.
2. The budget history must never show another item's values. Either `openHistory` opens the modal only when `loadBudgetValues` succeeded, or `budgetValues` is reset so that a failed load cannot leave the previous item's values in place.

---

## Re-review (round 2)

Reviewed commit 4be820b (`Finances.svelte.ts`, `budget/+page.svelte`,
`tests/unit/stores/Finances.test.ts`) against the two blockers above. On this
branch `npm test` (69 files, 1022 tests), `npm run check` (0 errors, 0 warnings)
and `npm run lint` all pass.

TASK-4: PASS
notes: `addWealthValue` now returns the `boolean` from `apiService.update` and reloads only when the add succeeded. `loadBudgetValues` returns `res !== null`, because `ApiService.list` returns `null` on failure. New tests cover both failure paths. The double-click caller in `wealth/+page.svelte` ignores the return value, so its behaviour does not change.

TASK-7: PASS
notes: The history add row is no longer cleared when an add fails, because `addWealthValue` now reports the failure.

TASK-8: PASS
notes: `openHistory` sets `historyBudget` only when `loadBudgetValues` succeeded, so the modal can no longer open with another item's values. If a reload fails while the modal is open (`reloadBudget`), the modal keeps the same item's previous values. That is stale but correct for the item.

All other tasks are unchanged from round 1: PASS.

## Overall (round 2)

APPROVED

Nothing must change before merge.
