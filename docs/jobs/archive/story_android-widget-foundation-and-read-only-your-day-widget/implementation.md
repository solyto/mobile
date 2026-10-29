# Implementation: Android widget foundation and read-only "Your Day" widget

id: story
developer: @developer
date: 2026-10-29

## Summary

Native widget foundation plus the read-only Your Day list widget, built
against the contract in `brief.md`. It covers:

- the `SolytoWidgets` bridge (`addWebMessageListener`, app origin only, main
  frame only)
- a Keystore-encrypted token store and a widget data cache, both excluded
  from backup
- an `HttpURLConnection` API client and a WorkManager fetch worker that
  applies the D11 error contract
- the `RemoteViews` list widget with light/dark colours, a preview and
  strings in en/de/fr/es/it
- row-tap routing through `MainActivity` → bridge `navigate`

`frontend/src/lib/state/WidgetBridge.ts` exists and matches the contract, so
`frontend/` was not edited.

**Not built:** the container has no JDK and no Android SDK, so
`./gradlew assembleDebug` could not run. All the code is unverified by a
compiler. I checked library APIs against the actual AARs (core-remoteviews
1.1.0, work-runtime 2.11.2, webkit 1.14.0). The first step of review should
be a local build.

## Changes

TASK-1: `android/variables.gradle` and `android/app/build.gradle` add
`androidx.core:core-remoteviews:1.1.0` (minCompileSdk 34) and
`androidx.work:work-runtime:2.11.2` (minCompileSdk 35, AGP ≥ 8.6). Both are
fine with compileSdk 36 / AGP 8.13. `fdroid/app.solyto.yml` and
`scripts/build-fdroid.sh` need no change: both artifacts come from Google
Maven (allowed by F-Droid) and nothing touches the Node/frontend build.

TASK-2: `widget/WidgetTokenStore.java` holds an AES-256-GCM key in
AndroidKeyStore (`solyto_widget_token`). It writes the ciphertext, IV, expiry
and API URL to the private prefs `widget_token`. Expiry and URL are bound in
as GCM associated data. Any Keystore or decrypt failure clears the store and
counts as "no token", with no plaintext fallback. The token is never logged:
only exception class names are. `widget/IsoTime.java` parses ISO 8601 on API
24 (java.time needs 26). `apiUrl` must be http(s) with a host and no
query/fragment/userinfo; trailing slashes are stripped.

TASK-3: `widget/WidgetCache.java` uses the prefs `widget_cache` to hold the
last `data` JSON, the fetch time, an outdated flag, the state
(LOADING/OK/SIGNED_OUT/UNSUPPORTED_SERVER/UPDATE_APP) and a
"device unsupported" flag. The plugin rewrites that flag on every app start,
so a WebView update clears it.

TASK-4: adds `res/xml/backup_rules.xml` (≤ API 30) and
`res/xml/data_extraction_rules.xml` (API 31+, cloud backup and device
transfer). They exclude `widget_token.xml`, `widget_cache.xml` and
`androidx.core.widget.prefs.RemoteViewsCompat.xml` (core-remoteviews keeps
row content there on API < 31). **Manifest change:** `fullBackupContent` and
`dataExtractionRules` on `<application>`.

TASK-5: `widget/WidgetApi.java` calls `GET {apiUrl}/api/v1/widgets/your-day`
with Bearer, `Accept` and `X-Client-Version` (the `versionName` from
PackageManager, the same value as the app's `PUBLIC_VERSION`). It uses
15 s timeouts and a 1 MB body limit, and doesn't follow redirects so the
token can't leak to another host. It maps responses to OK / 401 / 404 / 426 /
temporary failure (429, 5xx, 3xx, other statuses, I/O, bad envelope).

TASK-6: `widget/YourDayPayload.java` checks `kind: your-day` and schema
version 1, and flattens sections into header and row items. It skips unknown
section keys and rows without a title, drops unknown icons, ignores `action`,
caps at 20 rows per section and cuts text to 500 chars.

TASK-7: `widget/WidgetFetchWorker.java` and `widget/WidgetWork.java` handle
fetching and scheduling.
- Unique work: a 60-minute periodic fetch (KEEP), "now" (REPLACE) and "at
  refresh_at + 1 min" (REPLACE). Backoff is exponential from 5 minutes, with
  at most 3 retries, after which the periodic fetch takes over.
- No input data is passed; the worker reads the token from the store.
- With no widget placed, `fetchNow` is a no-op. With no token, the worker
  shows signed-out and schedules nothing.
- If the token changed during the request (logout or a new token), the
  result is dropped. A 401 clears the token only if it is still the one used.

TASK-8: adds the layouts `widget_your_day`, `_row`, `_section` and
`_preview`, the drawables `ic_widget_event`/`ic_widget_todo` (Lucide-style),
`widget_background`, `widget_placeholder_bar` and `widget_preview`, and
`res/xml/your_day_widget_info.xml`. The widget info is 180×110 dp min,
resizable to 110×80 dp, 3×3 target cells, `updatePeriodMillis="0"`, with a
description, `previewImage` and `previewLayout`. Widget colours are in
`values/colors.xml`, built on the existing solyto colours, with dark
overrides in the new `values-night/colors.xml`.

TASK-9: widget strings in `values`, plus new `values-de/fr/es/it`. The
wording matches the web app's informal tone (du/tu/tú), and the title
matches the app's `your_day` translations. Needs a native-speaker check.

TASK-10: `widget/YourDayWidgetProvider.java` renders from the cache with
`RemoteCollectionItems`. The device-unsupported state takes priority, then
the cache state. Payload with no rows shows `labels.empty`; an unreadable
payload shows "update the app". "Updated HH:MM" turns into "Outdated · HH:MM"
on stale data.
- The header and the state text use an explicit `FLAG_IMMUTABLE`
  PendingIntent (request code 1) that opens `MainActivity`.
- Rows use an explicit mutable template (request code 2, action
  `app.solyto.action.WIDGET_ROUTE`) with per-row fill-in extras.
- `onEnabled` schedules the periodic fetch, `onDisabled` cancels all work,
  and `onUpdate` renders and enqueues a fetch.
- **Manifest change:** `<receiver .widget.YourDayWidgetProvider exported="false">`
  with the appwidget meta-data.

TASK-11: `WidgetBridgePlugin.java` is registered in `MainActivity` before
`super.onCreate`, like `PullToRefreshPlugin`.
- It calls `addWebMessageListener("SolytoWidgets", {getLocalUrl()})` only
  when `WEB_MESSAGE_LISTENER` is supported; otherwise it registers nothing
  and sets the not-supported state.
- It accepts only main-frame string messages ≤ 16 KB that parse as JSON with
  a known type.
- It keeps the reply proxy from `ready` and drops it on `onPageStarted`
  (reload, share `loadUrl`).
- Token and cache work runs on a single-thread executor; replies go out on
  the main thread.
- The token is never posted back.

TASK-12: `MainActivity` handles `ACTION_WIDGET_ROUTE` in `onCreate` (only on
a fresh start, not on recreation) and `onNewIntent`.
- It ignores launches from history and consumes the extras.
- It validates the key (`[a-z][a-z0-9_.-]*`, ≤ 64) and the id (1–128 chars).
- It hands the route to the plugin, which sends `navigate` now or keeps it
  until `ready`.
- Share and launcher intents are unaffected.

## Flag for review

- **Two manifest changes:** the backup rules attributes (TASK-4) and the
  widget receiver (TASK-10).
- New dependencies (TASK-1), approved by the brief §11.
- No changes to `fdroid/`, signing, `versionCode`/`versionName`, or
  `frontend/`.

## Known issues / follow-ups

- **Build not run** (no JDK/SDK in the container). Run
  `make build-fdroid && cd android && ./gradlew assembleDebug` first.
- **Manual checks (brief §12, none done yet):**
  - place, resize and remove the widget
  - light and dark mode
  - API 24 and API 34+ emulators
  - login → data appears
  - logout → signed-out state
  - app token refresh → widget keeps working
  - tap a todo row and an event row, both on warm and cold start
  - airplane mode
  - server URL of an old self-hosted server
  - reboot
- If the very first fetch fails (offline before any data was cached), the
  widget stays on "Loading…" until a later fetch succeeds. There is no
  separate "offline" string in the brief's state list.
- `previewImage` is a drawn layer-list placeholder, not a screenshot. On
  API 31+ the `previewLayout` is used instead. A real screenshot asset could
  replace it later.
- Small race: a `clear` that arrives exactly between the worker's token
  re-check and its cache write could leave one payload in the cache until
  the next fetch, which then clears it (no token → signed out).
