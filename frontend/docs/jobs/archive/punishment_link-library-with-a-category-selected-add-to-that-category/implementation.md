# Implementation: link library: with a category selected add to that category

id: punishment
developer: deepseek-v4-flash (developer)
date: 2026-10-07

## Summary

New links created while browsing a link-library category now inherit that
category instead of always being saved as uncategorized. The mapping is:
positive category id -> that id; `0` (Uncategorized), `null` (All) and
`'favorite'` -> `null` (uncategorized), preserving the previous behaviour for
those views. The change is a store-level getter plus swapping a hardcoded
`null` in the create form, following the existing `Todos.quickCreate()`
precedent.

## Changes

TASK-1: Make a new link inherit the currently selected category.
- `src/lib/state/LinkLibrary.svelte.ts` — added
  `getActiveCategoryId(): number | null`, returning `activeFilter` when it is
  a positive number and `null` otherwise.
- `src/lib/components/libraries/links/LinkCreate.svelte` — `onsubmit()` now
  sends `category_id: library.getActiveCategoryId()` instead of a hardcoded
  `null`.
- No change to `LinkLibrary.create()`'s signature or the
  `SaveToLibraryButton.svelte` caller, as required. That caller uses a
  *separate* `LinkLibrary` instance created in `src/routes/feeds/+layout.svelte`
  whose `activeFilter` is never set, so `getActiveCategoryId()` stays `null`
  there and feed saves remain uncategorized.

TASK-2: Add regression tests for the active-category mapping.
- `tests/unit/stores/LibraryStores.test.ts` — added a `LinkLibrary` test
  covering all filter states: positive id -> that id, `0` -> `null`,
  `'favorite'` -> `null`, `null` (All) -> `null`.

TASK-3: Verify the change end to end.
- `npm run check` — 0 errors, 0 warnings.
- `npx vitest run tests/unit/stores/LibraryStores.test.ts` — 29 passed.
- `npm test` — 713/714 passed; the single failure is the pre-existing,
  unrelated `StatisticWidget > applies the requested color classes` in
  `tests/components/logic-leaves.test.ts` (untouched by this job).
- `npm run build` — production build succeeded.
- `npm run lint` — cannot pass on this branch for pre-existing reasons, see
  Known issues.

## Known issues / follow-ups

- `npm run lint` fails independently of this change: `prettier --check .`
  flags 404 files repo-wide (formatting drift, including untouched lines in
  `LinkCreate.svelte`), and `eslint` reports a pre-existing unused import
  `CreateLinkCategoryRequest` in `src/lib/state/LinkLibrary.svelte.ts` (line 6,
  not touched by this job). These are pre-existing and out of scope.
- No rendered/browser confirmation was possible: the SPA requires a running
  solyto REST API (`http://localhost:8000`) and authentication, neither of
  which is available in this environment. The behaviour is covered by the unit
  tests instead.
