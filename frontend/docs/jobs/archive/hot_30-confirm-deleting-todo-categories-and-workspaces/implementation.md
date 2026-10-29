# Implementation: 30 Confirm deleting todo categories and workspaces

id: hot

## Summary

Deleting a category or a workspace from the todo settings modal now opens a `ConfirmationModal` (`type="confirm-delete"`, popup on desktop, bottom sheet on mobile). The item is deleted only on confirm. Cancel closes the modal. The × that detaches a category from a workspace is still unconfirmed, as the brief says.

## Changes

TASK-1: Added `todos.category_deletion_title/description` and `todos.workspace_deletion_title/description` to `src/lib/types/translation.ts` and `src/lib/i18n/en.ts`, worded like `timeTracking.category_deletion_*`.
TASK-2: Added the four keys to `de.ts`, `es.ts`, `fr.ts`, `it.ts`. The category strings match the existing `timeTracking.category_deletion_*` translations. The workspace strings use the glossary term (Arbeitsbereich / espacio de trabajo / espace de travail / spazio di lavoro). No sub-agent tool was available in this session, so I wrote them directly, following `docs/I18N.md` and the translator rules, rather than through the `translator` agent.
TASK-3: `CategoryEdit.svelte`: `DeleteButton` opens the modal. The modal is rendered at the component root, outside the hover-collapsed action container and the `{#if editing}` branch. `onDelete` closes the modal before calling the API, so it doesn't stay open if the request fails.
TASK-4: `WorkspaceEdit.svelte`: same pattern, using `todos.workspace_deletion_*`.
TASK-5: After the review, I restored the lockfile dependencies with `npm ci`. No packages were added and nothing tracked changed. `npm run check` reports 0 errors and 0 warnings, and `npm run lint` is clean. The brief leaves the manual desktop/mobile run to a human tester ("No testing against API. Human tests."), and no API was reachable here, so that run is still open. What I checked from the code:
- Keyboard: while the settings modal is open, it registers no Enter/Escape handlers. `CreateEntry` and `CategoryEdit` rename only register them while their input is active, and they unregister on blur. `PopupConfirmationModal` registers at priority 1, so Enter and Escape reach it. `TodoCreate`'s Enter is at priority 3, so it runs later and is blocked by `preventOthers`.
- Positioning: the nested confirmation's `position: fixed` containing block is the settings modal's full-viewport `backdrop-blur` wrapper. The intermediate `overflow-y-auto` elements are below that block, so they should not clip it. The exceptions are a bottom-sheet drag or the intro `scale` transition, which add a transform for a moment. One minor risk: the confirmation sits inside the content's `z-30` stacking context, so the settings modal's close button may paint above its blur overlay. This needs checking in the manual run.

## Known issues / follow-ups

- Human: the manual desktop + mobile run from TASK-5 (cancel and confirm, for a category and a workspace; Escape and Enter; check for clipping).
