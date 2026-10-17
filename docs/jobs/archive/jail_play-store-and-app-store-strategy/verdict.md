# Verdict: play store and app store strategy

id: jail
reviewer: @reviewer
date: 2026-10-17

## Review

Branch `report/jail_play-store-and-app-store-strategy`, diff against `main`.
Only two kinds of file changed: the new report
`docs/reports/play-store-and-app-store.md` and the job files under
`docs/jobs/jail_.../`. No code, Gradle, manifest, `patch/`, `frontend/`,
`fdroid/`, `fastlane/`, CI or signing files were touched. That matches the
report-only scope in tasks.md. I checked the report's repo claims against
the code (see the notes for each task). External policy facts (fees, Play
testing rules, Apple deadlines) can't be checked offline. The report cites
each one with a URL and the access date, as tasks.md asked.

TASK-1: PASS
notes: §2 matches the repo. `buildTypes.release` uses
`signingConfigs.release` (build.gradle:33), so the claim that
`bundleRelease` needs no Gradle change holds. `fdroid/app.solyto.yml` has
no `Binaries`/`AllowedAPKSigningKeys`, so F-Droid signs with its own key.
The versionCode formula matches `build-fdroid.sh`. The SDK levels (24/36/36)
and the manifest (INTERNET only, allowBackup, SEND, VIEW, FileProvider) are
correct. I measured the screenshots: 518×1149, PNG colour type 6 (RGBA). The
icon is 512×512. The description lengths are 60/1697 characters, and there
is one changelog (10012).

TASK-2: PASS
notes: I confirmed the account-deletion gap. `apiRoutes.ts` `users.*` has
no delete route, and grepping `frontend/src` for deletion terms finds
nothing. `urls.ts` reads `PUBLIC_PRIVACY_URL`/`PUBLIC_LEGAL_NOTICE_URL`.
`build-fdroid.sh` sets only `PUBLIC_MOBILE`, `PUBLIC_VERSION` and
`PUBLIC_REDIRECT_AFTER_LOGOUT`, so P4 is correct. Each item is marked
present, missing or unknown and names the repo that owns the fix. There is
a data-flow inventory for Data safety and the privacy labels.

TASK-3: PASS
notes: Steps G1–G11 cover everything tasks.md lists: account types and fees,
closed testing, AAB, signing options A/B/C, target API, Data safety and
content rating, listing reuse and localisation, tracks, and CI. Signing and
new secrets are clearly flagged (G5, G11). Every policy fact has a dated
source.

TASK-4: PASS
notes: Steps A1–A11 cover enrolment, Mac/Xcode, `@capacitor/ios` (described
only, with the package install marked as needing approval), the bundle ID,
certificates and associated domains, a native-feature port table,
versioning, App Store Connect metadata (privacy labels, age rating, export
compliance), TestFlight, review, and CI. The uncertainties (whether
Capacitor 7 builds with Xcode 26, passkeys in WKWebView) are presented as
risks and open points. The repo claims hold: `isNativePlatform` is used in
`routes/share`, and `app.html` has no `viewport-fit=cover`.

TASK-5: PASS
notes: §6 covers 4.2, UGC, self-hosting and the OpenAI key, push, keeping
F-Droid and `build-fdroid.sh` safe, developer verification, AGPL (with
sources and a not-legal-advice framing), the vendored-frontend workflow, and
fdroid yml changes (flagged). I verified two claims: `ConfigureAiTokens` is
not imported anywhere, and every commit in this repo is by one author.

TASK-6: PASS
notes: The report has every section tasks.md requires: summary with
blockers first, current state, prerequisites, Play steps, Apple steps,
risks, phased plan, costs, work split by repo, open questions, and dated
sources.

## Security

None run. This is a documentation-only change, and it contains no secrets.

## Overall

APPROVED

No blockers. The report is complete and in scope, and every repo claim I
checked is accurate.
