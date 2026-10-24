# Tasks: mobile: note is created without category

id: toy
status: open
analyst: analyst
date: 2026-09-05

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

<!-- TASK-1: description
     files: list of files likely affected
     depends: none
     risk: low / medium / high — reason

TASK-2: ...
-->

TASK-1: Add an `openCreateNoteModal(parent: number | null)` method to the `NotesSvelte` store that sets `createParent = parent` and then calls the existing `openModal('note')`, following the same pattern as `openRightClickMenu`/`openModal` already on the store.
     files: src/lib/state/Notes.svelte.ts
     depends: none
     risk: low — a thin store method that sets one existing field and delegates to an existing method; no changes to `create()` logic.

TASK-2: Wire both mobile navigation "Create Note" buttons to the new store method so the created note lands in the currently-viewed category: the category-detail `AddNoteButton` (NoteNavigationMobile.svelte line 118) must open with `current.id`, and the root `AddNoteButton` (line 63) must open with `null` to avoid stale `createParent` leakage.
     files: src/lib/components/notes/NoteNavigationMobile.svelte
     depends: TASK-1
     risk: low — targeted change to the two onClick handlers; the `current` derived value already holds the category being viewed.

TASK-3: Add unit tests to `tests/unit/stores/Notes.test.ts` for `openCreateNoteModal` verifying it sets `createParent` to the passed parent (and that a `null` parent clears it) and opens the modal, so the wiring is covered by the existing store-test suite.
     files: tests/unit/stores/Notes.test.ts
     depends: TASK-1
     risk: low — follows the existing `create`/`createParent` test pattern in the same file.
