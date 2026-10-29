# Tasks: libraries: changing a rating resets the list

id: line
analyst: analyst
date: 2026-10-29

## Findings

- Every library store refetches the whole list after create/update/delete/updateRating
  (`if (res) await this.load()`), and `load()` overwrites `filteredEntries` with all
  entries (`setFilteredEntries(this.entries)` / `this.filteredEntries = this.entries`).
  Search terms and genre/rating/wishlist/lent/type/location/unidentified filters stay
  set in state (the filter button still looks active) while the list shows everything.
- Affected: **all** edits, not just rating — `update` (edit modal), `updateRating`
  (detail modal stars, `DetailModal.svelte:26`), `create`, `delete`, `PlantLibrary.uploadCover`,
  `LinkLibrary.dragToCategory` / favorite toggle (`LinkEntry.svelte:21`).
- Libraries affected: books, music, movies, games, recipes, plants, quotes.
  `LinkLibrary` already has the pattern this job needs (`activeFilter` + `reapplyFilter()`
  called from `load()`), but it ignores an active search term.
- Book and music `setFilteredEntries` also reset `shelfIndex` to 0, so a reload jumps
  the shelf view back to the start as well.
- No flicker needed: as long as the filter is re-applied synchronously in `load()` right
  after `this.entries = ...` (before any `await`, e.g. before `loadGenres()`), Svelte
  renders only the final filtered list.
- Filter modes are not composable today, they are "last action wins": `search()` clears
  genre/rating but not wishlist/lent; wishlist and lent clear each other but not genre/rating;
  `filterByGenreAndRating()` ignores wishlist/lent/search. So the store flags alone cannot
  reliably reconstruct what is on screen (e.g. wishlist set, then a search typed: the
  screen shows search results but `wishlistFilter` is still `true`).

## Approach (decision for the developer)

Follow the existing `LinkLibrary` precedent: each store remembers which filter was last
applied and `load()` re-runs it via a `reapplyFilter()` method, instead of resetting.
This keeps today's "last action wins" behaviour exactly; it does **not** make filters
combine. Making filters composable (search + genre + wishlist at once) is a behaviour
change and out of scope — flag it as a follow-up rather than doing it here.

`shelfIndex` must not reset on a reload-triggered re-apply (only on a user-initiated
filter change); clamp it if the filtered list got shorter.

Open question (not blocking, default chosen above): whether the owner wants composable
filters. If so, that is a separate job.

## Task breakdown

TASK-1: Make `BookLibrary.load()` re-apply the last active filter (search / genre+rating / wishlist / lent / none) instead of resetting to all entries, synchronously before `loadGenres()`, without resetting `shelfIndex`.
files: src/lib/state/BookLibrary.svelte.ts
depends: none
risk: medium — the reference implementation for all other stores; must track "last applied filter" correctly across `search()`, `filterByGenreAndRating()`, `filterByWishlist()`, `filterByLent()`, `clearFilters()`.

TASK-2: Apply the same change to `MusicLibrary` (search / genre+rating / wishlist), keeping `loadIntegrations()` behaviour unchanged and not resetting `shelfIndex` on reload.
files: src/lib/state/MusicLibrary.svelte.ts
depends: TASK-1
risk: low — same shape as BookLibrary.

TASK-3: Apply the same change to `MovieLibrary` and `GameLibrary` (search / genre+rating / wishlist).
files: src/lib/state/MovieLibrary.svelte.ts, src/lib/state/GameLibrary.svelte.ts
depends: TASK-1
risk: low — same shape, no shelf index.

TASK-4: Apply the same change to `RecipeLibrary` (search / rating+type via `filter()`), `PlantLibrary` (search / location / unidentified) and `QuoteLibrary` (search only).
files: src/lib/state/RecipeLibrary.svelte.ts, src/lib/state/PlantLibrary.svelte.ts, src/lib/state/QuoteLibrary.svelte.ts
depends: TASK-1
risk: low — simpler filter sets; note `PlantLibrary.create` and `uploadCover` both call `load()`.

TASK-5: Extend `LinkLibrary.reapplyFilter()` so an active search term is also preserved after reload (today toggling favorite or editing while searching drops the search), tracking search as a filter mode like the other stores.
files: src/lib/state/LinkLibrary.svelte.ts
depends: TASK-1
risk: low — small change to an existing method; must keep category/favorite counts and drag-to-category working.

TASK-6: If the "re-apply last filter" logic is pure enough to live in `LibraryFilterService` or is otherwise testable without Svelte runes, add Vitest unit tests for it per `docs/TESTING.md`; otherwise skip and say so in implementation.md.
files: tests/ (new or existing LibraryFilterService test), possibly src/lib/services/LibraryFilterService.ts
depends: TASK-1..TASK-5
risk: low — test-only; do not introduce a new abstraction just to make it testable.

## Out of scope / follow-ups to record

- Making filters composable (search combined with genre/rating/wishlist/lent).
- Inconsistent clearing between filter modes (e.g. `search()` not clearing `wishlistFilter`, so the funnel button stays highlighted).
- Detail modals capture `library.activeEntry` once (`const entry = library.activeEntry`), so after a reload the open modal keeps the stale object; it shows the new rating only because the modal's own state is updated locally (verify, do not fix here unless it breaks the rating display).
- Replacing the full refetch with an in-place update of the changed entry.

No UI strings are added or changed; no i18n work.
