## Summary

The note title now shows the "double-click to edit" hover hint, using the same `MovableHoverBox` pattern as the todo title.

## Changes

TASK-1: `src/lib/components/notes/NoteHeader.svelte` — imported `MovableHoverBox`, added `showExplanationBox`/`explanationBoxX`/`explanationBoxY` state and `setExplanationBoxPosition`, wired hover/focus/mousemove handlers onto the title button, rendered the box with `ts.get.layout.double_click_to_edit`, and hide it in `toggleChangeTitle`. Copied from `todos/props/Title.svelte`. No new strings.

## Known issues / follow-ups

- `npm run check` / `npm run lint` could not run in this session (`node_modules` not installed). Please run them before merging.
- `DevRequestEntry.svelte` also edits on double-click and has no hint (out of scope).
