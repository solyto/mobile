# Tasks: Android widget bridge

id: town
analyst: analyst
date: 2026-10-29

<!-- Produced by @analyst from brief.md. -->

## Context found while reading

- Branch verified: `feature/town_android-widget-bridge`.
- Dependency [[logout-revokes-server-token]] is done: `apiRoutes.auth.logout`,
  `Auth.signOut()` and the local-only `Auth.logout()` exist
  (`src/lib/state/Auth.svelte.ts:182-198`).
- `docs/reports/android-homescreen-widgets-decisions.md` lives in
  `solyto/mobile` and is **not readable from this workspace**. D6/D7/D12 are
  known only through the brief.
- `Todos` is a feature store (created in `routes/todos/+layout.svelte` and
  `routes/calendar/+layout.svelte`); `Calendars` only in
  `routes/calendar/+layout.svelte`. Both already hold `auth: Auth` as a
  constructor collaborator, so the bridge is reachable through `auth` without
  a module-level singleton (STANDARDS 11.1 / 15.2).
- Precedent for a non-reactive helper owned by `Auth`:
  `src/lib/state/SessionMonitor.ts` (constructed in `Auth`, cleaned up in
  `Auth.destroy()`, mocked in `tests/unit/auth/Auth.test.ts`). The bridge
  should follow that shape and have a `destroy()` (STANDARDS 11.4).
- Opening a todo from the list = `todos.openEdit(id)` →
  `TodoEditModal` (rendered by `routes/todos/+layout.svelte`). There is no URL
  that opens a single todo today; `Todos.checkUrlForFilter()` already reads
  `filterType`/`filterValue` query params after `load()`, which is the
  precedent for a `?todo=<uuid>` param.
- `uuid` is already a dependency (`validate` is available); no new package
  needed.
- Browser globals injected by shells are declared in `src/app.d.ts`
  (STANDARDS decisions) — `window.SolytoWidgets` goes there.

## Task breakdown

TASK-1: Add `apiRoutes.auth.widgetToken` (`/auth/widget-token`), the response type, and a `Window.SolytoWidgets` declaration.
  files: src/lib/config/apiRoutes.ts, src/lib/types/auth.ts, src/app.d.ts
  depends: none
  risk: medium — the response shape of `POST /auth/widget-token` (field names for token and expiry, envelope) is defined in the API backlog, which is not in this repo; the developer must confirm it rather than guess (see open question 1).

TASK-2: Create the bridge class (`src/lib/state/WidgetBridge.ts`, SessionMonitor-style) that is inert unless `IS_MOBILE` and `window.SolytoWidgets` exist, parses native messages defensively (ignore non-JSON, unknown `type`, wrong field types), and exposes `ready()`, `clear()`, `notifyChanged()` (2 s debounced `refresh`), `issueToken()`, `destroy()`, with callbacks for `status`/`navigate`.
  files: src/lib/state/WidgetBridge.ts (new)
  depends: TASK-1
  risk: medium — it is the only file allowed to touch `SolytoWidgets`, so its surface must cover every later task without growing a second channel.

TASK-3: Implement widget-token issuing in the bridge: `POST` via the shared `auth.apiService` (`postWithStatus`), send `setToken { token, expiresAt, apiUrl: getApiUrl() }`, never store the token; on 404 persist a "no widgets" marker keyed by API URL + server version via `LocalStorageService` and skip until either changes; other failures are silent and retried on the next trigger.
  files: src/lib/state/WidgetBridge.ts, possibly src/lib/services/ApiService.ts (a read accessor for the stored server version, which is private today)
  depends: TASK-2
  risk: medium — the stored server version is only written by `checkServerVersion()` when `CLIENT_VERSION` is set and runs async from the root layout, so at the first trigger it can be null; the 404 key must handle "unknown version" deliberately (see open question 2).

TASK-4: Wire the bridge into `Auth`: construct it as a collaborator, send `clear` at the top of `logout()` (before `clear()`), issue a token after `login()`, `passkeyAuthenticate()` and a successful `performRefresh()`, and call its `destroy()` from `Auth.destroy()`.
  files: src/lib/state/Auth.svelte.ts
  depends: TASK-3
  risk: medium — `Auth` is the session core; issuing must be fire-and-forget so a widget failure can never fail a login/refresh, and `routes/admin/+layout.svelte` calls `setAuth()` a second time, creating a second Auth (and bridge) that could overwrite `SolytoWidgets.onmessage` (see open question 3).

TASK-5: Send `ready` once per app start after auth has loaded and the router is ready, and on `status { needsToken: true }` issue a token only when logged in.
  files: src/lib/state/Auth.svelte.ts (expose the `load()` promise, today discarded by `this.load().then()`), src/routes/+layout.svelte (call after `onMount`/first navigation)
  depends: TASK-4
  risk: medium — "auth loaded" is not observable today; exposing it touches the constructor and root layout ordering.

TASK-6: Add a single-todo URL: the todos page reads `?todo=<uuid>` after `todos.load()` and calls `todos.openEdit(id)`, also when already on `/todos` (query change without remount).
  files: src/lib/state/Todos.svelte.ts (next to `checkUrlForFilter`), src/routes/todos/+page.svelte, src/lib/config/urls.ts (if a helper for the URL is added)
  depends: none
  risk: medium — a same-route `goto` does not remount the page, so the param must also be handled on navigation; and a todo not present in `todos.todos` (e.g. not in the loaded list) leaves `editingTodo` null and silently opens nothing.

TASK-7: Handle `navigate` in the bridge: ignore when logged out; `todo` + valid UUID → `goto` the TASK-6 URL; `calendar` → `goto(resolve(urls.calendar))`; unknown keys or invalid/missing ids are ignored; must work when it arrives right after `status` on cold start.
  files: src/lib/state/WidgetBridge.ts (or the navigate callback set from src/routes/+layout.svelte, since `goto` lives in `$app/navigation`)
  depends: TASK-5, TASK-6
  risk: medium — a cold-start `navigate` can race the root layout's own login/setup redirect in `onMount`.

TASK-8: Call `this.auth.widgetBridge.notifyChanged()` after successful todo and calendar mutations in the two state classes.
  files: src/lib/state/Todos.svelte.ts (quickCreate, delete, changeCompleted and the other `change*`/tag/category updates, subtask add/update/mark/delete), src/lib/state/Calendars.svelte.ts (createEvent, updateEvent, deleteEvent, applyEventMove, updateOccurrence, deleteOccurrence, deleteCalendar, changeTodoCompleted)
  depends: TASK-4
  risk: low — one line per successful branch, but many methods; easy to miss one (exact set: see open question 4).

TASK-9: Vitest tests for the bridge and its Auth wiring: inert without `SolytoWidgets` and on web/desktop; malformed messages ignored; `status needsToken` issues when logged in only; refresh and login issue; 404 remembered and not retried until API URL/version change; other failures retried; `clear` sent before local state is cleared on logout; `refresh` debounced (fake timers); `navigate` valid todo/calendar, unknown key, bad UUID, logged out.
  files: tests/unit/widgets/WidgetBridge.test.ts (new), tests/unit/auth/Auth.test.ts (mock the bridge like SessionMonitor; add clear/issue assertions)
  depends: TASK-3, TASK-4, TASK-5, TASK-7, TASK-8
  risk: low — follows the existing mocking pattern in `tests/unit/auth/Auth.test.ts`; `IS_MOBILE` is a module constant, so tests need `vi.mock('$lib/config/platform')` per platform.

## Open questions (do not guess)

1. **Widget-token response shape.** The brief gives the endpoint but not the
   body. Which fields carry the token and its expiry (`token` /
   `expires_at`? inside `data`?). Needed for TASK-1/3; the developer should
   get it from the API backlog `widget-token` or the owner.
2. **404 memory without a known server version.** If no server version is
   stored yet (no `CLIENT_VERSION`, or `/health` not answered yet), should a
   404 be remembered per API URL alone, or not remembered at all?
3. **Second `Auth` in `routes/admin/+layout.svelte`.** It calls `setAuth()`
   again, so a second bridge would attach. Should the bridge skip attaching
   when one is already attached, or is admin irrelevant on mobile? Fixing
   the double `setAuth()` itself is out of scope.
4. **Which mutations send `refresh`.** The brief says todo and calendar
   create/update/delete/complete. Unclear whether category/workspace changes,
   calendar create/colour/order, and dashboard Quick Add commits
   (`QuickAdd.svelte.ts`, creates todos/events outside `Todos`/`Calendars`)
   should also refresh. TASK-8 lists the conservative set; Quick Add is
   excluded unless confirmed.
