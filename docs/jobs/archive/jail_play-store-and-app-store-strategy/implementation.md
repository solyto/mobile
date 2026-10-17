# Implementation: play store and app store strategy

id: jail
developer: @developer
date: 2026-10-17

## Summary

This job produced one report, `docs/reports/play-store-and-app-store.md`.
It lists the steps needed to publish solyto on Google Play and the Apple
App Store. It is based on the repo as it is today and on official store,
Capacitor, F-Droid and FSF pages fetched on 2026-10-17 (dated sources in
§12). No code, Gradle, manifest, `patch/`, `frontend/`, `fdroid/`,
`fastlane/`, CI or signing files were changed. No iOS project was created,
and no release or store tooling was run.

Main findings:
- **Blockers for both stores:** there is no account deletion anywhere (no
  API route, no UI; verified). UGC (dev-requests, public profiles, friend
  feeds) has no report/block feature or terms of use. The privacy policy is
  only an anchor on the landing page, and the in-app legal links are most
  likely hidden in the mobile build because `PUBLIC_PRIVACY_URL` is not set
  in `build-fdroid.sh`.
- **Play:** already targets API 36. `bundleRelease` needs no Gradle change.
  The existing screenshots (518×1149 RGBA) fail Play's format rules, and no
  feature graphic exists. Play App Signing is a decision for the maintainer
  (flagged).
- **F-Droid** signs with its own key (no `Binaries`/`AllowedAPKSigningKeys`).
  Users who switch stores must reinstall. Google's Android developer
  verification (from 30 Sep 2026) means F-Droid's key fingerprint should be
  registered as well.
- **iOS:** the work is large and partly uncertain. It needs Xcode 26+ (it
  is not verified that Capacitor 7 builds with it). The origin changes to
  `capacitor://` (affects CORS and passkeys), Web Push will not work, and
  guideline 4.2 is a real review risk. Sign in with Apple is not required.

## Changes

TASK-1: "Current state" section (§2). It covers the build/signing/release
  flow, F-Droid signing, versioning, the manifest, and an audit of the
  fastlane metadata, including measured screenshot sizes and alpha channel.
  File: `docs/reports/play-store-and-app-store.md` (new).
TASK-2: "Shared compliance prerequisites" (§3). It marks account deletion,
  the web deletion URL, the privacy policy, the in-app policy link, UGC
  moderation and the demo account as present, missing or unknown, with
  evidence and an owning repo for each. It also has a data-flow inventory
  for Data safety and the privacy labels.
TASK-3: Google Play steps G1–G11 (§4): account types and fees, closed
  testing, AAB, signing options A/B/C (flagged), target API, content
  forms, account deletion, listing assets, tracks and CI.
TASK-4: Apple steps A1–A11 (§5): enrolment, Xcode/SDK requirements, adding
  `@capacitor/ios` (described only), signing and capabilities, a table of
  native features to port, versioning, App Store Connect metadata,
  TestFlight, review, the passkey prototype, and CI.
TASK-5: Cross-cutting risks (§6): 4.2, UGC, self-hosting and the OpenAI key
  (the UI component is unused, so the setting can't be reached), push,
  F-Droid/`build-fdroid.sh` safety, Android developer verification,
  AGPL vs App Store (with a lockfile licence scan: no GPL/AGPL runtime
  dependencies), the vendored-frontend workflow, and whether the F-Droid
  yml needs changes.
TASK-6: Summary (blockers first), versioning across stores (§7), phased
  plan (§8), costs and accounts (§9), work split by repo (§10), open
  questions (§11) and dated sources (§12). The style follows
  `docs/reports/android-homescreen-widgets.md`.

## Known issues / follow-ups

- Not verified (marked in the report): whether Capacitor 7 builds with
  Xcode 26, WebAuthn in a Capacitor WKWebView with the `capacitor://`
  scheme, Push API support in Android System WebView, whether F-Droid's
  scanner accepts `node_modules/@capacitor/ios`, the EU DSA trader-status
  details, and whether `app.solyto` is available as a Play package name and
  as an Apple bundle ID.
- Found in passing and outside the report's scope: the `versionCode`
  formula collides once MINOR or PATCH goes above 99 (§7).
  `allowBackup="true"` may back up the WebView auth token (§3.1).
- The canonical `../app` repo is not available here, so the check for
  third-party contributors (relevant to AGPL on the App Store) only covers
  this repo's history.
