# Implementation: 09 Session monitor and ApiService follow-ups

id: relative
developer: @developer
date: 2026-10-13

## Summary

Finished the follow-ups from 2df74d2. The session monitor is now its own class (`SessionMonitor`) with a `destroy()`. `Auth` has a `destroy()` and a session-expired event. The root layout reacts to that event instead of watching `loggedIn` in an `$effect`. `ApiService` rebuilds retry headers through its own header builders, with no cast. `postWithStatus` is typed as an ok/failed union, so the refresh unwrap needs no optional chain. The three `Calendars` DELETEs and `ExportSettings` now go through the shared `auth.apiService`, as do the seven components that used to build their own `ApiService`. Tests were written before each implementation step. `npm test` (806 tests), `npm run check` and `npm run lint` all pass.

## Changes

TASK-1: `tests/unit/services/ApiService.test.ts`: new tests pin the retry headers after a 401 recovery for JSON-body, bodyless and auth-only (FormData) requests, plus the "recovery leaves no token" case for JSON and bodyless requests.

TASK-2: `src/lib/services/ApiService.ts`: `fetchWithRecovery(endpoint, init, buildHeaders)` takes `init` without headers plus a header builder. It calls the builder for the first request and again for the retry. The `init.headers as Record<string, string>` cast is gone, and all 14 call sites pass the builder they used before. Removed the narrating comments on `setUnauthorizedHandler` and `fetchWithRecovery`, keeping the "network errors propagate" why-line and the `AUTH_ENDPOINTS` note.

TASK-3: `postWithStatus` now returns `{ ok: true; data: PostResponse } | { ok: false; data: null }`, which makes `Auth.performRefresh` read `res.data.data` after the `!res.ok` early return. The existing refresh tests already described the `{ data: { data: LoginResponse } }` envelope correctly.

TASK-4: `tests/unit/auth/SessionMonitor.test.ts` (new): covers listener registration, the interval while visible, no interval while hidden, stop on hide, check + restart on show, check on `online`, `destroy()` removing everything, and calling `destroy()` twice. It uses fake timers, `EventTarget` stubs for `document`/`window` and a mocked `$app/environment`.

TASK-5: `src/lib/state/SessionMonitor.ts` (new, plain class next to `Auth`, as open question 3 proposed): it takes a check callback, checks `browser` in its constructor, and collects its cleanups like `Viewpoint`. `Auth` constructs it with `() => this.validateSession()`. The handler fields, the interval methods and `SESSION_CHECK_INTERVAL_MS` were removed from `Auth`.

TASK-6: Added `Auth.destroy()`, which calls `sessionMonitor.destroy()`. The root `+layout.svelte` calls `auth.destroy()` in `onDestroy`. In `Auth.test.ts`, `SessionMonitor` is mocked, and tests check that the monitor's check validates the session and that `destroy()` tears the monitor down.

TASK-7: Added `Auth.setSessionExpiredHandler(fn)` and a private `expireSession()` (logout, then the handler). It replaces `logout()` only in the two rejected branches (`performRecovery`, `validateSession`). Tests: the handler fires once on a rejected 401 recovery and once on a rejected resume check. It does not fire on a transient failure, an offline rejection or an explicit `logout()`.

TASK-8: `src/routes/+layout.svelte`: removed `wasLoggedIn`, its comment and the `$effect` (along with the `if (!browser)` guard). `handleSessionExpired` now does what the effect used to do: it skips auth/setup routes, shows the `session_expired` notification, and redirects to setup or login based on `featureConfig.firstStartupOptions`. It is registered via `auth.setSessionExpiredHandler`. One intentional difference: an explicit user `logout()` no longer triggers the "session expired" toast and redirect.

TASK-9: `ExportSettings.svelte` uses `auth.apiService`. `downloadExport` now uses `apiService.image(apiRoutes.export.download…)`, and a `null` result is the failure path. Added an `image()` URL/headers test in `ApiService.test.ts`.

TASK-10: `Calendars.svelte.ts`: `deleteOccurrence`, `revokeShare` and `unsubscribeFromCalendar` now use `this.apiService.delete` and follow the `deleteEvent` pattern. Reload behaviour is unchanged: `deleteOccurrence` still reloads events, `unsubscribeFromCalendar` still reloads calendars, and `revokeShare` still does no reload. Tests in `tests/unit/stores/Calendars.test.ts` check URL/id and reload-on-success only.

TASK-11: Replaced `new ApiService(auth.getToken())` with `auth.apiService` and removed the `ApiService` import in `ManageNotificationTypes`, `ManagePushNotifications`, `ManageBotNotifications`, `TelegramBotConnection`, `Inspiration`, `ShareCalendarModal` and `Recommender`.

TASK-12: Removed the narrating comments in `Auth.svelte.ts`: the `RefreshOutcome` union note, the constructor note, the `clear()` note, `Single-flight`, the 5xx note, the lettered ladder, both JSDoc blocks and the inline outcome notes. Also removed the `postWithStatus` comment in `ApiService.ts`. The ladder is now three named calls: `adoptExternalSession()`, `refreshOrTransient()` (a rejected refresh request maps to `'transient'`, as before) and `expireSession()`. One why-line remains in the `validateSession` catch ("Offline is transient and must never log out; the `online` event re-checks."). It states a constraint, and it also keeps the catch block non-empty for `no-empty`. The reviewer may want it reworded or dropped.

Final checks: `grep -rn "new ApiService(" src` only finds `Auth`. `fetch(` only appears in `ApiService`, `service-worker.ts`, `routes/setup/+page.svelte` and `ManageWeatherCity.svelte`. The comment grep over the four files only finds the two 10.1 keepers, the `validateSession` catch line above and the existing Tailwind safelist comment in the layout.

## Known issues / follow-ups

- `ManageWeatherCity.svelte` is untouched because it is blocked by open question 1 (a third-party Nominatim call). The owner has to choose between options (a), (b) and (c).
- `ExportSettings` download: the `Accept` header changes from `application/zip` to `application/json` (open question 2). If the backend cares, a dedicated `ApiService` download method is needed, and the `image()` name for a zip blob stays a naming wart.
- Small behaviour change in `ApiService` that can't happen in practice: if recovery returned `true` but left no token, an auth-only (FormData) retry now sends `Bearer null` (what `getAuthHeaderOnly()` already does) instead of dropping the header. Recovery only returns `true` after setting a token, so this can't occur today, and it isn't pinned by a test.
- `node_modules` was missing from the workspace. I ran `npm ci` (lockfile-pinned, no changes to `package.json` or `package-lock.json`) so the test, check and lint gates could run.
- `.mcp.json` was already modified in the worktree before this session (session tooling config). I left it uncommitted on purpose.
- After merge: tick off the matching entries in `docs/STANDARDS_BACKLOG.md` and leave the `ManageWeatherCity` part open. Not done here, since tasks.md schedules it after the merge.
- Out of scope, as noted in tasks.md: `Recommender.svelte` still builds a URL with a template string (15.3), and `viewPoint.destroy()` is never called from the layout.
