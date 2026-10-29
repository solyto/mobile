# Tasks: 30 Confirm deleting todo categories and workspaces

Branch verified: `feature/hot_30-confirm-deleting-todo-categories-and-workspaces`.

Reference pattern: `src/lib/components/todos/actions/TodoDelete.svelte` (local `modalOpen` state, `DeleteButton onClick={openModal}`, `{#if modalOpen}<ConfirmationModal type="confirm-delete" …/>{/if}`). Wording pattern: `timeTracking.category_deletion_title` / `category_deletion_description` ("Delete Category" / "Are you sure you want to delete this category?").

## TASK-1 — Add the English strings and translation type keys

Add four keys to the `todos` section: `category_deletion_title`, `category_deletion_description`, `workspace_deletion_title`, `workspace_deletion_description`. Word them like the `timeTracking` ones (e.g. "Delete Category" / "Are you sure you want to delete this category?", "Delete Workspace" / "Are you sure you want to delete this workspace?").

- Files: `src/lib/types/translation.ts` (todos interface), `src/lib/i18n/en.ts` (todos section, near `delete_confirm_label` ~line 335)
- Depends on: none
- Risk: low. These are new keys only; the type change will make `check` fail until TASK-2 is done.

## TASK-2 — Translate the new keys into de, es, fr, it

Hand the four new keys to the `translator` agent (`docs/agents/translator.md`, `docs/I18N.md`). Use the existing `timeTracking.category_deletion_*` translations in each locale for consistent wording.

- Files: `src/lib/i18n/de.ts`, `src/lib/i18n/es.ts`, `src/lib/i18n/fr.ts`, `src/lib/i18n/it.ts`
- Depends on: TASK-1
- Risk: low. This only adds strings, and `check` catches any missing keys.

## TASK-3 — Confirm before deleting a category

In `CategoryEdit.svelte`, the `DeleteButton` should open a `ConfirmationModal` (`type="confirm-delete"`, `todos.category_deletion_*`) and stop calling `onDelete` directly. Delete on confirm, and close the modal on cancel. Render the modal at the component root, outside the `pointer-fine:w-0 overflow-hidden` action container and outside the `{#if editing}` branch.

- Files: `src/lib/components/todos/CategoryEdit.svelte`
- Depends on: TASK-1
- Risk: medium. Unlike `TodoDelete`/`TodoEditModal`, this modal is nested *inside* the `ContentModal` (popup / `BottomSheetModal`). Ancestors with `backdrop-filter`/`transform`/`overflow` can become the containing block for `position: fixed`, so on mobile the confirmation might be clipped or mispositioned inside the sheet. Check this in the manual run (TASK-5). If it breaks, stop and report back rather than restructuring on your own. The fallback would be to lift the pending-delete state into `TodoSettingsModal.svelte` and render the `ConfirmationModal` as a sibling of `ContentModal`, like `TodoEditModal` does, but that is a larger change.

## TASK-4 — Confirm before deleting a workspace

Same as TASK-3 for `WorkspaceEdit.svelte`, using `todos.workspace_deletion_*`. Leave the category-chip detach (×) unconfirmed, as the brief says.

- Files: `src/lib/components/todos/WorkspaceEdit.svelte`
- Depends on: TASK-1
- Risk: medium. It has the same nested-modal containing-block concern as TASK-3, and `FindCategoryMenu` may sit in the same row.

## TASK-5 — Verify

Run `npm run check` and `npm run lint`. Then do the manual run the brief asks for, on both desktop (popup) and mobile (bottom sheet). For a category and for a workspace: click delete, then cancel (the item stays); click delete, then confirm (the item is gone). Also check:
- Escape and Enter while the confirmation is open act only on the confirmation and do not also close the settings modal or trigger `CreateEntry`. `KeyManager` runs handlers in ascending priority order, and the first one at the same priority wins.
- The confirmation is not clipped by the settings modal or bottom sheet.

- Files: none (verification only)
- Depends on: TASK-2, TASK-3, TASK-4
- Risk: low. The run itself only checks things, but it is where the nesting/keyboard issues from TASK-3/4 would show up.

## Open points

- The brief does not say whether a success notification should follow deletion (`TodoDelete` shows `todos.delete_success`). Not planned. Don't add one unless asked.
