# Implementation: Finance History

id: photo
developer: @developer
date: 2026-10-15

## Summary

Wealth fields and budget items (income and expense) now have a history view.
Clicking an item's title on `/finances/wealth` or `/finances/budget` opens a
`ContentModal` (popup on desktop, bottom sheet on mobile). The modal shows a
line chart of the item's values, a row to add an entry (date defaults to today,
future dates are blocked, and a hint shows the amount that will be replaced on
that date), and the list of entries newest first. Each entry can be edited
inline or deleted after confirmation. The double-click on an amount still
works as before.

`tasks.md` was marked BLOCKED because the API contract was missing. The
frontend brief points to the finished API job, so I took the contract from
the public `github.com/solyto/api` (job `river_finance-history`:
`routes/api.php`, the `*ValueRequest` and `*Resource` classes, and the archived
`implementation.md`). That answers the analyst's three questions:

1. **Contract:**
   - Wealth: `PUT /finances/wealth/fields/{field}/value` (unchanged, now takes an optional `date`), `PUT|DELETE /finances/wealth/fields/{field}/values/{value}`.
   - Budget: `GET|POST /finances/budget/{budget}/values`, `PUT|DELETE /finances/budget/{budget}/values/{value}`.
   - Dates are sent as `Y-m-d`.
   - `Budget.value` stays the current value. Budget values are not embedded in the list response, so they are fetched per item.
2. **Income and expense:** the API covers both, so the frontend does too.
3. **Future dates:** the API rejects them (`before_or_equal:today`). `DateInput` got an optional `max` prop (STANDARDS 7.2), so the picker blocks them as well.

Two ids in one route: the store fills the parent id with `.replace('%d', …)`
and passes the value id to `ApiService.update/delete`. `Contacts` and `Todos`
already do this, so `ApiService` was not touched.

`npm run check` (0 errors, 0 warnings), `npm run lint` (clean),
`npm test` (69 files, 1020 tests passed) and `npm run build` all pass.

## Changes

TASK-1: `src/lib/types/finance.ts`
- New `FinanceValue` (`id`, `date`, `value`). `WealthValue` and `BudgetValue` are aliases of it, because the API shapes are identical. This lets one component serve both.
- New `FinanceValueForm` (`date` string + `value`), the single typed form value (STANDARDS 13.2).
- New `StoreFinanceValueRequest` (`value` required, `date` optional) and `UpdateFinanceValueRequest` (both optional), mirroring the API's request rules.
- The old `UpdateWealthValueRequest` is replaced by `StoreFinanceValueRequest`.
- `Budget` is unchanged, because `values` is never loaded by the API's list/show endpoints.

TASK-2: `src/lib/config/apiRoutes.ts`
- Wealth: `updateValue` (the `/value` add endpoint) is renamed to `storeValue`, and new `updateValue`/`deleteValue` routes point at `/values/%d`.
- Budget: new `listValues`, `storeValue`, `updateValue` and `deleteValue`.

TASK-3: `src/lib/services/FinanceHistoryService.ts` (new) with `tests/unit/services/FinanceHistoryService.test.ts` (13 tests). Pure functions that:
- read the calendar day from the API date (`Y-m-d` or an ISO timestamp, without timezone shift) and turn it into a local `Date` for display;
- sort entries newest/oldest first;
- find the entry on a date (for the "replaces" hint) and another entry on a date (for the edit date-clash check);
- convert between entry, form and request;
- build the chart categories/values, oldest first.

TASK-4: `src/lib/state/Finances.svelte.ts`
- New `budgetValues` state and `loadBudgetValues(budget)`.
- New `addBudgetValue`, `updateBudgetValue` and `deleteBudgetValue`. Each reloads the budget list and the item's values on success.
- New `updateWealthValue` and `deleteWealthValue`, which reload wealth. `addWealthValue` now takes the optional date.
- The budget totals are unchanged, because `Budget.value` is still the current value.
- Store tests added in `tests/unit/stores/Finances.test.ts` (URL composition with two ids, reloads, no reload on failure).

TASK-5: nine new `finances.*` keys (`history`, `date`, `amount`, `no_values`, `replaces_value`, `date_taken`, `edit_value`, `delete_value_label`, `delete_value_message`) added to `types/translation.ts` and to `en`, `de`, `es` and `fr`.

TASK-6: `src/lib/components/finances/FinanceHistory.svelte` (new). A presentational leaf: it takes `values` and `minValues` as props and reports changes through the `onAdd`/`onUpdate`/`onDelete` callbacks. It uses only the shared primitives: `DateInput`, `NumberInput`, `TextButton`, `InlineEditButton`, `InlineDeleteButton`, `ConfirmationModal` and `SmoothLineChart`. Saving an edit is disabled when the new date already has another entry, because the API would answer 422. The delete action is hidden when deleting would go below `minValues`; the budget page passes 1, because the API rejects deleting the last budget value. Two primitives were extended:
- `forms/DateInput.svelte`: optional `max` prop.
- `charts/SmoothLineChart.svelte`: the chart is now rebuilt when its inputs change. `chartContainer` became `$state`, and the one-shot `isInitialized` guard and the duplicate `tick()` init were removed. Before this, the chart was drawn once and went stale after an edit. The other users (check-in trends, admin growth, the finance overview) only gain the redraw.

TASK-7: `components/finances/WealthField.svelte` and `routes/finances/wealth/+page.svelte`. The field title is now a button that calls the new `onOpenHistory` prop. The page renders one `ContentModal` + `FinanceHistory` for the open field. The field is looked up by id from `finances.wealth`, so the modal shows fresh values after every reload. The page's handlers wrap the store calls in the loading indicator; the early returns happen before `start()` (15.7).

TASK-8: `components/finances/BudgetField.svelte` and `routes/finances/budget/+page.svelte`. These are wired the same way. Opening an item loads its values first (`loadBudgetValues`). The double-click flow still uses `updateBudget({ value })`, which the API now stores as today's history value.

TASK-9: `check`, `lint`, `test` and `build` all pass, and nothing needed fixing. `node_modules` was missing from the worktree, so I ran `npm ci --ignore-scripts` from the existing lockfile. `package.json` and `package-lock.json` are unchanged, and `node_modules` is gitignored.

## Known issues / follow-ups

- **Not rendered.** No API runs in this environment, so `/finances/*` redirects to login. The modal, the bottom sheet and the chart were checked by type-check and build only, not with `shot`. A visual check against a running API is still open, especially of the three-column add row at 375px width.
- **Overview charts on `/finances/wealth` don't refresh.** The "Show history" charts compute their statistics once in `onMount`, so they only pick up corrected or backfilled values after the page is reloaded. The existing double-click flow already behaves this way, and the brief puts those charts out of scope.
- **Failed requests show no message.** A rejected add/update/delete (for example a 422 from a race) just leaves the form open. This matches the existing finance methods; none of them shows a notification.
- **`tasks.md` still says "BLOCKED".** It was left as the analyst wrote it; the decisions above replace its open questions.
- `npm run build` ran out of memory in this container with the default Node heap. It passes with `NODE_OPTIONS=--max-old-space-size=4096`. This is an environment limit, not a code issue.

## Review fixes (round 2)

- `Finances.addWealthValue` now returns the real result of `apiService.update` (it always returned `true`), so a rejected add no longer clears the history's add row. Covered by a new failure test.
- `Finances.loadBudgetValues` now returns whether the load succeeded, and `openHistory` on `/finances/budget` opens the modal only on success, so a failed load can no longer show another item's values. Covered by a new test.
- Files: `src/lib/state/Finances.svelte.ts`, `src/routes/finances/budget/+page.svelte`, `tests/unit/stores/Finances.test.ts`. `npm test`, `npm run check` and `npm run lint` pass.
