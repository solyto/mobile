# Report: Android home-screen widgets for solyto

date: 2026-10-15
read: true
job: opinion_audit-android-homescreen-widgets
scope: audit only. No code, Gradle, manifest, `patch/`, `frontend/` or
`fdroid/` changes were made for this report.

## 1. Summary / verdict

**Feasible: yes.** Nothing in the current setup blocks home-screen widgets.
The cheapest path also needs no new dependencies, no Kotlin and no change to
the F-Droid recipe.

**Recommended approach (for the maintainer to confirm):**

- **Technology:** classic `AppWidgetProvider` + `RemoteViews`, written in
  **Java**, the same language as `MainActivity`. Jetpack Glance would be a
  nicer API, but it brings in Kotlin, the Compose compiler and the Compose
  runtime only for widgets. None of the community Capacitor widget plugins
  is a good fit (see §3.3).
- **Data:** the **web app pushes a ready-to-render snapshot** to native
  storage through a small custom bridge (option 3.1 in §4). The widget does
  not make network calls and never sees the auth token. The cost is that the
  data is only as fresh as the last time the app was open.
- **Phasing:** ship a **static shortcut widget** first. It needs no data and
  no `../app` changes. Then add one **read-only "Your Day" data widget**
  (today/overdue todos and today's events) based on the snapshot. Only build
  interactive widgets (tap-to-complete, start/stop timer) after a separate
  decision on moving the token to native (option 3.2).

The hard part is not the widget UI. It is **where the widget gets its data**.
The bearer token and API URL live in WebView `localStorage`, and native code
cannot read that directly (§4).

## 2. Current state (TASK-1)

All of this comes from the files in this repo as of today.

| Area | Current state | Source |
|---|---|---|
| Language | Java only. There is no Kotlin plugin and no `.kt` file. Java source/target level is 21. | `android/app/build.gradle`, `android/app/capacitor.build.gradle` |
| AGP / Gradle | AGP `8.13.0`, Gradle wrapper `8.14.3` | `android/build.gradle`, `android/gradle/wrapper/gradle-wrapper.properties` |
| SDK levels | `minSdk 24`, `compileSdk 36`, `targetSdk 36` | `android/variables.gradle` |
| AndroidX deps (app module) | `appcompat 1.7.1`, `coordinatorlayout 1.3.0`, `core-splashscreen 1.2.0`, `swiperefreshlayout 1.1.0`. `androidxCoreVersion 1.17.0` is defined in variables but only comes in transitively. | `android/app/build.gradle`, `android/variables.gradle` |
| Repositories | `google()`, `mavenCentral()` | `android/build.gradle` |
| Capacitor | `@capacitor/android`, `/cli`, `/core` `^7.6.8` (root `package.json`). Capacitor **8** is current upstream (`@capacitor/core` 8.5.3 on npm, 2026-10-14). | `package.json`, npm registry |
| Capacitor npm plugins | **None.** `capacitor.build.gradle` has an empty dependency block, and `capacitor.settings.gradle` only includes `:capacitor-android`. | `android/app/capacitor.build.gradle`, `android/capacitor.settings.gradle` |
| Custom native plugin | `PullToRefreshPlugin`, registered in `MainActivity.onCreate` via `registerPlugin(...)`. It talks to the page through **`WebView.addJavascriptInterface`** plus an injected script, not through Capacitor's `@PluginMethod` JS API. | `android/app/src/main/java/app/solyto/PullToRefreshPlugin.java` |
| JS ↔ Capacitor | The vendored frontend does **not** depend on `@capacitor/core`. Its only touchpoint is `window.Capacitor?.isNativePlatform?.()` in `routes/share/+page.svelte`, the runtime global that the native bridge injects. | `frontend/package.json`, `frontend/src/routes/share/+page.svelte` |
| Manifest | One activity, `.MainActivity`, `launchMode="singleTask"`, `exported="true"`. Intent filters: MAIN/LAUNCHER, `SEND text/plain`, and `VIEW` on scheme `@string/custom_url_scheme` (= `app.solyto`). Also one `FileProvider`. **No receivers, services or jobs.** Only permission: `INTERNET`. `allowBackup="true"`, with no backup rules. | `android/app/src/main/AndroidManifest.xml`, `res/values/strings.xml` |
| Intent handling | `onCreate` and `onNewIntent` both call `handleShareIntent`. For `ACTION_SEND text/plain` it calls `webView.loadUrl("https://my.solyto.app/share?q=" + encoded)`. The `VIEW app.solyto://…` filter has **no Java handler**, and `@capacitor/app` (which would emit `appUrlOpen`) is not installed. | `MainActivity.java` |
| WebView origin | `androidScheme https`, `hostname my.solyto.app`, `webDir frontend/build` | `capacitor.config.json` |
| Theming resources | `colors.xml`: `solyto_bg_light #FFFFFF`, `solyto_bg_dark #121212`, `solyto_surface_dark #222222`, `solyto_lightblue #14A5CD`, `solyto_green #61D96A`. There is no `values-night/` folder; dark mode is handled in code (`uiMode` checks). | `res/values/colors.xml`, `MainActivity.java` |
| Native strings | `res/values/strings.xml` only (app name, scheme). No `values-de/fr/es`. | `res/values/` |
| Tests | Only the template `src/test/java` and `src/androidTest/java` exist. CI runs no Android tests. | `android/app/src/`, `.github/workflows/release.yml` |

## 3. Technical options (TASK-2)

### 3.1 Option A: `AppWidgetProvider` + `RemoteViews` (Java)

This is the platform API. A widget is a `BroadcastReceiver` subclass
(`AppWidgetProvider`) declared in the manifest, plus an
`appwidget-provider` XML file and XML layouts rendered as `RemoteViews`.

- **New dependencies:** none for simple widgets. For list widgets on
  minSdk 24, add `androidx.core:core-remoteviews` (latest `1.1.0` on Google
  Maven, checked 2026-10-15). It provides
  `RemoteViewsCompat.setRemoteAdapter(context, remoteViews, appWidgetId, viewId, RemoteCollectionItems)`,
  which backports the API 31 `RemoteViews.RemoteCollectionItems` model. You
  can then pass list items directly and skip the old
  `RemoteViewsService` + `RemoteViewsFactory` boilerplate.
- **Language:** Java, which matches the existing code.
- **API-level constraints relative to minSdk 24:**
  - The basic layout set (`LinearLayout`, `FrameLayout`, `RelativeLayout`,
    `GridLayout`, `TextView`, `ImageView`, `Button`, `ListView`, …) works on
    all supported levels.
  - Stateful **checkboxes/switches** need API 31:
    `RemoteViews.setCompoundButtonChecked` is "Added in API level 31"
    (Android reference, checked 2026-10-15). On API 24–30, tap-to-complete
    needs a fallback, such as an `ImageView` that toggles an icon.
  - Android 12 (API 31) added rounded corners, dynamic colours and
    responsive layouts. The Android "Enhance your widget" docs describe them
    and a backward-compatibility path for dynamic colours. Treat all of these
    as progressive enhancements behind `Build.VERSION.SDK_INT` checks, the
    way `applySystemBarAppearance()` already handles API 35.
  - `updatePeriodMillis` "doesn't support values of less than 30 minutes"
    (Android "App widgets" docs, checked 2026-10-15). For anything more
    frequent, the docs point to WorkManager.
- **Pros:** no new toolchain, F-Droid-neutral, small APK impact, same
  language and style as the existing native code.
- **Cons:** XML layouts are verbose. The widget UI is fully native, so it
  cannot reuse Svelte components or Tailwind styles.

### 3.2 Option B: Jetpack Glance

This is a Compose-style API that generates `RemoteViews` under the hood.

- **Status:** latest stable `androidx.glance:glance-appwidget` is
  **`1.2.0`**, and the latest pre-release is `1.3.0-alpha02` (Google Maven
  `maven-metadata.xml`, lastUpdated 2026-08-26, checked 2026-10-15). The
  `1.1.1` POM shows dependencies on Compose `runtime`, `ui-graphics`,
  `ui-unit`, `core-remoteviews`, `datastore-preferences` and others.
- **What it requires here:** the Kotlin Android Gradle plugin, the Compose
  compiler Gradle plugin, and the Compose runtime as a transitive dependency.
  The repo has none of these today. It also adds a second language to a
  codebase that currently has about 4 Java files.
- **Pros:** much nicer UI code, built-in `ActionCallback`s for interactions,
  `GlanceAppWidgetReceiver`, and a testing artifact (`glance-appwidget-testing`).
- **Cons:** the toolchain changes (Kotlin + Compose compiler) affect the
  F-Droid build and every future AGP/Kotlin upgrade. APK size grows. It
  still renders to `RemoteViews`, so it has the same capability limits as
  option A.
- **Verdict:** this is a reasonable choice *if* the maintainer wants Kotlin
  in the repo anyway. It is not justified for one or two widgets. **This is a
  maintainer decision** (see Open questions).

### 3.3 Option C: community Capacitor widget plugins

Checked on the npm registry on 2026-10-15 (`npm view`, plus inspecting the
published tarballs):

| Package | Latest | Capacitor peer | Android part | Licence | Fit |
|---|---|---|---|---|---|
| `capacitor-widget-bridge` (kisimediaDE) | 8.1.0 (2026-03-03); **7.0.0** (2025-06-03) is the only Cap-7 line | `>=8.0.0` for 8.x, `>=7.0.0` for 7.0.0 | One Java file (155 lines): `setItem`/`getItem` into `SharedPreferences` (`MODE_PRIVATE`), plus `reloadAllTimelines` via `AppWidgetManager` and `Class.forName` on registered class names, plus `requestPinAppWidget`. **It ships no widgets.** You still write the `AppWidgetProvider` yourself. | MIT | Usable, but it only replaces about 50 lines of plugin code. The Cap-7 line has not been updated since June 2025. |
| `@capgo/capacitor-widget-kit` (Capgo) | 8.1.14 (2026-10-15) | `>=8.0.0`. All published versions are 8.x, so **not usable on Capacitor 7** without upgrading. | Java. SVG-template widgets rendered through `com.caverock:androidsvg-aar:1.4`, plus a native-widget bridge. | MPL-2.0 | Too heavy and opinionated (SVG templates, iOS-first), and requires Capacitor 8. |
| `capacitor-widgetsbridge-plugin` | 0.2.1 (2025-05-31) | `>=7.0.0` | **None.** The tarball has no `android/` directory, so it is iOS-only. | MIT | Not applicable. |

**Conclusion:** no plugin provides ready-made Android widgets for
Capacitor 7. The only real candidate (`capacitor-widget-bridge@7.0.0`)
covers the same ground as the small custom bridge that §4 needs anyway, and
the repo already has a pattern for that (`PullToRefreshPlugin`). A custom
plugin also avoids adding an npm dependency to the root `package.json`, and
that dependency would be pulled into the F-Droid build through
`npx cap sync`. If the app moves to Capacitor 8 later, check this again.

## 4. Data and auth (TASK-3)

**The problem.** The widget runs in the app process, but outside the
WebView. Everything it would need sits in WebView `localStorage`:

- `auth` → `{ user, authToken: { token, token_type, expires_at } }`
  (`frontend/src/lib/state/Auth.svelte.ts`, `Auth.LS_AUTH_KEY`)
- `custom_api_url` → user-set API base. If it is unset, the default is
  `https://api.solyto.app` (`frontend/src/lib/config/platform.ts`).
- `theme`, plus the language stored on the server in `user.settings.language`

Native code cannot read WebView `localStorage` in a supported way. Any data
widget therefore needs **the web app to hand something to native**, and that
JS code lives in the vendored `frontend/` (see §7.1).

Token lifecycle, from `Auth.svelte.ts`: on load, an expired token is
dropped. If a token expires within 14 days (native) or 5 days (web), it is
refreshed through `POST /api/v1/auth/refresh`, and the response contains a
**new** token. Whether the server invalidates the previous token on refresh
is **not visible from this repo** (the backend lives elsewhere). That one
fact decides how hard option 3.2 is.

### 3.1 Web app pushes a pre-rendered snapshot (no native network calls)

How it works: whenever relevant state changes (todos loaded or changed,
widget events fetched, app resumed), the web app builds a small JSON
snapshot, for example
`{ generated_at, locale, theme, items: [{title, due, route}], labels: {...} }`,
and calls a native bridge method. The bridge writes the snapshot to
`SharedPreferences` and calls `AppWidgetManager.updateAppWidget(...)`.

- **Pros:**
  - The widget never has the token. The security surface barely changes.
  - All business logic stays in the web app. For example, "today/overdue"
    filtering is already done by `TodoFilterService.filterByDueDate('today-overdue', …)`
    and used by `YourDay.svelte`, and the web app already handles the user's
    timezone and date format.
  - Labels can be **pre-translated** with the web i18n tables (en/de/fr/es),
    which keeps the widget in the user's in-app language rather than the
    system locale (§7.3).
  - Native code stays dumb and small.
- **Cons:**
  - Data is only as fresh as the last time the app was open. A widget showing
    "today" goes stale after midnight. Mitigations: store per-item due
    timestamps so native code can re-filter or re-label at render time, show
    "updated <time>", and make the whole widget tap through to the app,
    which refreshes the snapshot.
  - Interactions such as tap-to-complete cannot reach the server directly.
    They can only open the app, possibly on a route that performs the action
    (§5), or queue an action that the web app flushes on its next start.
  - Logout must clear the snapshot. That needs a bridge call from the
    logout/`clear()` path in `../app`.
- **Bridge options** (all native code goes in `android/`):
  1. A `@CapacitorPlugin` with a `@PluginMethod`. JS can call it either
     through `@capacitor/core` (a **new dependency in `../app`**, which needs
     approval) or through the runtime global `window.Capacitor.Plugins.<Name>`,
     the same global the share page already uses. That the runtime global
     works without the npm package on Capacitor 7 is an assumption.
     **Verify it before relying on it.**
  2. `addJavascriptInterface`, like `PullToRefreshPlugin`. This pattern is
     already in the repo and needs no JS dependency.

### 3.2 Web app hands token and API URL to native; widget fetches itself

How it works: after login or refresh, the web app passes
`{ token, expires_at, api_url }` to native storage. A `WorkManager`
periodic job (minimum 15 min, best effort) or `updatePeriodMillis`
(minimum 30 min) then fetches data from the API and updates the widget.

- **Pros:** the data stays fresh without opening the app. Real interactions
  become possible, such as `PUT /todos/{id}` with `{ is_completed: true }`
  (the request shape used by `Todos.changeCompleted`) or time-tracking
  start/stop.
- **Cons / risks:**
  - **Token refresh conflict.** If native refreshes and the server
    invalidates the old token, the WebView's copy dies and the user is
    logged out of the app. The safest rule is that **native never
    refreshes**: it uses the token until `expires_at` and otherwise shows
    "open solyto to sign in". The web app re-pushes the token on every
    login, refresh and app start.
  - **Logic duplication.** Filtering, timezone handling (the user's timezone
    lives in server-side user settings), date formatting and translation
    would have to be reimplemented in Java, or new server endpoints would be
    needed. `calendars/events/widget` exists, but there is no "todos due
    today" endpoint. `todos/due-date` exists, but its semantics are not
    documented here.
  - **New dependency:** `androidx.work:work-runtime` (latest `2.12.0` on
    Google Maven, checked 2026-10-15). It is FOSS and needs no GMS.
  - **Security:** a long-lived bearer token now exists in **two** places
    (see below).
  - **Revocation:** logout must also wipe the native copy. Whether the token
    can be revoked server-side is unknown from this repo.

### 3.3 Static shortcut widgets (no data)

The widget is a row or grid of buttons (Todos, Calendar, Notes, Check-in,
Quick add, …). Each button is a `PendingIntent` into `MainActivity` with a
route (§6).

- **Pros:** no data, no auth, no `../app` change (apart from optional
  "open quick-add" routes), and no staleness. It is almost entirely
  `res/` XML plus a tiny provider class.
- **Cons:** it only saves a tap or two. For the same user value, Android
  **app shortcuts** (long-press on the launcher icon, a static
  `res/xml/shortcuts.xml`) are even cheaper. They are worth considering
  alongside widgets or instead of them.

### Security notes on copying the token out of the WebView

These apply only to option 3.2. Option 3.1 copies display data, not
credentials.

- `androidx.security:security-crypto` (`EncryptedSharedPreferences`,
  `MasterKey`): version `1.1.0` (Google Maven, 2025-07-30) **"Deprecated all
  APIs in favour of existing platform APIs and direct use of Android
  Keystore"** (androidx security release notes, checked 2026-10-15). Do
  **not** adopt it.
- Recommended instead: generate an AES-GCM key in the **AndroidKeyStore**
  (platform API, available on API 23+, no dependency), encrypt the token,
  and store the ciphertext and IV in private `SharedPreferences`.
- **Backups:** the manifest has `allowBackup="true"` with no rules. Exclude
  the token prefs from backup, via `fullBackupContent` (≤ API 30) and
  `dataExtractionRules` (API 31+). A restored ciphertext would not decrypt
  anyway, because Keystore keys do not migrate. Changing backup rules is a
  manifest change, so flag it in review. WebView storage itself is probably
  already covered by auto-backup today. That is **not verified** and is
  outside this report's scope.
- In terms of exposure, any JS that can call the bridge (including an XSS
  in the page) can already read `localStorage`. The bridge itself therefore
  does not widen access to the token. The real new risk is the second copy
  at rest.
- **Shoulder-surfing / privacy:** solyto positions itself as *private*. A
  widget shows todo titles, event names and note snippets on the home screen
  of an unlocked phone. This applies to **both** data options. Consider a
  per-widget "hide details" option.

## 5. Candidate widgets (TASK-4)

These are candidates only. Choosing which ones ship is up to the maintainer.
Complexity: S = days, M = about a week, L = more, all rough. Data source
column: API route keys from `frontend/src/lib/config/apiRoutes.ts`.

| # | Widget | Data needed / API | Interaction | Opens route | Complexity with 3.1 (snapshot) | Complexity with 3.2 (native fetch) |
|---|---|---|---|---|---|---|
| 1 | **Shortcuts / launcher** | none | tap → open | `/todos`, `/calendar`, `/notes`, `/check-in`, `/time-tracking`, … | **S** (no `../app` change) | n/a |
| 2 | **Quick add** | none | tap → open the quick-add UI | today `/share?q=` *requires* `q` and returns to `/` without it, so a new route or param in `../app` is needed (e.g. `/?quickadd=1`) | **S** + small `../app` change | n/a |
| 3 | **Your Day** (today/overdue todos + today's events) | `todos.list` filtered client-side (`TodoFilterService` `'today-overdue'`) + `calendars.listWidgetEvents` (`/calendars/events/widget`, already used by `YourDay.svelte`) | tap row → open; optional complete (see #4) | `/todos`, `/calendar` (no per-item routes exist for todos/events) | **M**: list widget via `core-remoteviews`, date rollover handling | **L**: reimplements the filter and timezone logic natively |
| 4 | **Todos with tap-to-complete** | as #3 + `PUT todos.update` `{ is_completed }` | checkbox (API 31+, `setCompoundButtonChecked`) with icon fallback on 24–30 | `/todos` | **M–L**: deferred action queue, or open-app-and-complete route in `../app` | **L**: plus the token handling in §4 |
| 5 | **Upcoming events** | `calendars.listWidgetEvents` | tap → open | `/calendar` | **M** | **M–L** |
| 6 | **Check-in** | whether today's check-in exists (`checkIn.list`) + settings (`users.settings.updateCheckInSettings` GET) | tap → open check-in for today | `/check-in`, or `/check-in/date/[date]` (exists) | **S–M** | **M** |
| 7 | **Time-tracking timer** | running entry (`timeTracking.entries.list`) | start/stop (`timeTracking.entries.start`, `…/stop`) | `/time-tracking` | **M** read-only; start/stop needs 3.2 | **L** |
| 8 | **Newest / pinned note** | `notes.newest` (or a chosen note via `notes.get`). Content is Tiptap HTML, so the widget needs plain-text extraction (easy in JS, annoying in Java). | tap → open note | `/notes/[id]` (exists) | **M**: the "pinned" choice needs a widget configuration activity | **M–L** |
| 9 | **Random quote** | `libraries.quotes.getRandom` | tap → open / next | `/libraries/quotes` | **S–M** | **M** |

Observations:

- #3 maps almost exactly onto the existing dashboard "Your Day" component
  (`lib/components/dashboard/YourDay.svelte`). With option 3.1 the web app
  can serialise what it already computes.
- Only #4 and #7 *need* server writes from outside the app. They are the
  candidates that force the token decision.
- Todo and event routes are list-level only (`/todos`, `/calendar`). Deep
  links to a single todo or event would need `../app` changes.

## 6. Deep linking from widget taps (TASK-5)

The pattern already exists in `MainActivity.handleShareIntent`:

1. The widget sets a `PendingIntent.getActivity(...)` on each clickable view.
   The intent is **explicit** (component = `MainActivity`), with a custom
   action such as `app.solyto.action.OPEN_ROUTE` and a route extra or data
   URI. It uses `FLAG_IMMUTABLE`, which is required when targeting API 31+,
   and a distinct request code or data URI per route, so that `PendingIntent`s
   that differ only in extras are not merged.
2. `MainActivity` is `singleTask`:
   - **Cold start:** `onCreate` gets the intent. As in `handleShareIntent`,
     post `getBridge().getWebView().loadUrl("https://my.solyto.app" + route)`.
   - **Already running:** Android calls `onNewIntent`. The same handler runs,
     and the existing task is brought to the front instead of a new activity.
     The existing code handles the `intent` parameter directly rather than
     relying on `getIntent()`, and the widget handler should do the same.
3. A new `handleWidgetIntent(intent)` would sit next to `handleShareIntent`
   in both lifecycle methods.

Details to get right:

- **Allowlist routes.** `MainActivity` is `exported="true"`, so any app can
  send it an intent with the same action. Map a small enum or allowlist
  (`todos`, `calendar`, `notes`, `check-in`, …) to paths. Never `loadUrl` a
  string taken directly from an extra. The same applies if the existing
  `app.solyto://` `VIEW` filter is reused instead, since browsers and other
  apps can trigger that scheme as well.
- **`loadUrl` does a full page load.** SvelteKit restarts and in-memory
  state is lost, but `localStorage` (auth) survives. This matches today's
  share behaviour. A softer alternative, `evaluateJavascript` calling a
  client-side navigation hook, would need a hook exported from `../app` and
  is not needed for an MVP.
- Routes that perform an action (quick-add, complete a todo, start a timer)
  do not exist yet. They are `../app` work, gated on `IS_MOBILE`.

## 7. Constraints and risks (TASK-6)

### 7.1 Vendored frontend workflow

- **All JS changes** (snapshot push, token handoff, logout cleanup, new
  quick-add or action routes) **must be made in the canonical `../app` repo**,
  gated on `IS_MOBILE` (`frontend/src/lib/config/platform.ts`), and then
  pulled in with `scripts/vendor.sh`. Editing `frontend/` directly would be
  overwritten by the next `vendor.sh` run.
- Shortcut widgets (#1) need **no** JS change.
- The web app must keep working without the bridge on web and desktop (the
  `IS_MOBILE` gate, plus an existence check for the bridge object).

### 7.2 F-Droid and the build

- **Option A + custom bridge:** no new Gradle or npm dependencies. With
  `core-remoteviews` or `work-runtime`, the new deps come from Google Maven,
  are Apache-2.0 and have no GMS dependency. `build-fdroid.sh` is unaffected,
  and **`fdroid/app.solyto.yml` needs no change**, because new versions are
  picked up through `UpdateCheckMode: Tags`.
- **Option B (Glance):** adds the Kotlin and Compose compiler Gradle plugins.
  These are FOSS and fetched by Gradle from the usual repositories, so they
  should still build on F-Droid. They do make reproducible builds harder and
  add upgrade overhead. ⚠ Verify on an F-Droid build server or with
  `fdroid build` locally before release. If the build recipe needs any
  adjustment, the change to **`fdroid/app.solyto.yml` must be flagged**.
- **Option C (npm plugin):** it would be added to the root `package.json`
  and wired in by `npx cap sync android`, which writes
  `capacitor.settings.gradle` and `capacitor.build.gradle`. It would be
  scanned by the F-Droid scanner (it ships Java source only, so that is
  fine). This is not recommended (§3.3).
- `build-fdroid.sh` stays offline and Node 20-compatible as long as no new
  JS build step is added. None of the options requires one.

### 7.3 i18n

- The web app's language comes from `user.settings.language` (server), with
  `navigator.language` as fallback (`Translation.svelte.ts`). It is not
  necessarily the Android system locale.
- With option 3.1, the snapshot carries already-translated labels, so native
  only needs strings for "empty", "open app" and the widget picker metadata
  (`android:description`, label). Those go in `res/values`, `values-de`,
  `values-fr` and `values-es`. These folders do not exist yet; they are small
  new files.
- Shortcut widgets need their button labels in `res/values-*` and will
  follow the **system** locale, not the in-app language. That is a minor
  mismatch the maintainer should accept or avoid (for example, with
  icon-only buttons).

### 7.4 Theming

- Reuse `colors.xml` (`solyto_bg_light/dark`, `solyto_surface_dark`,
  `solyto_lightblue`, `solyto_green`). Widgets resolve resources in their
  own context, so light/dark needs a `values-night/` variant of the widget
  colours. Today dark mode is only handled in code; `values-night` would be
  new but standard.
- Optionally use dynamic colours on API 31+ (§3.1).
- The in-app theme (`localStorage` `theme`, `Theme.svelte.ts`) can differ
  from the system theme. A snapshot could carry it if exact matching
  matters.

### 7.5 Battery and update frequency

- `updatePeriodMillis` has a 30-minute minimum and wakes the device, so for
  snapshot widgets use `0`, or a long period only to handle date rollover.
- Snapshot widgets update on app use, which costs essentially nothing.
- WorkManager periodic work has a 15-minute minimum, is batched by Doze and
  App Standby, and is best effort. "Live" freshness is not achievable, and
  that should be stated in the UI.
- Updates triggered by the bridge should be debounced in JS, because state
  classes reload often.

### 7.6 Testing

- There is no Android test setup in CI today, and the existing test dirs are
  template-only.
- Realistic approach:
  - JS snapshot building: unit-test it in `../app` with Vitest (pure
    function from state to snapshot).
  - Native: Robolectric or instrumented tests would be new tooling, and
    adding them is a separate decision.
  - For the MVP, do manual testing on API 24, an API 30 emulator (no
    checkbox support), API 31+ and API 35/36, in light and dark mode, with
    en and de, covering cold-start and warm-start taps, logout, and
    midnight rollover.
- Glance would also provide `glance-appwidget-testing`.

## 8. Phased rough plan

1. **Phase 0, decisions** (see Open questions). No code.
2. **Phase 1, MVP shortcut widget** (S, Android-only, no `../app` change):
   - `AppWidgetProvider` (Java), layout XML, `appwidget-provider` XML with
     preview, manifest `<receiver>`, and `res/values-*` strings
   - `handleWidgetIntent` with a route allowlist in `MainActivity`
   - Optionally, static app shortcuts (`shortcuts.xml`) at the same time
3. **Phase 2, read-only "Your Day" data widget** (M):
   - native: a custom bridge plugin (`SharedPreferences` + `updateAppWidget`)
     and a list widget via `core-remoteviews`
   - `../app`: an `IS_MOBILE`-gated snapshot push after todos and events
     load, a clear on logout, and pre-translated labels
   - privacy toggle and an "updated at" timestamp
4. **Phase 3, interactive widgets** (L, optional): only after deciding on
   the token. Either a deferred action queue (no token) or native API calls
   with a Keystore-encrypted token, WorkManager and backup exclusion rules.
5. **Later:** if Kotlin is introduced for other reasons, reconsider moving
   to Glance. If Capacitor is upgraded to 8, look at the plugin landscape
   again.

## 9. Open questions for the maintainer

1. **Which widgets** should ship? The table in §5 lists candidates; this
   report does not pick a set.
2. **Kotlin:** is adding Kotlin and the Compose compiler (Glance)
   acceptable, or should native code stay Java-only?
3. **Token handoff:** is copying the bearer token out of the WebView into
   native storage (option 3.2) acceptable from a security and privacy
   standpoint? If not, interactive widgets are limited to "open app" or
   deferred actions.
4. **Backend:** does `POST /auth/refresh` invalidate the previous token? Is
   there server-side revocation on logout? How long do tokens live? This
   cannot be answered from this repo.
5. **`../app` scope:** is it acceptable to add a mobile-only bridge call and
   new routes (quick-add, possibly complete-todo) to the canonical web app?
   Should it add `@capacitor/core` as a dependency, or rely on the injected
   `window.Capacitor` global or a `addJavascriptInterface`-style bridge?
6. **Privacy default:** should data widgets hide details by default, given
   solyto's "private" positioning?
7. **App shortcuts:** are static launcher shortcuts wanted alongside (or
   instead of) the shortcut widget?
8. **Capacitor 8:** is an upgrade planned? It would affect plugin choices.
9. **Unverified assumption (needs a spike, not done here):**
   `window.Capacitor.Plugins.<Name>` works for a custom plugin when
   `@capacitor/core` is not bundled in the web app.

## 10. Sources (all accessed 2026-10-15)

Repository files (this branch): `android/build.gradle`,
`android/app/build.gradle`, `android/variables.gradle`,
`android/app/capacitor.build.gradle`, `android/capacitor.settings.gradle`,
`android/gradle/wrapper/gradle-wrapper.properties`,
`android/app/src/main/AndroidManifest.xml`,
`android/app/src/main/java/app/solyto/{MainActivity,PullToRefreshPlugin}.java`,
`android/app/src/main/res/values/{colors,strings,styles}.xml`,
`capacitor.config.json`, `package.json`, `scripts/build-fdroid.sh`,
`scripts/vendor.sh`, `fdroid/app.solyto.yml`, `.github/workflows/release.yml`,
`frontend/src/lib/config/{apiRoutes,platform,urls}.ts`,
`frontend/src/lib/state/{Auth,Todos,Calendars,CheckInData,TimeTracking,Notes,QuickAdd,Theme,Translation}.svelte.ts`,
`frontend/src/lib/components/dashboard/YourDay.svelte`,
`frontend/src/routes/share/+page.svelte`.

External:

- npm registry (`npm view` / `npm pack`): `capacitor-widget-bridge`
  (7.0.0 2025-06-03, 8.1.0 2026-03-03, MIT),
  `@capgo/capacitor-widget-kit` (8.1.14 2026-10-15, MPL-2.0, peer
  `@capacitor/core >=8`), `capacitor-widgetsbridge-plugin` (0.2.1
  2025-05-31, MIT, no Android code), `@capacitor/core` (8.5.3 2026-10-14).
  Repos: https://github.com/kisimediaDE/capacitor-widget-bridge,
  https://github.com/Cap-go/capacitor-widget-kit
- Google Maven `maven-metadata.xml` (https://dl.google.com/android/maven2/):
  `androidx.glance:glance-appwidget` (stable 1.2.0, latest 1.3.0-alpha02),
  `androidx.work:work-runtime` 2.12.0, `androidx.security:security-crypto`
  1.1.0, `androidx.core:core-remoteviews` 1.1.0. Glance 1.1.1 POM for its
  dependency list.
- androidx Security release notes, 1.1.0: "Deprecated all APIs in favour of
  existing platform APIs and direct use of Android Keystore":
  https://developer.android.com/jetpack/androidx/releases/security
- Glance release notes: https://developer.android.com/jetpack/androidx/releases/glance
- App widgets overview and advanced guide (`updatePeriodMillis` 30-minute
  minimum, WorkManager recommendation):
  https://developer.android.com/develop/ui/views/appwidgets,
  https://developer.android.com/develop/ui/views/appwidgets/advanced
- Enhance your widget (rounded corners, dynamic colours):
  https://developer.android.com/develop/ui/views/appwidgets/enhance
- `RemoteViews` reference (`setCompoundButtonChecked` added in API 31,
  `RemoteCollectionItems` added in API 31):
  https://developer.android.com/reference/android/widget/RemoteViews
- `RemoteViewsCompat` (`setRemoteAdapter` with `RemoteCollectionItems`):
  https://developer.android.com/reference/kotlin/androidx/core/widget/RemoteViewsCompat
