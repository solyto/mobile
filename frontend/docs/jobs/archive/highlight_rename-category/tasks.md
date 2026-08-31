# Tasks: rename category

id: highlight
status: open
analyst: opencode-go/deepseek-v4-flash
date: 2026-08-13

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Add the todos category rename route `updateCategory: API_URL + '/todos/categories/%d'` to the `todos` section of apiRoutes, matching the brief's `PUT /api/v1/todos/categories/{category}`.
     files: src/lib/config/apiRoutes.ts
     depends: none
     risk: low — config addition mirroring existing category routes for notes, links, and time-tracking.

TASK-2: Add `UpdateTodoCategoryRequest` interface (`title?: string`) to src/lib/types/todo.ts, next to `CreateTodoCategoryRequest`.
     files: src/lib/types/todo.ts
     depends: none
     risk: low — straightforward type addition mirroring `UpdateTimeTrackingCategoryRequest`.

TASK-3: Add `updateCategory(category: TodoCategory, request: UpdateTodoCategoryRequest): Promise<boolean>` to `Todos` state, calling `apiService.update(apiRoutes.todos.updateCategory, category.id, request)` and reloading categories — and workspaces, whose embedded category titles are displayed in WorkspaceEdit — on success.
     files: src/lib/state/Todos.svelte.ts
     depends: TASK-1, TASK-2
     risk: low — mirrors existing `updateWorkspace`/`deleteCategory` methods; only nuance is reloading workspaces too.

TASK-4: Add an inline rename affordance to `CategoryEdit.svelte` (pen/edit button in the existing `minimal` button style next to DeleteButton; clicking switches the title span to a pre-filled `TextInput` that autofocuses, saves on Enter/blur and cancels on Escape via the existing `KeyManager` + `loadingIndicator` patterns), wired to `todos.updateCategory`.
     files: src/lib/components/settings/CategoryEdit.svelte
     depends: TASK-3
     risk: medium — the brief leaves the exact interaction open ("find a way"); recommended pattern follows `CreateEntry.svelte` and `TimeTrackingNavigation.svelte` (KeyManager Enter/Escape), and any tooltip/label added should get matching i18n keys in all four locale files + `SettingsRecords`.

TASK-5: Verify with `npm run check` (svelte-check) and `npm run lint` (prettier + eslint).
     files: none (verification only)
     depends: TASK-1, TASK-2, TASK-3, TASK-4
     risk: low — standard verification; no state/component test infra exists for this layer, so no new unit tests are expected for this feature.
