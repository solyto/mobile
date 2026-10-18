# Verdict: link library: with a category selected add to that category

id: punishment
reviewer: deepseek-v4-flash (reviewer)
date: 2026-10-07

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

Base branch: `main` (22c5a68), no `.manigot/manigot.json` present. Branch
`feature/punishment_link-library-with-a-category-selected-add-to-that-category`
is correct. Reviewed full `git diff main...HEAD`: only the two expected source
files, the test file, and job metadata changed — no scope creep.

TASK-1: PASS
notes: `LinkLibrary.getActiveCategoryId()` added at
`src/lib/state/LinkLibrary.svelte.ts:99-103`, returning `activeFilter` when it
is a positive number and `null` otherwise. `LinkCreate.svelte:44` now sends
`category_id: library.getActiveCategoryId()` instead of hardcoded `null`. Both
files use the same context-injected store (`getLinkLibrary()`), so the active
filter is read from the instance the user is browsing. Mapping matches spec:
positive id -> id; `0`/`null`/`'favorite'` -> `null`. `LinkLibrary.create()`
signature unchanged; the feeds path is untouched — `SaveToLibraryButton.svelte`
still sends `category_id: null` explicitly and uses the separate store from
`src/routes/feeds/+layout.svelte` whose `activeFilter` is never set, so
`getActiveCategoryId()` returns `null` there. Confirmed. `CreateLinkRequest`
(`src/lib/types/library_link.ts:27`) allows `number | null`, so the type is
correct. `create()` -> `load()` -> `reapplyFilter()` already re-applies the
current category filter so the new link appears in the active view.

TASK-2: PASS
notes: `tests/unit/stores/LibraryStores.test.ts:594-607` adds a test inside the
existing `LinkLibrary` describe block covering all four filter states
(`null` -> null, positive -> id, `0` -> null, `'favorite'` -> null). Uses the
same `new LinkLibrary()` / `filterByCategory()` / `filterByFavorite()` pattern
as the surrounding tests. Assertions are consistent with the actual mapping.

TASK-3: PASS
notes: `implementation.md` documents `npm run check`, targeted Vitest, full
`npm test` (713/714, single pre-existing unrelated `StatisticWidget` failure in
`tests/components/logic-leaves.test.ts`), and `npm run build` succeeding.
Cannot re-run in this read-only session, but the diff is small and type-safe
and no touched file is implicated in the reported failures. `npm run lint` is
reported failing due to pre-existing repo-wide prettier drift and a pre-existing
unused import (`CreateLinkCategoryRequest` at `LinkLibrary.svelte.ts:6`, not
touched by this job) — both are pre-existing and out of scope. No i18n keys
added, so the "all four translation files" rule is not triggered.

## Security

none

## Overall

APPROVED

- No blockers. The change is minimal, correctly scoped, matches the tasks and
  the brief, and is covered by a regression test.
- Non-blocking note (no action required for this job): the reported pre-existing
  lint/format drift and the unrelated `StatisticWidget` test failure exist on the
  base branch and were not introduced here.
