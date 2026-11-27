# Tasks: notes-cross-references-and-backlinks

id: but
analyst: charmaine (from `docs/backlog/notes-cross-references-and-backlinks.md`)
date: 2026-11-24

Spec: `docs/backlog/notes-cross-references-and-backlinks.md`. API contract: room decision
"backlinks API contract" (`GET /notes/{note}/backlinks` → `[{ id, title }]`, title asc).
UI placement and look of the picker, the link popup and "Linked from" are decided by the designer.

## Task breakdown

TASK-1: Add `@tiptap/suggestion` at `3.32.0` (approved in backlog decision 3)
     files: package.json, package-lock.json
     depends: none
     risk: low — same version line as the other TipTap packages

TASK-2: Note link logic: `NoteLinkService` (note id from an href, title search for the picker), backlink type, `apiRoutes.notes.backlinks`, store `searchLinkableNotes()` and `loadBacklinks()`
     files: src/lib/services/NoteLinkService.ts, src/lib/types/note.ts, src/lib/config/apiRoutes.ts, src/lib/state/Notes.svelte.ts, tests/unit/services/NoteLinkService.test.ts, tests/unit/stores/Notes.test.ts
     depends: none
     risk: low — additive

TASK-3: Toolbar button + note picker that inserts `<a href="/notes/{uuid}">Title</a>` (selection becomes the text)
     files: src/lib/components/notes/editor/EditorToolbar.svelte, new picker component, i18n
     depends: TASK-2, designer
     risk: medium — editor interaction

TASK-4: `[[` shortcut with `@tiptap/suggestion` and an inline picker
     files: src/lib/components/notes/editor/TipTapEditor.svelte, new extension + list component
     depends: TASK-1, TASK-2, designer
     risk: medium — keyboard handling must go through KeyManager

TASK-5: Link popup (Open / Edit / Remove) as a bubble menu; internal links open in-app, external ones via the existing `target="_blank" rel="external"` behaviour
     files: src/lib/components/notes/editor/*, i18n
     depends: TASK-2, designer
     risk: medium

TASK-6: "Linked from" list on the note page, hidden when empty, reloaded when a note is opened
     files: src/routes/notes/[id]/+page.svelte, new component, i18n
     depends: TASK-2, designer
     risk: low

TASK-7: Translations of the new `en` keys (translator agent), component tests for picker and backlinks list
     files: src/lib/i18n/*.ts, tests/components/notes.test.ts
     depends: TASK-3..6
     risk: low
