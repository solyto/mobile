# Brief: Finance History

type: feature
id: photo
branch: feature/photo_finance-history
date: 2026-10-15
author: Leander Muskalla

## What

Make the value history of wealth fields and budget items editable: values can be added for any date, corrected and deleted, with at most one value per item and day.

**Wealth.** Today `PUT /finances/wealth/fields/{field}/value` always creates a new `WealthValue` dated today (`WealthService::updateValue`), and there is no way to change or remove a past value.

- Adding a value accepts an optional date (default: today). If the field already has a value on that date, it is replaced instead of a second one being created.
- A single value can be updated (amount and date) and deleted.
- `currentValue` on `WealthFieldResource` is the value with the latest date, not the last inserted one, and the field's values are returned ordered by date.

**Budget.** A budget item (income or expense) has a single `value` column that is overwritten on every change, so there is no history at all.

- Budget items get a dated value history like wealth fields, with the same operations: add with an optional date (replacing an existing value on that date), update and delete a single value.
- The item's current value is its value with the latest date. Existing reads of the budget item (list, totals) keep returning a current value, so clients that only show the current amount keep working.
- Existing budget items start their history with one value: their current `value`, dated at their `updated_at`.

**Both.**

- Only the owner of the item can add, change or delete its values.
- Caches for the user's finance data are invalidated on every change.

## Why

Users cannot fix a mistyped amount, remove a wrong entry, record a balance they forgot to enter on the day, or see how an income or expense changed over time, so their finance history drifts away from reality or does not exist (feature request "Finance - history", 27.08.2026).

## Out of scope

- Bulk import or bulk editing of values.
- Changes to creating, renaming or deleting wealth fields and budget items, beyond what the history needs.
- Recurring or scheduled budget changes (e.g. "salary rises from July").

## Notes

- `WealthFieldResource::currentValue` is currently `$this->values->last()` on an unordered relation. Once values can be backfilled, the last inserted value is no longer the most recent one, so this must be based on the date.
- Existing data can already contain several wealth values for the same field and day (every edit on a day added a row). The one-value-per-day rule needs a decision for those rows: the intended behaviour is to keep the most recently created value per field and day and drop the others. This deletes data, so confirm it with the owner before writing the migration.
- Income and expense items share the `budgets` table, so the history applies to both. The request mentions income; if the owner wants it for income only, that should be decided before the analyst starts.
- Whether a date in the future is allowed is open; rejecting it is the expected default.
- Endpoint shape and naming are up to the developer; the frontend job will follow whatever is chosen here. The OpenAPI docs should describe the new and changed endpoints.
➜  app git:(main) ✗ cat frontend-brief-finance-history.md 
## What

Give every wealth field and budget item a history view in which its values can be viewed, corrected, deleted and added for past dates.

Clicking a wealth field on `/finances/wealth` or a budget item on `/finances/budget` opens a modal (a bottom sheet on mobile, via the existing `ContentModal`) for that item:

- At the top, a small line chart of this item's values over time.
- Below it, the list of its values, newest first: date and amount, with edit and delete actions per entry.
- An "add entry" row with a date (default today) and an amount.

Notable changes:

- Types, API routes and store methods for listing, adding (with a date), updating and deleting values of wealth fields and budget items, each reloading the finance data on success like the existing finance methods.
- The history view is one component used for both wealth fields and budget items.
- The existing double-click on an amount to enter a new value stays as it is.
- All new UI strings in `en`, `de`, `es` and `fr`.

## Why

Users cannot fix a mistyped amount, remove a wrong entry, record a balance they forgot to enter on the day, or see how an income or expense changed over time (feature request "Finance - history", 27.08.2026).

## Out of scope

- A table or spreadsheet view across all items, and bulk backfilling.
- Editing values by clicking points in a chart.
- New overview charts for the budget page.
- Changes to the existing wealth overview charts ("Show history"); they pick up corrected and backfilled values on their own.

## Notes

- Depends on the API job for the finance history, which adds the endpoints, the budget value history and the one-value-per-day rule. Use the endpoint names and shapes that job settles on. API PART IS DONE, check github.com/solyto/api for reference.
- One value per item and day: adding an entry for a date that already has one replaces it. The add row should make that clear, for example by showing the existing amount for the chosen date.
- Deleting an entry asks for confirmation (`ConfirmationModal`).
- `WealthStatisticsService` already sorts by date and aggregates by month, so backfilled wealth values appear correctly in the overview charts. The per-item chart can reuse an existing chart component (`charts/SmoothLineChart`).
- Income and expense items share one model, so the history applies to both; see the API brief if it should be income only.
- Follow `docs/STANDARDS.md`, in particular: form controls from `forms/` (`DateInput`, `NumberInput`), buttons from `ui/buttons/`, no raw inputs, and any payload conversion in a service rather than in the component.