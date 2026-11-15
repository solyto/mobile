# Tasks: persist view in todos (mobile)(

id: honor
analyst: @analyst
date: 2026-11-08

## Findings (root cause)

The todo view is **not persisted at all** — it only lives in memory, which is why it resets:

1. `src/routes/todos/+layout.svelte` calls `setTodos()`, so a **new** `Todos` store is created every time the user enters `/todos`. Leaving for `/calendar` or `/` (dashboard) and coming back throws the old instance away.
2. `Todos.view` starts as `$state<TodoView>('list')` (`src/lib/state/Todos.svelte.ts:49`), and `changeView()` (line 126) only sets the field. Nothing writes to or reads from LocalStorage. (Compare `todos_hideit`, which *is* persisted in the same store.)
3. On mobile/tablet, `onMount` in `src/routes/todos/+page.svelte:33-35` **always** overrides the view with `todos.view = 'card'`. So even an in-memory value would be lost there.

Desktop and mobile allow different views (`ViewSwitcher.svelte`): desktop = `list | grouped | kanban | overview`, mobile = `card | grouped | overview`. A saved view must be checked against the current viewport, otherwise mobile could load `list`/`kanban`, which the mobile branch of `+page.svelte` doesn't render (blank page), and desktop could load `card`.

The fix follows the existing pattern in `Calendars.svelte.ts` (`LS_VIEW_KEY`, `changeView` → `saveView`, `loadView` with an allow-list fallback). "Web, mobile, desktop" all run this same store and page code (the native shells use the same LocalStorage service), so one fix covers all three.

Decision made (flag it if you disagree): use **one** key, `todos_view`. When loading, if the saved value isn't allowed for the current viewport, fall back to that viewport's default (`list` on desktop, `card` on mobile/tablet). Resizing a browser window across the breakpoint therefore falls back to the default instead of keeping a separate choice for each viewport.

## Task breakdown

TASK-1: Save the todo view to LocalStorage in the `Todos` store and add a viewport-aware `loadView(isDesktop: boolean)` that restores it, validated against the allowed desktop/mobile views (default `list` / `card`).
  files: src/lib/state/Todos.svelte.ts
  depends: none
  risk: low — small change that copies the existing Calendars `LS_VIEW_KEY` / `loadView` / `saveView` pattern; the allowed view lists must match `ViewSwitcher.svelte`.

TASK-2: In the todos page `onMount`, replace the hard-coded `todos.view = 'card'` mobile override with `todos.loadView(viewPoint.isDesktop)`, so both desktop and mobile restore the saved view.
  files: src/routes/todos/+page.svelte
  depends: TASK-1
  risk: medium — `viewPoint.isDesktop` starts as `false` until the Viewpoint store measures the window. If it hasn't measured by the time this `onMount` runs, desktop would fall back to `card` → `list`. Check the Viewpoint init order (the old override already depended on it, so it's probably fine, but confirm).

TASK-3: Add store unit tests for persisting and restoring the view: saved on `changeView`, restored by `loadView`, and an invalid or wrong-viewport value falls back to the default.
  files: tests/unit/stores/Todos.test.ts (uses the `storage` mock from tests/unit/stores/setup/storeMocks)
  depends: TASK-1
  risk: low — tests only, using the existing mocked-storage setup.

## Out of scope / notes

- The dashboard (`src/routes/+page.svelte`) and calendar layout also call `setTodos()` but never read `view`; they don't need changes.
- No UI strings change, so no i18n/translator work.
- Do not move `setTodos()` into the root layout to keep the instance alive. That is a bigger architectural change and still wouldn't survive a reload.
