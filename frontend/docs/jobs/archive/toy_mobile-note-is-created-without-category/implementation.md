## Summary

On mobile, browsing into a note category via the hamburger navigation and pressing "Create Note" created the note in the root (no `category_id`), so the note was invisible to the user who was looking at a category. The category-detail "Create Note" button called `notes.openModal('note')` without setting the store's `createParent`, and the root-level button never cleared a stale `createParent`. Fixed by adding a dedicated store method `openCreateNoteModal(parent)` and wiring both mobile navigation buttons to it: the category-detail button passes `current.id` (the category being viewed), the root button passes `null`.

## Changes

- TASK-1: Added `openCreateNoteModal(parent: number | null)` to the `NotesSvelte` store (`src/lib/state/Notes.svelte.ts`). It sets `createParent = parent` and delegates to the existing `openModal('note')`, following the same pattern as `openRightClickMenu`/`openModal`. No changes to `create()` logic.
- TASK-2: Wired both mobile navigation "Create Note" buttons in `src/lib/components/notes/NoteNavigationMobile.svelte` to the new method: the category-detail `AddNoteButton` opens with `current.id` (the category currently being viewed), and the root `AddNoteButton` opens with `null` so a stale `createParent` from a previously cancelled in-category create can't leak into a root-level create.
- TASK-3: Added unit tests in `tests/unit/stores/Notes.test.ts` covering `openCreateNoteModal`: it sets `createParent` to the passed parent and opens the note modal, and a `null` parent clears a stale `createParent`. All 26 tests in the Notes store suite pass.

## Known issues / follow-ups

- Two pre-existing test failures in the full suite are unrelated to this job: `TodoFilterService.test.ts` "keeps only todos due within the current week" (the test computes the week's end via `setDate(startOfWeek.getDate() + 6)`, which overflows into the next month whenever the week crosses a month boundary — fails on 2026-09-05) and `tests/components/logic-leaves.test.ts` "applies the requested color classes" (`.bg-blue-50` class not found in the component test). Neither touches code modified here.
- Pre-existing lint noise in the touched files (unused `fade` import and prettier style drift in `NoteNavigationMobile.svelte`) was left as-is to keep the change minimal.