# Brief: Android widget bridge

type: feature
id: town
branch: feature/town_android-widget-bridge
date: 2026-10-29
author: Leander Muskalla

## What

Connect the app to the Android home-screen widgets: hand native a widget
token, tell it when to clear or refresh, and open the route a widget tap
asks for. Mobile only (`IS_MOBILE`); web and desktop are unaffected.

This is job 4 of 6 in `solyto/mobile`
`docs/reports/android-homescreen-widgets-decisions.md` (D6, D7, D12). Read
that document first. It depends on [[logout-revokes-server-token]] and on the
API's `POST /auth/widget-token` (api backlog `widget-token`).

## Why

The widget's native code fetches its own data with a restricted widget
token, which only the logged-in app can request. The app also knows when data
changed and owns its routes, so widget taps are routed through it.

## The contract with native (must match the mobile job exactly)

Native injects `window.SolytoWidgets` with `WebViewCompat.addWebMessageListener`,
for the origin `https://my.solyto.app` only. Messages are JSON strings sent
with `SolytoWidgets.postMessage(...)`; native messages arrive on
`SolytoWidgets.onmessage` (`event.data`).

App → native:

| Message | When |
|---|---|
| `{ "type": "ready" }` | Once per app start, after auth has loaded and the router is ready |
| `{ "type": "setToken", "token", "expiresAt", "apiUrl" }` | After a widget token was issued |
| `{ "type": "clear" }` | On any logout, before local auth state is cleared |
| `{ "type": "refresh" }` | After todo or calendar data changed (debounced) |

Native → app:

| Message | Meaning |
|---|---|
| `{ "type": "status", "needsToken": bool }` | Reply to `ready` |
| `{ "type": "navigate", "key", "id"? }` | A widget tap; may come right after `status` (cold start) or any time later |

## Steps

1. **One module** for all widget bridge code, `IS_MOBILE`-gated, that does
   nothing when `window.SolytoWidgets` is missing (older app builds, web,
   desktop, WebViews without the feature). No other file talks to
   `SolytoWidgets` directly. Ignore malformed messages.
2. **Issuing a widget token** (`apiRoutes.auth.widgetToken` =
   `/auth/widget-token`), then `setToken` with the token, its expiry and
   `getApiUrl()`. Issue:
   - when native replies `needsToken: true` and the user is logged in;
   - after every login (password, passkey, any path that sets a new token);
   - after every successful token refresh (`performRefresh`): the refresh
     deletes the old token on the server, and the old widget token with it.
3. **Old servers** (D12): a 404 from `/auth/widget-token` means the server
   has no widgets. Remember that per API URL and server version (like the
   stored server version in `ApiService`) and do not retry until either
   changes. Other failures: try again on the next trigger, without bothering
   the user.
4. **Logout:** send `clear` from the local logout path (`Auth.logout()`), so
   every way of ending the session clears the widgets: user logout, session
   expiry, account deletion, password flows.
5. **Refresh:** send `refresh` after successful todo and calendar mutations
   (create, update, delete, complete), debounced (for example 2 s), from the
   existing state classes (`Todos.svelte.ts`, `Calendars.svelte.ts`).
6. **Navigate:** map route keys to in-app navigation with `goto()`:
   - `todo` + id: open that todo, the same way opening it from the todo
     list does. Validate the id as a UUID. If the app has no URL that opens
     a single todo, add one (for example a query parameter the todos page
     reads) rather than falling back to the list.
   - `calendar`: the calendar page.
   Unknown keys and invalid ids are ignored. When logged out, do nothing (the
   normal login redirect applies).
7. **Tests** (vitest): the module is inert without the bridge object and on
   web/desktop; `status` with `needsToken` triggers issuing; a refresh
   triggers issuing; a 404 is remembered and not retried; `clear` is sent on
   logout; `refresh` is debounced; `navigate` with valid/unknown keys and a
   bad id.

## Out of scope

- The dashboard's own Your Day (it does not change).
- The native side (`solyto/mobile`, jobs 5 and 6). Vendoring into mobile
  happens in job 5.
- Moving the share intent to the bridge.

## Notes

- Native never sends the widget token back to JS; the app never stores it.
- The message types and route keys above are the cross-repo contract. Changing
  them needs the mobile job and the API format (`route.key`) changed too.

### `POST /auth/widget-token` response (confirmed, implemented in solyto/api)

Request: `POST {apiUrl}/auth/widget-token` with the normal Bearer token, empty body.

Success: **201**, standard `ApiResponse` envelope, same shape as login/refresh:

    {
      "success": true,
      "message": "…",
      "data": {
        "token": "<plain text token>",
        "token_type": "Bearer",
        "token_expires_at": "<ISO 8601>"
      },
      "timestamp": "…"
    }

Use `data.token` and `data.token_expires_at`, and send
`setToken { token, expiresAt: token_expires_at, apiUrl: getApiUrl() }`.

Other responses:
- **404**: the server has no widgets (old self-hosted server). Remember it per
  API URL and server version, and don't retry (step 3).
- **429**: throttled. Try again on the next trigger.
- Any other non-2xx: transient. Try again on the next trigger.

Tests mock this response; no running API is needed.