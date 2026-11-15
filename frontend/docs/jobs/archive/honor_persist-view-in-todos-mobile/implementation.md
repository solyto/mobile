# Implementation: persist view in todos (mobile)(

id: honor
developer: @developer
date: 2026-11-08

## Summary

The todo view was never persisted: it lived only in the per-page `Todos` store, and the mobile `onMount` forced `card` every time. The view is now saved to LocalStorage (`todos_view`) and restored on mount, validated against the views allowed for the current viewport. This one fix applies to web, mobile, and desktop shells.

## Changes

TASK-1: `src/lib/state/Todos.svelte.ts` — added `LS_VIEW_KEY`, `VIEWS_DESKTOP` / `VIEWS_MOBILE` (matching `ViewSwitcher.svelte`), `changeView` now calls `saveView()`, and a new `loadView(isDesktop)` falls back to the viewport default (`list` / `card`). Same pattern as `Calendars`.
TASK-2: `src/routes/todos/+page.svelte` — replaced the hard-coded mobile `todos.view = 'card'` with `todos.loadView(viewPoint.isDesktop)`. `ViewPoint` measures the window synchronously in its constructor (root layout), so `isDesktop` is correct by the time this `onMount` runs.
TASK-3: `tests/unit/stores/Todos.test.ts` — tests for saving on change, restoring an allowed view, and falling back for disallowed/missing values.

## Known issues / follow-ups

- `node_modules` is not installed in this environment, so `npm test` / `npm run check` could not be run; please run them before merging.
