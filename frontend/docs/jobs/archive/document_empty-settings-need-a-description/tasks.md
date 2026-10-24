# Tasks: Empty settings need a description

id: document
analyst: @analyst
date: 2026-10-14

## Audit of the settings page

Branch checked: worktree HEAD is `feature/document_empty-settings-need-a-description`, which matches `brief.md`.

`src/routes/settings/+page.svelte` renders 9 sections. Each one was checked for lists that can be empty:

| Section | Component | List that can be empty | Empty state today |
|---|---|---|---|
| Todos → Categories | `TodoSettings.svelte` | `todos.categories` | **none, blank area** |
| Todos → Workspaces | `TodoSettings.svelte` | `todos.workspaces` | **none, blank area** |
| Todos → Workspace card → categories | `WorkspaceEdit.svelte` | `workspace.categories` | none, but the "+ Category" button is always shown below, so it does not look broken (see Open questions) |
| Tags | `TagSettings.svelte` | `tags.tags` | **none, blank area** (only the "+" button in the corner) |
| Localization | `LocalizationSettings.svelte` | static options | n/a |
| Features | `FeatureSettings.svelte` | static feature keys | n/a |
| Notifications | `NotificationSettings.svelte` + children | static types/channels; telegram/push already show hints | n/a |
| Appearance | `AppearanceSettings.svelte` | static themes/modes | n/a |
| App | `AppSettings.svelte` | none | n/a |
| Security → Passkeys | `SecuritySettings.svelte` | `passkeys` | **already exists**: `passkey_no_passkeys` |
| Export | `ExportSettings.svelte` | export status | **already exists**: `export_no_exports` |

**Style to copy.** The existing empty state in `SecuritySettings.svelte:147` is
`<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.settings.passkey_no_passkeys}</p>`.
It is the same muted-text style used in `AppSettings.svelte` and is the closest equivalent inside a `SettingsSection`. Use exactly these classes.

**Naming to copy.** Use the existing `settings.<thing>_no_<things>` / "No … yet." pattern, e.g. `export_no_exports: 'No exports yet.'`.

## Task breakdown

TASK-1: Add three new i18n keys under `settings`, `no_categories`, `no_workspaces` and `no_tags` (en: "You have no categories yet." / "You have no workspaces yet." / "You have no tags yet."), to the translation type and to all four locale files.
  files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
  depends: none
  risk: low. The keys are additive only, and `npm run check` checks that all four locales match.

TASK-2: In `TodoSettings.svelte`, show the muted `<p>` with `ts.get.settings.no_categories` when `todos.categories.length === 0`, and the one with `ts.get.settings.no_workspaces` when `todos.workspaces.length === 0`. Otherwise render the existing `{#each}` wrapper unchanged (use `{#if}…{:else}` or `{#each}…{:else}`).
  files: src/lib/components/settings/TodoSettings.svelte
  depends: TASK-1
  risk: low. Markup-only change inside an existing `SettingsSection`. No new state.

TASK-3: In `TagSettings.svelte`, show the muted `<p>` with `ts.get.settings.no_tags` when `tags.tags.length === 0`. Otherwise render the existing tag list.
  files: src/lib/components/settings/TagSettings.svelte
  depends: TASK-1
  risk: low. Markup only. Note that the "+" button is positioned `absolute top-0 right-0` next to the heading, so the new `<p>` must stay in normal flow below the heading and not overlap it.

TASK-4: Verify with `npm run check` and `npm run lint`. If a running dev environment exists, also look at the settings page with an account that has no categories, workspaces or tags.
  files: none
  depends: TASK-2, TASK-3
  risk: low. Verification only.

## Out of scope (not done in this job)

- Hardcoded English strings found during the audit (`NotificationSettings.svelte:27`, `ManageNotificationTypes.svelte` labels/tooltips/"Loading...", `SecuritySettings.svelte:145` "Loading...", `ExportSettings.svelte` feature labels/error messages, `AppSettings.svelte` "Version"). These break STANDARDS 8.1 but are unrelated to empty states. Do not fix them here.
- The existing `export_no_exports` uses `text-c-neutral-4` without `text-sm`, which is slightly different from the passkey style. Leave it unchanged.

## Open questions (not blocking; the defaults above apply unless the owner says otherwise)

1. **Flash during loading.** `+page.svelte` loads tags, categories and workspaces in `onMount`, so the "no … yet" text will briefly appear before the data arrives. `Tags.loaded` exists, but `Todos.loaded` is only set by `Todos.load()` (todo list), not by `loadCategories()`/`loadWorkspaces()`. The default plan accepts this brief flash, because it adds no new state. If it is not acceptable, a separate decision is needed on how to track the loading state of categories and workspaces.
2. **Workspace with no categories** (`WorkspaceEdit.svelte`). The card always shows a "+ Category" button, so it does not look broken. It is left out of scope by default. Add a task only if the owner wants a hint there too.
3. **Exact wording.** The brief's example is "You have no categories yet". The default plan follows that phrasing. The existing keys use the shorter "No … yet." style. Either is fine; the developer should keep the wording consistent across all three new keys.
