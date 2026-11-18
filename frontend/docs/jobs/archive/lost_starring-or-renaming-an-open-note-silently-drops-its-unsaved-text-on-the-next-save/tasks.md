# Tasks: starring or renaming an open note silently drops its unsaved text on the next save

id: lost
analyst: analyst
date: 2026-11-18

Branch verified: worktree HEAD is
`feature/lost_starring-or-renaming-an-open-note-silently-drops-its-unsaved-text-on-the-next-save`,
matching `brief.md`.

Scope is the brief's §3 fix and §4 tests. Out of scope (per brief): dropping the full
reload after edits, any API change for a content-less list endpoint (§2), the journal
route (`activeNote` is set directly there, not via `selectNote`). No UI strings, so no i18n.

## Task breakdown

TASK-1: Make `selectNote()` keep the local `content` of the open note when it selects that same id again (the reload path via `load()` → `checkUrlForActiveNote()`), while title, favourite, tags and timestamps still come from the server copy.
  files: src/lib/state/Notes.svelte.ts (`selectNote`, ~line 214)
  depends: none
  risk: low — one method and one field. Every caller (`checkUrlForActiveNote`, `openSearchResult`, the nav/overview/mobile renderers) either passes a different id, which works as before, or re-taps the open note, where keeping the local content is the behaviour we want.

TASK-2: In the Notes store test, add a list mock that returns fresh note objects on every `api.list` call, like the real API. The existing `mockLists()` hands back the same objects every time, which hides the bug. Keep `mockLists()` as it is for the existing tests.
  files: tests/unit/stores/Notes.test.ts
  depends: none
  risk: low — test-only helper. Keep it next to `mockLists()` and don't add a new shared abstraction in `tests/unit/setup/`.

TASK-3: Add store tests. With `n1` open and `pageState.params.id = 'n1'`, set a local `activeNote.content`, then call `updateFavoriteStatus`, `changeTitle` and `addTag` (one test each, or one parametrised test). After each, `activeNote.content` still holds the local value and `is_favorite` / `title` / `tags` hold the server values.
  files: tests/unit/stores/Notes.test.ts
  depends: TASK-1, TASK-2
  risk: low — tests only. They must fail without TASK-1, so run them against the old `selectNote` once.

TASK-4: Add a store test for the save race. `saveContent()` while `api.update` is pending (a deferred promise). Change `activeNote.content` before resolving it. After `saveContent()` resolves, `activeNote.content` is the latest local value and `api.update` was called with the value from before the change.
  files: tests/unit/stores/Notes.test.ts
  depends: TASK-1, TASK-2
  risk: low — tests only. Needs a manually resolved promise for `api.update`. Check `tests/unit/setup/storeMocks` and `docs/TESTING.md` for an existing pattern before writing one.

TASK-5: Add a store test: `selectNote()` with a different id than the open note takes that note's server content, not the previous note's local content.
  files: tests/unit/stores/Notes.test.ts (`describe('active note')`)
  depends: TASK-1
  risk: low — tests only. This pins down the behaviour that must not change.

TASK-6: Run `npm test`, `npm run check` and `npm run lint`. Check the change against `docs/STANDARDS.md` (no extra comments, no `$derived`/`$effect`, minimal diff).
  files: none (verification)
  depends: TASK-1..TASK-5
  risk: low — verification only.

## Open points

None blocking. One note for the developer: `create()` (line 337) and the journal branch
of `saveContent()` (line 412) assign `activeNote` directly and are not covered by the
fix. The brief does not include them: `create()` opens a new empty note, and on the
journal route the id changes from `''` to the new id, which remounts the editor. Leave
them unchanged.
