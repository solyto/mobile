# Verdict: persist view in todos (mobile)(

id: honor
reviewer: @reviewer
date: 2026-11-08

## Review

TASK-1: PASS
notes: `src/lib/state/Todos.svelte.ts` — `LS_VIEW_KEY = 'todos_view'`, `VIEWS_DESKTOP` / `VIEWS_MOBILE` match `src/lib/components/todos/views/ViewSwitcher.svelte` exactly. `changeView` → `saveView`, `loadView(isDesktop)` validates against the allow-list and falls back to `allowed[0]` (`list` / `card`). Mirrors the `Calendars` pattern. `LocalStorageService.get` returns raw string or null, so comparing it is correct. `ViewSwitcher` is the only caller that changes the view, and it uses `changeView`.

TASK-2: PASS
notes: `src/routes/todos/+page.svelte` — the hard-coded `card` override is replaced by `todos.loadView(viewPoint.isDesktop)`. Confirmed in `src/lib/state/Viewpoint.svelte.ts`: the constructor runs `updateScreenSize()` synchronously in the browser, so `isDesktop` is already correct when the page's `onMount` runs. A mobile-only saved value (or a desktop-only one) can no longer leave the page blank, because `loadView` filters it out.

TASK-3: PASS
notes: `tests/unit/stores/Todos.test.ts` — covers saving on change, restoring an allowed view on both viewports, and falling back for a value from the wrong viewport and for null. `resetStoreMocks()` runs `mockReset` on `storage.*` in `beforeEach`, so `mockReturnValue` doesn't leak into other tests. Not run: `node_modules` isn't installed here (the developer had the same problem).

Scope: the diff only touches the three planned files plus the job docs. Nothing outside the plan changed.

## Security

None. Only a non-sensitive view name goes into LocalStorage.

## Overall

APPROVED

No blockers. Run `npm test` and `npm run check` before merging, because they could not be run in this environment.
