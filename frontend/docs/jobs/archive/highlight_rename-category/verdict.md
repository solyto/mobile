# Verdict: rename category

id: highlight
status: reviewed
reviewer: opencode-go/deepseek-v4-flash
date: 2026-08-13

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

TASK-1: PASS
notes: `updateCategory: API_URL + '/todos/categories/%d'` added to the `todos` section of `src/lib/config/apiRoutes.ts` (line 52), between `createCategory` and `deleteCategory`. Matches the brief's `PUT /api/v1/todos/categories/{category}`; `%d` matches the numeric-id convention of the sibling `deleteCategory` route and is correctly substituted by `ApiService.update` (`src/lib/services/ApiService.ts:61-70`, PUT + `%d` → `id.toString()`).

TASK-2: PASS
notes: `UpdateTodoCategoryRequest { title?: string }` added directly below `CreateTodoCategoryRequest` in `src/lib/types/todo.ts` (lines 87-89), mirroring `UpdateTimeTrackingCategoryRequest`. `TodoCategory.id` is `number`, consistent with the `%d` route.

TASK-3: PASS
notes: `updateCategory(category, request)` added to `Todos` (`src/lib/state/Todos.svelte.ts:269-276`): calls `apiService.update(apiRoutes.todos.updateCategory, category.id, request)` and, on success, reloads categories and workspaces in parallel via `Promise.all([this.loadCategories(), this.loadWorkspaces()])`. Workspace reload is necessary and correct: `WorkspaceEdit.svelte:71` renders `category.title` from the categories embedded in `TodoWorkspace` objects. Mirrors the existing `updateWorkspace`/`deleteCategory` pattern, including the import of `UpdateTodoCategoryRequest`.

TASK-4: PASS
notes: Inline rename in `src/lib/components/settings/CategoryEdit.svelte`: pen button (`IconPen`) styled like the `minimal` DeleteButton (`z-40 ... text-c-neutral-3`, no drop-shadow) next to the delete button, native `title` tooltip bound to the new i18n key; clicking swaps the `/{category.title}` span for a pre-filled `TextInput` (`bind:input` + `bind:value`, autofocus after `tick()`); Enter/blur save via `todos.updateCategory` guarded against empty/unchanged titles (trim comparison), Escape cancels; Enter/Escape handled through the existing `KeyManager` at priority 2 (same as `TimeTrackingNavigation.svelte:94-107`), handlers unregistered on save/cancel/`onDestroy`. Double-invocation of `saveEdit` (Enter then blur after unmount) is guarded by the `if (!editing) return` early return. `rename_category` added to `SettingsRecords` (`src/lib/types/translation.ts:72`) and to all four locales (en/de/fr/es), all typed `SettingsRecords`, so `ts.get.settings.rename_category` compiles. Feature is reachable: `src/routes/settings/+page.svelte` renders `TodoSettings` → `CategoryEdit`.
minor notes (non-blocking): no visual error feedback if the PUT fails (acknowledged in implementation.md; consistent with the surrounding settings UI, e.g. `CreateEntry.svelte`); a category title renamed in settings can remain stale inside already-loaded `Todo` objects (`todo.category.title`, e.g. `todos/props/Category.svelte:119`) until the next `todos.load()` — identical pre-existing behavior for `deleteCategory` and outside the task's stated scope (categories + workspaces reload was explicitly specified); `loadingIndicator.stop()` is not in a `try/finally`, so a thrown error during the post-PUT reload would leave the spinner running — same pattern as the surrounding methods.

TASK-5: PARTIAL (verification not independently reproducible in this environment)
notes: The sandbox for this review permits only git read/commit commands, so `npm run check` / `npm run lint` could not be re-executed here. Static review of all changed files found no type errors: every new symbol is used, all prop/signature contracts line up (`apiService.update(endpoint, id, body)`, `KeyManager.registerKeyDown(key, handler, {priority})`/`unregisterAll(Record<string,string|null>)`, `TextInput` `bind:input`/`bind:value`/`onblur`, `SettingsRecords.rename_category`). The claim that `npm run lint`'s prettier step fails repo-wide on 255 files (pre-existing, incl. files untouched by this job) is credible and consistent with the observed state of the codebase; no eslint-relevant issues were found by inspection of the diff.

## Security

No new security surface. The rename path reuses the existing authenticated `ApiService.update` (PUT with auth header), the request body is a single trimmed string, and no new inputs reach the DOM unescaped (Svelte default escaping). The new i18n key is static. No findings.

## Overall

APPROVED

All four tasks are implemented as specified and are consistent with the codebase's established patterns (KeyManager priorities, loadingIndicator, DeleteButton styling, i18n key handling, route/type conventions). Nothing found requires changes before merge. The TASK-5 note about not re-running npm checks here is an environment limitation, not a defect; the developer's verification claims are plausible and nothing in the diff contradicts them. Minor observations listed under TASK-4 (no error feedback, stale embedded todo titles, no try/finally around the loading indicator) are pre-existing house patterns and explicitly out of scope for this job.
