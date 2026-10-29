# Implementation: libraries: changing a rating resets the list

id: line
developer: developer
date: 2026-10-29

## Summary

Every library store reloads the whole list after an edit (rating, edit modal, create, delete, cover upload, link favorite/drag). `load()` used to overwrite `filteredEntries` with all entries, which dropped any active search or filter. Now each store remembers which filter was applied last (`activeFilter`, a plain non-reactive field) and `load()` re-applies it in the same synchronous step that assigns the new entries, before any further `await`. Because of that, the list never briefly shows all entries. The current "last action wins" filter behaviour is unchanged.

## Changes

TASK-1: `BookLibrary.svelte.ts`: added `activeFilter` (`none | search | genreAndRating | wishlist | lent`), a private `filterEntries()` switch, and a private `reapplyFilter()` that `load()` calls before `loadGenres()`. User filter actions still reset `shelfIndex` to 0. A reload keeps the shelf position and clamps it to the new list length.
TASK-2: `MusicLibrary.svelte.ts`: same as books (`search | genreAndRating | wishlist`). `loadIntegrations()` is unchanged.
TASK-3: `MovieLibrary.svelte.ts`, `GameLibrary.svelte.ts`: same pattern. These stores have no shelf.
TASK-4: `RecipeLibrary.svelte.ts` (`search | ratingAndType`) and `PlantLibrary.svelte.ts` (`search | location | unidentified`) got `activeFilter` and a `reapplyFilter()` that re-runs the existing filter methods. `QuoteLibrary.load()` now calls `search()`, which returns all entries when the term is empty.
TASK-5: `LinkLibrary.svelte.ts`: added a plain `searchActive` flag. `search()` sets it, choosing a category or favorites clears it, and `reapplyFilter()` re-runs the search first. `activeFilter` is unchanged, so the category highlight behaves as before.
TASK-6: `tests/unit/stores/LibraryStores.test.ts`: added reload tests for every store and a shelf-position test (kept on reload, clamped when the list shrinks). Removed `load()` from the two "shelf resets on refilter" tests, because a reload deliberately no longer resets the shelf. **I could not run these tests or `npm run check`/`npm run lint`: there is no `node_modules` in the worktree, and installing packages needs approval. Please run `npm test && npm run check && npm run lint` before merging.**

## Known issues / follow-ups

- Filters don't combine (e.g. search + genre + wishlist): this job keeps "last action wins".
- Filter modes clear each other inconsistently (e.g. `search()` does not clear `wishlistFilter`, so the filter button stays highlighted).
- Detail modals capture `library.activeEntry` once, so after a reload an open modal still holds the old object. Not changed here.
- The full refetch after each edit could be replaced by updating the changed entry in place.
