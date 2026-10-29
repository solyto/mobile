# Brief: notebook journal

type: feature
id: exist
branch: feature/exist_notebook-journal
date: 2026-10-10
author: Leander Muskalla

## What

Build the Journal surface in the notebook so the daily-journal mechanic the API
now supports is usable in the app. The API provisions one hidden, system-owned
folder per user (`title = '.journal'`, `is_system = true`, `is_hidden = true`,
root-level); the notebook must present it as a special day-based interface
rather than a normal folder.

Notable changes:

- **Mirror the new API contract.** Add `is_system` / `is_hidden` to the
  `NoteCategory` type and the `PATCH /notes/categories/{id}/hidden` endpoint to
  `apiRoutes.notes`, so the client can identify the journal folder by its system
  flag and toggle hidden.
- **Journal navigation entry.** Add a **Journal** destination to the notebook
  navigation (desktop sidebar and mobile notebook drawer), beside Favorites. It
  opens the journal interface and is never an expandable folder of notes.
- **Journal interface.** Provide **Today**, **Yesterday** and **Other**
  (datepicker into the archive). Opening a day resolves that day's entry by the
  title convention (`YYYY-MM-DD` via `getUrlFormat`) inside the journal folder,
  creating it on first open, and hands it to the existing note editor. No note
  list — days, not names.
- **Day reach.** From the notebook, only today and earlier are reachable; future
  days are not selectable. The archive datepicker marks days that already have
  an entry.
- **Keep the journal out of ordinary notebook surfaces.** Journal entries must
  not appear in the category tree, the notebook overview (newest / favorites /
  last-updated), the no-category list, or the mobile notebook lists.
- **i18n and tests.** All four locales in sync; extract any pure
  day/entry-resolution logic into a testable service, following the repo's
  existing `src/lib/services/` pattern.

## Why

Users have no home for day-based writing: notes are name-addressed folders, not
days. The journal gives one durable, always-present place to open today and
write, reach yesterday for retroactive entries, and browse older days — the
anchor of the connectivity direction.

## Out of scope

- **Backend/API work.** The journal folder, its flags, `is_system` immutability
  and the hidden toggle already shipped in the API job
  (`home_notebook-journal-folders/`); this job consumes that contract.
- Calendar day-marks / check-in linking (direction step 2) and the planner.
- A journal-specific note endpoint or a date field on notes — entries stay
  ordinary notes addressed by the title convention.
- Adopting or renaming pre-existing `.journal` folders; recursive/descendant
  hiding; search over journal entries.
- Exposing the hidden toggle for ordinary folders in the UI (the endpoint is
  wired, but only the journal uses it in this job).

## Notes

- Journal identity is the folder's `is_system` flag, not its title, so a rename
  (which the API forbids anyway) can't break the interface. Resolve the folder id
  from `GET /notes/categories` and keep it out of the rendered tree.
- The date convention is `getUrlFormat` (`YYYY-MM-DD`), the same as check-in;
  entry titles equal the date. `NoteExportService` already exports the journal
  folder — nothing to change there.
- The dashboard's recent-notes widget reads `GET /notes/newest`, which the API
  already filters; the notebook overview is computed client-side from
  `GET /notes` and must be filtered here.
- UI decisions the direction leaves open, to settle during implementation:
  today opens write-ready, a past day opens the same editor read-first (no forced
  focus); the datepicker marks days with entries and disables future days. These
  are not blockers.
- Route/naming is a developer choice; the check-in date route
  (`/check-in/date/[date]`) is a close precedent if a date-addressed route fits.
- Verify with `npm run check`, `npm run lint`, `npm test`; keep the four i18n
  tables in sync (`npm run check` enforces it) and add unit tests for any
  extracted day/entry-resolution logic.