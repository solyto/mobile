# Tasks: tag budget items and filter the budget page by tag

id: opposite
analyst: analyst
date: 2026-11-17

## Context found while reading

- Branch verified: `feature/opposite_tag-budget-items-and-filter-the-budget-page-by-tag`.
- `budget-interval` has already shipped: `BudgetIntervalService` exists and the
  store totals (`Finances.svelte.ts:65-75`) already use `monthlyTotal()`. So the
  filtered totals get monthly amounts for free as long as they go through the
  same three getters.
- The finances route does **not** provide the `Tags` store today:
  `src/routes/finances/+layout.svelte` calls neither `setTags()` nor `tags.load()`.
  `getTags()` in `AddBudget`/the budget page would return `undefined` unless this
  is added.
- There are six locales: `en, de, es, fr, it, ru`.
- Existing tag building blocks: `TagFlexList.svelte` (display, optional
  `onRemove`), `forms/MultiSelect.svelte` (used by the library create modals with
  `tags.create()` via `oncreate`, e.g. `LinkCreate.svelte:22-43`),
  `forms/Select.svelte` (single select with `onchange`). `MultiSelect` has **no**
  change callback, so persisting tag edits in the history modal needs either
  an optional `onchange` prop on it (STANDARDS 7.2 "extend, don't fork") or the
  add/remove pattern from `todos/props/Tags.svelte`.
- `hide-features-on-older-servers` is still a backlog item: there is no
  `serverSupports()` helper or feature/version list, and the minimum API
  version for `budget-tags` is not stated anywhere. See Open questions.

## Task breakdown

TASK-1: Add `tags` to the budget types: `Budget` gets `tags: Tag[]`, `CreateBudgetRequest`/`UpdateBudgetRequest` get `tags?: number[]`, and `loadIncome()` normalises a missing `tags` (older server) to `[]` once at the API boundary (STANDARDS 12.3).
  files: src/lib/types/finance.ts, src/lib/state/Finances.svelte.ts
  depends: none
  risk: low — additive fields; the only risk is forgetting the `?? []` fallback and crashing on older servers.

TASK-2: Add pure tag-filter logic as a tested service (STANDARDS 15.8): `filterByTag(budgets, tagId | null)` (null returns the list unchanged) and `usedTags(budgets)` (distinct tags used on at least one item, sorted by name).
  files: src/lib/services/BudgetTagService.ts (new; or methods on an existing service if the developer finds a better home — not BudgetIntervalService, different responsibility), tests/unit/services/BudgetTagService.test.ts (new)
  depends: TASK-1
  risk: low — pure functions, fully unit-testable.

TASK-3: Add filter state to the `Finances` store: a `selectedTagId = $state<number | null>(null)`, filtered `income`/`expenses` accessors used by the page, `availableTags` (from `usedTags` over all items), and make `getBudgetIncomeTotal`/`getBudgetExpenseTotal`/`getBudgetTotal` compute from the filtered lists; clear the selection if the selected tag is no longer used after a reload.
  files: src/lib/state/Finances.svelte.ts
  depends: TASK-2
  risk: medium — the getters are also used outside the page (check `src/routes/finances/+page.svelte` and any widget/overview callers) and must still mean "everything" when no tag is selected; keep the raw `income`/`expenses` arrays intact so loading/sorting is unchanged.

TASK-4: Unit tests for the filtered totals in the store: a tag on both an income and an expense item (50 € / 20 € → +30 €), an item with two tags counted under each, a yearly item contributing its monthly amount, and no tag selected giving today's totals.
  files: tests/unit/stores/Finances.test.ts
  depends: TASK-3
  risk: low — extends the existing `budget totals` describe block; the `budget()` fixture helper needs an optional `tags` argument.

TASK-5: Provide and load the `Tags` store for the finances section (`setTags()` and `tags.load()` alongside `loadIncome()`/`loadWealth()`).
  files: src/routes/finances/+layout.svelte
  depends: none
  risk: low — same pattern as the library and notes layouts; one extra request on the finances section.

TASK-6: Add the i18n keys for the tag picker label and the filter (selector label, "all" option) under the finances records, `en` only, with the type in `translation.ts`; hand `de, es, fr, it, ru` to the `translator` agent.
  files: src/lib/types/translation.ts, src/lib/i18n/en.ts, then de.ts, es.ts, fr.ts, it.ts, ru.ts (translator)
  depends: none
  risk: low — `npm run check` enforces locale parity; check first whether existing keys (`libraries.tags`, `todos.tag`, a generic "all") can be reused instead of adding new ones.

TASK-7: Tag picker when creating an item: a `MultiSelect` of `tags.tags` (with `oncreate` → `tags.create()`, as in `LinkCreate.svelte`) in both the desktop row and the mobile bottom sheet of `AddBudget`, sending `tags` in `CreateBudgetRequest` and resetting after submit.
  files: src/lib/components/finances/AddBudget.svelte
  depends: TASK-1, TASK-5, TASK-6
  risk: medium — the desktop variant is an inline row with Enter/Escape `KeyManager` handlers and a blur-to-close flow; the MultiSelect dropdown (portal) and its own Enter handling may conflict with the row's Enter-to-submit (cf. `autocompleteOpen` guard in `todos/props/Tags.svelte:45`). Desktop and mobile must share logic (STANDARDS 6).

TASK-8: Tag picker in the history modal on the budget page that saves via `finances.updateBudget(historyBudget, { tags })` and updates `historyBudget` locally on success, like the interval control does.
  files: src/routes/finances/budget/+page.svelte, src/lib/components/forms/MultiSelect.svelte (optional `onchange` prop, if that route is chosen)
  depends: TASK-1, TASK-5, TASK-6
  risk: medium — `MultiSelect` has no change callback today, so this either extends a shared component used by every library create modal (must stay backward-compatible) or adopts the todo-style add/remove pattern; also don't copy store data into local state to edit it (STANDARDS 3.7).

TASK-9: Show an item's tags on `BudgetField` using `TagFlexList` (read-only, no `onRemove`), only when the item has tags.
  files: src/lib/components/finances/BudgetField.svelte
  depends: TASK-1
  risk: low — display only; watch the row layout on mobile so the amount column isn't squeezed.

TASK-10: Tag filter selector on the budget page (one tag or "all"), options from `finances.availableTags`, hidden when no budget item has a tag; the lists, the three totals, the income/expense bar and the `sectionTotal` passed to `BudgetField` all read the filtered store values.
  files: src/routes/finances/budget/+page.svelte
  depends: TASK-3, TASK-6
  risk: medium — the page currently holds `total`/`incomeTotal`/`expenseTotal` in `$derived` over store getters; they must re-compute when `selectedTagId` changes (prefer reading the getters inline over adding more `$derived`, per STANDARDS 3.1/3.2), and the bar divides by `incomeTotal`, which can be 0 for a tag with only expenses (today's code would render `Infinity%`/`NaN%`).

TASK-11: Hide the tag picker (create + history modal) on servers that don't return `tags` on budgets, per the brief's note; the filter is already hidden there because no tags are used.
  files: src/lib/state/Finances.svelte.ts, src/lib/components/finances/AddBudget.svelte, src/routes/finances/budget/+page.svelte
  depends: TASK-1, TASK-7, TASK-8
  risk: high — scope unclear, see Open question 1; the detection mechanism is not decided.

## Open questions

1. **Older-server detection (TASK-11).** The brief says "hide the picker and the
   filter; see `hide-features-on-older-servers`", but that backlog item is not
   implemented and leaves its own design undecided, and the minimum API version
   for `budget-tags` is not given. Options:
   (a) data-based: the store records whether the loaded budgets carry a `tags`
       field; with zero budgets the field is unknown and the picker is shown
       (an older server would just ignore the extra `tags` field — unverified);
   (b) version-based: implement a minimal `serverSupports(minVersion)` now,
       which pulls part of `hide-features-on-older-servers` into this job and
       needs the version number;
   (c) skip hiding the picker in this job and leave it to
       `hide-features-on-older-servers`.
   Suggested default if nobody decides: (a), as it needs no version number and
   adds no new abstraction. Confirm before implementing TASK-11.
2. **Remembering the selected tag** across visits is optional in the brief. Not
   planned here; if wanted, it is a small follow-up via `LocalStorageService`.
3. **Other callers of the totals getters (TASK-3).** The finances overview
   (`src/routes/finances/+page.svelte:55,82`) also calls `getBudgetTotal()`,
   `getBudgetIncomeTotal()` and `getBudgetExpenseTotal()`. The `Finances` store
   lives in the finances layout, so a tag selected on the budget page would
   still be active when the user goes to the overview. The brief only covers
   the budget page. Safe default: the overview always shows everything, either
   by resetting `selectedTagId` when leaving the budget page or by having the
   overview use unfiltered totals.
