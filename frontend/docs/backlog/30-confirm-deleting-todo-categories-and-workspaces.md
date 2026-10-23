# Backlog: 30 Confirm deleting todo categories and workspaces

created: 2026-10-15

## What

In the todo settings modal (`src/lib/components/todos/TodoSettingsModal.svelte`), deleting a category (`todos/CategoryEdit.svelte`, `onDelete`) or a workspace (`todos/WorkspaceEdit.svelte`, `onDelete`) happens on the first click, with no confirmation. Ask before deleting, using the existing confirmation modals in `src/lib/components/ui/` (`ConfirmationModal`, which switches between popup and bottom sheet).

Detaching a category from a workspace (the × on a workspace chip) only removes the link, so it does not need a confirmation.

## Why

Deleting a category or workspace cannot be undone, and a single stray click or tap is enough. On touch devices the trash icons are always visible in every row, so they are easy to hit by accident.

## Out of scope

Undo.

## Notes

All new strings (title, description) in all four i18n files. Check how other features word their delete confirmations (`timeTracking.category_deletion_*`) and follow that. Safety: `check`, plus a manual run on mobile and desktop: delete a category and a workspace, cancel both, and confirm both.
