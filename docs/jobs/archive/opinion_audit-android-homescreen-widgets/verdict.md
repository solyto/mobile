# Verdict: Audit: android homescreen widgets

id: opinion
reviewer: @reviewer
date: 2026-10-15

## Review

Review surface: `git diff main...HEAD` (no `.manigot/manigot.json`, so the
base is `main`). Apart from the job's own files, the only change is the new
`docs/reports/android-homescreen-widgets.md`. There are no code, Gradle,
manifest, `patch/`, `frontend/` or `fdroid/` changes, which matches the
report-only scope in tasks.md.

I spot-checked the report's factual claims against the repo, and all of
them hold:
- AGP 8.13.0, Gradle 8.14.3, SDK 24/36/36, Java 21, and the AndroidX dep
  versions
- `capacitor.settings.gradle` includes only `:capacitor-android`
- The manifest has a `singleTask` exported activity, three intent filters,
  `allowBackup="true"`, no receivers, and INTERNET as its only permission
- The native code is Java only (3 files) and has no `values-*` locale or
  `values-night` folders
- In `Auth.svelte.ts`, the localStorage key is `auth`, the refresh
  threshold is 14 days native / 5 days web, and refresh returns a new token
- In `platform.ts`, `custom_api_url` defaults to `api.solyto.app`
- The `apiRoutes` keys exist: `listWidgetEvents`, `notes.newest`,
  `quotes.getRandom`, time-tracking `start` and `stop`, `todos/due-date`
- The `/share` route redirects to `/` when `q` is missing
- The `/check-in/date` and `/notes/[id]` routes exist
- F-Droid uses `UpdateCheckMode: Tags`
- `YourDay.svelte` uses `filterByDueDate('today-overdue', …)`

TASK-1: PASS
notes: §2 is a complete and accurate current-state inventory.

TASK-2: PASS
notes: §3 compares RemoteViews (with the `core-remoteviews` backport),
Glance, and three community plugins. Versions, licences, Capacitor 7
compatibility and F-Droid fit are given with dates. It covers the API 31
constraints (`setCompoundButtonChecked`, `RemoteCollectionItems`, dynamic
colours) relative to minSdk 24.

TASK-3: PASS
notes: §4 compares the three required options (snapshot push, token
handoff with WorkManager, static). It covers the refresh conflict, the
deprecation of security-crypto in favour of AndroidKeyStore, backup rules
and privacy. Everything is presented as options, and the token decision is
left to the maintainer.

TASK-4: PASS
notes: §5 lists nine candidate widgets, each with its apiRoutes key,
interaction type, route, and a complexity rating for both data options.
They are presented as candidates only.

TASK-5: PASS
notes: §6 describes the flow PendingIntent → `onCreate`/`onNewIntent` →
`loadUrl`, modelled on `handleShareIntent`. It includes `FLAG_IMMUTABLE`,
distinct request codes, and a route allowlist because the activity is
exported.

TASK-6: PASS
notes: §7 covers the vendored `../app` workflow with the `IS_MOBILE` gate,
F-Droid impact (it flags `fdroid/app.solyto.yml` for the Glance path),
i18n, theming, battery and testing.

TASK-7: PASS
notes: The report contains every required section: verdict, phased plan,
open questions, and dated sources. One readability note, not a blocker:
inside §4 the data options are numbered 3.1–3.3, which overlaps with the
§3.1–3.3 headings for the technology options.

## Security

None. The change is documentation only. The report correctly surfaces the
token-copy risk as a maintainer decision.

## Overall

APPROVED. Nothing must change before merge.
