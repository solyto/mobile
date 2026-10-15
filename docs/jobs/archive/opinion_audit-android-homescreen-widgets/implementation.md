# Implementation: Audit: android homescreen widgets

id: opinion
developer: @developer
date: 2026-10-15

## Summary

This job produced one report, `docs/reports/android-homescreen-widgets.md`,
and no code, build, manifest, `patch/`, `frontend/` or `fdroid/` changes.

Verdict: widgets are feasible. The recommended approach is Java
`AppWidgetProvider` + `RemoteViews`. Start with a static shortcut widget,
then add a read-only "Your Day" widget fed by a snapshot that the web app
pushes over a small custom bridge, so the token never leaves the WebView.
Interactive widgets come only after the maintainer decides on the token.
The report lists these as recommendations and open questions; it does not
make the decisions.

## Changes

All tasks wrote to `docs/reports/android-homescreen-widgets.md` (new file;
the `docs/reports/` directory was created by writing it). Tasks 1–7 were
committed together in one commit because they are sections of a single
document.

TASK-1: §2 "Current state". Inventory of Java/AGP 8.13.0/Gradle 8.14.3,
SDK 24/36/36, AndroidX deps, Capacitor 7 with no npm plugins, the
`PullToRefreshPlugin` bridge pattern, manifest/intents, colours, strings
and tests.
TASK-2: §3. Comparison of RemoteViews (+ `core-remoteviews` backport),
Glance (1.2.0 stable, needs Kotlin + Compose compiler) and community
plugins (checked on npm with tarballs inspected; none fits Capacitor 7
well). Includes API 31 constraints.
TASK-3: §4. Three data/auth options (snapshot push, token handoff +
WorkManager, static), the token-refresh conflict, security-crypto
deprecation (verified from release notes) versus AndroidKeyStore, backup
rules, and privacy.
TASK-4: §5. Nine candidate widgets mapped to `apiRoutes` keys and routes,
with interaction needs and complexity for each data option.
TASK-5: §6. PendingIntent → `MainActivity` (`singleTask`,
`onCreate`/`onNewIntent`) → `loadUrl`, modelled on `handleShareIntent`,
with a route allowlist and `FLAG_IMMUTABLE`.
TASK-6: §7. Vendored workflow (`../app`, `IS_MOBILE`), F-Droid impact
(no `fdroid/app.solyto.yml` change for the recommended path; Glance is
flagged), i18n, theming, battery and testing.
TASK-7: Summary/verdict, phased plan, open questions and dated sources.

## Known issues / follow-ups

- Not verified (it would need a spike): whether
  `window.Capacitor.Plugins.<Name>` works for a custom plugin without
  `@capacitor/core` bundled in the web app. This is listed as an open
  question.
- Backend behaviour can't be determined from this repo: whether token
  refresh invalidates the old token, revocation, and token lifetime.
- Side observation, out of scope: the manifest declares a `VIEW
  app.solyto://` intent filter, but there is no native handler and no
  `@capacitor/app`, so these deep links only open the app and don't
  navigate anywhere. It may be worth checking whether the auth verify/reset
  deep links (`getDeepLinkUrl`) behave as intended.
