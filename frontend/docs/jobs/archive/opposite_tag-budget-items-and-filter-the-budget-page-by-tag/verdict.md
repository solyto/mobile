# Verdict: tag budget items and filter the budget page by tag

id: opposite
reviewer: reviewer
date: 2026-11-17

## Review

Reviewed `git diff main...HEAD` on `feature/opposite_tag-budget-items-and-filter-the-budget-page-by-tag`.
`npm test` (98 files, 1594 tests), `npm run check` (0 errors, 0 warnings) and
`npm run lint` all pass. Every changed file appears in `implementation.md`.

TASK-1: PASS
notes: `Budget.tags: Tag[]`, `BudgetResponse` API type with optional `tags`, `tags?: number[]` on both requests. `BudgetTagService.fromApi()` sets a missing `tags` to `[]` once in `loadIncome()` (STANDARDS 12.2/12.3).

TASK-2: PASS
notes: `filterByTag` (null returns the same list) and `usedTags` (each tag once, sorted by name, case-insensitive like `Tags.sort()`) are pure functions with tests in `tests/unit/services/BudgetTagService.test.ts`.

TASK-3: PASS
notes: The three totals go through `filteredIncome()`/`filteredExpenses()` and the existing `monthlyTotal()`, so interval handling is unchanged. The raw arrays stay as they were. `loadIncome()` clears a selected tag that is no longer used. The overview (`finances/+page.svelte`) always shows everything because the budget page resets `selectedTagId` in `onDestroy` (Open question 3, safe default).

TASK-4: PASS
notes: Covers 50/20 → +30, an item with two tags under each tag, a yearly item counted monthly (120/yr → 10), no tag selected giving the full totals, available tags, and clearing or keeping the selection on reload.

TASK-5: PASS
notes: `setTags()` + `tags.load()` added to `routes/finances/+layout.svelte`, the same pattern as the other sections.

TASK-6: FAIL
notes: Keys and the `FinanceRecords` type are correct and in all six locales, and the wording matches the I18N.md glossary. But the developer wrote `de`, `es`, `fr`, `it`, `ru` themselves (`src/lib/i18n/{de,es,fr,it}.ts:~863-867`, `ru.ts:683-685`; implementation.md TASK-6). That breaks the hard rule in AGENTS.md ("write `en` and hand the other locales to the `translator` agent … don't translate on the fly"), STANDARDS 8.2 and `docs/I18N.md:4-13`.

TASK-7: PASS
notes: `BudgetTagPicker` wraps `forms/MultiSelect` and creates tags with `tags.create()`, as `LinkCreate` does. The desktop row and mobile sheet both use it with the same `selectedTags` state and submit logic (STANDARDS 6). It is reset after submit, and only resolved ids are sent. On Enter/Escape: the code doesn't add `stopPropagation`. `svelte-multiselect` already calls `event.stopPropagation()` on both keys (`node_modules/svelte-multiselect/dist/MultiSelect.svelte:1015-1021`), and the root layout's bubbling `onkeydown` forwarder means the row's `KeyManager` submit doesn't fire. So the behaviour described is correct, but the library provides it, not this change.

TASK-8: PASS
notes: The optional `onchange` on `forms/MultiSelect` is backward-compatible (STANDARDS 7.2). For a user-created tag it fires only after `oncreate` resolves. `svelte-multiselect` assigns `selected` before calling `onchange`, so `value` is current. The history modal saves through `finances.updateBudget(…, { tags })` and does not copy store data into editable local state. If saving fails, the picker resets to the saved tags.

TASK-9: PASS
notes: `BudgetField.svelte:40-45` shows the tags with read-only `TagFlexList`, only when the item has tags. The title and tags wrap with `min-w-0`, so the amount column keeps its width.

TASK-10: PASS
notes: `forms/Select` (new optional `ariaLabel` prop, STANDARDS 7.2) offers "All tags" plus the used tags and is hidden when no item has a tag. The lists, the three totals, the bar and `sectionTotal` all read filtered values. The existing `$derived` totals recompute because the getters read `selectedTagId`. `expenseShare()` stops the width from becoming `Infinity`/`NaN` when filtered income is 0.

TASK-11: PASS
notes: The developer implemented the analyst's suggested default (a) without confirmation. This is documented in implementation.md, follows the brief ("hide the picker and the filter"), and adds no new abstraction. `showTags` reaches `AddBudget` as a prop (STANDARDS 3.3). When no tags are selected, no `tags` field is sent.

## Security

None run.

## Overall

NEEDS WORK

Must change before merge:

1. Have the `translator` agent produce or confirm the `de`, `es`, `fr`, `it`, `ru` values of `finances.tags`, `finances.tag_error`, `finances.all_tags` and `finances.tag_filter`, following `docs/I18N.md`. The developer's own versions must not ship unreviewed (AGENTS.md hard rule; STANDARDS 8.2).
