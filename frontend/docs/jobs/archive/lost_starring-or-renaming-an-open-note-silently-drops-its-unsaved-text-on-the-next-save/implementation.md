# Implementation: starring or renaming an open note silently drops its unsaved text on the next save

id: lost
developer: developer
date: 2026-11-18

## Summary

A notes reload no longer overwrites the content of the note that is open in the
editor. `selectNote()` carries the local `content` over when it re-selects the same
id; title, favourite, tags and timestamps still come from the server. Store tests
cover favourite/title/tag edits, the save race, and selecting a different note.

## Changes

TASK-1: `src/lib/state/Notes.svelte.ts` — `selectNote()` keeps `activeNote.content`
when the id is unchanged (the `load()` → `checkUrlForActiveNote()` path). One-line
why-comment: the editor is not remounted for the same id.
TASK-2: `tests/unit/stores/Notes.test.ts` — `mockServerNotes()` next to `mockLists()`,
returns `structuredClone`d notes per `api.list` call so local edits can't leak into
the "server" copy. `mockLists()` unchanged.
TASK-3: same file — `describe('reload of the open note')`: `updateFavoriteStatus`,
`changeTitle`, `addTag` keep the local content and show the server's
`is_favorite` / `title` / `tags`. Verified they fail against the old `selectNote`.
TASK-4: same file — `saveContent()` with a deferred `api.update` (pattern from
`Contacts.test.ts`): content typed during the pending save survives; the PUT carried
the pre-change content. Fails against the old `selectNote`.
TASK-5: same file — `selectNote()` for a different id takes that note's server content.
TASK-6: `npm test` (1670 passed), `npm run check` (0 errors/warnings), `npm run lint`
(clean). Checked against `docs/STANDARDS.md` (no `$derived`/`$effect`, sole comment
is a why-comment per 10.1, formatting per 1.10).

## Known issues / follow-ups

- The worktree had no `node_modules`; I ran `npm ci --ignore-scripts` (lockfile only,
  no dependency added) to run the checks.
- §2 of the brief (every save re-downloads all notes' content) stays out of scope;
  it needs an API-side decision.
