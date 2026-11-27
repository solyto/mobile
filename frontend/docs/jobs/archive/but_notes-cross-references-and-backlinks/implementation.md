# Implementation: notes-cross-references-and-backlinks

id: but
developer: charmaine
date: 2026-11-24

## Summary

Links between notes in the app: a toolbar picker and a `[[` shortcut insert `<a href="/notes/{uuid}">Title</a>`, a popup on any link offers Open / Edit / Remove, and the note page shows a "Linked from" list from `GET /notes/{id}/backlinks` (API contract: room decision "backlinks API contract"). UI follows carmine's `design.md`.

## Changes

TASK-1 (`4d1878a`): `@tiptap/suggestion` pinned at `3.32.0` (backlog decision 3). Its peer `@floating-ui/dom` was already installed via the bubble menu.

TASK-2 (`724bc9f`, `569d8a3`):
- `services/NoteLinkService.ts`: `noteIdFromHref` (relative or absolute `/notes/{uuid}`, trailing slash/query/fragment), `hrefForNote` (built from `urls.note`), `searchByTitle`.
- `types/note.ts` `NoteBacklink`, `apiRoutes.notes.backlinks`.
- `state/Notes.svelte.ts`: `hiddenNoteIds` (from `listHidden`), `searchLinkableNotes(term, limit)` (no journal, hidden or current note), `findNote`, `openNote`, `backlinks` + `loadBacklinks(noteId)` (cleared first; 403/404 leave it empty; a late response for another note is dropped).

TASK-3 (`32aeb68`): toolbar button (`file-symlink`) after the link button opens `NoteLinkModal` (ConfirmationModal `w-112`, one `TextInput`, results below). Inserts through `linkService.hrefForNote`; selected text becomes the link text. Shared pieces:
- `helpers/NotePicker.svelte.ts`: term / results / highlighted index, used by the modal and by `[[`.
- `notes/NoteResultRow.svelte`: the search result row, now shared by `NoteSearch` and the picker (STANDARDS 1.6).
- `notes/editor/NoteLinkList.svelte`: result list; registers ArrowUp/ArrowDown/Enter with `KeyManager` (priority 0) while mounted.
- New `en` keys `link_to_note`, `linked_from`, `link_open`, `link_edit`, `link_remove`; other locales by furio.

TASK-4 (`6761e83`): `notes/editor/NoteLinkSuggestion.ts` wraps `@tiptap/suggestion` (`char: '[['`, spaces allowed, any prefix). `NoteLinkSuggestionList.svelte` is positioned by the plugin's `mount` (fixed strategy) and reuses `NoteLinkList` (max 8). Keys have one owner: `KeyManager` handles them through `NoteLinkList`; the plugin's `onKeyDown` only returns `true` to stop ProseMirror moving the caret or splitting the line. Escape is the plugin's own exit and leaves the text.

TASK-5 (`2652474`): `notes/editor/LinkBubbleMenu.svelte`, a second bubble menu (`linkBubbleMenu` key), shown on `isActive('link') && !isActive('table')`. Label: note title, or link text in italics if the note is gone, or the hostname (`UrlHelper.hostnameOf`, new). Open: `notes.openNote(id)` for internal links, `<a target="_blank" rel="external">` with `safeHref` for external ones (none for unsafe URLs). Edit reuses `InsertLinkModal` (new `initialUrl` prop). Remove unsets the whole link. Mobile: 36px buttons, 18px icons, passed in as props. Internal links get a dotted underline in the editor. Review fix: `notes/editor/EditorPopover.svelte` is the shared off-screen root + container for both bubble menus and the `[[` list (STANDARDS 1.6), with no visual change. `EditorPopoverDivider.svelte` replaces `TableBubbleMenu`'s dead `toolbar-divider` class (no CSS, STANDARDS 1.8), so the table popup now shows its two dividers, like the link popup.

TASK-6 (`546375b`): `notes/NoteBacklinks.svelte` (props only) below the editor on `/notes/[id]`, shown only when not empty, links via `resolve(urls.note, …)`. Backlinks load in the page's `afterNavigate` from `page.params.id`. That covers every way a note is opened (sidebar, favourites, search, popup Open, "Linked from", direct URL, create) in one place, needs no `$effect`, and works before the note list has loaded.

TASK-7 (`8cf86aa`): `tests/components/note-links.test.ts` covers the picker (filtering, category, keys, click), popup (labels, open internal/external/unsafe, edit, remove) and "Linked from". Unit tests in `tests/unit/helpers/NotePicker.test.ts`, `UrlHelper.test.ts`, `services/NoteLinkService.test.ts`, `stores/Notes.test.ts`.

## Known issues / follow-ups

- Not checked in a browser: no API was reachable from this session, so the `[[` positioning, the bubble menus and external links on Capacitor/Electron (the backlog asks for this) still need a manual check.
- Opening a linked note navigates away like the sidebar does, so unsaved edits behave as they do there today.
- `npm run check` needs `NODE_OPTIONS=--max-old-space-size=1800` in this container (2 GB memory limit).
