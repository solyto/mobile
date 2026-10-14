# Verdict: Swipe from top to reload

id: object
reviewer: @reviewer
date: 2026-10-14
round: 2 (re-review after the build verification was added)

## Review

Branch checked: `feature/object_swipe-from-top-to-reload` (matches brief).
Base: `main` (`.manigot/manigot.json` is missing, so I used the default).
I reviewed the whole `git diff main...HEAD`. Every source change is in
`android/` (`build.gradle`, `variables.gradle`, `colors.xml`, `MainActivity`,
plus the new `PullToRefreshLayout` and `PullToRefreshPlugin`). `frontend/` was
not touched, as the plan required.

Since the round-1 verdict (`8d0163a`), only `implementation.md`,
`session.log` and `tokens.json` have changed. **The Java and resources are
byte-for-byte the same as in round 1.** The new part is the "Build
verification" section: a full `assembleDebug` that follows
`scripts/build-fdroid.sh`, with the dependency resolved from Google Maven and
no javac warnings from this job's code. I can't re-run it here (there's no
toolchain in this container), so I'm taking the developer's report as given.

TASK-1: PASS
notes: `variables.gradle` pins `androidxSwipeRefreshLayoutVersion = '1.1.0'`
and `app/build.gradle` uses it. The brief allows new dependencies. The project
builds and `swiperefreshlayout:1.1.0` is on `debugRuntimeClasspath`
(implementation.md, "Build verification"). This fixes the round-1 blocker.

TASK-2: PASS
notes: `MainActivity.setupPullToRefresh()` re-parents the WebView as
SwipeRefreshLayout → FrameLayout → WebView. The FrameLayout keeps Capacitor's
edge-to-edge margins working, since SwipeRefreshLayout ignores child margins.
The existing margins are copied and insets are re-requested. Reload happens
via `webView.reload()`. The spinner stops through
`Bridge.addWebViewListener` (`onPageLoaded` / `onReceivedError`), so
Capacitor's WebViewClient is left alone, and there's a 15 s timeout as a
fallback. The share-intent code is unchanged.

TASK-3: PASS
notes: The plugin is registered before `super.onCreate`, so the JS interface
is in place before the first page load. The script is re-injected on every
`onPageLoaded`, and readiness is reset in `onPageStarted`.
`PullToRefreshLayout` always lets `ACTION_DOWN` through, so
SwipeRefreshLayout 1.1.0 records `mInitialDownY`. After that it blocks move
events until the page answers or 300 ms pass. The rules for blocking a pull
(scrolled ancestor, overlay/dialog, `position: fixed`, restrictive
`touch-action`, multi-touch, pinch-zoom, a `preventDefault`ed touchmove) fit
this frontend. The JS interface only takes booleans.

TASK-4: PASS
notes: The light/dark spinner colours are re-applied in
`onConfigurationChanged`. Three new colours are in `colors.xml`.
`setProgressViewOffset` follows `webView.getTop()` and is never called while a
refresh is showing.

TASK-5: PARTIAL
notes: The build item on the checklist is done. The device/emulator checks
(pull reloads, scrolling a list back up doesn't, no trigger in modals/drags,
spinner below the status bar on 15+, share intent) have **not** been run. This
environment can't run them. `implementation.md` hands them to the user as a
manual check before release, and lists them as an open checklist. Leaving out
the changelog is justified (only `10012.txt` exists).

Scope: `docs/CLAUDE.md` (an empty file, from a `chore: commit all` commit) is
tooling noise, not developer work. Nothing else is outside the plan.

## Overall

APPROVED

The code matches the plan, and the build risk that blocked round 1 is now
covered. The one open item is the hands-on device check from TASK-5. Only a
person with a phone or emulator can do it, and it's recorded as an open
checklist in `implementation.md`. Holding the merge for it would not change
anything an agent can do on this branch.

Before releasing to F-Droid (not before merge), the user needs to run the open
TASK-5 checklist in `implementation.md` on Android <15 and 15+, in light and
dark mode.

No blockers for merge.
