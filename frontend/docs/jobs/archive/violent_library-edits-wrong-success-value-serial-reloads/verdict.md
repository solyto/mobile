# Verdict: library edits — wrong success value, serial reloads

id: violent
reviewer: reviewer
date: 2026-11-17

## Review

Reviewed `git diff main...HEAD` on `feature/violent_library-edits-wrong-success-value-serial-reloads`. All changes are in the eight library stores, `tests/unit/stores/LibraryStores.test.ts` and the job files. Nothing is outside scope. I re-ran the checks: `npm run check` (0 errors), `npm run lint` and `npm test` (98 files, 1658 tests) all pass.

TASK-1: PASS
notes: All 26 `update`/`delete`/`updateRating`/`deleteGenre`/`deleteCategory` methods now `return res;`, and the `if (res) …` reload is unchanged. These are the remaining `res !== null` lines: `create` (8), `loadReleases` (Book, Music), Link `createCategory` and Plant `uploadCover`. In each of them `res` is an object or `null`, so they were correctly left alone. The new code matches STANDARDS 15.5.

TASK-2: PASS
notes: The table-driven `it.each` covers all 26 methods. On `false` it checks for no `api.list` call (no reload); on `true` it checks for a reload.

TASK-3: PASS
notes: Book, Movie, Music and Game `load()` use `Promise.all`. Genres are applied only on success. `entries` → `reapplyFilter()` → `loaded` only on list success. Music's `loadIntegrations()` still runs afterwards, and `loadGenres()` is unchanged. Applying genres when the list fails is what the brief allows ("genres/categories only change when their request succeeded").

TASK-4: PASS
notes: `LinkLibrary.load()` sets `entries` before `setCategories()`, so the counts always use the new list. `loadCategories()` now uses the same private `setCategories()` and behaves as before. The helper stays inside the class, as the tasks allowed. Running `reapplyFilter()` before the categories are set does not matter, because `reapplyFilter` does not read `categories`.

TASK-5: PASS
notes: Deferred promises keyed by route show that both requests start before either one resolves. The list-failure path is covered. Link `categoriesCount` is checked for both resolve orders. Existing tests are unchanged and pass.

TASK-6: PASS
notes: check, lint and test pass (re-run by the reviewer). No package or i18n files changed.

## Security

none

## Overall

APPROVED

No blockers.
