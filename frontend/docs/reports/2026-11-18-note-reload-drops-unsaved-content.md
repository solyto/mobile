# Report: starring or renaming an open note silently drops its unsaved text on the next save

Date: 2026-11-18
Scope: `load()` / `selectNote()` and the mutation methods of
`src/lib/state/Notes.svelte.ts`, as used by `src/routes/notes/[id]/+page.svelte`,
`NoteHeader.svelte`, `NoteTags.svelte` and `editor/TipTapEditor.svelte`.
Method: read the code at `53eb6e3`, then reproduced the store behaviour with a
throwaway Vitest store test (mocked `ApiService` returning fresh objects per request,
like the real API). The test was not committed. Not reproduced in a browser.

**Overall: a deterministic data-loss bug in notes, plus a performance cost on every
save.** Every note edit reloads all notes (on purpose, see the library brief from
2026-11-17). For the open note, the reload swaps `activeNote` for the server copy
while the editor keeps showing the user's unsaved text. The next Ctrl+S then saves
the server copy and reports "Saved".

---

## 1. Finding: the reload replaces the open note's content (verified in a store test)

How the pieces fit:

- `/notes/[id]` renders the editor inside `{#key notes.activeNote.id}`
  (`+page.svelte:14`). The editor is only remounted when the **id** changes.
- `TipTapEditor` reads `activeNote.content` once on mount and from then on writes
  every keystroke back: `onUpdate → notes.activeNote.content = e.getHTML()`
  (`TipTapEditor.svelte:110-114`). The editor is the source of truth for content.
- `changeTitle`, `updateFavoriteStatus`, `addTag`, `removeTag`, `dragToCategory` and
  `saveContent` all end with `await this.load()`.
- `load()` → `checkUrlForActiveNote()` → `selectNote(page.params.id)` →
  `this.activeNote = this.notes.find(...)`: a **new object** holding the server's
  content (`Notes.svelte.ts:75-105, 214-216`).
- Same id, so the editor is not remounted and still shows the user's text.
  `activeNote.content` now holds the old server text.

Repro (store test, result in brackets):

1. Open note `n1` (server content `<p>old</p>`), type a paragraph
   (`activeNote.content = '<p>old</p><p>typed</p>'`).
2. Click the star (`updateFavoriteStatus`) or rename the note (`changeTitle`), or
   add/remove a tag.
3. `activeNote.content` is now `<p>old</p>` [verified for favorite and title].
4. Press Ctrl+S without typing again: `saveContent()` sends `<p>old</p>`. The user
   gets "Saved", and the paragraph is gone after the next page load.

Typing one more character before saving re-syncs `activeNote.content` from the editor
and hides the bug, so it shows up only sometimes. That makes it hard to report.

Same race on a plain save: keystrokes typed while the PUT and the two GETs are in
flight are overwritten in `activeNote.content` when `load()` finishes. They come back
only with the next keystroke. In the test, text added during the PUT was lost from
`activeNote.content` after `saveContent()` returned [verified].

Not affected: `/notes/journal/[date]`. `page.params.id` is unset there, so
`checkUrlForActiveNote()` does not swap `activeNote`.

## 2. Finding: every Ctrl+S re-downloads every note's full content (verified in code)

`saveContent()` = `PUT /notes/{id}`, then `load()` = `GET /notes` + `GET /notes/hidden`
in parallel. `Note.content` is part of the list payload (`types/note.ts:6`), so each
save transfers the HTML of **all** notes, including inline images. TipTap's `Image`
extension is enabled and pasted images are read with `readAsDataURL`
(`TipTapEditor.svelte:78-80`). One pasted screenshot can make every later save of any
note download several MB. The loading bar runs until both lists arrive.

The owner decided on 2026-11-17 (library brief, "Out of scope") that the full reload
after every edit stays on purpose. So this report does **not** propose dropping it. It
is listed to size the cost and because the fix in §3 keeps working however the reload
evolves. A later API-side option (a list endpoint without `content`, with content
loaded per note) would cut the payload. That needs a decision in the API repo, so it
is out of scope here.

## 3. Suggestion

Keep the reload. Once the editor has mounted a note, the reload must not overwrite
that note's content, because nothing can push the reloaded content into the editor
anyway. In `selectNote()`:

```ts
selectNote(noteId: string): void {
	const localContent = this.activeNote?.id === noteId ? this.activeNote.content : null;
	this.activeNote = this.notes.find((n) => n.id === noteId) ?? null;
	if (this.activeNote !== null && localContent !== null) this.activeNote.content = localContent;
}
```

- Title, favourite, tags and `updated_at` still come fresh from the server. Only
  `content` of the already-open note is carried over.
- Because `activeNote` is the proxied object from `this.notes`, the list entry (search,
  "last updated") gets the local content too, which matches what the user sees.
- Selecting a *different* note is unchanged (`localContent` is `null`).
- Edited in another tab: today the reload pulls the other tab's text into
  `activeNote` while the editor shows yours, and Ctrl+S silently saves the other
  tab's text. With the fix, what you see is what gets saved. Last writer still wins,
  as before.

A minimal change in one method, no new abstraction, no API change, no i18n.

## 4. Tests

In `tests/unit/stores/Notes.test.ts`, with `api.list` returning **fresh** note objects
per call. With the existing `mockLists()`, the same object comes back every time, so
the mutation leaks into the "server" copy and hides the bug. I hit this while
reproducing.

- Open `n1`, set `activeNote.content`, call `updateFavoriteStatus` / `changeTitle` /
  `addTag`: `activeNote.content` keeps the local value. `is_favorite` / `title` /
  `tags` show the server value.
- `saveContent()` where content changes during the pending `api.update`: afterwards
  `activeNote.content` is the latest local value.
- `selectNote()` for a different id takes that note's server content.

## 5. Risk

Low. The only behaviour change is that a reload no longer overwrites the content of
the note that is open in the editor. Nothing else writes `content` to the server
except `saveContent()`. The mobile list (`NoteNavigationMobile.svelte:168, 244, 282`)
calls `selectNote(note.id)` on tap. Tapping the note that is already open now keeps
the local content, which is the desired behaviour. Any other id behaves as before.
