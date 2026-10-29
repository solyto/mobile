# Decisions: Android home-screen widgets

date: 2026-10-29
builds on: `docs/reports/android-homescreen-widgets.md` (2026-10-15)
scope: architecture decisions for the widget foundation. No code was
changed. The first widget is "Your Day", but these decisions are meant to
carry many more widgets, including interactive ones (tap-to-complete,
start/stop timer).

## 1. Summary

The report recommended a "web app pushes a snapshot" design, because it
avoided both the token problem and backend changes. Two facts change that:
interactive widgets are a real long-term goal, and the backend can change.
The foundation is therefore:

| # | Decision | Replaces in the report |
|---|---|---|
| D1 | Native fetches widget data itself, with its **own scoped widget token** issued by the backend | §4 option 3.1 (snapshot push) and 3.2 (reuse the WebView token) |
| D2 | The **backend builds widget data** in one generic row format | snapshot building in `../app` (§4 3.1) |
| D3 | Native code is **Java + `AppWidgetProvider`/`RemoteViews`** | confirms §3.1; Glance rejected |
| D4 | Widgets **show details**; no privacy mode | §4 "Shoulder-surfing" / open question 6 |
| D5 | **No Capacitor upgrade** is needed for widgets | open question 8 |
| D6 | Widget taps open routes via a **navigation hook** in `../app`, with `loadUrl` as the cold-start fallback | §6 (`loadUrl` only) |

## 2. Decisions

### D1: native fetch with a scoped widget token

- After login, the web app requests a separate token (for example
  `POST /auth/widget-token`) and hands it to native through the bridge (D7).
- The token is accepted **only by widget endpoints** (D2) and can be revoked
  on its own. Ideally it appears in the user's session/device list.
- Native **never sees or refreshes the WebView's token**. This removes the
  refresh conflict from report §4 3.2, and with it open question 4 ("does
  `/auth/refresh` invalidate the old token?").
- At rest: an AES-GCM key in the **AndroidKeyStore** encrypts the token, and
  the ciphertext and IV go into private `SharedPreferences`. Exclude those
  prefs from backup (`fullBackupContent` ≤ API 30, `dataExtractionRules`
  API 31+). That is a manifest change, so flag it in review.
  `androidx.security:security-crypto` is deprecated; do not use it.
- Logout in the web app clears the native copy (D7) and revokes the token on
  the server.

**Why:** interactive widgets need server writes from outside the app.
Reusing the WebView token would put the main credential in two places and
make the two copies fight over refreshes. A scoped token limits what a leak
can do and keeps the WebView session independent.

### D2: the backend builds widget data

- One endpoint per widget, for example `GET /widgets/your-day`, returning
  data that is already filtered, in the user's timezone and in the user's
  language. The server already has the user's settings, and
  `calendars/events/widget` is a precedent.
- One **generic row format** shared by all widgets, roughly:

  ```
  {
    kind, schema_version, generated_at,
    labels: { ... },                       // pre-translated UI strings
    rows: [{ id, title, subtitle?, at?, until?, icon?, route, action? }]
  }
  ```

  - `at` / `until` are **raw timestamps**, not formatted strings. Native
    uses them to handle the midnight rollover ("today" vs "overdue")
    without a fetch.
  - `action` describes an optional interaction (D8).
  - `schema_version` lets native recognize a format it doesn't know yet.
- One native list renderer can then serve Your Day, upcoming events, newest
  notes, and so on. A new widget is mostly a backend endpoint plus a native
  layout, with no logic rewritten in Java.

**Why:** the API is meant to serve every kind of client. Building the data
on the server removes the main weakness of native fetching (business logic
duplicated in Java), and the WebView, the widgets and any future client all
read the same data.

**Note (optional, not part of this work):** the "today/overdue" logic then
exists both in `TodoFilterService` (TypeScript) and on the server. The
dashboard's `YourDay.svelte` could later read the same endpoint so that only
one implementation remains.

### D3: Java + `RemoteViews`

- The native code is written by AI, so less code per widget is not a deciding
  factor. What is left favours the platform API:
  - **No new build tooling.** Glance would bring Kotlin, the Compose compiler
    and Glance itself, whose versions must stay compatible with each other
    and with AGP. Each upgrade is a chance for build errors in a language the
    maintainer does not read.
  - **No abstraction layer.** `RemoteViews` is what the launcher actually
    renders, so a widget that looks wrong is debugged directly.
  - **No F-Droid risk** and no APK growth. Release builds run with
    `minifyEnabled false`, so the Kotlin/Compose runtime would not be
    stripped.
  - **One language** in `android/`, matching `MainActivity` and the plugins.
- The interaction plumbing (`PendingIntent` → receiver → background API call
  → widget update) is verbose. It is built **once** in the foundation and
  reused by every interactive widget.
- Allowed new dependencies, all Apache-2.0, from Google Maven, with no GMS:
  `androidx.core:core-remoteviews` (list widgets on minSdk 24) and
  `androidx.work:work-runtime` (D9). Networking uses the platform
  (`HttpURLConnection` + `org.json`), with no OkHttp/Retrofit.
- API levels: checkboxes (`setCompoundButtonChecked`) need API 31. On
  24–30, fall back to a tappable icon (report §3.1).

### D4: widgets show details

Placing a widget on the home screen is the user's own choice, and so is what
it shows. No "hide details" mode and no setup screen for now. A setup screen
can be added later when a widget needs per-widget options (such as "which
calendar").

### D5: no Capacitor upgrade for widgets

Nothing here depends on a Capacitor plugin. The bridge is our own (D7), and
widgets use platform APIs. A move to Capacitor 8 is a separate decision on its
own merits.

### D6: navigation hook for widget taps

- `../app` exposes a small `IS_MOBILE`-gated function, for example
  `window.solytoNavigate(path)`, that calls SvelteKit's `goto()`, the same
  client-side navigation an in-app link uses. Once the app is running, it
  also tells native that it is **ready** (D7).
- `MainActivity` handles widget intents in `onCreate` and `onNewIntent`:
  - **app ready** (warm start) → `evaluateJavascript` calls the hook: an
    instant switch, with app state kept;
  - **not ready** (cold start) → `loadUrl("https://my.solyto.app" + path)`,
    which the app has to boot for anyway.
- **Route allowlist:** `MainActivity` is `exported="true"`, so map a fixed
  set of route keys to paths and never navigate to a string taken directly
  from an intent extra (report §6). Widget `PendingIntent`s are explicit,
  `FLAG_IMMUTABLE`, and use a distinct request code or data URI per route.
- Moving share (`handleShareIntent`) to the hook is possible later but is out
  of scope.

**Why:** a full `loadUrl` throws away the running app on every tap (a blank
moment, a refetch, lost in-memory state). The report only proposed it first
because the shortcut widget needed no `../app` change. Your Day changes
`../app` anyway for the bridge.

## 3. Follow-on design choices (proposed defaults)

These follow from D1–D6. They are written down so the implementation does
not have to rediscover them; change them during implementation if needed.

### D7: the JS ↔ native bridge

- Mechanism: **`addJavascriptInterface`**, the pattern `PullToRefreshPlugin`
  already uses. It needs no `@capacitor/core` in `../app` and avoids the
  unverified `window.Capacitor.Plugins` assumption (report open question 9).
- Calls: `setWidgetToken(token, expiresAt, apiUrl)` after login,
  `clearWidgets()` on logout, `refreshWidgets()` after the user changes data
  that a widget shows (debounced in JS), and `ready()` for D6.
- The bridge only accepts data from JS. **Native never returns the token to
  JS.**
- In `../app`, all bridge calls go through one `IS_MOBILE`-gated module that
  checks whether the bridge object exists, so web and desktop are
  unaffected.

### D8: interactions

- Tap on a row action → explicit broadcast to a widget action receiver →
  WorkManager job calls the widget action endpoint (for example "complete
  todo X") → re-fetch → update the widget.
- Backend: action endpoints are accepted by the widget token, and only for
  the actions widgets offer.
- **Offline or failed:** show an error state on the widget and do not queue
  anything. A retry queue can come later if it is needed.

### D9: freshness

- A WorkManager periodic fetch every 30–60 minutes, **plus** a one-off update
  scheduled just after local midnight, **plus** `refreshWidgets()` from the
  app after changes. Set `updatePeriodMillis` to `0`.
- The widget shows when it was last updated, and tapping it opens the app.

### D10: widget token lifetime

- Proposed: a long-lived token (backend chooses the exact duration) that
  native **rotates itself** through a widget-token refresh endpoint. That
  rotation never touches the WebView token.
- If the token is rejected: the widget shows "Open solyto to sign in", and
  the web app issues a fresh widget token on its next start.

## 4. Work split for "Your Day"

1. **Backend:** issue, rotate and revoke the widget token (scoped), and
   `GET /widgets/your-day` in the row format (D2).
2. **`../app`:** bridge module (D7), hook plus ready signal (D6),
   widget-token request after login and app start, clear on logout. Then
   vendor it with `scripts/vendor.sh`.
3. **This repo (`android/`):** the bridge interface, Keystore token store plus
   backup rules, the fetch worker and midnight update, the Your Day list
   widget (`res/` layouts, `appwidget-provider` XML with preview,
   `values-night`, `values-de/fr/es` strings for picker text and empty and
   error states), and the widget intent handler with the route allowlist.
4. **Later:** action endpoints and tap-to-complete on the D8 plumbing, then
   more widgets on the same foundation.

Steps 1 and 2 are in other repos, and each is better written as its own job
brief.

## 5. Still open

- The backend's concrete token design: lifetime, rotation endpoint, whether
  the token shows in the session list, and which actions it may call.
- Whether to also ship static app shortcuts (`shortcuts.xml`) next to the
  widgets (report open question 7). They are cheap and can use the same route
  allowlist.
- Testing: manual checks per report §7.6. Android test tooling in CI remains a
  separate decision.
