# Verdict: Android widget foundation and read-only "Your Day" widget

id: story
reviewer: @reviewer
date: 2026-10-29

Reviewed `git diff main...HEAD` on
`feature/story_android-widget-foundation-and-read-only-your-day-widget`.
Every changed file is accounted for in `implementation.md`. There are no edits
to `frontend/`, `fdroid/`, `scripts/`, `patch/`, signing, or
`versionCode`/`versionName`. `frontend/src/lib/state/WidgetBridge.ts` exists.
Its message shapes (`ready`/`setToken{token,expiresAt,apiUrl}`/`clear`/`refresh`
and `status{needsToken}`/`navigate{key,id?}` as JSON strings) match the native
side.

## Review

TASK-1: PASS
notes: `variables.gradle` adds `androidxCoreRemoteViewsVersion = '1.1.0'` and `androidxWorkVersion = '2.11.2'`, and `app/build.gradle` adds the two `implementation` lines. Nothing else in the Gradle files changed. `fdroid/app.solyto.yml` is untouched, which is correct: both artifacts come from Google Maven and contain no GMS.

TASK-2: PASS
notes: `WidgetTokenStore` uses an AES-256-GCM AndroidKeyStore key. Expiry and URL are bound as AAD. Every Keystore or decrypt failure clears the store and returns null (fail closed, no plaintext fallback). Logs contain only exception class names. `save` rejects tokens that are expired or unparseable and URLs that are not http(s) or carry userinfo, a query or a fragment. It also strips trailing slashes.

TASK-3: PASS
notes: `WidgetCache` uses its own prefs file `widget_cache`. `clear` removes the payload, fetch time and outdated flag and sets SIGNED_OUT. The device-unsupported flag is rewritten on every plugin load.

TASK-4: PASS
notes: `backup_rules.xml` and `data_extraction_rules.xml` (cloud-backup and device-transfer) exclude `widget_token.xml`, `widget_cache.xml` and `RemoteViewsCompat` prefs. The file names match `PREFS`. **Manifest change:** `fullBackupContent` and `dataExtractionRules` on `<application>`. A human should review it, as the brief requires.

TASK-5: PASS
notes: The client builds `apiUrl + "/api/v1/widgets/your-day"` and sends Bearer, `Accept` and `X-Client-Version` (`versionName` from PackageManager). It sets timeouts, a 1 MB body cap and no redirect following. Status mapping: 401, 404 and 426 get their own outcomes; everything else (including 429/5xx/IO/a bad envelope) is a temporary failure. Neither the token nor the body is logged.

TASK-6: PASS
notes: The parser checks `kind`. `schema_version > 1` returns null, and `isNewerSchema` lets the worker map that to UPDATE_APP. Unknown section keys are skipped, rows without a title are skipped, unknown icons are dropped, and `action` is ignored. It caps at 20 rows per section. `opt*` accessors mean it does not throw.

TASK-7: PASS
notes: There is no input `Data`; the worker reads the token from the store. The D11 mapping is correct, and a 401 uses `clearIfCurrent`. The result is dropped if the token changed during the request. With no token, the worker shows signed-out and schedules nothing. Unique work: periodic 60 min (KEEP), now (REPLACE), refresh_at + 1 min (REPLACE). Temporary failures use exponential backoff from 5 min, up to 3 retries. Keeping the periodic work pending also avoids the known WorkManager component-toggle → `onUpdate` loop.

TASK-8: PASS
notes: The layouts use only RemoteViews-safe views (LinearLayout, FrameLayout, ListView, TextView, ImageView). The widget info sets `updatePeriodMillis="0"`, is resizable, and has `previewImage` (layer-list placeholder), `previewLayout` and `description`. Colours build on the existing `solyto_*` resources and are overridden in `values-night`.

TASK-9: PASS
notes: All picker and state strings are present in `values` and `values-de/fr/es/it`. A native speaker still needs to check the translations; that is not a code issue.

TASK-10: PASS
notes: The provider renders every state. Device-unsupported takes precedence. `labels.empty` is shown when there are no rows. "Updated" switches to "Outdated" on stale data. The header and the message use an explicit `FLAG_IMMUTABLE` intent (request code 1). The row template is explicit, with `FLAG_MUTABLE` on 31+ and implicitly mutable below, request code 2, and per-row fill-in extras. `onEnabled` schedules work, `onDisabled` cancels it, and `onUpdate` renders and fetches. **Manifest change:** the receiver (`exported="false"`, the documented pattern for app widgets).

TASK-11: PASS
notes: The listener is registered in `load()` with the origin set `{getLocalUrl()}`, only when `WEB_MESSAGE_LISTENER` is supported; otherwise the device-unsupported state is recorded. It accepts only main-frame string messages ≤ 16 KB with a known type. On `ready` it keeps the proxy, flushes the pending route and replies with `status`. `setToken`, `clear` and `refresh` match the contract. The proxy is dropped on `onPageStarted`. Storage work runs on a single-thread executor, and replies go out on the main thread with a stale-proxy check. The token is never posted back.

TASK-12: PASS
notes: `handleWidgetIntent` runs in `onCreate` (fresh start only) and `onNewIntent`. It uses a dedicated action and extra namespace, skips launches from history, consumes the extras, validates the key against `[a-z][a-z0-9_.-]*` (≤ 64) and the id (1–128), and hands off to `WidgetBridgePlugin.openRoute`, which sends now or keeps the route pending until `ready`. Share and launcher intents are unaffected.

TASK-13: PARTIAL
notes: `implementation.md` says honestly that the Gradle build could not run (no JDK/SDK in the container; this review session cannot build either). It lists the §12 manual checks as not done and flags both manifest changes. I statically cross-checked the APIs used (RemoteViewsCompat, WorkManager, webkit `WebMessageListener`/`WebMessageCompat.getType`, Capacitor `WebViewListener.onPageStarted`, which is already used by `PullToRefreshPlugin`) and found no compile problems, but that does not replace a build.

## Security

The `@security` agent did not run. Reviewer notes:
- The token stays native: it is Keystore-encrypted, never in WorkManager data, never logged, never posted to JS, never sent across redirects, and excluded from backups.
- The bridge only accepts messages from the app's own origin and the main frame.
- The exported `MainActivity` validates route extras, so a forged intent can at most open a known page.

## Overall

APPROVED

No code changes are required. Before merging, a human with an Android toolchain must:
- run `make build-fdroid && cd android && ./gradlew assembleDebug`. The code has never been compiled.
- carry out the brief §12 manual checks, none of which have been done.
- review the two manifest changes (backup rules attributes and the widget receiver).
