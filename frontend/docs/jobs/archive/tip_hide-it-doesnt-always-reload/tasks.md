# Tasks: hide it doesnt always reload

id: tip
status: open
analyst: @analyst
date: 2026-08-17

<!-- Produced by @analyst from brief.md. -->

## Root cause (analysis)

Symptom: after reloading `/todos`, the Hide-It toggle shows the persisted (correct)
state, but hideable todos/categories stay visible; toggling off and on again hides
them.

All findings are in `src/lib/state/Todos.svelte.ts`:

1. **The persisted flag is restored too late.** `hideItActive` starts `$state(false)`
   on every store creation, and `loadHideIt()` — the only reader of
   `localStorage['todos_hideit']` — runs as the *last* statement of `load()`
   (line 90), after three awaited network calls. Every filtering pass before that
   (`checkUrlForFilter()` → `useFilters()` at line 79, the sort at line 85, and any
   `toggleHideIt()` during the load window) runs with `hideItActive === false`.

2. **Hide-it filtering silently no-ops when `workspaces` is empty.**
   `useFilters()` (line 161-171) applies `filterByHideIt(todos, this.workspaces)`
   and `filterCategories()` applies `filterCategoriesByHideIt(categories,
   this.workspaces)`. With `workspaces === []` both hide *nothing*
   (`TodoFilterService.ts:108-138`). `workspaces` is only populated by the
   `Promise.all([loadCategories(), loadWorkspaces()])` at line 89 — and
   `loadWorkspaces()` **swallows failures** (`if (res)` at line 104): a single
   non-ok response (transient 5xx, 401-refresh race at boot) leaves `workspaces`
   empty for the lifetime of the page while the todos/categories fetches succeed.

3. **Result — exact reported symptom:** when the workspaces fetch fails or the
   user interacts before it resolves, `loadHideIt()` still restores
   `hideItActive = true` (so the toggle shows the correct state) and dutifully
   re-filters — but against an empty workspaces array, so nothing is hidden.
   "Sometimes" = only when that fetch fails/is slow. Toggling twice helps because
   any mutation meanwhile re-runs `load()` → workspaces arrive → the next
   `useFilters()` finally filters against a populated array.

4. **Fragility in the same family (confirmed, secondary):**
   - If any awaited fetch *rejects* (network-level error — `ApiService.list`
     returns `null` on HTTP errors, but `fetch` rejects on network failure),
     `load()` throws and `loadHideIt()` never runs at all; `+page.svelte`'s
     `onMount` has no error handling.
   - `loadCategories()` unconditionally resets `filteredCategories =
     this.categories` (line 98) — also called standalone from
     `settings/+page.svelte:25` and category CRUD — so hidden categories
     reappear in the nav after those actions (same bug class, non-reload path).
   - `HideIt.svelte` binds a `$derived` into `Toggle`'s `$bindable` `checked` —
     display and store can transiently disagree during the load window.
   - A new `Todos` instance is created per layout (`/`, `/todos`, `/calendar`,
     `/settings`) sharing one LS key — each visit re-runs the whole restore
     sequence, multiplying exposure.

Fix direction (minimal): restore the flag synchronously (constructor/top of
`load()`), keep a re-filter after `workspaces` load, and make sure a rejected or
failed workspaces fetch can't leave hide-it silently inactive.

## Task breakdown

TASK-1: restore hide-it flag synchronously
Restore `hideItActive` from localStorage at store construction (or top of
`load()`), so every `useFilters()` / `filterCategories()` pass — including
`checkUrlForFilter()` inside `load()` — sees the persisted value. Keep
`loadHideIt()`'s re-filter-after-workspaces behavior as the tail of `load()`.
files: src/lib/state/Todos.svelte.ts, tests/unit/stores/Todos.test.ts
depends: none
risk: low — constructor runs client-side only; LocalStorageService already
guards non-browser; existing tests mock `storage.getBool` (default `?? false`).

TASK-2: harden load() against failed/skipped workspace loads
Ensure (a) a rejection in `loadCategories()`/`loadWorkspaces()` cannot skip the
flag restore + re-filter at the tail of `load()` (e.g. settle both, then restore
and re-filter unconditionally), and (b) a non-ok workspaces response
(`loadWorkspaces()` swallowing the error and leaving `[]`) no longer leaves
hide-it silently inactive for the page's lifetime — pick the smallest mechanism
already idiomatic in this codebase (propagate the failure so `load()` rejects
visibly, or retry/defer re-filter until workspaces exist). No redesign, no new
abstractions.
files: src/lib/state/Todos.svelte.ts
depends: TASK-1
risk: medium — touches `load()`, the shared path re-run by every todos mutation;
ordering-sensitive (flag must be set before first filter pass, re-filter must
happen after workspaces resolve).

TASK-3: regression tests for the restore sequence
Using the existing `tests/unit/setup/storeMocks.ts` harness, add cases to
`tests/unit/stores/Todos.test.ts`: (a) `load()` with `storage.getBool → true`
and a hideable workspace → hideable todos/categories are excluded from
`filteredTodos`/`filteredCategories`; (b) workspaces endpoint returns `null`
(HTTP failure) → assert the chosen TASK-2 behavior instead of the old silent
no-op; (c) `toggleHideIt()` invoked before workspaces resolve (the load-window
race) → state consistent after `load()` completes.
files: tests/unit/stores/Todos.test.ts
depends: TASK-1, TASK-2
risk: low — pure store tests, harness already exists.

TASK-4: verify build, types, lint and manual repro
Run `npm run check`, `npm test`, `npm run lint`. Document the manual verification
in implementation.md: reload `/todos` with the flag persisted on (incl. a
simulated failed workspaces request via devtools) — todos and categories stay
hidden without toggling twice.
files: docs/jobs/tip_hide-it-doesnt-always-reload/implementation.md
depends: TASK-1, TASK-2, TASK-3
risk: low — verification only.

TASK-5 (optional, confirm scope first): fix adjacent hide-it leaks
Same bug class on non-reload paths: `loadCategories()` resets
`filteredCategories` without re-applying hide-it (settings page + category CRUD
make hidden categories reappear). Out of the reported repro; only do it if the
author confirms, as a one-line re-filter or by routing through the store.
files: src/lib/state/Todos.svelte.ts
depends: TASK-2
risk: low — single method, covered by TASK-3-style assertions if implemented.

## Open questions

- None blocking TASK-1/3/4. TASK-2 mechanism choice (reject visibly vs. defer)
  is left to the developer/reviewer — the brief only asks for the cause, and both
  options remove the reported symptom; flagging it here instead of guessing.
