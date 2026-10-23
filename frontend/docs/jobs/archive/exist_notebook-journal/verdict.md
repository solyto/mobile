# Verdict: notebook journal

id: exist
reviewer: reviewer (deepseek-v4-flash)
date: 2026-10-10

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

This is a re-review after the previous NEEDS WORK verdict
(`26e59dc`). The single blocking item (TASK-3 journal leak under concurrent
`load()`/`loadCategories()`) has been addressed in `4110d92`.

TASK-1: PASS
notes: `is_system`/`is_hidden` added to `NoteCategory`
(`src/lib/types/note.ts:33-34`) and `updateCategoryHidden`
(`PATCH /notes/categories/%d/hidden`) wired in `src/lib/config/apiRoutes.ts:88`.
Test factories updated for the new required fields. Matches the contract.

TASK-2: PASS
notes: `src/lib/services/JournalService.ts` is pure: `findJournalCategory` by
`is_system` (root and child), `getEntryTitle` via `getUrlFormat`, `isEntryTitle`,
`findEntry`, `getEntryDates`, `isReachable`. Covered by 17 tests in
`tests/unit/services/JournalService.test.ts`. Non-blocking: `isReachable` is not
consumed in production (the picker re-implements the future check locally); the
requirement itself is met.

TASK-3: PASS
notes: The store resolves the journal folder out of the loaded categories and
keeps it out of the tree (`Notes.svelte.ts:89-104`), and excludes journal notes
from `getVisibleNotes`/`getNotesForCategory`/`getNewestNotes`/
`getLastUpdatedNotes`/`getFavorites`. The previous leak is fixed: `load()`
(`:59-69`) and `loadCategories()` (`:97-102`) both re-snapshot the three overview
fields, so the exclusion holds regardless of which `Promise.all` leg in
`src/routes/notes/+layout.svelte:73` resolves first. New regression test
`tests/unit/stores/Notes.test.ts:404-438` runs the worst-case order
(`load()` before `loadCategories()`), asserts the pre-fix leak
(`newestNotes` contains the journal entry), and that all three fields are
filtered afterwards. `isJournalNote` guards on `journalCategory !== null`, so
ordinary notes are never wrongly filtered. Create-on-first-open,
error path and no-folder path are covered.

TASK-4: PASS
notes: Six keys (`journal`, `today`, `yesterday`, `other`, `journal_empty`,
`journal_create_error`) added to `NoteRecords` (`translation.ts:389-394`) and to
all four locale tables (`en/de/es/fr`), no drift.

TASK-5: PASS
notes: Journal link added beside Favorites in both
`NoteNavigationDesktop.svelte:31-38` and `NoteNavigationMobile.svelte:70-77` as a
plain anchor (never an expandable folder); `urls.journal` added to `urls.ts`.
Desktop no-category/empty checks and the mobile root list now use the
journal-aware getters, so the folder and its notes cannot appear in the notebook
lists.

TASK-6: PASS
notes: `/notes/journal` (`src/routes/notes/journal/+page.svelte`) presents
Today / Yesterday / Other, resolves the selected day through `openJournalEntry`
(create-on-first-open) and hands it to the existing `TipTapEditor` — no note list.
A static route takes precedence over the sibling `[id]` route, so
`checkUrlForActiveNote()` sees no `id` param. `JournalArchivePicker` marks days
that have an entry, disables future days (lexicographic `YYYY-MM-DD` compare) and
cannot advance past the current month; weekday headers (Mon-first 1-7) line up
with `getCalendarMonth`. `autofocus={isToday}` gives today write-ready / past days
read-first (brief's open UI decisions). The custom grid was an allowed
alternative to the `DatePicker` wrapper.

TASK-7: PASS — reports only
notes: `npm run check`, `npm run build` and `npm test` (748 pass, 1 pre-existing
unrelated failure) are reported green; lint failure documented as pre-existing
repo-wide and not introduced here. I could not re-run these (session shell is
restricted to git), so this relies on the reported results plus reading; no new
verification gap beyond that.

Scope: every changed source file maps to a task. No unrelated refactors. The
`TipTapEditor` optional `autofocus` prop defaults to `false`, so all existing
call sites are unaffected. The notebook-overview getter swaps and empty-state
checks are in scope (brief: keep the journal out of the overview).

## Security

none — no auth, secret, or data-flow changes. The new route constant follows the
existing `%d` placeholder convention.

## Overall

APPROVED

No blockers. The prior TASK-3 leak is closed and test-locked. Non-blocking
observations (not merge blockers): `JournalService.isReachable` is only exercised
by tests, and `npm run lint`/`npm test` were not independently re-run in this
session.
