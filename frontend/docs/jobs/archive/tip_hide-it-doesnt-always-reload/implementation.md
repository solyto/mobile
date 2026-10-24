# Implementation: hide it doesnt always reload

id: tip
status: open
developer: @developer
date: 2026-08-17

## Summary

Fixed the "hide it sometimes doesn't hide after reload" bug in the todos feature
and added regression tests for the restore sequence.

Root cause (see tasks.md for the full analysis): the persisted
`todos_hideit` flag was only read at the **end** of `Todos.load()`, and hide-it
filtering silently no-ops while `workspaces` is empty — so a failed/slow
workspaces fetch (or any interaction inside the load window) left the toggle
showing the correct state while nothing was hidden.

- **TASK-1**: `hideItActive` is now restored from localStorage synchronously in
  the `Todos` constructor, so every filter pass (including the ones `load()`
  runs before the workspaces request resolves) sees the persisted value.
- **TASK-2**: `load()` wraps the parallel `loadCategories()`/`loadWorkspaces()`
  in `try`/`finally` so the flag restore + re-filter at the tail of `load()`
  can no longer be skipped by a rejected request, and `loadWorkspaces()` now
  retries once on failure (both non-ok responses and network rejections), so a
  transient failure can't leave `workspaces === []` — the state that silently
  disabled hide-it for the whole page lifetime. On permanent failure the store
  degrades gracefully (flag still restored, load still completes).
- **TASK-3**: four regression tests covering the restore sequence (see below).
- **TASK-4**: verification results below.
- **TASK-5**: intentionally not implemented — it was marked "confirm scope
  first" and no confirmation was given; tracked as a follow-up.

## Changes

TASK-1 — `src/lib/state/Todos.svelte.ts`: constructor now reads
`localStorage.getBool(LS_HIDE_IT_KEY) ?? false` into `hideItActive`
(SSR-safe: `LocalStorageService` returns `null` outside the browser).

TASK-2 — `src/lib/state/Todos.svelte.ts`:
- `load()`: `try { await Promise.all([loadCategories(), loadWorkspaces()]) }
  finally { loadHideIt() }` — the re-filter after workspaces always runs.
- `loadWorkspaces(retries = 1)`: failed fetch (`null` response or rejected
  promise via `.catch(() => null)`) is retried once; keeps the codebase's
  null-on-failure idiom for its standalone callers.
- `loadHideIt()`: comment only — it re-reads storage so a toggle issued while
  `load()` is in flight wins over the constructor restore.

TASK-3 — `tests/unit/stores/Todos.test.ts`: new `describe('hide-it restore on
load')` with four tests:
1. flag restored at construction + todos/categories hidden after `load()`;
2. workspaces fetch fails once → retried → still hidden;
3. workspaces fetch fails permanently → `load()` still completes, flag still
   restored (graceful degradation);
4. toggle issued mid-`load()` wins; one further toggle re-hides (the reported
   "toggle twice" complaint is gone).

TASK-4 — verification (this file).

Note: `src/lib/state/Todos.svelte.ts` also contains three formatting-only
normalizations on pre-existing long lines (in `useFilters`, `quickCreate`,
`updateCategory`) introduced by running the project's prettier on the touched
file; no semantic change.

## Verification

- `npm test`: **366/366 tests pass** (34 files), incl. the 4 new ones.
- `npm run check` (svelte-check): **0 errors, 0 warnings**.
- `npx prettier --check` + `npx eslint` on both changed files: clean.
  (Repo-wide `npm run lint` fails on ~278 **pre-existing** unformatted files —
  baseline debt, untouched by this job.)
- `node_modules` was empty in this sandbox; restored with `npm ci` (lockfile
  exact, no dependency changes).
- Manual repro with a live backend (reload `/todos` with the flag persisted on,
  devtools-simulated failed workspaces request) was **not possible here** — no
  API is available in this environment. The unit tests encode exactly those
  scenarios instead.

## Known issues / follow-ups

- **BLOCKER — commits could not be created.** The session's git shim permits
  `git add`/`git commit`, but the worktree's gitdir
  (`/home/leo/code/solyto/app/.git/worktrees/tip_hide-it-doesnt-always-reload`)
  is mounted **read-only** in this sandbox (`EROFS` on `index.lock`; confirmed
  via `/proc/mounts`). Not fixable from inside the session (no root). All work
  is present as unstaged working-tree changes; intended commits, in order:
  - `[tip] TASK-1: restore hide-it flag synchronously at store construction`
  - `[tip] TASK-2: guarantee hide-it re-filter and retry failed workspace loads`
  - `[tip] TASK-3: add hide-it restore regression tests`
  - `[tip] implementation: add summary`
  Files to stage (the working tree also contains pre-existing changes to
  `AGENTS.md` and deletions under `.opencode/jobs/highlight_rename-category/`
  that predate this session and are **not** part of this job):
  `src/lib/state/Todos.svelte.ts`,
  `tests/unit/stores/Todos.test.ts`,
  `docs/jobs/tip_hide-it-doesnt-always-reload/{tasks,implementation}.md`.
- TASK-5 (not implemented, needs author confirmation): `loadCategories()` sets
  `filteredCategories = categories` without re-applying hide-it, so standalone
  callers (settings page, category CRUD) un-hide categories in the nav until
  the next full `load()`.
- If the workspaces endpoint fails permanently, hide-it still cannot hide
  anything (the data that decides what to hide is missing); it now retries and
  keeps the toggle state truthful instead of silently showing a wrong list.
  A louder failure mode (rejected `load()`) was rejected because every caller
  (`onMount` in `+page.svelte`) lacks error handling and would hang the
  loading indicator.
