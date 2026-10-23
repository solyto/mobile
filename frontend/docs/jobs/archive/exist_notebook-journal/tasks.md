# Tasks: notebook journal

id: exist
analyst: analyst
date: 2026-10-10

<!-- Produced by @analyst from brief.md. -->

## Summary

Build the notebook Journal surface on top of the API contract the brief
describes: mirror the type/route contract, extract the pure day/entry
resolution into a tested service, teach the Notes store about the system
journal folder (and exclude it from ordinary notebook surfaces), add the
Journal navigation entry, and build the day-based journal interface with an
archive datepicker. i18n across all four locales and unit tests are part of
the work.

Branch check: brief declares `branch: feature/exist_notebook-journal`. The
worktree is mounted on the job branch (this session has no shell to run
`git branch --show-current`, so the check could not be repeated independently;
the workspace is a job worktree, which is on the job branch by construction).

## Task breakdown

TASK-1: Mirror the new API contract — add the `is_system`/`is_hidden` flags to
the `NoteCategory` type and wire the `PATCH /notes/categories/{id}/hidden`
endpoint into `apiRoutes.notes`.
files: src/lib/types/note.ts, src/lib/config/apiRoutes.ts
depends: none
risk: low — additive type fields plus one route constant, no behavior change.

TASK-2: Extract the pure day/entry-resolution logic into a new
`JournalService` (locate the journal folder by `is_system`, build the
`YYYY-MM-DD` entry title via `getUrlFormat`, find an existing entry among
notes, compute which days already have entries for archive marking), and cover
it with unit tests following the existing `src/lib/services/` + tests pattern.
files: src/lib/services/JournalService.ts (new),
       tests/unit/services/JournalService.test.ts (new)
depends: TASK-1 (reads `is_system`)
risk: medium — foundational logic the interface depends on; must be kept
purely functional and well tested.

TASK-3: Teach the Notes store about the journal — resolve the journal folder
from the loaded categories, exclude journal entries/folder from ordinary
surfaces (category tree, `getNewestNotes`/`getLastUpdatedNotes`/`getFavorites`,
`getNotesForCategory(null)`), and add a method to open a journal day
(resolve by title, create-on-first-open via `ApiService`, set `activeNote`).
Extend the existing store unit tests for the new behavior.
files: src/lib/state/Notes.svelte.ts, tests/unit/stores/Notes.test.ts
depends: TASK-1, TASK-2
risk: high — touches the shared `load()`/derived getters used by every
notebook surface; an over-broad filter would hide ordinary notes.

TASK-4: Add the journal i18n keys (Journal, Today, Yesterday, Other/archive,
datepicker labels, empty-day text, create/error messages as needed) to the
translation type and to all four locale tables (`en`, `de`, `es`, `fr`).
files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts,
       src/lib/i18n/es.ts, src/lib/i18n/fr.ts
depends: none
risk: low — mechanical, but `npm run check` fails if the four tables drift.

TASK-5: Add the Journal navigation entry beside Favorites in both the desktop
sidebar (`NoteNavigationDesktop.svelte`) and the mobile notebook drawer
(`NoteNavigationMobile.svelte`), linking to the new journal route and never
rendered as an expandable folder. Add the route to `urls.ts` if a
date-addressed route is used.
files: src/lib/components/notes/NoteNavigationDesktop.svelte,
       src/lib/components/notes/NoteNavigationMobile.svelte,
       src/lib/config/urls.ts
depends: TASK-3, TASK-4
risk: medium — two separate navigation variants; the mobile drawer level-1
list currently also enumerates categories/no-category notes that must not
include the journal.

TASK-6: Build the Journal interface — a route/component presenting Today,
Yesterday and Other (an archive datepicker), resolving the selected day's
entry through the store, creating it on first open and handing it to the
existing note editor (no note list). Restrict reach to today and earlier,
mark days that already have entries, and disable future days. Reuse the
existing `DatePicker` wrapper, extending it only if the pinned
`@svelte-plugins/datepicker` cannot mark/disable days through the current
wrapper.
files: src/routes/notes/journal/** (new), src/lib/components/notes/journal/**
       (new), src/lib/components/forms/DatePicker.svelte (only if extension
       needed)
depends: TASK-2, TASK-3, TASK-4
risk: high — the main new surface; interacts with loading/active-note state
and the editor, and the datepicker capability for marks/disabled days is not
confirmed in this repo.

TASK-7: Verification — run `npm run check`, `npm run lint` and `npm test` and
resolve any fallout.
depends: TASK-1 through TASK-6
risk: low — standard verification gate.

## Open questions / scope notes

- The brief wires the hidden-toggle endpoint "so the client can … toggle
  hidden" and says "only the journal uses it in this job", but no journal UI
  for toggling hidden is described (the API already provisions the folder
  hidden). TASK-1 wires the endpoint; no UI task consumes it. If a
  user-facing toggle is actually expected, that scope should be added
  explicitly rather than assumed.
- Route shape (`/notes/journal` vs a date-addressed `/notes/journal/date/[date]`
  like `check-in/date/[date]`) is left to the developer; the brief calls this a
  developer choice. TASK-5/TASK-6 assume a single journal route but do not fix
  the path.
- The `@svelte-plugins/datepicker` (v1.0.11) capability to mark days with
  entries and disable future days is not verifiable from this worktree
  (`node_modules` not present); if unsupported, the archive picker may need a
  small extension or an alternative. Flagged under TASK-6.
