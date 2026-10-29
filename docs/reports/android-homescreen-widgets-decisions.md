# Decisions: Android home-screen widgets

date: 2026-10-29 (revised the same day, see §1)
read: true
builds on: `docs/reports/android-homescreen-widgets.md` (2026-10-15)
scope: architecture decisions for the widget foundation. No code was
changed. The first widget is "Your Day", but these decisions are meant to
carry many more widgets, including interactive ones (tap-to-complete,
start/stop timer). The goal is a solid foundation: no choice here should
need revisiting when the next widget or the next interaction arrives.

## 1. Summary

The report recommended a "web app pushes a snapshot" design, because it
avoided both the token problem and backend changes. Two facts change that:
interactive widgets are a real goal, and the backend can change.

A second pass checked the first version of this document against the code
in `api/`, `app/` and `android/` and with tap-to-complete in scope from the
start. It changed D1, D2, D6, D7, D8 and D9, dropped D10 (token rotation) and
added D11–D13.

| # | Decision |
|---|---|
| D1 | Native fetches widget data with its **own widget token**, bound to the session token that issued it and only valid on widget routes |
| D2 | The **backend builds widget data** in one generic, display-ready section/row format |
| D3 | Native code is **Java + `AppWidgetProvider`/`RemoteViews`**; Glance rejected |
| D4 | Widgets **show details**; no privacy mode |
| D5 | **No Capacitor upgrade** is needed for widgets |
| D6 | Widget taps open routes through the bridge (D7); route keys are mapped to paths in `../app` |
| D7 | The JS ↔ native bridge uses **`addWebMessageListener`**, restricted to the app's origin |
| D8 | **Tap-to-complete is part of the foundation**: generic action plumbing, first used by Your Day |
| D9 | Freshness: periodic fetch, server-given `refresh_at`, refresh after changes in the app |
| D10 | *(dropped: token lifetime and rotation now follow from D1)* |
| D11 | One fixed **error contract** between widget routes and native |
| D12 | **Self-hosted and outdated servers** are handled explicitly |
| D13 | **Prerequisite:** logout in `../app` revokes the token on the server |

## 2. Findings that shaped the revision

These were checked in the code on 2026-10-29.

- **Logout never revokes the token on the server.** `Auth.logout()`
  (`app/src/lib/state/Auth.svelte.ts`) only clears localStorage, and no code
  calls `POST /auth/logout`. A logged-out token stays valid until it expires
  (up to 90 days), on every platform. See D13.
- **`addJavascriptInterface` is visible to every frame**, third-party ones
  included. The app embeds a Deezer iframe (`DeezerSneakPreview.svelte`).
  See D7.
- **Sanctum abilities are not checked anywhere.** Every protected route is
  behind plain `auth:sanctum` (`api/routes/api.php`), which accepts any valid
  token. A token with only a `widget` ability would still reach every
  endpoint. See D1.
- **The app refreshes its token by itself**: on start, once the token is
  within 14 days of expiry on native (`shouldRefresh`). The refresh deletes
  the old token (`AuthService::refreshToken`). See D1.
- **Mobile users can set their own API URL** (`getCustomApiUrl`), so the
  server may be older than the app. See D12.
- **Todo due dates are dates, not timestamps** (`Todo::$casts`,
  `due_at => date`), and so are all-day events. See D2.
- **Completing a recurring todo creates the next occurrence**
  (`TodoService::update`). See D8.

## 3. Decisions

### D1: a widget token bound to its session

- **Issuing:** `POST /auth/widget-token`, called by the web app with its
  normal token. It creates a Sanctum token named `widget-token` with the
  ability `widget` and returns it with its expiry. The route must **not** be
  named `widgets.*` (see the gate below).
- **Bound to the parent:** a new nullable column `parent_token_id` on
  `personal_access_tokens`, a foreign key to the issuing token with
  `ON DELETE CASCADE`, and a **unique** index. Issuing replaces any existing
  widget token of the same parent in one transaction. So:
  - there is at most one widget token per session, enforced by the database;
  - whatever ends a session (logout, revoking it in the session list,
    `logout-all`, a password change, account deletion, a token refresh)
    deletes its widget token too, with no extra code paths;
  - a lost phone is handled by revoking that phone's session, which the user
    would do anyway.
- **Lifetime:** the widget token's `expires_at` is the parent's. A widget
  token can never outlive its session. There is no separate rotation
  endpoint: every app token refresh deletes the old widget token (cascade),
  and the app issues a new one right after (D7). The widget secret therefore
  rotates with the session.
- **Scope: one central gate, deny by default.** In
  `Sanctum::authenticateAccessTokensUsing`, a token without the `*` ability
  is valid only on routes named `widgets.*`. Routes added later anywhere are
  closed to widget tokens automatically. Normal tokens (`*`) may call widget
  routes too.
- **Session list:** `GET /auth/tokens` does not list widget tokens. They
  belong to their session, and revoking the session covers them. The app's
  session UI does not change.
- **At rest on the device:** an AES-GCM key in the **AndroidKeyStore**
  encrypts the token. The ciphertext, IV, expiry and API URL go into private
  `SharedPreferences`, excluded from backup (`fullBackupContent` ≤ API 30,
  `dataExtractionRules` API 31+). That is a manifest change, so flag it in
  review. `androidx.security:security-crypto` is deprecated; do not use it.
- Native **never sees the WebView's token**, and never returns the widget
  token to JS.

**Why:** interactive widgets need server writes from outside the app. A
separate token keeps the main credential in one place. Binding it to the
session makes revocation impossible to forget or skip, without new revoke
endpoints or client-side bookkeeping.

### D2: the backend builds display-ready widget data

- One endpoint per widget. The first is `GET /widgets/your-day`, used only
  by the widget for now. The app's own dashboard Your Day does not change.
- Your Day content, in this order: **today's events**, **due and overdue
  todos**, **upcoming events** (the 3-day range `listWidgetEvents` already
  uses). The "scored todos" part of the dashboard stays out: its scoring
  only exists in TypeScript.
- One **generic format** shared by all widgets:

  ```
  {
    kind, schema_version, generated_at,
    refresh_at,                         // when this data goes stale (next local midnight)
    labels: { ... },                    // pre-translated UI strings (title, empty state, ...)
    sections: [{
      key, title?,
      rows: [{
        id, title, subtitle?, time_label?,  // display-ready text
        at?, until?, all_day,               // raw values: ISO timestamps, or dates when all_day
        icon?,                              // key from a fixed icon set, never a URL
        route: { key, id? },                // mapped to a path by ../app (D6)
        action?: { type, key, checked? }    // D8
      }]
    }]
  }
  ```

  - The server knows the user's timezone, language, 12/24-hour and date
    format, so it produces the text. Native only renders it and cannot end
    up inconsistent with the app.
  - Raw values stay for ordering and future use. Dates are never sent as
    UTC timestamps.
  - `refresh_at` tells native when to fetch again, so native needs no
    timezone logic.
  - **Versioning:** additive changes keep `schema_version`. Native ignores
    fields, section types and action types it does not know. A higher
    major version than native supports shows "update the app".
  - The server caps rows per section; the job sets the number.
- A new widget is mostly a backend endpoint plus a native layout, with no
  logic rewritten in Java.

**Why:** the API serves every kind of client. Building the data on the
server keeps business logic out of Java, and the WebView, the widgets and
any future client can read the same data.

**Note (optional, not part of this work):** the "today/overdue" logic then
exists both in `TodoFilterService` (TypeScript) and on the server. The
dashboard's `YourDay.svelte` could later read the same endpoint.

### D3: Java + `RemoteViews`

- The native code is written by AI, so less code per widget is not a deciding
  factor. What is left favours the platform API:
  - **No new build tooling.** Glance would bring Kotlin, the Compose compiler
    and Glance itself, whose versions must stay compatible with each other
    and with AGP.
  - **No abstraction layer.** `RemoteViews` is what the launcher renders.
  - **No F-Droid risk** and no APK growth (release builds run with
    `minifyEnabled false`).
  - **One language** in `android/`, matching `MainActivity` and the plugins.
- Allowed new dependencies, all Apache-2.0, from Google Maven, with no GMS:
  `androidx.core:core-remoteviews` (list widgets on minSdk 24) and
  `androidx.work:work-runtime` (D9). `androidx.webkit` is already present
  (D7). Networking uses the platform (`HttpURLConnection` + `org.json`), with
  no OkHttp/Retrofit.
- **Intents:** row clicks in collection widgets need a **mutable** template
  `PendingIntent` (with an explicit component) for the per-row fill-in
  intents; Android requires this on API 31+. All other widget
  `PendingIntent`s are explicit and `FLAG_IMMUTABLE`, with a distinct request
  code or data URI each. Receivers treat fill-in extras as untrusted and
  validate the key and id format.
- API levels: checkboxes (`setCompoundButtonChecked`) need API 31. On
  24–30, fall back to a tappable icon (report §3.1).

### D4: widgets show details

Placing a widget on the home screen is the user's own choice, and so is what
it shows. No "hide details" mode and no setup screen for now. A setup screen
can be added later when a widget needs per-widget options.

### D5: no Capacitor upgrade for widgets

Nothing here depends on a Capacitor plugin. The bridge is our own (D7), and
widgets use platform APIs.

### D6: widget taps open routes through the bridge

- Rows carry `route: { key, id? }`, for example `{ key: "todo", id: "…" }`.
  **`../app` owns the mapping** from keys to paths and validates the id
  format. Native keeps no list of paths.
- `MainActivity` handles widget intents in `onCreate` and `onNewIntent` and
  only checks the key's format:
  - **app ready** (warm start): native sends `navigate { key, id? }` over the
    bridge, and the app calls SvelteKit's `goto()`. An instant switch, with
    app state kept.
  - **not ready** (cold start): native keeps the pending route and sends it
    when the app reports `ready`.
- The app ignores unknown keys and invalid ids. If the user is not logged
  in, the normal login redirect applies.
- `MainActivity` is `exported="true"`, so any app can send it an intent. The
  worst a forged intent can do is open a known page.
- Moving share (`handleShareIntent`) to the bridge is possible later but is
  out of scope.

**Why:** a full `loadUrl` throws away the running app on every tap. One
channel for everything avoids a global JS function and building JS strings
for `evaluateJavascript`.

### D7: the JS ↔ native bridge

- Mechanism: **`WebViewCompat.addWebMessageListener`** with the allowed
  origin `https://my.solyto.app`. Only that origin's frames get the object,
  each message carries its source origin and whether it came from the main
  frame (native accepts main-frame messages only), and native can reply on
  the same channel. If the WebView lacks the feature, widgets show "not
  supported on this device" and the app carries on.
- Messages from the app:
  - `ready`: the app is running. Native replies `{ needsToken }` (true when
    it has no token or the stored one has expired) and delivers a pending
    route (D6).
  - `setToken { token, expiresAt, apiUrl }`
  - `clear`: logout. Native deletes the token and cached widget data and
    shows the signed-out state.
  - `refresh`: data a widget shows has changed (debounced in JS).
  - `unsupported`: the app's server has no widget routes (D12). Native drops
    any token and cached data and shows "server doesn't support widgets".
- Messages from native: `navigate { key, id? }`.
- When the app requests a widget token: after `ready` when native replies
  `needsToken`, after login, and **after every successful token refresh**
  (D1).
- Logout order: `clear` first, then `POST /auth/logout` (D13).
- In `../app`, all bridge use goes through one `IS_MOBILE`-gated module that
  checks whether the bridge object exists, so web and desktop are
  unaffected.

### D8: interactions (part of the foundation)

- A row action is `{ type, key, checked? }`. Native knows only the UI
  **types** (`check` for now). The **key** names the server action, for
  example `todo.complete`. Native validates the key format and posts to
  `POST /widgets/actions/{key}/{id}`.
- Backend: an **explicit route per action key**, never a generic
  dispatcher. Each checks ownership the same way the normal endpoints do
  and goes through the same service (for todos `TodoService::update`, so
  recurrence keeps working).
- Actions are **idempotent**: completing an already completed todo succeeds
  and changes nothing. There is no "uncomplete" from the widget.
- Native flow: tap → explicit, non-exported receiver → the widget shows the
  new state at once → WorkManager job calls the action → re-fetch all placed
  widgets. On failure it reverts and shows an error state. Nothing is queued
  offline; a retry queue can come later if needed.
- A new action is then mostly backend work, as long as its UI type exists.

### D9: freshness

- WorkManager periodic fetch every 60 minutes, **plus** a one-off fetch at
  the server's `refresh_at`, **plus** `refresh` from the app after changes.
  `updatePeriodMillis` is `0`.
- Work is scheduled in `onEnabled` and cancelled in `onDisabled`: no
  background work while no widget is placed.
- **The token never goes into WorkManager input data** (stored unencrypted
  in WorkManager's database). Workers read it from the token store.
- The last payload is cached for rendering, excluded from backup, and
  deleted on `clear`.
- The widget shows when it was last updated, and tapping its header opens
  the app.

### D10: dropped

The first version proposed a long-lived token that native rotates itself.
D1 replaces it: the widget token lives exactly as long as its session and
rotates with every app token refresh.

### D11: error contract

| Response | Native does |
|---|---|
| 401 | Delete the local token, show "Open solyto to sign in". The next `ready` asks for a new token. |
| 404 on a widget route | Show "Your server doesn't support widgets yet" (D12). |
| 404 on an action | The item is gone: re-fetch. |
| 426 | Show "Please update the app" (`RecordClientVersion`). |
| 429 / 5xx / offline | Keep the last data, mark it as outdated, back off. |

- Native sends `X-Client-Version` on every request, so the existing
  minimum-version check covers widgets too.
- The backend gets a `widgets` rate limiter per token and throttles
  `POST /auth/widget-token`, so a stuck worker cannot flood the server.

### D12: self-hosted and outdated servers

- The app treats a 404 from `POST /auth/widget-token` as "this server
  doesn't support widgets" and does not retry on every start. It sends
  `unsupported` to native, on the 404 and whenever it skips the request for
  that reason: without a token, native never fetches and could not find out
  itself (it would show "sign in" instead).
- Native uses exactly the API URL the app hands over in `setToken`, under
  the same network security rules as the WebView.

### D13: prerequisite — logout revokes the token on the server

`Auth.logout()` in `../app` calls `POST /auth/logout` before clearing local
state. If the call fails (offline), local state is cleared anyway. This
fixes an existing gap on every platform and is what makes D1's cascade take
effect on logout. It is its own job and comes first.

## 4. Jobs

| # | Repo | Job | Needs |
|---|---|---|---|
| 1 | `../app` | Logout revokes the token on the server (D13) | — |
| 2 | `../api` | Widget token: issuing, parent binding with cascade, central gate, hidden from the session list (D1) | — |
| 3 | `../api` | `GET /widgets/your-day`, `todo.complete` action, rate limits, translations (D2, D8, D11) | 2 |
| 4 | `../app` | Widget bridge module, token requests after `ready`/login/refresh, `clear` on logout, `refresh` after todo/event changes, `navigate` handling, old-server tolerance (D6, D7, D12) | 1, 2 |
| 5 | this repo | Vendor `../app`; widget foundation and read-only Your Day: message listener, Keystore token store and backup rules, workers, list widget (`res/` layouts, `appwidget-provider` XML with preview, `values-night`, `values-de/fr/es/it` strings for picker text and states), intent handling, error states (D3, D6, D7, D9, D11) | 3, 4 |
| 6 | this repo | Tap-to-complete on Your Day on the D8 plumbing | 5 |

1 and 2 can run in parallel, then 3 and 4, then 5, then 6. Each job gets its
own backlog entry in its repo.

## 5. Still open

- Whether to also ship static app shortcuts (`shortcuts.xml`) next to the
  widgets (report open question 7). They are cheap and can use the same
  route keys.
- Testing: manual checks per report §7.6. Android test tooling in CI remains
  a separate decision.
- Not part of this work: no `sanctum:prune-expired` is scheduled, so expired
  tokens are never deleted. Worth its own `../api` backlog entry.

## 6. Time tracking widget (2026-10-29)

The second widget, from the dev request "Home widgets and NFC activation"
(NFC and Samsung Routines are out of scope).

- **Content:** the running timer (project, live elapsed time, stop button)
  and up to 20 projects, most recently used first, each with a start button.
  The running project is not repeated in the list.
- **Starting while another timer runs switches** to the new project in one
  tap (the server stops the old timer and starts the new one in one locked
  transaction). Starting the running project is a no-op. Stopping a stopped
  timer is a no-op. The app's own `POST /time-tracking/entries/start` keeps
  answering 409 while a timer runs.
- **No descriptions** from the widget: widgets have no text input.
- **Format additions**, backwards compatible (`schema_version` stays 1):
  row `live: "elapsed"` (the widget counts up from `at` with a
  `Chronometer`, without fetching), row `color` (`#RRGGBB`), action type
  `button` with `icon` (`play` | `stop`), row icon `timer`. `refresh_at` is
  optional.
- **Route keys:** `time_tracking`, `time_tracking_project` + project UUID.
- **Foundation gap found:** job 5 tied the native code to Your Day (one
  cache, a hardcoded fetch path, Your Day classes referenced throughout).
  It is made generic first, without visible change.

| # | Repo | Job | Needs |
|---|---|---|---|
| 7 | `../api` | `widget-time-tracking`: endpoint, start/stop actions | — |
| 8 | `../app` | `widget-refresh-on-time-tracking-changes`: refresh after time tracking changes, route keys | — |
| 9 | this repo | `android-widget-foundation-multiple-kinds` | — |
| 10 | this repo | `android-widget-time-tracking` (vendor `../app` with job 8 first, by hand) | 7, 8, 9 |

## 7. Check-in widget (2026-10-29)

- **Content:** today's check-in, one row per enabled tracker in the app's
  order (8 by default, up to 12; the list scrolls). Each row shows its
  tappable values; the selected one is highlighted.
- **Tapping** a value saves it for today; tapping the selected value clears
  it, as in the app. The widget always sends the explicit target value
  (or `null`), never a toggle, so retries are safe.
- **Sports** is a choice of sport (1 gym … 6 yoga), not a rating: the user's
  5 selected sports, plus today's stored sport if it is no longer selected.
- **Resets at local midnight** via `refresh_at`.
- **Format additions**, backwards compatible: action type `scale`
  (`value`, `options` with `value`, `icon`, `color`); actions may carry a
  JSON body `{ "value" }`; new action status 422 (invalid value). Option
  colors come from the server; native has no color logic. Row ids may
  contain `_`.
- **Not now:** choosing trackers per widget (it would need the first setup
  screen, D4), fill-level icons, other days than today.

| # | Repo | Job | Needs |
|---|---|---|---|
| 11 | `../api` | `widget-check-in`: endpoint, set-value action | — |
| 12 | `../app` | `widget-refresh-on-check-in-changes`: refresh after check-ins and settings, route key | — |
| 13 | this repo | `android-widget-check-in` (vendor `../app` with job 12 first, by hand) | 11, 12 |
