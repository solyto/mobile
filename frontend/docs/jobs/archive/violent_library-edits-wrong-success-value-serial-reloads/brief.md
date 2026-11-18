# Brief: library edits — wrong success value, serial reloads

type: feature
id: violent
branch: feature/violent_library-edits-wrong-success-value-serial-reloads
date: 2026-11-17
author: Leander Muskalla

updated: 2026-11-17 (scope decided by the owner, ready for implementation)

## Job (decided, do exactly this)

Two changes in the eight library stores
(`src/lib/state/{Book,Movie,Music,Game,Recipe,Plant,Quote,Link}Library.svelte.ts`).
Nothing else.

### 1. Return the real success value (bug fix)

The mutation methods return `res !== null`, but where `res` comes from
`apiService.update()` / `apiService.delete()` it is already a boolean
(`ApiService.ts:257,275` return `res.ok`). So the result is always `true`.
Effect: when saving the edit form fails (422, 500, offline),
`if (ok) library.closeCreateModal()` still closes the modal and the input is
lost without a message.

Fix: return the boolean directly (`return res;`), as
`TimeTracking.updateCategory` already does (`TimeTracking.svelte.ts:77`).
Keep the existing `if (res) await this.load();` before the return.

Affected methods (26 call sites, verified 2026-11-17):
- `update`, `delete`, `updateRating` in all stores that have them
- `deleteGenre` in Book, Movie, Music, Game
- `deleteCategory` in Link (`LinkLibrary.svelte.ts:209`)

Correct already, do not change: `create`, `createCategory`, `uploadCover`,
`loadReleases` (their `res` is an object or `null`).

Check each `res !== null` in the eight stores
(`grep -n "res !== null" src/lib/state/*Library.svelte.ts`) and change only
those where `res` is the boolean from `update()` / `delete()`.

### 2. Load list and genres/categories in parallel

`load()` fetches the list, then genres/categories, one after another:
- Book, Movie, Music, Game: list → `loadGenres()` (e.g. `BookLibrary.svelte.ts:78-86`)
- Link: list → `loadCategories()` (`LinkLibrary.svelte.ts:52-61`)

Start both requests at the same time (`Promise.all`), then apply the results.
Same data, same freshness as today; saves one round trip per edit.

Rules:
- Keep today's behaviour on failure: `entries` / `loaded` only change when the
  list request succeeded; genres/categories only change when their request
  succeeded. `reapplyFilter()` runs after `entries` is set, as today.
- **Link:** `loadCategories()` computes `categoriesCount` from `this.entries`
  (`LinkLibrary.svelte.ts:63-80`). In `load()`, the counts must be computed
  after **both** requests are back and `entries` is set, or they'd be counted
  against the old list. `loadCategories()` is also called on its own after
  creating, editing or deleting a category, and must keep working the same way
  there (fetch categories, count against the current entries).
- **Music:** `loadIntegrations()` stays as it is (after the rest, loaded once
  per instance).
- Recipe, Plant, Quote have no second request; leave their `load()` alone.

## Out of scope (do not do)

- Discarding outdated `load()` responses (a "latest load wins" guard).
  Considered and dropped by the owner.
- Swapping the edited entry in from the PUT response instead of reloading,
  local re-sorting, or skipping the genre/category reload. All rejected: the
  full reload after every edit stays on purpose (fresh data from other tabs,
  server-side sort order, derived state).
- Showing 422 field errors in the library forms.
- Any API change. The API side is a separate entry in the API repo.
- Refactoring the stores beyond these two changes.

## Tests

In `tests/unit/stores/LibraryStores.test.ts` (stores with a mocked
`ApiService`, see `docs/TESTING.md`):
- For each store and each method from part 1: returns `false` when
  `api.update` / `api.delete` resolve `false`, and does not call `load()`.
  Returns `true` and reloads when they resolve `true`.
- Part 2, for Book, Movie, Music, Game and Link: `load()` issues the list
  request and the genres/categories request before either resolves (e.g. with
  deferred promises).
- Link: after `load()`, `categoriesCount` reflects the newly loaded entries,
  also when the categories response arrives before the list response.

## Checks

- `npm run check`, `npm run lint` (eslint) and `npm test` pass.
- No new packages, no i18n changes needed.

## Background (for context, no action)

- Every edit reloads the whole library on purpose (all eight stores end
  mutations with `await this.load()`).
- API facts from the API side: PUTs validate everything before writing (422 =
  nothing stored); the PUT response is the full entity; a PUT never changes other
  entries or the genre/category lists; lists are sorted on the server.
- Source report: `docs/reports/2026-11-17-library-reload-after-every-click.md`.
