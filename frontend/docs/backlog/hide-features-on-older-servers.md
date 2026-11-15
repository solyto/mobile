# Backlog: hide features the server doesn't support yet

created: 2026-11-15

## What

Show a feature only when the server's API version supports it. Start with the
two features from 1.1.3:

- **External calendars:** the "Connected accounts" section in Manage calendars
  (`src/lib/components/calendars/ExternalAccounts.svelte`, loaded by
  `src/lib/state/ExternalCalendars.svelte.ts`).
- **OPML import:** the "Import OPML" entry in the feeds sidebar
  (`src/lib/components/feeds/FeedNavigation.svelte:121`) and its modal.

A possible shape:

- A small helper, e.g. `serverSupports(minVersion: string): boolean` in
  `src/lib/helpers/VersionHelper.ts`, that compares
  `ApiService.storedServerVersion()` with `minVersion` using the existing
  `compareVersions()`.
- One list of features with their minimum server version (e.g.
  `externalCalendars: '1.1.3'`, `opmlImport: '1.1.3'`), so later features only
  add an entry.
- Components check the helper and render nothing (or a short "needs a newer
  server" hint) when it returns false.

## Why

The web app and the API ship together, and self-hosters pull both images with
the same `SOLYTO_VERSION`. But the mobile and desktop apps update through
their stores, while a self-hosted server stays on its version until the admin
runs `make update`. Those users see features their server doesn't have:

- Manage calendars always shows "Couldn't load connected accounts", and
  "Connect calendar" ends in a generic error (the API returns 404).
- "Import OPML" opens, and the upload fails with "Something went wrong while
  importing".

Nothing crashes or loops (`refresh()` returns false on 404, no poller starts,
missing response fields fall back to defaults). The app warns about an older
server (`checkServer()` in `src/routes/+layout.svelte`), but only as a toast
for 20 seconds, once per server version, so it doesn't explain an error the
user runs into later.

This will repeat with every feature that needs a newer API. Found in the 1.1.3
release review (2026-11-15).

## Decisions

- Undecided: hide the feature completely, or show it disabled with a hint
  ("Available once your server is updated to 1.1.3").
- Undecided: what to do when the server version is unknown
  (`storedServerVersion()` returns null, e.g. `PUBLIC_VERSION` unset in a
  local build, or `/health` failed). Showing everything keeps today's
  behaviour for the web app.

## Notes

- `storedServerVersion()` is only set after `checkServerVersion()` succeeded
  for the current API URL, so the first render after login may not have it
  yet. Components should react when it changes.
- Also affects admin-only features, e.g. setting a dev request to "Waiting for
  Deployment" against a 1.1.2 API gives a 422.
- Check: with a server reporting 1.1.2, neither Connected accounts nor
  Import OPML is shown (or both are shown disabled with the hint); with 1.1.3
  both work as today.
