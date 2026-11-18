# Implementation: library edits — wrong success value, serial reloads

id: violent
developer: developer
date: 2026-11-17

## Summary

The library mutation methods now return the real boolean from `ApiService.update()` / `delete()`. Before, they always returned `true`, so a failed save still closed the form. `load()` in Book, Movie, Music, Game and Link now sends the list request and the genres/categories request at the same time with `Promise.all`.

## Changes

TASK-1: In the 26 `update` / `delete` / `updateRating` / `deleteGenre` / `deleteCategory` methods across the eight `src/lib/state/*Library.svelte.ts` stores, `return Promise.resolve(res !== null);` became `return res;`. The `res !== null` lines in `create`, `createGenre`/`createCategory`, `uploadCover` and `loadReleases` were left alone.
TASK-2: `tests/unit/stores/LibraryStores.test.ts`: added an `it.each` over all 26 methods. When the API returns `false`, the method returns `false` and makes no `api.list` call. When it returns `true`, the method returns `true` and reloads.
TASK-3: `Book/Movie/Music/GameLibrary.load()` start the list and genres requests together. Genres are applied if their request succeeded. `entries`, `reapplyFilter()` and `loaded` change only if the list request succeeded. Music's `loadIntegrations()` still runs afterwards. `loadGenres()` is unchanged.
TASK-4: `LinkLibrary.load()` starts the links and categories requests together. It sets `entries` first, then the categories, so the counts are always taken from the new entries. Setting categories and recomputing `categoriesCount` moved into a private `setCategories()`, which both `load()` and `loadCategories()` use. `loadCategories()` on its own behaves as before.
TASK-5: Tests with deferred `api.list` promises, keyed by route via `apiRoutes`. They check that both requests are made before either one resolves, that the results are applied, and that genres are still applied when the list request fails. For Link, they check that `categoriesCount` matches the new links whichever response arrives first. The new tests were confirmed to fail against the old Book/Link `load()`.
TASK-6: `npm run check` (0 errors), `npm run lint` and `npm test` (1658 tests) all pass. `node_modules` was missing from the worktree, so I ran `npm ci --ignore-scripts` to install the pinned dependencies from the lockfile. No package files changed.

## Known issues / follow-ups

- `ApiService.list()` returns `null` on HTTP errors, and both failure paths keep the old behaviour. If a request throws (a network error), `Promise.all` now rejects without applying the other response. Before, a throwing genres request left the new `entries` set but `loaded` false. In practice, both requests usually fail together when the network is down.
