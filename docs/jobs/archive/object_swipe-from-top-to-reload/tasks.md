# Tasks: Swipe from top to reload

id: object
analyst: @analyst
date: 2026-10-14

## Context (what the analyst found)

- Branch verified: worktree HEAD is `feature/object_swipe-from-top-to-reload`, matching `brief.md`.
- This repo (`mobile`) is a Capacitor 7 Android shell. `frontend/` is **vendored**
  from the canonical app repo (`../app`) by `scripts/vendor.sh` (`rsync --delete`),
  with mobile-only overrides kept in `patch/`. Any edit made directly in
  `frontend/src` will be **wiped on the next vendor/release run**, so
  this job must not change `frontend/`.
- Because of that, the plan is a **native Android** pull-to-refresh: wrap the
  Capacitor WebView in AndroidX `SwipeRefreshLayout`, which gives the standard
  Material circular spinner that Android users expect. Everything stays in
  `android/`.
- **Key pitfall:** the web app never scrolls the document itself. In
  `frontend/src/routes/+layout.svelte` the root `.page-container` is
  `overflow-hidden` and the content scrolls inside
  `<div class="... overflow-auto content-container">`, and there are other nested
  scrollers too (modals, kanban, calendar views). So `WebView.getScrollY()` /
  `canScrollVertically(-1)` will always say "at top", and a plain
  `SwipeRefreshLayout` would start a refresh whenever the user scrolls a list
  back up. The native side has to ask the page whether the element under the
  finger is scrolled to the top (TASK-3).
- Capacitor's `BridgeActivity` sets its own content layout
  (`capacitor_bridge_layout_main`); `android/app/src/main/res/layout/activity_main.xml`
  looks unused. So wrapping should probably happen in code in `MainActivity`
  (re-parent the bridge WebView), not in XML. The developer should check this
  against the installed `@capacitor/android` sources before starting TASK-2.

## Open questions / assumptions (not blocking; flag if wrong)

1. **New Gradle dependency.** `androidx.swiperefreshlayout:swiperefreshlayout`
   is not on the classpath yet. It is a standard AndroidX library from Google
   Maven, which F-Droid builds accept. Project rules say "never install packages
   without asking". That rule is written for npm, but the developer/reviewer
   should get explicit sign-off on this addition.
2. **What "reload" means.** Assumption: a full `WebView.reload()` of the current
   route. It is simple and also fixes "didn't load properly" cases. Side effect:
   in-memory UI state is lost (e.g. an unsaved note in the editor or an open
   modal). A softer "re-fetch data only" option would need changes in the
   vendored frontend and is out of scope here.
3. **Where the gesture is disabled.** Assumption: no refresh when the touch
   starts inside a scrolled element, inside an open modal/dialog or bottom
   sheet, or during a drag (kanban dnd, calendar entry drag). Exact rules are
   settled in TASK-3.
4. Spinner colours: assumption is to reuse the existing
   `solyto_bg_light/dark` colours plus a contrasting accent. No new design input.

## Task breakdown

TASK-1: Add the AndroidX SwipeRefreshLayout dependency (version pinned in `variables.gradle`) and confirm the project still builds.
  files: android/variables.gradle, android/app/build.gradle
  depends: none (needs dependency sign-off, see open question 1)
  risk: low — a single well-known AndroidX artifact, but it must resolve in the F-Droid build environment (`scripts/build-fdroid.sh`).

TASK-2: In `MainActivity`, wrap the Capacitor bridge WebView in a `SwipeRefreshLayout` in code (keep its layout params and edge-to-edge inset handling), and on refresh call `webView.reload()` and stop the spinner when the page finishes loading.
  files: android/app/src/main/java/app/solyto/MainActivity.java
  depends: TASK-1
  risk: medium — re-parenting the bridge WebView after `super.onCreate` could interfere with Capacitor's `adjustMarginsForEdgeToEdge: "auto"` insets and with the share-intent `loadUrl`. Finishing the refresh needs a page-load hook that doesn't replace Capacitor's own `WebViewClient` (e.g. a `BridgeWebViewClient` subclass / `WebViewListener`, or a timeout fallback).

TASK-3: Gate the gesture with `setOnChildScrollUpCallback`, backed by a small script that the native side injects into the WebView (no `frontend/` edits). On touchstart, the script finds the nearest scrollable ancestor of the touch target and reports to native (JavascriptInterface or a cached flag) whether it can scroll up, or whether the touch is inside an open modal/dialog. Refresh is allowed only when nothing under the finger can scroll up.
  files: android/app/src/main/java/app/solyto/MainActivity.java (possibly a small new helper class in the same package)
  depends: TASK-2
  risk: high — this decides whether the feature feels right or keeps firing by accident. Without it, scrolling up in any list triggers a reload (see Context). It also has a timing race (touchstart in JS vs. native intercept), and the script has to be re-injected after each page load/reload.

TASK-4: Style the indicator: spinner/background colours that follow light/dark mode (reusing the existing `solyto_bg_*` colours), and a start offset so it shows below the status bar under edge-to-edge on Android 15+.
  files: android/app/src/main/java/app/solyto/MainActivity.java, android/app/src/main/res/values/colors.xml
  depends: TASK-2
  risk: low — cosmetic only; the one thing to watch is the spinner hiding under the transparent status bar on API 35+.

TASK-5: Manually verify on a device/emulator (Android <15 and 15+, light and dark): pull at top reloads; scrolling a long list back up does not; no trigger inside modals/bottom sheets, kanban drag or calendar drag; share-intent still works; record the results in implementation.md. Add a short changelog line for the next F-Droid version if the release process expects it.
  files: docs/jobs/object_swipe-from-top-to-reload/implementation.md, fastlane/metadata/android/en-US/changelogs/<next versionCode>.txt (only if wanted)
  depends: TASK-3, TASK-4
  risk: low — verification only. The repo has no automated UI tests, so this is the only check of the gesture behaviour.

## Out of scope (by this plan)

- Any change in `frontend/` (vendored; it would be overwritten). A web-based or
  PWA pull-to-refresh would belong in the `app` repo as a separate job.
- Soft data re-fetch without a full reload.
- Version bump / release (`scripts/release.sh`).
