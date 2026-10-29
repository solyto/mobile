# Tasks: link library: with a category selected add to that category

id: punishment
status: open
analyst: deepseek-v4-flash (analyst)
date: 2026-10-07

<!-- Produced by @analyst from brief.md. -->

## Context / findings

The bug is a hardcoded value, not a missing feature.

- `src/lib/components/libraries/links/LinkCreate.svelte` builds the create
  request in `onsubmit()` and always sends `category_id: null` (line 44),
  regardless of which category the user is currently viewing.
- The current selection lives in `LinkLibrary.activeFilter`
  (`src/lib/state/LinkLibrary.svelte.ts` line 35), typed
  `null | number | 'favorite'`:
  - `null` = "All" tab (CategoryHeader line 17)
  - `0`    = "Uncategorized" tab (line 56)
  - positive number = a real category id (line 85)
  - `'favorite'` = favourites tab (line 30)
- `LinkLibrary.create()` calls `load()`, which calls `reapplyFilter()`, so once
  the new link is saved under the selected category it will already appear in
  the current view — no extra refresh logic is needed.
- Existing precedent for "inherit the active filter on create" already exists
  in the codebase: `Todos.quickCreate()` sets `request.category_id` from the
  active category filter (`src/lib/state/Todos.svelte.ts` lines 268-275). The
  links fix should follow the same idea.
- Other callers of `LinkLibrary.create()` must NOT change behaviour:
  `src/lib/components/feeds/SaveToLibraryButton.svelte` saves feed items with
  an explicit `category_id: null` and gets a *separate* `LinkLibrary` instance
  from `/feeds/+layout.svelte` whose `activeFilter` is never set (stays `null`).
  A store-level default keyed off `activeFilter` therefore leaves it untouched,
  but the developer must confirm this and keep it true.

Expected mapping for a newly created link, given the active filter:
`positive category id -> that id`; `0 | null | 'favorite' -> null`
(uncategorized). "All" stays uncategorized to preserve current behaviour.

## Task breakdown

TASK-1: Make a new link inherit the currently selected category.
  files: src/lib/state/LinkLibrary.svelte.ts,
         src/lib/components/libraries/links/LinkCreate.svelte
  depends: none
  risk: low — single-purpose mapping; needs care only so the feeds save path
        (activeFilter null, separate store instance) still sends null.
  detail:
    - Add a small method on `LinkLibrary` (e.g. `getActiveCategoryId(): number | null`)
      that returns the active filter when it is a positive number, else `null`.
      This mirrors the existing small getters `getCategoryCount()` /
      `getFavoriteCount()` and makes the logic unit-testable (the repo has no
      component tests).
    - In `LinkCreate.svelte` `onsubmit()`, replace the hardcoded
      `category_id: null` with the value returned by that method.
    - Do not change `LinkLibrary.create()`'s signature or the
      `SaveToLibraryButton.svelte` caller.

TASK-2: Add regression tests for the active-category mapping.
  files: tests/unit/stores/LibraryStores.test.ts
  depends: TASK-1
  risk: low — additive tests against the `LinkLibrary` describe block.
  detail:
    - Cover each filter state: real category id -> that id; `0`
      (uncategorized) -> null; `'favorite'` -> null; `null` (all) -> null.
    - Follow the existing `new LinkLibrary()` setup and `filterByCategory()` /
      `filterByFavorite()` usage already in this file (lines 512-593).

TASK-3: Verify the change end to end.
  files: (no source changes; produces command output only)
  depends: TASK-1, TASK-2
  risk: low — standard project checks.
  detail:
    - `npm run check` (type-check; no i18n keys are added by this change).
    - `npm test` (Vitest unit tests).
    - `npm run lint`.
    - Manual/rendered confirmation that adding a link while a category is
      selected lands it in that category, and that the "All" / "Uncategorized"
      / favourites tabs still create uncategorized links.

## Out of scope

- Any change to `SaveToLibraryButton.svelte` / the feeds save flow (it has no
  category context and must keep saving uncategorized).
- The mobile layout: `CategoryHeader.svelte` is `max-md:hidden`, so there is no
  category selection UI on small screens to inherit; not part of this brief.
- Adding a category picker to the create modal — the brief only asks for the
  currently-browsed category to be preselected.
