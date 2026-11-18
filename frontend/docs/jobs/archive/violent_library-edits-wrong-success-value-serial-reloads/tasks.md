# Tasks: library edits — wrong success value, serial reloads

id: violent
analyst: analyst
date: 2026-11-17

Branch verified: worktree HEAD is `feature/violent_library-edits-wrong-success-value-serial-reloads`, matching brief.md.

## Task breakdown

TASK-1: Return the real boolean from the 26 mutation methods that wrap `apiService.update()` / `apiService.delete()` (`return res;` instead of `return Promise.resolve(res !== null);`). Keep the `if (res) await this.load();` / `if (res) await this.loadGenres();` / Link's `deleteCategory` `if (res) { … }` block exactly as it is.
  files:
  - `src/lib/state/BookLibrary.svelte.ts`: `update` (237), `delete` (243), `updateRating` (254), `deleteGenre` (267)
  - `src/lib/state/MovieLibrary.svelte.ts`: `update` (188), `delete` (194), `updateRating` (205), `deleteGenre` (218)
  - `src/lib/state/MusicLibrary.svelte.ts`: `update` (239), `delete` (245), `updateRating` (256), `deleteGenre` (269)
  - `src/lib/state/GameLibrary.svelte.ts`: `update` (185), `delete` (191), `updateRating` (202), `deleteGenre` (215)
  - `src/lib/state/RecipeLibrary.svelte.ts`: `update` (156), `delete` (162), `updateRating` (173)
  - `src/lib/state/PlantLibrary.svelte.ts`: `update` (142), `delete` (148)
  - `src/lib/state/QuoteLibrary.svelte.ts`: `update` (95), `delete` (101)
  - `src/lib/state/LinkLibrary.svelte.ts`: `update` (174), `delete` (180), `deleteCategory` (209)
  Do NOT touch the other `res !== null` lines (`create`, `createGenre`/`createCategory`, `uploadCover` in Plant, `loadReleases` in Book/Music) — their `res` is an object or `null`.
  depends: none
  risk: low — mechanical one-line change per method; the callers already branch on the boolean, so they now just get the correct value.

TASK-2: Tests for TASK-1 in `tests/unit/stores/LibraryStores.test.ts`: for each store and each method listed in TASK-1, (a) `api.update`/`api.delete` resolving `false` → method returns `false` and `api.list` is not called (no reload); (b) resolving `true` → returns `true` and `api.list` is called (reload). A table-driven `it.each` over store/method pairs is fine, as long as it stays readable.
  files: `tests/unit/stores/LibraryStores.test.ts` (mocks from `tests/unit/setup/storeMocks.ts`, read-only)
  depends: TASK-1
  risk: low — tests only; the existing mock setup (`api.update`, `api.delete`, `api.list`) already covers what's needed.

TASK-3: Make `load()` in Book, Movie, Music and Game start the list request and the genres request together (`Promise.all`), then apply the results: `entries` + `reapplyFilter()` + `loaded = true` only if the list response is truthy; `genres` only if the genres response is truthy. Music: `await this.loadIntegrations()` stays after this, unchanged. `loadGenres()` itself stays as it is (still used by `createGenre`/`deleteGenre`).
  files: `src/lib/state/BookLibrary.svelte.ts` (78-86), `src/lib/state/MovieLibrary.svelte.ts` (61-69), `src/lib/state/MusicLibrary.svelte.ts` (80-89), `src/lib/state/GameLibrary.svelte.ts` (58-66)
  depends: none (independent of TASK-1; touches different methods in the same files)
  risk: low — one small behaviour change the brief allows: today genres are only fetched if the list succeeded, now a successful genres response is applied even when the list fails (brief: "genres/categories only change when their request succeeded").

TASK-4: Make `LinkLibrary.load()` start the list and categories requests together, then: set `entries` (only if list succeeded), then apply categories and compute `categoriesCount` against the **new** `entries` (only if categories succeeded), then `reapplyFilter()` and `loaded = true` (only if list succeeded). `loadCategories()` used on its own (from `createCategory`) must keep fetching categories and counting against the current `entries`. To avoid duplicating the counting loop, the developer can move "set categories + recompute counts" into one small method used by both `load()` and `loadCategories()` — keep it within the class, no new file or service.
  files: `src/lib/state/LinkLibrary.svelte.ts` (52-80)
  depends: none
  risk: medium — the counts must be computed after both responses are back and `entries` is set; getting the order wrong silently counts against the old list.

TASK-5: Tests for TASK-3 and TASK-4 in `tests/unit/stores/LibraryStores.test.ts`:
  - For Book, Movie, Music, Game and Link: with `api.list` returning deferred promises (one per route), call `load()` without awaiting and assert both the list route and the genres/categories route were requested before either resolves; then resolve both and assert `entries`, `genres`/`categories` and `loaded` are set.
  - Link: `categoriesCount` reflects the newly loaded entries (not the previous `entries`), including when the categories promise resolves before the list promise.
  - Music: `loadIntegrations` route requests are expected too — route-match in the mock so the integrations call doesn't break the test.
  The existing tests (e.g. "switches back to all… after deleting the active category", which route-matches `api.list`) must keep passing unchanged.
  files: `tests/unit/stores/LibraryStores.test.ts`
  depends: TASK-3, TASK-4
  risk: low — tests only; a deferred-promise helper may need to be written locally in the test file (check `tests/unit/setup/` first for an existing one before adding).

TASK-6: Run `npm run check`, `npm run lint` and `npm test`; fix anything caused by this change only.
  files: none expected
  depends: TASK-1 … TASK-5
  risk: low — no types, i18n or packages change.

## Notes / open points

- Count verified: 26 `res !== null` call sites where `res` is the boolean from `update()`/`delete()` (Book 4, Movie 4, Music 4, Game 4, Recipe 3, Plant 2, Quote 2, Link 3), matching the brief.
- Recipe, Plant, Quote `load()` are out of scope (no second request).
- Out of scope per brief: "latest load wins" guard, swapping in PUT responses, 422 field errors, any API change, other refactoring (e.g. dropping the `Promise.resolve(...)` wrapper in `create`/`createGenre` etc.).
