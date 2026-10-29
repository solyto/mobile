# Tasks: Android widget foundation and read-only "Your Day" widget

id: story
analyst: @analyst
date: 2026-10-29

## Context checked

- Branch matches `brief.md` (`feature/story_android-widget-foundation-and-read-only-your-day-widget`).
- `frontend/src/lib/state/WidgetBridge.ts` exists. It matches the contract in
  the brief: it posts JSON strings with `SolytoWidgets.postMessage`, reads
  `event.data` (string) in `onmessage`, and sends `apiUrl` from `getApiUrl()`
  (bare URL; the app appends `/api/v1` itself in `apiRoutes.ts`). No
  `frontend/` edits are needed.
- The app sends `X-Client-Version` as `PUBLIC_VERSION`, which is the root
  `package.json` version, the same value `build-fdroid.sh` writes as
  `versionName`. Native should send `versionName`. Read it from
  `PackageManager` (or enable `buildConfig`); do not hand-edit
  `versionName`/`versionCode`.
- Existing pattern: `PullToRefreshPlugin` is registered in
  `MainActivity.onCreate` before `super.onCreate`, and its `load()` runs
  before the first page load. `androidx.webkit` 1.14.0 is already a
  dependency.
- Only `res/values` exists today (no `values-night`, `values-de/fr/es/it`).
  Colours available: `solyto_bg_light`, `solyto_bg_dark`,
  `solyto_surface_dark`, `solyto_lightblue`, `solyto_green`.
- `res/xml/` only has `file_paths.xml`. The manifest has
  `allowBackup="true"` and no backup rules yet.
- There is no Android unit-test setup beyond the Capacitor sample test.
  Verification here is a `./gradlew assembleDebug` build plus the manual
  checks in step 12.

## Task breakdown

TASK-1: Add `androidx.core:core-remoteviews` and `androidx.work:work-runtime` with versions in `variables.gradle` and `implementation` lines in `app/build.gradle`, and confirm `fdroid/app.solyto.yml` needs no change.
  files: android/variables.gradle, android/app/build.gradle
  depends: none
  risk: medium. The work-runtime version must build with compileSdk 36, AGP and the existing `androidx.core` 1.17.0. Do not touch the `signingConfigs` block or `versionCode`/`versionName`. The new dependencies need approval, which the brief gives (§11).

TASK-2: Create the token store `WidgetTokenStore`: AES-GCM key in AndroidKeyStore, with ciphertext, IV, expiry and apiUrl in private SharedPreferences. Provide `save`, `readToken`, `apiUrl`, `needsToken` (missing or expired) and `clear`. The store never logs the token. A broken or missing key counts as "no token".
  files: android/app/src/main/java/app/solyto/widget/WidgetTokenStore.java (new; package choice is up to the developer)
  depends: none
  risk: high. This handles a credential. Keystore errors (key invalidated, API 24 quirks) must fail closed to `needsToken=true`, never crash, and never fall back to plaintext.

TASK-3: Create the widget data cache: store the last successful payload JSON plus the fetch time, an "outdated" flag and the current state (loading / signed-out / unsupported-server / update-app / not-supported-device / ok) in a separate private SharedPreferences file that `clear` wipes.
  files: android/app/src/main/java/app/solyto/widget/WidgetCache.java (new)
  depends: none
  risk: low. Plain prefs storage. Use a separate prefs file name so the backup rules can name it.

TASK-4: Exclude the token prefs and the cache prefs from backup with `res/xml/backup_rules.xml` (`fullBackupContent`, API ≤ 30) and `res/xml/data_extraction_rules.xml` (API 31+, cloud backup and device transfer), wired into the `<application>` tag.
  files: android/app/src/main/res/xml/backup_rules.xml (new), android/app/src/main/res/xml/data_extraction_rules.xml (new), android/app/src/main/AndroidManifest.xml
  depends: TASK-2, TASK-3 (prefs file names)
  risk: medium. Manifest change; flag it in review (brief §4). Exclusions must use the exact `<name>.xml` prefs file names, or the token gets backed up silently.

TASK-5: Create the API client `WidgetApi`: `GET {apiUrl}/api/v1/widgets/your-day` with `HttpURLConnection` and the headers `Authorization: Bearer`, `Accept: application/json` and `X-Client-Version: <versionName>`, plus timeouts. Parse the envelope with `org.json` and map the result to 200-data / 401 / 404 / 426 / 429 / 5xx / network-error. Never log the token or response bodies.
  files: android/app/src/main/java/app/solyto/widget/WidgetApi.java (new)
  depends: TASK-2
  risk: medium. A trailing-slash or path mistake on `apiUrl` breaks self-hosted servers. Cleartext `http://` custom URLs follow the app's existing network security config. Nothing new may be added for them.

TASK-6: Create the payload model/parser for `kind: your-day`, `schema_version` 1. Read `labels`, `sections` (keys `today`, `due`, `upcoming`) and rows (`title`, `subtitle`, `time_label`, `icon` ∈ {event, todo}, `route{key,id}`). Skip unknown sections, rows, icons and fields, ignore `action`, and report `schema_version > 1` as "update the app".
  files: android/app/src/main/java/app/solyto/widget/YourDayPayload.java (new)
  depends: none
  risk: low. Pure parsing. Malformed rows must be skipped and never throw out of the parser.

TASK-7: Create `WidgetFetchWorker` (WorkManager). It reads the token from the store and calls `WidgetApi`. It then applies the D11 table:
  - 200: cache the payload and schedule a one-off fetch at `refresh_at`.
  - 401: clear the token and set the signed-out state.
  - 404: set the unsupported-server state.
  - 426: set the update-app state.
  - 429/5xx/offline: keep the data, mark it outdated and return `Result.retry()` with exponential backoff.
  After every outcome it triggers a widget re-render. Add a small scheduler helper for the unique periodic work (60 min), the unique one-off "now" work and the one-off at `refresh_at`. The token is never put into input `Data`.
  files: android/app/src/main/java/app/solyto/widget/WidgetFetchWorker.java (new), android/app/src/main/java/app/solyto/widget/WidgetWork.java (new; scheduling helper)
  depends: TASK-1, TASK-2, TASK-3, TASK-5, TASK-6
  risk: medium. Unique-work names and ExistingWorkPolicy decide whether fetches pile up or get dropped. Without a token, the worker must not schedule anything that loops.

TASK-8: Create the widget resources:
  - widget layout (header with title, "updated at" and outdated marker; ListView/collection; empty and state text)
  - row layouts (section header; item with icon, title, subtitle and time_label)
  - `event` and `todo` vector icons
  - `res/xml/your_day_widget_info.xml` (`updatePeriodMillis="0"`, resizable, sensible min/default sizes, `previewImage` and, on API 31+, `previewLayout`, `description`)
  - light and dark colours in `values` / `values-night`, based on the existing colour resources
  files: android/app/src/main/res/layout/widget_your_day*.xml (new), android/app/src/main/res/drawable/ic_widget_*.xml (new), android/app/src/main/res/xml/your_day_widget_info.xml (new), android/app/src/main/res/values/colors.xml, android/app/src/main/res/values-night/colors.xml (new)
  depends: none
  risk: medium. RemoteViews only supports a limited set of views and attributes, so an unsupported one breaks the widget at runtime, not at build time. `previewImage` needs a drawable; if no real screenshot exists, use a drawable preview and say so.

TASK-9: Add strings in `values` and `values-de`, `values-fr`, `values-es` and `values-it`: widget picker name and description, loading, "Open solyto to sign in", "Your server doesn't support widgets yet", "Please update the app", "Not supported on this device", outdated marker and the "updated at" format.
  files: android/app/src/main/res/values/strings.xml, android/app/src/main/res/values-{de,fr,es,it}/strings.xml (new)
  depends: none
  risk: low. Translations need a native-speaker check. The new locale folders contain only the widget strings, so `app_name` etc. fall back to the defaults.

TASK-10: Create `YourDayWidgetProvider` (`AppWidgetProvider`). It:
  - renders each state from the cache (ok list via `RemoteCollectionItems` from core-remoteviews, empty with `labels.empty`, loading, signed-out, unsupported-server, update-app, not-supported-device, with an outdated marker on stale data);
  - in `onEnabled`, schedules periodic work and a one-off fetch; in `onDisabled`, cancels all widget work;
  - on add/update, enqueues a one-off fetch;
  - has an explicit `FLAG_IMMUTABLE` header PendingIntent that opens `MainActivity`;
  - has a mutable explicit row template PendingIntent with per-row fill-in intents carrying `route.key` / `route.id`, with distinct request codes.
  Register the provider as a receiver in the manifest.
  files: android/app/src/main/java/app/solyto/widget/YourDayWidgetProvider.java (new), android/app/src/main/AndroidManifest.xml
  depends: TASK-1, TASK-3, TASK-6, TASK-7, TASK-8, TASK-9
  risk: high. This is the largest piece. Mutable vs immutable PendingIntent rules on API 31+, `RemoteCollectionItems` behaviour on API 24 vs 31+, and stable row IDs are easy to get wrong. Second manifest change; flag it.

TASK-11: Create `WidgetBridgePlugin` (Capacitor plugin, registered in `MainActivity` before `super.onCreate`, like `PullToRefreshPlugin`). In `load()`, when `WebViewFeature.WEB_MESSAGE_LISTENER` is supported, it calls `WebViewCompat.addWebMessageListener(webView, "SolytoWidgets", {getBridge().getLocalUrl()}, …)`. If the feature is not supported, it registers nothing and records the not-supported state. It:
  - accepts only `isMainFrame` messages that parse as JSON with a known `type`, and ignores anything malformed;
  - on `ready`, keeps the `JsReplyProxy`, replies `{type:"status", needsToken}` and flushes the pending route;
  - on `setToken`, validates and stores the token and enqueues a fetch;
  - on `clear`, wipes the token and cache and re-renders the widgets as signed out;
  - on `refresh`, enqueues a fetch;
  - exposes a method to send `navigate` or keep it pending;
  - never posts the token back.
  files: android/app/src/main/java/app/solyto/WidgetBridgePlugin.java (new), android/app/src/main/java/app/solyto/MainActivity.java
  depends: TASK-2, TASK-3, TASK-7, TASK-10 (for re-render on clear)
  risk: high. Trust boundary. The origin rule must be exactly the local URL, `postMessage` must run on the right thread, and the reply proxy must be dropped or replaced when the page reloads (pull-to-refresh, share `loadUrl`).

TASK-12: Handle widget row intents in `MainActivity` (`onCreate` + `onNewIntent`, next to `handleShareIntent`). Read the fill-in `key`/`id`, validate the key against `[a-z][a-z0-9_.-]*` (bounded length) and the id length, ignore anything else, and pass the route to `WidgetBridgePlugin`. The plugin sends `navigate` now if the app is ready, or keeps it until `ready`. Native keeps no path list.
  files: android/app/src/main/java/app/solyto/MainActivity.java, android/app/src/main/java/app/solyto/WidgetBridgePlugin.java
  depends: TASK-10, TASK-11
  risk: medium. `MainActivity` is exported and `singleTask`, so forged intents and warm vs cold start both have to work. Use a dedicated action or extra namespace so share and launcher intents are not affected.

TASK-13: Build check and handoff notes. Run `cd android && ./gradlew assembleDebug` (after `make build-fdroid` or `npx cap sync android` if needed). Confirm that `fdroid/app.solyto.yml` and `scripts/build-fdroid.sh` need no change. List the manual checks from brief §12 in `implementation.md` as not yet done, and flag both manifest changes.
  files: docs/jobs/story_android-widget-foundation-and-read-only-your-day-widget/implementation.md
  depends: TASK-1 through TASK-12
  risk: medium. The Gradle build may need network access for the new artifacts. If it can't run in the session, say so rather than claiming it passed. Emulator checks (API 24 and API 34+, reboot, airplane mode) can't be done in the container.

## Open points (not blocking; the developer should decide and document them)

- Widget preview: no design asset exists. A `previewLayout` (API 31+) plus a
  simple drawable `previewImage` is the conservative choice.
- Back-off for 429: the brief says "back off" without numbers. WorkManager's
  exponential backoff on the one-off fetch, with the 60-minute periodic fetch
  as the floor, needs no new constants from the API side.
- Whether the "not supported on this device" state persists depends on the
  WebView, which can be updated. Re-check it on every app start and do not
  store it permanently.
