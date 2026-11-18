# Brief: tag budget items and filter the budget page by tag

type: feature
id: opposite
branch: feature/opposite_tag-budget-items-and-filter-the-budget-page-by-tag
date: 2026-11-17
author: Leander Muskalla

## What

Let the user tag budget items (income and expense) with their existing
global tags, and filter the budget page by one tag to see income, expenses
and the balance for that tag only. Depends on the API entry `budget-tags`.

- **Types:** `Budget`, `CreateBudgetRequest` and `UpdateBudgetRequest` in
  `src/lib/types/finance.ts` get `tags` (tag objects on `Budget`, tag ids in
  the requests). A budget without `tags` (older server) has none.
- **Tagging:** a tag picker when creating an item
  (`src/lib/components/finances/AddBudget.svelte`) and in the history modal
  on `src/routes/finances/budget/+page.svelte`. Reuse the existing tag
  components and the `Tags` store (`src/lib/state/Tags.svelte.ts`) instead of
  building new ones. Show an item's tags on `BudgetField.svelte`.
- **Filter:** a tag selector on the budget page; one tag at a time, or none
  (everything, as today). Offer only tags that are used on at least one
  budget item. With a tag selected, the income and expense lists show only
  items with that tag, and the total, income total, expense total, the
  income/expense bar and the percentage bars are computed from those items
  only. Filter client-side in `src/lib/state/Finances.svelte.ts` (the totals
  at `:62-75` take the filtered lists); no new API call.
- **i18n:** labels for the filter ("all", the selector) and the tag picker in
  all six locales (`src/lib/i18n/`), with the type in
  `src/lib/types/translation.ts`.
- **Tests:** unit tests for the filtered totals (a tag on income and expense
  items, an item with two tags, no tag selected gives today's totals).

## Why

To see one area of the budget on its own, e.g. donations for solidarity work
against the server costs for it: "solidarity: + donations, − servers =
balance". Dev request from the maintainer, decided 2026-11-17: existing
global tags, a filtered monthly view only (no development over time), one
tag at a time.

## Notes

- Works without `budget-interval`. Once that's in, the filtered totals use
  the monthly amounts automatically, as long as both use the same totals
  functions. With yearly items in the tag, the numbers are only right
  after `budget-interval`.
- Whether the selected tag is remembered across visits is optional (a
  per-device convenience at most).
- On an older server without the field, hide the picker and the filter; see
  `hide-features-on-older-servers`.
- Check: tag a monthly income of 50 € and a monthly expense of 20 € with
  "solidarity"; selecting "solidarity" shows only those two, with
  + 50 €, − 20 € and a total of + 30 €; clearing the filter shows everything
  again.
