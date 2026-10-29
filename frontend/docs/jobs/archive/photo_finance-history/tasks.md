# Tasks: Finance History

id: photo
analyst: architect
date: 2026-10-15

<!-- Produced by @analyst from brief.md. -->

## Status: BLOCKED. Waiting on the API contract

The frontend brief says: "Use the endpoint names and shapes that job [the API
job] settles on." That contract is not available in this repository. There is
no OpenAPI file, no API job output, and no new finance routes in
`src/lib/config/apiRoutes.ts`. TASK-1, TASK-2 and TASK-4 cannot be written
without it. Any implementation done now would have to guess URLs, HTTP
methods, payloads and response shapes.

`brief.md` also has formatting problems. Its top half is the **API** brief,
which belongs to the backend repository and cannot be done here. After a
pasted shell-prompt line (`➜ app git:(main) ✗ cat frontend-brief-finance-history.md`)
comes the **frontend** brief. This task list covers only the frontend part.

### Questions for the owner (answer before `@developer` starts)

1. **API contract.** For wealth values and for budget values, what are:
   - the endpoint paths and methods for list (if values are not embedded), add (with date), update and delete;
   - the request bodies, including the date format (`YYYY-MM-DD`?);
   - the response shapes? In particular: does `Budget` keep a top-level `value` (= current value), and does it gain `values[]` / `currentValue` like `WealthField`? Are values embedded in the list responses, or fetched per item?
   - Does the existing `PUT /finances/wealth/fields/{id}/value` stay unchanged? (The brief says the double-click flow must keep working.)
   - Do value routes need two ids, for example `/fields/%d/values/%d`? `ApiService.update/delete` replace only one placeholder (see the TASK-2 risk).
2. **Income only, or both?** The API brief leaves this to the owner. By default these tasks assume **both** income and expense.
3. **Future dates.** If the API rejects them (the expected default), should the date picker block them too? `forms/DateInput.svelte` has no `max` prop today, so it would need extending (STANDARDS 7.2).

## Task breakdown

TASK-1: Extend the finance types with a dated value type for budget items, request types for adding a value (amount + date) and updating a value, and whatever new fields `Budget` gets (`values` / `currentValue`), exactly matching the API contract.
  files: src/lib/types/finance.ts
  depends: API contract (question 1), question 2
  risk: medium. The `Budget` shape change ripples into `getBudget*Total()` and `BudgetField.svelte`, and the type must mirror the API (STANDARDS 15.9, 12.3).

TASK-2: Add the new endpoints (wealth value add/update/delete and budget value add/update/delete, plus list endpoints if values are not embedded) to `apiRoutes.finances`.
  files: src/lib/config/apiRoutes.ts
  depends: API contract (question 1)
  risk: medium. If the routes nest two ids (`field/%d/values/%d`), the current `ApiService.update/delete` cannot fill both placeholders. Changing `ApiService` would be out of scope, so the developer should ask before touching it.

TASK-3: Add a pure service with unit tests for the history logic. It converts between the API value and the form (date string ↔ amount), sorts values newest first, finds the existing value for a chosen date (for the "this replaces X" hint), and builds the `categories`/`values` arrays for `SmoothLineChart` (oldest → newest).
  files: src/lib/services/FinanceHistoryService.ts (new), tests/FinanceHistoryService.test.ts (new)
  depends: TASK-1
  risk: low. Pure functions under TZ=UTC tests. Check whether `WealthStatisticsService` or `DateHelper` already provide date formatting before adding new code (STANDARDS 2.3, 13.1).

TASK-4: Add store methods to `Finances` for adding (with date), updating and deleting a value of a wealth field and of a budget item. Each reloads finance data on success (`loadWealth()` / `loadIncome()`), like the existing methods. Adjust `getBudgetTotal/IncomeTotal/ExpenseTotal` only if the `Budget` shape changes.
  files: src/lib/state/Finances.svelte.ts
  depends: TASK-1, TASK-2
  risk: medium. The existing `addWealthValue` is used by the double-click flow on the wealth page and must keep working. Extend it with an optional date, or add a separate method, but do not break the old one.

TASK-5: Add all new UI strings (history title, add entry, date, amount, edit, delete, delete confirmation text, "replaces existing value of X on this date", empty history) to the translation type and all four languages.
  files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
  depends: none
  risk: low. The work is mechanical, and `npm run check` enforces that the four languages stay in sync.

TASK-6: Build one shared, presentational history component. It shows a `SmoothLineChart` of the item's values at the top, then the list of values newest first (date, amount, edit and delete actions per row), then an add row (`DateInput` defaulting to today, `NumberInput`, a button from `ui/buttons/`) that shows the existing amount when the chosen date already has a value. Deleting asks for confirmation via `ConfirmationModal`. Inline edit of a row reuses the same form controls.
  files: src/lib/components/finances/FinanceHistory.svelte (new)
  depends: TASK-3, TASK-5 (types from TASK-1)
  risk: medium. This is the largest piece of UI. It must follow STANDARDS 3.3 (dumb leaf: values in, callbacks out), 3.7 (no copying store data into local edit state beyond the form value), 7 (no raw inputs or buttons), 13.2 (conversion in the service) and 9 (Enter/Escape via `KeyManager` if used).

TASK-7: Wire the history into the wealth page. Clicking a wealth field (its title) opens the history in a `ContentModal`, which is a bottom sheet on mobile. Render the modal once at the page level (STANDARDS 1.7). Connect the callbacks to the TASK-4 store methods with the loading indicator. Keep the existing double-click on the amount unchanged.
  files: src/lib/components/finances/WealthField.svelte, src/routes/finances/wealth/+page.svelte
  depends: TASK-4, TASK-6
  risk: medium. The click target must not collide with the existing delete button and the amount double-click. The loading indicator must stop on every exit path (15.7).

TASK-8: Wire the history into the budget page the same way, for income and expense items (or income only, per question 2). Keep the existing double-click on the amount working with the new budget value semantics.
  files: src/lib/components/finances/BudgetField.svelte, src/routes/finances/budget/+page.svelte
  depends: TASK-4, TASK-6, question 2
  risk: medium. If the API changes how a budget's current value is set, the double-click `updateBudget({ value })` flow in `+page.svelte` may need to switch to the new add-value method. Confirm this against the contract.

TASK-9: Verify with `npm run check`, `npm run lint` and `npm test`. Fix only findings caused by this job.
  files: none expected beyond the above
  depends: TASK-1 … TASK-8
  risk: low. This is verification only.

## Notes for the developer

- Out of scope (from the brief): a cross-item table or spreadsheet view, bulk backfill, editing via chart points, new budget overview charts, and changes to the wealth overview charts.
- `DateInput` takes a `string` value. Keep the component's form state as one typed value and leave conversion to TASK-3's service (STANDARDS 13.2).
- Do not touch `ApiService` without asking (see the TASK-2 risk).
