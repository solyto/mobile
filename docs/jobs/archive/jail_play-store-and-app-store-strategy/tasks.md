# Tasks: play store and app store strategy

id: jail
analyst: @analyst
date: 2026-10-17

## Scope

This is a **report-only** job. The deliverable is one markdown file,
`docs/reports/play-store-and-app-store.md`. It lists every step needed to
publish solyto on Google Play and the Apple App Store.
**Do not change code, Gradle, the manifest, `patch/`, `frontend/`, `fdroid/`,
`fastlane/`, CI, or signing material.** Do not create an `ios/` project. Do
not run `npx cap add ios`, release scripts, or any store tooling. If answering
a question seems to need a prototype or a real store account, record it as an
open question in the report.

## Context gathered by the analyst (for the developer)

- **Android today:** Capacitor 7 (`package.json`, `@capacitor/android ^7.6.8`).
  minSdk 24, target/compile SDK 36. The app is Java only. It ships as a signed
  **APK** (`./gradlew assembleRelease`) through `.github/workflows/release.yml`
  on `v*` tags. The keystore comes from `KEYSTORE_BASE64` and the
  `STORE_PASSWORD`/`KEY_ALIAS`/`KEY_PASSWORD` secrets. Play needs an **AAB**
  (`bundleRelease`) and Play App Signing (upload key vs app signing key). The
  report must explain how that fits with the existing keystore and with
  F-Droid. Is F-Droid's build signed by F-Droid or reproducible against the
  developer key? Check `fdroid/app.solyto.yml` and say what the answer means
  for users switching between stores. The report must not recommend touching
  the `signingConfigs` block or the secrets without flagging it.
- **Versioning:** `build-fdroid.sh` derives `versionCode` from root
  `package.json` (`MAJOR*10000+MINOR*100+PATCH`). Play needs a
  strictly increasing versionCode for each upload. iOS needs
  `CFBundleShortVersionString` plus a build number. Describe how both would
  derive from the same source.
- **Manifest:** has INTERNET permission only, `allowBackup="true"`, a SEND
  text/plain share intent, and a custom URL scheme VIEW intent. There is no
  GMS/Firebase. This matters for the Play Data safety form and target-API
  policy.
- **No iOS project exists.** iOS needs `@capacitor/ios`, `npx cap add ios`, a
  Mac with Xcode, CocoaPods or SPM, an Apple Developer Program membership,
  signing certs and provisioning profiles, App Store Connect, and TestFlight.
  The Android-native features in `MainActivity.java` (share intent →
  `/share?q=`, pull-to-refresh plugin, edge-to-edge) have no iOS equivalent
  yet. Sharing on iOS would need a Share Extension.
- **Account deletion (likely blocker):** the app supports in-app
  registration (`frontend/src/routes/auth/register`, `apiRoutes.auth.register`).
  The analyst found **no account-deletion endpoint** in
  `frontend/src/lib/config/apiRoutes.ts` (`users.*`) and nothing in
  `routes/profile`. Both Google Play (in-app deletion plus a web deletion URL)
  and Apple (guideline 5.1.1(v)) require account deletion. That work belongs
  to the backend and the canonical `../app` repo, not to this repo. Verify
  this finding before stating it in the report.
- **Apple-specific review risks to assess:** guideline 4.2 (minimum
  functionality / WebView wrappers); 4.8 (Sign in with Apple, probably not
  required because login is email/password + passkeys only, so confirm);
  passkeys/WebAuthn inside WKWebView (associated domains for `my.solyto.app`);
  the user-configurable custom API URL (self-hosting, `platform.ts`); the
  user-supplied OpenAI API key setting (`updateOpenaiApiKey`); web push in the
  service worker, which does not run under Capacitor's WKWebView; and export
  compliance (HTTPS-only encryption).
- **Shared store requirements:** a privacy policy URL; the Play Data safety
  form and Apple privacy nutrition labels (the data goes to the solyto API);
  content rating questionnaires; Play's closed-testing requirement for new
  personal developer accounts (verify the current tester count and duration);
  developer identity verification; store listing assets. Existing
  fastlane metadata (`fastlane/metadata/android/en-US`, 5 phone screenshots,
  icon) can probably be reused for Play. App Store screenshot sizes differ.
  The app has 4 UI languages (en/de/fr/es) but the listing is only in en-US.
- **Constraints:** the vendored-frontend rule applies (any JS change goes to
  `../app`, gated on `IS_MOBILE`/platform). `build-fdroid.sh` must stay
  offline and Node-20 compatible, so any Play/iOS build steps must not break
  it. Any change to `fdroid/app.solyto.yml` must be flagged. License is
  AGPL-3.0: assess whether Apple's App Store terms raise a GPL/AGPL
  compatibility concern (the copyright holder can distribute their own
  code, but third-party AGPL/GPL dependencies may matter). Present this as a
  risk with sources, not as legal advice.

## Task breakdown

TASK-1: Inventory the current build/release/distribution setup relevant to store publishing (APK vs AAB, signing flow, versioning, CI, F-Droid signing, manifest permissions, existing fastlane metadata) and write it up as a "current state" section.
  files (read-only): android/app/build.gradle, android/variables.gradle, android/app/src/main/AndroidManifest.xml, android/app/src/main/java/app/solyto/*.java, capacitor.config.json, package.json, scripts/build-fdroid.sh, scripts/release.sh, .github/workflows/release.yml, fdroid/app.solyto.yml, fastlane/metadata/android/**; output in docs/reports/play-store-and-app-store.md (new)
  depends: none
  risk: low. It is a read-only inventory; reading release.sh is fine but it must never be executed.

TASK-2: Verify app-level compliance prerequisites that both stores share: in-app account deletion (backend + `../app`), privacy policy URL, and what user data leaves the device (for Data safety / privacy labels). Mark each item present, missing, or unknown, and say which repo owns the fix.
  files (read-only): frontend/src/lib/config/apiRoutes.ts, frontend/src/lib/config/platform.ts, frontend/src/routes/profile/+page.svelte, frontend/src/routes/settings/+page.svelte, frontend/src/routes/auth/register/+page.svelte, frontend/src/service-worker.ts; output in report
  depends: none
  risk: medium. The account-deletion gap is probably a hard blocker for both stores and lives outside this repo, so state it carefully and verify it before asserting it.

TASK-3: Write the Google Play section as ordered steps: developer account type (personal vs organization), identity verification, and fees; the closed-testing requirement for new accounts; switching the build to AAB (`bundleRelease`); Play App Signing and upload key choices versus the existing keystore and F-Droid; target-API deadline policy; Data safety form; content rating; store listing (reuse fastlane metadata, localisation); release tracks; optional CI automation (e.g. fastlane supply / Gradle Play Publisher), flagged as touching secrets.
  files: docs/reports/play-store-and-app-store.md
  depends: TASK-1, TASK-2
  risk: medium. Google's policies (testing requirements, verification, target API) change often, so cite official sources with access dates and do not assert anything from memory.

TASK-4: Write the Apple App Store section as ordered steps: Apple Developer Program enrolment (individual vs organization, D-U-N-S, fee); Mac/Xcode requirement; adding `@capacitor/ios` and `npx cap add ios` (describe only, do not run); bundle ID `app.solyto`, certificates/profiles, capabilities (associated domains for passkeys); iOS ports of the Android-native features (share extension, pull-to-refresh, safe areas); versioning; App Store Connect record, privacy labels, age rating, export compliance; TestFlight; App Review; CI options (Xcode Cloud / fastlane on macOS runners).
  files: docs/reports/play-store-and-app-store.md
  depends: TASK-1, TASK-2
  risk: high. This is the largest unknown: there is no iOS project, it needs Mac hardware, and guideline 4.2 rejection of WebView wrappers is a real risk. Present it as risks and options, not as certainty.

TASK-5: Assess cross-cutting risks and constraints: guideline 4.2/minimum functionality and how solyto's feature set argues against it; AGPL-3.0 vs App Store terms (with sources, not legal advice); custom API URL / self-hosting and user-supplied OpenAI key under review rules; web push not working in WKWebView/Android WebView; keeping `build-fdroid.sh` offline/Node 20 and F-Droid unaffected; vendored-frontend workflow for any JS changes; whether any `fdroid/app.solyto.yml` change is needed (flag it).
  files (read-only): scripts/build-fdroid.sh, scripts/vendor.sh, fdroid/app.solyto.yml, LICENSE, frontend/src/lib/config/platform.ts; output in report
  depends: TASK-3, TASK-4
  risk: medium. Licensing and review-guideline interpretation are judgement calls, so they must be framed as risks for the maintainer to decide.

TASK-6: Assemble the final report `docs/reports/play-store-and-app-store.md`. It should contain: a summary (blockers first), current state (TASK-1), shared prerequisites (TASK-2), a Google Play step list (TASK-3), an App Store step list (TASK-4), risks/constraints (TASK-5), a phased plan (e.g. fix blockers → Play closed testing → Play production → iOS project → TestFlight → App Store), costs and accounts needed, a work split by repo (this repo / `../app` / backend), open questions for the maintainer, and dated sources. Follow the style of `docs/reports/android-homescreen-widgets.md`.
  files: docs/reports/play-store-and-app-store.md (new)
  depends: TASK-1, TASK-2, TASK-3, TASK-4, TASK-5
  risk: low. It is documentation only, with no build or runtime impact.

## Unclear / for the maintainer

- The brief has no "Why" or "Out of scope". The analyst assumes the report
  covers *steps only* and implements none of them (no AAB build, no iOS
  scaffold, no CI changes).
- Whether the developer account(s) are personal or organization accounts
  (this affects Play's testing requirement and Apple's D-U-N-S requirement) is
  unknown. The report should cover both paths.
- Whether a Mac is available for iOS builds is unknown. The report should
  cover local Xcode as well as hosted macOS CI.
- Whether the app stays free with no in-app purchases is assumed (the brief
  says "free"). If donations or paid tiers are planned, Apple 3.1.1 /
  Play Billing rules apply, and the report should note this as an open
  question.
- The report filename `play-store-and-app-store.md` was chosen by the
  analyst. The brief only says `docs/reports/`.
