# Verdict: Android widget bridge

id: town
reviewer: reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD`. Every source change is accounted for in implementation.md. `npm run check`: 0 errors. `npm run lint`: clean. `npm test`: 1291 passed, 3 failed. The 3 failures (`Auth.test.ts` login success, login failure, logout) also fail on `main`: those tests mock `api.post`, but `login()` uses `postRaw`. This branch did not touch them.

TASK-1: PASS
notes: `apiRoutes.auth.widgetToken`, `WidgetTokenResponse` (`token`, `token_type`, `token_expires_at`) and `Window.SolytoWidgets` all match the confirmed response in the brief.

TASK-2: PASS
notes: `src/lib/state/WidgetBridge.ts` is the only file that touches `SolytoWidgets`. It is inert unless `IS_MOBILE`, `browser` and `window.SolytoWidgets` are all present. `parse()` ignores anything that is not a JSON string, unknown types, and fields of the wrong type. It has a SessionMonitor-style `destroy()`.

TASK-3: PASS
notes: It calls `postWithStatus` and sends `setToken { token, expiresAt: token_expires_at, apiUrl: getApiUrl() }`. The token is never stored. A 404 is stored with the API URL and server version and skipped until either changes. A 429 (`RateLimitedError`), network errors and other non-2xx responses are swallowed and retried on the next trigger. Making `ApiService.storedServerVersion()` public is the read accessor the task allowed for.

TASK-4: PASS
notes: `logout()` calls `widgetBridge.clear()` before `clear()`. All the logout paths (signOut, expireSession, password flows, account deletion) end in `logout()`. `issueToken()` is fire-and-forget after login, passkey login and a successful `performRefresh` only. `destroy()` is wired.

TASK-5: PASS
notes: `auth.loaded` exposes the `load()` promise. The root layout starts the bridge after its login/setup redirect and once auth has loaded, which sends `ready` once. `status needsToken` issues a token only when logged in.

TASK-6: PASS
notes: `Todos.openFromUrl()` checks the UUID and calls `openEdit`. It runs from `afterNavigate`, so a same-route query change also opens the todo.

TASK-7: PASS
notes: `todo` with a UUID navigates to `/todos?todo=<id>`, and `calendar` navigates to `resolve(urls.calendar)`. Unknown keys and bad or missing ids are ignored, and nothing happens when logged out. The eslint disable comment follows STANDARDS (decisions, `no-navigation-without-resolve`).

TASK-8: PASS
notes: `notifyChanged()` runs after every successful todo mutation in `Todos` and every listed mutation in `Calendars`. Excluding Quick Add follows the conservative answer to open question 4 and is noted in implementation.md as a follow-up.

TASK-9: PASS
notes: `tests/unit/widgets/WidgetBridge.test.ts` has 19 tests and covers every case listed in the brief. `Auth.test.ts` mocks the bridge and checks issuing, the order of `clear` relative to clearing local state, and destroy. All new tests pass.

## Security

The widget token is never stored or logged. It goes only to `postMessage` on the native-injected bridge, which native restricts to the `https://my.solyto.app` origin. No findings.

## Overall

APPROVED

Nothing must change before merge.
