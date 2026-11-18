# Implementation: notebook search

id: next
developer: developer
date: 2026-11-16

## Summary

Notebook search modelled on the library search: same glass input, Ctrl+F to open, Escape to close, circle-x close button. Unlike libraries, the notebook view is not filtered. Once a term is typed, the bar grows into a box listing matching notes (title + folder). Click a result, or move with ArrowUp/ArrowDown and press Enter, to open that note. All keys go through `KeyManager`. Matching lives in a pure, tested service, and search state lives in `NotesSvelte`.

## Changes

TASK-1: `ArrowUp`/`ArrowDown` added to `SupportedKey`/`PrimaryKey` (`types/keydown.ts`) and to the handler map and primary keys in `KeyManager.svelte.ts`. The arrow cases in `KeyManager.test.ts` now cover all four arrows.

TASK-2: New `services/NoteSearchService.ts` with `search(notes, term, limit)`. It trims the term and matches case-insensitively. It searches the title and the plain-text content: tags are replaced by a space so words in separate blocks are not joined, and common entities are decoded. Title matches come first, and the result is capped at `limit`. Tests are in `tests/unit/services/NoteSearchService.test.ts` and cover tag/attribute names not matching, block boundaries, entities, ordering, the limit, and empty or whitespace terms.

TASK-3: `Notes.svelte.ts` gains `searchVisible`, `searchTerm`, `searchResults`, `searchIndex`, `SEARCH_RESULT_LIMIT = 10`, and the methods `openSearch()`, `closeSearch()`, `search()` (runs over `getVisibleNotes()`, so journal entries are excluded), `moveSearchSelection(delta)` (clamped) and `openSearchResult(note = highlighted)` (selects the note, clears the search, `goto`). No `$derived`/`$effect`. Store tests were added to `tests/unit/stores/Notes.test.ts`.

TASK-4: New `components/notes/NoteSearch.svelte`. `routes/notes/+layout.svelte` renders it only while `notes.searchVisible` is true. The component registers Escape/ArrowUp/ArrowDown/Enter with priority 0 on mount and releases them in `onDestroy`, so its lifecycle tracks open and closed and there is no effect watching the store. The layout registers Ctrl+F and ignores it while the create modal or the delete confirmation is open. That second guard is why Ctrl+F lives in the layout: `pendingDelete` is layout-local state. The layout wrapper got `relative` so the overlay can be positioned. Deviation from the task text: Ctrl+F is registered in the layout rather than in `NoteSearch`, so that the parent decides whether the search renders (STANDARDS §3.3, §5.4).

TASK-5: New `components/notes/SearchNoteButton.svelte`, styled like the neighbouring `AddNoteButton`/`AddFolderButton`. It is added to the desktop nav's top-right group and to the mobile root header. On mobile it closes the slide-in panel first.

TASK-6: New key `notes.no_search_results` in `en.ts` and `types/translation.ts`. No placeholder string was added, matching the library input. No translator agent was callable in this session, so I wrote de/es/fr/it/ru myself following `docs/I18N.md`. They should be reviewed.

TASK-7: `npm run check` has 0 errors and 0 warnings. `npm run lint` is clean. The §9 grep shows only pre-existing hits. `npm test` passes 1532 tests with 1 failure, which is pre-existing and unrelated (see below).

## Rework (after review)

- Search keys only act while focus is in the search box. `NoteSearch` registers Escape/arrows/Enter only after the input has focus. It closes, and releases the keys at once, when focus leaves the search container (`focusout` with `relatedTarget` outside it). Result buttons call `preventDefault` on `mousedown`, so the input keeps focus and the click still lands. Clicking into the editor or the title input now closes the search instead of taking over Enter and the arrows.
- Ctrl+F is ignored while `NoteHeader`'s delete confirmation is open. That flag moved from local state in `NoteHeader` to `notes.deleteNoteModalOpen`, so the layout can read it.
- Unverified in a browser (no API reachable): the focus-out behaviour on touch devices (tapping a result relies on the synthetic `mousedown`).

## Known issues / follow-ups

- `tests/unit/stores/Contacts.test.ts > load > loads hidden state, books, contacts and photos` fails on this branch without any change of mine to contacts. It comes from the last main commit 68c6b8c (contact photo refetching).
- Not rendered with `shot`: no API was reachable at `localhost:8000`, so `/notes` redirects to login. Layout, z-index against the mobile header, and the three-button row at `min-w-72` are unverified visually.
- `SearchNoteButton` is a third near-copy of the round notes buttons (§1.6). Merging them into one icon-button component would be a separate cleanup.
- These analyst decisions stand as written: content search plus title, journal entries excluded, folder name shown, cap of 10.
