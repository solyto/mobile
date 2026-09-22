# Verdict: mobile: note is created without category

id: toy
status: open
reviewer: deepseek-v4-flash
date: 2026-09-05

## Review

TASK-1: PASS
     notes: `src/lib/state/Notes.svelte.ts:164-167` adds `openCreateNoteModal(parent: number | null)` which sets `this.createParent = parent` and delegates to the existing `openModal('note')`, matching the `openRightClickMenu`/`openModal` store pattern. No changes to `create()` logic. Correct and minimal.

TASK-2: PASS
     notes: `src/lib/components/notes/NoteNavigationMobile.svelte:63` (root `AddNoteButton`) now opens with `openCreateNoteModal(null)`, clearing any stale `createParent`; line 118 (category-detail `AddNoteButton`) opens with `openCreateNoteModal(current.id)`, where `current` is the category currently being viewed. Both handlers are in scope; the desktop path was correctly left alone since it sets `createParent` via the right-click menu. This addresses both the "note lands outside the viewed category" and the "root note is invisible" concerns from the brief.

TASK-3: PASS
     notes: `tests/unit/stores/Notes.test.ts:180-199` adds two tests for `openCreateNoteModal` verifying it sets `createParent` to the passed parent (and clears a stale parent when given `null`), sets `createType='note'`, and opens the modal. Follows the existing store-test pattern. Could not run the suite locally (no `node_modules`), but the tests are deterministic and consistent with the existing patterns.

## Security

No security findings. The change only affects which category id is passed when creating a note; no new data handling, no auth changes.

## Overall

APPROVED

No blockers. The fix is correct, in-scope, and minimal. Note for the developer: the two pre-existing full-suite test failures (`TodoFilterService` week-boundary and `logic-leaves` color-class) and the pre-existing lint noise in `NoteNavigationMobile.svelte` (`fade` unused import, prettier drift) are unrelated to this job and were correctly left untouched; they can be handled in separate jobs.
