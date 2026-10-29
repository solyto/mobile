# Tasks: edit note title must be clearer

id: speaker
analyst: analyst
date: 2026-10-29

## Context

- The todo title's "double-click to edit" hover hint is built in
  `src/lib/components/todos/props/Title.svelte`. It uses `MovableHoverBox`
  (`src/lib/components/ui/MovableHoverBox.svelte`), driven by
  `showExplanationBox` / `explanationBoxX` / `explanationBoxY` state, with
  `onmouseover`/`onmouseout`/`onfocus`/`onblur`/`onmousemove` handlers, and
  `content={ts.get.layout.double_click_to_edit}`.
- The note title is the `<button ondblclick={toggleChangeTitle}>` in
  `src/lib/components/notes/NoteHeader.svelte` (non-journal, non-editing
  branch, around line 145). It has no hint today.
- The string `layout.double_click_to_edit` already exists, so no i18n work or
  translator hand-off is needed.
- Branch check was not possible from this read-only session (no shell). The
  developer should confirm `git branch --show-current` is
  `feature/speaker_edit-note-title-must-be-clearer`.

## Task breakdown

TASK-1: Show a `MovableHoverBox` "double-click to edit" hint when the note title in `NoteHeader.svelte` is hovered or focused. Copy the pattern from todo `Title.svelte`: the three state variables, the hover/focus/mousemove handlers on the title button, a position setter, and `showExplanationBox = false` in `toggleChangeTitle`.
files: src/lib/components/notes/NoteHeader.svelte
depends: none
risk: low — one component, reuses an existing component and an existing translation key; no API or state-store changes.

## Out of scope / unclear

- The journal title (`isJournal` branch) is not editable, so it gets no hint.
- The dev-request title/description (`DevRequestEntry.svelte`) can also be double-clicked and has no hint either. It is not part of this brief, so leave it alone.
