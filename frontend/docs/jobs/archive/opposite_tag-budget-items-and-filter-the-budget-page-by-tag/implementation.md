# Implementation: tag budget items and filter the budget page by tag

id: opposite
developer: developer
date: 2026-11-17

## Summary

Budget items carry global tags. You can pick tags when you create an item (desktop row and mobile sheet) and change them in the history modal. Each item shows its tags. A selector on the budget page filters by one tag or none. The lists, the three totals, the income/expense bar and the percentage bars then use only the filtered items. Filtering runs client-side in the `Finances` store through the existing interval-aware totals, so yearly and quarterly items count with their monthly amount. On servers whose budgets come without `tags`, the picker is hidden, and the filter never shows because no tags are in use.

## Changes

TASK-1: `types/finance.ts` adds `Budget.tags: Tag[]`, a `BudgetResponse` API type with an optional `tags` field, and `tags?: number[]` on the create and update requests. New `services/BudgetTagService.fromApi()` converts a missing `tags` to `[]` once in `loadIncome()` (STANDARDS 12.3). The fixture in `BudgetIntervalService.test.ts` got `tags: []`.
TASK-2: `BudgetTagService.filterByTag()` (null returns the list unchanged) and `usedTags()` (each tag once, sorted by name). Tests are in `tests/unit/services/BudgetTagService.test.ts`.
TASK-3: `Finances` gets `selectedTagId`, `filteredIncome()`, `filteredExpenses()` and `availableTags()`. The three total getters now read the filtered lists. `loadIncome()` clears a selected tag that is no longer used. The raw `income`/`expenses` arrays are unchanged.
TASK-4: `tests/unit/stores/Finances.test.ts` covers the brief's example (50 / 20 → +30), an item with two tags counted under each tag, a yearly item counted monthly, no tag selected giving today's totals, the available tags, and clearing or keeping the selection on reload.
TASK-5: `routes/finances/+layout.svelte` provides the `Tags` store and loads it alongside budget and wealth.
TASK-6: `finances.tags`, `tag_error`, `all_tags` and `tag_filter` added to `translation.ts` and all six locales. No translator agent can be called in this session, so I wrote the non-English strings myself following `docs/I18N.md` (glossary: Tag = Etiqueta (es) / tag (fr, it) / тег (ru)). `tag_error` reuses each locale's existing `libraries.tag_error` wording. Translator pass: all four keys in `de`, `es`, `fr`, `it`, `ru` checked against `docs/I18N.md` and confirmed unchanged.
TASK-7: new `components/finances/BudgetTagPicker.svelte` wraps `forms/MultiSelect` with the tag options and creates new tags via `tags.create()`. Both `AddBudget` variants use it, and the selected tag ids go into `CreateBudgetRequest`. Enter/Escape inside the multiselect stop propagation, so they don't reach the row's `KeyManager` submit.
TASK-8: `forms/MultiSelect.svelte` gets an optional `onchange(value)` prop (STANDARDS 7.2). For a newly created tag it fires only after the tag id has resolved. The history modal uses `BudgetTagPicker` and saves through `finances.updateBudget(…, { tags })`. If saving fails, the picker resets to the saved tags.
TASK-9: `BudgetField.svelte` shows the item's tags with `TagFlexList` (read-only) next to the title, only when it has tags. The title and tags wrap, so the amount column keeps its width.
TASK-10: `routes/finances/budget/+page.svelte` adds a `forms/Select` next to "Total" with "All tags" plus the used tags. It is hidden when no item is tagged. The lists read the filtered store methods. The income/expense bar no longer divides by a zero income (`expenseShare()`). `forms/Select.svelte` gets an optional `ariaLabel` prop. Leaving the page resets the selection, so the finances overview, which shares the store, always shows the whole budget (Open question 3, safe default).
TASK-11: Open question 1 was not answered and no human was available. I used the analyst's suggested default (a): `BudgetTagService.supportsTags()` returns true if any loaded budget has a `tags` field, or if there are no budgets. `Finances.tagsSupported` controls the picker: the page passes it to `AddBudget` as a `showTags` prop (STANDARDS 3.3) and uses it to show the picker in the history modal. An empty selection sends no `tags` field. Tests are in both test files.

## Known issues / follow-ups

- TASK-11 uses option (a) without confirmation. When `hide-features-on-older-servers` adds version-based detection, `tagsSupported` should move to it. If there are no budgets at all, the picker is shown on an older server too, which will probably ignore the field (not verified).
- I did not check the rendered UI with `shot`: no solyto API is running in this environment, and the budget page needs an authenticated session with data. The brief's manual check (50 € / 20 € → + 30 €) should be done against a server that has `budget-tags`. It is covered by unit tests.
- The selected tag is not remembered across visits (optional in the brief).
- Existing, out of scope: `AddBudget` has hardcoded `"Title"`/`"Value"` placeholders (STANDARDS 8.1), and the total shows `- 0` when it is exactly zero.
