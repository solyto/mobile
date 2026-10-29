# Brief: 23 Hidden note categories from their own endpoints

type: feature
id: mixture
branch: feature/mixture_23-hidden-note-categories-from-their-own-endpoints
date: 2026-10-14
author: Leander Muskalla

## What

The API (`solyto/api` `b34ec21`) no longer returns hidden or system note categories in the plain lists:

- `GET notes/categories` leaves out every category with `is_hidden` or `is_system` set, and every descendant of one. That includes `.journal`.
- `GET notes` leaves out the notes in those categories. `GET notes/newest` uses the same rule.
- New `GET notes/categories/hidden` returns the left-out categories as a tree (same `NoteCategory` shape).
- New `GET notes/hidden` returns the left-out notes (same `Note` shape).

The `Notes` store still finds `.journal` in the plain categories list (`src/lib/state/Notes.svelte.ts:98-103`, `src/lib/services/JournalService.ts:9-11`) and journal entries in the plain notes list. Once the API is deployed, the journal is empty and new entries can't find their category.

Add both routes to `apiRoutes.notes`, load them in the `Notes` store next to the plain lists, and merge them in so the journal works as before. Hidden user folders (`is_hidden`) must keep behaving as they do today.

## Why

API rule 13.3: new kinds of data are opt-in, so the 1.0.15 app (F-Droid) no longer sees `.journal`. The current frontend `main` is unreleased and has to switch before its first release. The web frontend deploys in lock-step with the API, so this ships together with the API change.

## Out of scope

UI changes to how hidden folders are shown. Note export, event attachments.

## Notes

Breaking: blocks the next API deploy. Check which callers rely on `categories`/`notes` containing hidden items (journal, category tree, search, newest) before deciding where to merge. Tests for any merge logic that ends up in `JournalService` or another pure service. Safety: tests, `check`, plus a manual run of journal create/open, hidden folder toggle, and the notes navigation.
