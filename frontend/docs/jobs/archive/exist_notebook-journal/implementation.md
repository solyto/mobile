# Implementation: notebook journal

id: exist
developer: opencode (deepseek-v4-flash)
date: 2026-10-10

<!-- Produced by @developer after implementation. -->

## Summary

Built the notebook Journal surface on top of the API contract from the brief:

- Mirrored the new contract (`is_system`/`is_hidden` on `NoteCategory`, the
  hidden-toggle route).
- Extracted the pure day/entry resolution into a new tested `JournalService`.
- Taught the `Notes` store about the system journal folder: it is resolved from
  the loaded categories, held separately, and excluded from every ordinary
  notebook surface.
- Added a **Journal** entry to the desktop sidebar and the mobile notebook
  drawer, beside Favorites.
- Added a day-based journal interface (Today / Yesterday / Other) at
  `/notes/journal` that resolves the day's entry by the `YYYY-MM-DD` title
  convention, creates it on first open, and hands it to the existing note
  editor. The archive picker marks days that already have an entry and disables
  future days.
- Added the journal strings to all four locales and unit tests for the new
  service and store behaviour.

## Changes

TASK-1 — API contract:
- `src/lib/types/note.ts`: added required `is_system` / `is_hidden` to
  `NoteCategory`.
- `src/lib/config/apiRoutes.ts`: added
  `notes.updateCategoryHidden` (`PATCH /notes/categories/%d/hidden`).
- `tests/unit/stores/Notes.test.ts`: the `category()` factory now provides the
  two new required flags (type fallout only).

TASK-2 — pure logic:
- `src/lib/services/JournalService.ts` (new): `findJournalCategory` (by the
  `is_system` flag, root or child), `getEntryTitle` (via `getUrlFormat`),
  `isEntryTitle`, `findEntry`, `getEntryDates` and `isReachable` (day-granularity
  today-and-earlier check).
- `tests/unit/services/JournalService.test.ts` (new): 17 unit tests.

TASK-3 — Notes store:
- `src/lib/state/Notes.svelte.ts`: added `journalCategory` state and
  `journalService`; `loadCategories()` now splits the system folder out of the
  rendered tree; `getVisibleNotes()`/`getNotesForCategory`/`getNewestNotes`/
  `getLastUpdatedNotes`/`getFavorites` exclude journal notes; added
  `isJournalNote`, `getJournalEntry`, `getJournalEntryDates` and
  `openJournalEntry` (resolve-or-create then set `activeNote`).
- `src/routes/notes/+page.svelte`: the notebook-overview empty state now uses
  visible notes so a journal-only notebook does not render a blank overview.
- `tests/unit/stores/Notes.test.ts`: 8 new tests covering resolution,
  create-on-first-open, the error/no-folder paths and the exclusions.

TASK-4 — i18n:
- `src/lib/types/translation.ts` + `en/de/es/fr`: added `journal`, `today`,
  `yesterday`, `other`, `journal_empty`, `journal_create_error`.

TASK-5 — navigation:
- `src/lib/config/urls.ts`: added `urls.journal = '/notes/journal'`.
- `NoteNavigationDesktop.svelte` / `NoteNavigationMobile.svelte`: added a
  Journal destination beside Favorites as a plain link (never an expandable
  folder); the mobile root list and the desktop no-category/empty checks now use
  the journal-aware getters.

TASK-6 — interface:
- `src/routes/notes/journal/+page.svelte` (new): Today / Yesterday / Other
  buttons; opens the selected day through the store; renders the existing
  `TipTapEditor`; waits for notes + categories to load before resolving today.
- `src/lib/components/notes/journal/JournalHeader.svelte` (new): date-aware
  heading (Today/Yesterday/formatted date) plus Save.
- `src/lib/components/notes/journal/JournalArchivePicker.svelte` (new): month
  grid built on the existing `getCalendarMonth` helper; marks days with an entry
  and disables future days; cannot advance past the current month.
- `src/lib/components/notes/editor/TipTapEditor.svelte`: added an optional
  `autofocus` prop so Today opens write-ready while past days open read-first.

TASK-7 — verification: see below.

## Review follow-up (verdict NEEDS WORK)

TASK-3 rework — journal leak into the notebook overview under concurrent
`load()`/`loadCategories()`:
- `src/lib/state/Notes.svelte.ts`: `loadCategories()` now re-snapshots
  `newestNotes`/`lastUpdatedNotes`/`favoriteNotes` after resolving
  `journalCategory`, so the overview is excluded regardless of whether `load()`
  or `loadCategories()` resolves first (the `+layout.svelte` `Promise.all`
  race the reviewer flagged).
- `tests/unit/stores/Notes.test.ts`: added a test that runs `load()` before
  `loadCategories()` (the worst-case order), asserts the raw snapshot leaks the
  journal entry beforehand, and that the three fields are filtered afterwards.

## Known issues / follow-ups

- **Archive picker is a custom component, not the `DatePicker` wrapper.** The
  pinned `@svelte-plugins/datepicker` (1.0.11) can disable future days
  (`enableFutureDates`) but has no way to mark days that already have an entry —
  it only exposes `enabledDates`/`disabledDates`, and day cells are rendered by
  the library with no per-date hook. The task list explicitly allowed "a small
  extension or an alternative"; the archive picker is therefore a small custom
  month grid built on the repo's existing `getCalendarMonth` helper, giving full
  control over marking and disabled days. `DatePicker.svelte` was left untouched.
- **`npm run lint` fails on the branch before this change** (pre-existing):
  `prettier --check` flags ~252 files and `eslint` reports ~292 errors
  (`svelte/no-navigation-without-resolve`, unused imports, ...). Every file
  changed here except the new ones was already on that list; the added lines are
  prettier- and eslint-clean. `npm run format` was deliberately not run
  repo-wide (it would reformat hundreds of unrelated files). The one eslint error
  in a touched file (`NoteNavigationMobile.svelte`, unused `fade` import) is
  pre-existing and left untouched.
- **`npm test` has one pre-existing failure** unrelated to this job:
  `tests/components/logic-leaves.test.ts > StatisticWidget > applies the
  requested color classes`. All other 748 tests pass (25 of which are new here).
- **No rendered/visual verification.** The app is a client-only SPA behind auth
  and has no local backend in this worktree, so `shot` would only capture the
  login redirect. Verification was done with `npm run check` (0 errors / 0
  warnings), `npm run build` (succeeds, journal route emitted) and `npm test`.
- The hidden-toggle route is wired (TASK-1) but unused, per the analyst's note
  that no journal UI consumes it in this job.
