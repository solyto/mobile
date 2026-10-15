# Tasks: Audit: android homescreen widgets

id: opinion
analyst: @analyst
date: 2026-10-15

## Scope

This is a **report-only** job. The deliverable is one markdown file,
`docs/reports/android-homescreen-widgets.md`. It answers two questions: can
solyto ship Android home-screen widgets, and how would we build them?
**No code, Gradle, manifest, `patch/`, `frontend/` or `fdroid/` changes.** If
a prototype ever seems necessary to answer a question, stop and record it in
the report as an open question. Do not build one.

`docs/reports/` does not exist yet. Creating it (by writing the report file)
is expected.

## Context gathered by the analyst (for the developer)

- The native side is small. `android/app/src/main/java/app/solyto/` holds
  `MainActivity` (extends `BridgeActivity`), `PullToRefreshLayout`, and one
  custom plugin, `PullToRefreshPlugin`, registered with
  `registerPlugin(...)`. That plugin is the existing pattern for a custom
  JS↔native bridge.
- `AndroidManifest.xml` has one activity (`singleTask`). Its intent filters
  are MAIN/LAUNCHER, SEND text/plain (→ `https://my.solyto.app/share?q=`),
  and VIEW on `@string/custom_url_scheme`. It has no receivers or services,
  and its only permission is INTERNET.
- Auth: the bearer token, its expiry, and the user live in **WebView
  localStorage** under the key `auth` (`frontend/src/lib/state/Auth.svelte.ts`,
  `LS_AUTH_KEY`). The token expires (`expires_at`) and is renewed through
  `apiRoutes.auth.refresh`. Native code cannot read WebView localStorage
  directly. This is the main architectural problem for any widget that shows
  live data.
- The API base URL is also in localStorage (`custom_api_url`, in
  `frontend/src/lib/config/platform.ts`). Its default is `https://api.solyto.app`.
- `frontend/` is vendored. Any JS-side bridge call (for example "push widget
  data to native") would have to land in the canonical `../app` repo, gated
  on `IS_MOBILE`. The report must say this explicitly.
- Distribution: GitHub Releases plus F-Droid (`fdroid/app.solyto.yml`,
  `scripts/build-fdroid.sh`, offline, Node 20). New native dependencies must
  be FOSS and available from Maven Central or Google's Maven repository, with
  no proprietary or GMS dependencies.
- SDK levels: minSdk 24, target and compile 36, Java only (no Kotlin set up
  yet; check `android/build.gradle` and `android/app/build.gradle` to confirm).

## Task breakdown

TASK-1: Inventory the current Android/Capacitor setup that is relevant to widgets: Java vs. Kotlin, AGP/Gradle versions, AndroidX deps, Capacitor plugins in use, minSdk/targetSdk, and existing intent handling. Summarize it as a "current state" section.
  files (read-only): android/build.gradle, android/app/build.gradle, android/variables.gradle, android/app/capacitor.build.gradle, android/capacitor.settings.gradle, android/app/src/main/AndroidManifest.xml, android/app/src/main/java/app/solyto/*.java, capacitor.config.json, package.json
  depends: none
  risk: low. It is a read-only inventory.

TASK-2: Research and compare the technical options for widgets in a Capacitor app: (a) classic `AppWidgetProvider` + `RemoteViews` (Java, no new deps); (b) Jetpack Glance (needs Kotlin + Compose compiler); (c) existing community Capacitor widget plugins, checked for maintenance status, Capacitor 7 compatibility, licence, and F-Droid suitability. Cover API-level constraints such as collection widgets/`RemoteCollectionItems` and API 31+ widget features versus minSdk 24.
  files: docs/reports/android-homescreen-widgets.md (new)
  depends: TASK-1
  risk: medium. External library status changes over time, so cite sources with dates and do not assert anything from memory.

TASK-3: Analyse the data/auth problem: how a widget gets data and credentials when the token lives in WebView localStorage. Compare at least: (1) the web app pushes a pre-rendered widget snapshot to native via a custom Capacitor plugin (SharedPreferences), so there are no native network calls; (2) the web app hands the token and API URL to native storage, and the widget fetches through WorkManager or `updatePeriodMillis`, with token-expiry/refresh handling; (3) static "shortcut" widgets with no data at all. Note the security implications of copying the token out of the WebView (for example EncryptedSharedPreferences, now deprecated, versus Keystore).
  files: docs/reports/android-homescreen-widgets.md
  depends: TASK-1
  risk: medium. This is the decisive section, and it touches auth design. Present it as options, not a decision.

TASK-4: Map candidate widgets to existing features and API endpoints (for example today's todos, next calendar events, quick-add/check-in shortcut, pinned note), using `frontend/src/lib/config/apiRoutes.ts` and the state classes. For each candidate, give the data it needs, whether it needs interaction (tap-to-complete versus open-in-app deep link), and a rough complexity rating.
  files (read-only): frontend/src/lib/config/apiRoutes.ts, frontend/src/lib/state/Todos.svelte.ts, frontend/src/lib/state/Calendars.svelte.ts, frontend/src/lib/state/CheckInData.svelte.ts; output in docs/reports/android-homescreen-widgets.md
  depends: TASK-3
  risk: low. It is descriptive, but the final widget selection belongs to the maintainer, so it should be presented as candidates.

TASK-5: Describe how widget taps would open the app at a specific route (PendingIntent → `MainActivity` → `loadUrl("https://my.solyto.app/<route>")`, the same approach as `handleShareIntent`), including the `singleTask`/`onNewIntent` behaviour.
  files (read-only): android/app/src/main/java/app/solyto/MainActivity.java, android/app/src/main/AndroidManifest.xml; output in report
  depends: TASK-1
  risk: low. The pattern already exists in the code.

TASK-6: Assess cross-cutting impact and constraints: vendored-frontend workflow (JS changes go to `../app`, gated on `IS_MOBILE`), F-Droid build implications (new Gradle deps, Kotlin plugin, reproducibility, `fdroid/app.solyto.yml` flagged), i18n (widget strings in Android `res/values-*` for en/de/fr/es versus the web i18n tables), light/dark theming with the existing `colors.xml`, battery and update-frequency limits, and testing approach.
  files (read-only): scripts/build-fdroid.sh, scripts/vendor.sh, fdroid/app.solyto.yml, .github/workflows/release.yml, android/app/src/main/res/values/colors.xml; output in report
  depends: TASK-2, TASK-3
  risk: low. It is analysis only, but any recommendation that would change `fdroid/app.solyto.yml` must be flagged.

TASK-7: Write the final report `docs/reports/android-homescreen-widgets.md`. It should contain: a summary/verdict (feasible yes/no and recommended approach), current state (TASK-1), options comparison (TASK-2), data/auth (TASK-3), candidate widgets (TASK-4), deep linking (TASK-5), constraints and risks (TASK-6), a phased rough plan (for example an MVP shortcut widget, then a data widget), open questions for the maintainer, and dated sources.
  files: docs/reports/android-homescreen-widgets.md (new)
  depends: TASK-2, TASK-3, TASK-4, TASK-5, TASK-6
  risk: low. It is documentation only, with no build or runtime impact.

## Unclear / for the maintainer

- The brief has no "Why" and no "Out of scope". The analyst assumes the
  report stays technology-agnostic about *which* widgets ship. It proposes
  candidates and does not pick a final set.
- It is unclear whether introducing Kotlin (needed for Glance) is acceptable
  in this repo. The report should present this as a trade-off, not assume it.
- It is unclear whether moving the auth token out of the WebView into native
  storage is acceptable from a security/privacy standpoint. The report
  should surface this as a decision for the maintainer.
