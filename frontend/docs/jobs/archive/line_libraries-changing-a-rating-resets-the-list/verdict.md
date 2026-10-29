# Verdict: libraries: changing a rating resets the list

id: line
reviewer: reviewer
date: 2026-10-29

## Review

TASK-1: PASS
notes: `BookLibrary.load()` calls `reapplyFilter()` synchronously right after assigning `entries`, before `await loadGenres()`, so no flicker to the full list. `activeFilter` is set in every filter entry point (`search`, `filterByGenreAndRating` incl. via `addRatingFilter`/`addGenreFilter`, `filterByWishlist`, `filterByLent`, `clearFilters`). User actions still reset `shelfIndex` via `setFilteredEntries`; reload clamps it (`max(0, min(i, len-1))`, safe for an empty list).

TASK-2: PASS
notes: Same as books (`search | genreAndRating | wishlist`); `loadIntegrations()` untouched.

TASK-3: PASS
notes: Movie/Game follow the pattern; re-apply happens before `loadGenres()`.

TASK-4: PASS
notes: Recipe (`search | ratingAndType`, `addTypeFilter`/`addRatingFilter` go through `filter()`), Plant (`search | location | unidentified`), Quote (`load()` → `search()`, which returns all entries for an empty term per `LibraryFilterService.search`). All re-apply synchronously after assigning entries.

TASK-5: PASS
notes: `searchActive` is set by `search()` and cleared by `filterByCategory`/`filterByFavorite`; `reapplyFilter()` prefers it. Category highlight and counts unchanged. `load()` still awaits `loadCategories()` before re-applying (pre-existing); in between the old filtered list stays on screen, so there is no flicker to all entries.

TASK-6: PASS
notes: Reload tests added for every store, plus a shelf keep/clamp test. Removing `load()` from the two "shelf resets on refilter" tests is consistent with the intended behaviour change. I traced each new test by hand against the store and `LibraryFilterService` code and they hold. I could not run them because the worktree has no `node_modules`, and installing packages is not allowed.

Scope: the diff only touches the eight library stores, the store test file and the job docs, all listed in tasks.md. No UI strings were changed.

## Security

none (not run)

## Overall

APPROVED

No blockers. Still not verified: `npm test && npm run check && npm run lint` have not run in this job (no `node_modules`). Run them before merging.
