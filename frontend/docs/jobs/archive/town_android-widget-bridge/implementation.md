# Implementation: Android widget bridge

id: town
developer: developer
date: 2026-10-29

## Summary

All `window.SolytoWidgets` traffic lives in one class, `src/lib/state/WidgetBridge.ts`. `Auth` owns it as a collaborator, the same way it owns `SessionMonitor`. It does nothing unless `IS_MOBILE`, `browser` and `window.SolytoWidgets` are all present. It sends `ready`, `setToken`, `clear` and `refresh` (debounced by 2 s). It handles `status` and `navigate` and ignores malformed messages. The `?todo=<uuid>` query parameter on `/todos` now opens a single todo.

## Changes

TASK-1: Added `apiRoutes.auth.widgetToken` and `WidgetTokenResponse` (`types/auth.ts`). Added `SolytoWidgetsBridge` and the app→native and native→app message unions (`types/platform.ts`). Declared `Window.SolytoWidgets` in `src/app.d.ts`.

TASK-2/3: New `WidgetBridge` with `start()`, `issueToken()`, `clear()`, `notifyChanged()` and `destroy()`. Native messages must be JSON strings, and every field is type-checked. `issueToken()` calls `POST /auth/widget-token` through the shared `ApiService` and sends `setToken { token, expiresAt: token_expires_at, apiUrl: getApiUrl() }`. It never stores the token. On a 404 it stores `{ apiUrl, version }` under `widget_token_unsupported` and skips until either changes. Any other failure (non-2xx, 429/`RateLimitedError`, network) is swallowed, so the next trigger tries again. `ApiService.storedServerVersion()` was made public so the bridge can read the version.

TASK-4: `Auth` constructs the bridge. `logout()` calls `widgetBridge.clear()` before the local state is cleared. This covers every logout path, because `signOut`, session expiry, password change and account deletion all end in `logout()`. `login()`, `passkeyAuthenticate()` and a successful `performRefresh()` call `void widgetBridge.issueToken()`, which is fire-and-forget and can never fail the auth flow. `Auth.destroy()` destroys the bridge.

TASK-5: `Auth` exposes `loaded`, the `load()` promise that was previously thrown away. In `onMount`, after the login/setup redirect, the root layout calls `auth.loaded.finally(() => auth.widgetBridge.start())`. That sends `ready` once and attaches `onmessage`. `status { needsToken: true }` issues a token only when logged in.

TASK-6: Added `Todos.openFromUrl()`, which reads `?todo=`, checks it is a UUID and calls `openEdit(id)`. `routes/todos/+page.svelte` calls it from `afterNavigate`, so it also runs on a same-route query change. `TodoEditModal` renders as soon as the todo is in the loaded list.

TASK-7: `navigate` in the bridge does nothing when logged out. `todo` + UUID goes to `goto('/todos?todo=<id>')` and `calendar` goes to `goto(resolve(urls.calendar))`. Everything else is ignored. The todo `goto` has an eslint disable comment because `resolve()` cannot take a query string (STANDARDS decisions).

TASK-8: `this.auth.widgetBridge.notifyChanged()` is called after each successful todo mutation in `Todos`: quickCreate, delete, every `change*`, tag and category assignment, and the subtask methods. In `Calendars` it is called after createEvent, updateEvent, deleteEvent, updateOccurrence and deleteOccurrence (moves go through these), deleteCalendar and changeTodoCompleted. The store test mock `auth` got a `widgetBridge` stub.

TASK-9: Added `tests/unit/widgets/WidgetBridge.test.ts` with 19 tests:
- the bridge is inert without the object and on web/desktop;
- `ready` is sent once, and destroy detaches;
- malformed messages are ignored;
- `status` issues a token only when it is needed and the user is logged in;
- the `setToken` payload is correct;
- a 404 is remembered, and retried only after the version or API URL changes;
- other failures are retried;
- `clear` drops a pending refresh;
- refresh is debounced;
- `navigate` covers todo, calendar, unknown keys, bad or missing ids, and logged out.

`Auth.test.ts` mocks the bridge. It checks that a token is issued after password login, passkey login and a successful refresh, and not after failures. It checks that `clear` comes before local storage is cleared on logout, and that destroy tears the bridge down. `Todos`/`Calendars` store tests cover `openFromUrl` and the refresh notification.

Checks: `npm run check` has 0 errors and `npm run lint` is clean. `npm test` has 1291 passing and 3 failing; the 3 failures were already there (see below). To run them I restored `node_modules` from the lockfile with `npm ci --ignore-scripts`. No dependency was added or changed.

## Decisions on the analyst's open questions

1. Response shape: taken from the brief (`data.token`, `data.token_expires_at`).
2. 404 with no known server version: the marker is stored with `version: null`. Once the server version becomes known, the key no longer matches, so the endpoint is tried once more. After that the new key is remembered.
3. The second `Auth` in `routes/admin/+layout.svelte`: only the root layout calls `widgetBridge.start()`, so the admin `Auth` never attaches `onmessage`. Its `clear`/`setToken` posts would be correct and harmless.
4. Refresh set: the conservative set from TASK-8. Dashboard Quick Add (`QuickAdd.svelte.ts`), category/workspace changes and calendar create/colour/order do not send `refresh`.

## Known issues / follow-ups

- Three tests in `tests/unit/auth/Auth.test.ts` were already failing before this job: `login` success, `login` failure and `logout`. They mock `api.post`, but `Auth.login()` uses `postRaw`. They were not touched.
- `?todo=<id>` opens nothing if that todo is not in the list `GET /todos` returns.
- Quick Add on the dashboard creates todos and events without notifying the widgets (open question 4). This needs a decision if widgets should update from there.
