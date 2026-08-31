# Implementation: rename category

## Summary

Added the ability to rename todo categories in the settings section, so users no longer have to delete and recreate a category (which loses all todo associations). A pen button next to the existing delete button in `CategoryEdit.svelte` switches the category title into an inline, pre-filled `TextInput` that saves on Enter/blur and cancels on Escape, backed by a new `updateCategory` method on the `Todos` state that calls the `PUT /api/v1/todos/categories/{category}` endpoint and refreshes both categories and workspaces (whose embedded category titles are shown in `WorkspaceEdit`).

## Changes

TASK-1: Added `updateCategory: API_URL + '/todos/categories/%d'` to the `todos` section of `src/lib/config/apiRoutes.ts`, placed between `createCategory` and `deleteCategory` to mirror the ordering used in the notes and links category routes.

TASK-2: Added `UpdateTodoCategoryRequest` interface (`title?: string`) to `src/lib/types/todo.ts` directly below `CreateTodoCategoryRequest`, mirroring `UpdateTimeTrackingCategoryRequest`.

TASK-3: Added `updateCategory(category: TodoCategory, request: UpdateTodoCategoryRequest): Promise<boolean>` to the `Todos` class in `src/lib/state/Todos.svelte.ts`. It calls `apiService.update(apiRoutes.todos.updateCategory, category.id, request)` and, on success, reloads categories and workspaces in parallel (`Promise.all([this.loadCategories(), this.loadWorkspaces()])`) so the renamed title also updates in `WorkspaceEdit`.

TASK-4: Added an inline rename affordance to `src/lib/components/settings/CategoryEdit.svelte`:
- A pen button (IconPen) styled like the existing `minimal` `DeleteButton` (text-c-neutral-3, no drop-shadow), placed next to the delete button, with a native `title` tooltip bound to the new i18n key.
- Clicking it swaps the `/{category.title}` span for a pre-filled `TextInput` (via `TextInput` with `bind:input` + `bind:value`) that autofocuses after `tick()`.
- Enter and Escape are handled through the existing `KeyManager` (priority 2, mirroring `TimeTrackingNavigation`); Enter/blur save via `todos.updateCategory` (guarded against empty or unchanged titles) with the `loadingIndicator` pattern, Escape cancels. Handlers are unregistered on save/cancel/destroy.
- Added `rename_category` key to `SettingsRecords` in `src/lib/types/translation.ts` and to all four locale files (`en`, `de`, `fr`, `es`).

TASK-5: Verification:
- `npm run check` (svelte-kit sync + svelte-check): passes with 0 errors and 0 warnings.
- `npm run lint`: prettier `--check` fails repo-wide on 255 files, including files untouched by this job (verified against base-commit versions of `CategoryEdit.svelte`, `WorkspaceEdit.svelte`, `src/routes/+layout.svelte`, `src/lib/state/Notes.svelte.ts`), so this is a pre-existing condition not introduced here. ESLint, run directly on all changed files, reports 0 errors.
- No new unit tests: as noted in the task breakdown, there is no component/state test infra for this layer.

## Known issues / follow-ups

- `npm run lint` fails because prettier (with the repo's `prettier-plugin-tailwindcss` config) disagrees with the committed formatting of 255 files across the codebase. This predates this job and was left untouched to avoid a massive unrelated reformat. A follow-up could reformat the repo (`npm run format`) and pin the prettier/plugin versions to whatever the codebase was formatted with.
- The rename interaction is keyboard-only for save/cancel (Enter/blur/Escape); no dedicated "save" button was added, matching the inline edit pattern used in `TimeTrackingNavigation`. There is no visual error feedback if the PUT fails (consistent with the surrounding settings UI, which silently ignores failed updates).
