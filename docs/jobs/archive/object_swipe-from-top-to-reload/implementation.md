# Implementation: Swipe from top to reload

id: object
developer: @developer
date: 2026-10-14

## Summary

Native Android pull-to-refresh, done entirely in `android/` (no changes to the
vendored `frontend/`). The Capacitor WebView is wrapped in an AndroidX
`SwipeRefreshLayout`, so pulling down shows the standard Material spinner and
runs `WebView.reload()`. A small script injected into the page decides
whether a pull may start, based on what is under the finger. This stops a
reload when the user scrolls a list back up, and inside modals, fixed sheets
and drag/gesture areas.

**Builds; not yet tested on a device.** `./gradlew assembleDebug` succeeds
(see "Build verification" below). Device testing is done by the user, outside
this job (see TASK-5).

## Changes

TASK-1: Added `androidx.swiperefreshlayout:swiperefreshlayout:1.1.0` (version
pinned as `androidxSwipeRefreshLayoutVersion` in `android/variables.gradle`,
used in `android/app/build.gradle`). The brief allows new dependencies, which
answers open question 1. The artifact is on Google Maven, which F-Droid already
uses for the other AndroidX libraries. I read its sources to confirm the API
(`setOnChildScrollUpCallback`, `setProgressViewOffset`,
`getProgressCircleDiameter`, and the intercept logic).

TASK-2: `MainActivity.setupPullToRefresh()` re-parents the bridge WebView after
`super.onCreate`, giving CoordinatorLayout → SwipeRefreshLayout → FrameLayout
→ WebView. I checked this against the `@capacitor/android` 7.6.8 sources:
`BridgeActivity` uses `capacitor_bridge_layout_main`, and
`CapacitorWebView.edgeToEdgeHandler` insets the WebView by setting its own
layout margins. `SwipeRefreshLayout` ignores child margins, so the extra
FrameLayout is needed to keep Capacitor's edge-to-edge handling working. The
existing margins are copied over and insets are re-requested. On refresh,
`webView.reload()` is called. The spinner stops through a
`Bridge.addWebViewListener` (`onPageLoaded` / `onReceivedError`), which leaves
Capacitor's own WebViewClient untouched, plus a 15 s timeout as a fallback.
The share-intent `loadUrl` is unchanged.

TASK-3: Two new classes in `app.solyto`:
- `PullToRefreshPlugin`: a Capacitor plugin with no methods, registered in
  `MainActivity.onCreate` before `super.onCreate`. I made it a plugin so that
  `addJavascriptInterface` runs during bridge setup, before the first page
  loads (interfaces added later only appear after the next reload). After each
  page load it injects a script (guarded so it installs only once per page).
  On `touchstart` the script reports "blocked" if any of these is true:
  - more than one finger is down, or the page is pinch-zoomed
  - the document or any ancestor of the target has `scrollTop > 0`
  - the target is inside `dialog[open]`, `[role=dialog|alertdialog]`,
    `[aria-modal=true]` or any `position: fixed` element (this covers
    `PopupContentModal`, the mobile nav overlays and the FAB)
  - an ancestor has a `touch-action` that excludes vertical panning (e.g. maps)

  If a page handler calls `preventDefault()` on `touchmove`, as
  svelte-dnd-action does once a drag starts, the script also reports blocked
  mid-gesture. If a page has no script (still loading, or an error page), the
  check falls back to `webView.canScrollVertically(-1)`.
- `PullToRefreshLayout`: a `SwipeRefreshLayout` subclass that handles the
  timing race. `ACTION_DOWN` is always let through, so the layout records the
  start point. Move events then stay blocked until the page answers for that
  touch, or until 300 ms pass, after which a pull is allowed.

I checked the injected script with `node --check`, and ran it in headless
Chromium against a fixture page with a mocked bridge. Results: plain element at
top → allowed; inside a scrolled list → blocked; fixed modal → blocked;
`touch-action:none` → blocked; `touch-action:pan-y` → allowed;
`preventDefault` on touchmove → blocked mid-gesture; a second injection only
re-reports ready.

TASK-4: Spinner colours follow the system light/dark mode and are re-applied
in `onConfigurationChanged` (the manifest handles `uiMode` itself). The circle
background is `solyto_bg_light` (#FFFFFF) in light mode and the new
`solyto_surface_dark` (#222222, the web app's `s-dark-2`) in dark mode. The
arrow cycles through the app's gradient colours, `solyto_lightblue` #14A5CD and
`solyto_green` #61D96A (new entries in `colors.xml`). The spinner position is
tied to the WebView's top: a layout listener calls `setProgressViewOffset`, so
on Android 15+ edge-to-edge the spinner rests 64 dp below the status bar
instead of under it. Below Android 15 the top is 0 and SwipeRefreshLayout's
defaults are kept.

TASK-5: **Not done.** No device verification was possible: this environment
has no Java toolchain, Android SDK or emulator, so I could neither build the
APK nor run it. Only the parts that run in a browser were checked (TASK-3,
above). Checklist still to run on a device/emulator (Android 14 and 15+, light
and dark):
- [x] project builds (`./gradlew assembleDebug`) and the dependency resolves
      (see "Build verification" below)
- [ ] pull at the top of a page shows the spinner and reloads
- [ ] scrolling a long list back up does not reload
- [ ] no reload inside a modal/bottom sheet, kanban drag or calendar drag
- [ ] spinner appears below the status bar on Android 15+ and the WebView
      still has correct edge-to-edge margins
- [ ] share intent ("Share → solyto") still opens `/share`

No changelog line was added: `fastlane/.../changelogs/` only has `10012.txt`,
so the release process doesn't seem to expect one per version.

## Build verification

With the user's sign-off, a toolchain was installed in the agent's home
directory (outside the repo): Temurin JDK 21.0.12, Android cmdline-tools,
platform `android-36`, build-tools 36.0.0 (Gradle pulled in 35.0.0 itself).
Then the same steps as `scripts/build-fdroid.sh` were run, minus the
version `sed` (which would have been a no-op: `versionCode 10015` already
matches `package.json` 1.0.15):

1. `frontend`: `npm ci` + `PUBLIC_MOBILE=true ... npm run build`
2. root: `npm ci`, `npx cap sync android`
3. `android`: `./gradlew assembleDebug` → **BUILD SUCCESSFUL**,
   `app-debug.apk` (7.5 MB)

Checks:
- `debugRuntimeClasspath` contains
  `androidx.swiperefreshlayout:swiperefreshlayout:1.1.0`, so it resolves from
  Google Maven.
- `MainActivity`, `PullToRefreshLayout` and `PullToRefreshPlugin` (plus their
  inner classes) are compiled into the app module.
- `:app:compileDebugJavaWithJavac --rerun` gives no javac warnings. The
  "unchecked operations" note in the full build comes from the Capacitor /
  Cordova library modules, not from this job's code.
- All generated files (`frontend/build`, `android/app/src/main/assets/*`,
  `capacitor-cordova-android-plugins/`, `build/`) are gitignored. The working
  tree stayed clean.

Note: the first frontend build was OOM-killed in this 8 GB container while a
Gradle daemon was running. It worked after `./gradlew --stop`. This is an
environment issue, not a project issue.

## Known issues / follow-ups

- Not yet tested on a device/emulator (see TASK-5). The user does this
  manually before release.
- A reload is a full `WebView.reload()`, so unsaved in-memory UI state (e.g. an
  open editor or modal) is lost. A softer data-only refresh would need
  frontend changes in the `app` repo.
- Spinner colours follow the system dark mode, the same as the existing
  system-bar code, not the web app's own theme setting (`html.dark`).
- On Android 15+ the spinner starts just above the WebView top, i.e. behind
  the transparent status bar, while it is being pulled in. This is
  cosmetic; please check on a device.
- `MainActivity` already called `handleShareIntent` twice on cold start
  (`BridgeActivity.load()` calls `onNewIntent`, then `onCreate` calls it
  again). This is unchanged and out of scope.
