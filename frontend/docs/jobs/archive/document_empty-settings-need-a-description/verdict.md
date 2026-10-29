# Verdict: Empty settings need a description

id: document
reviewer: @reviewer
date: 2026-10-14

## Review

Branch: `feature/document_empty-settings-need-a-description` (matches brief). Base: `main`.
The diff `main...HEAD` touches only the job documents, the five i18n/type files and the two settings components. That matches implementation.md. `.mcp.json` is modified in the worktree but not committed, so it is not part of the branch.

TASK-1: PASS
notes: `no_categories`, `no_workspaces` and `no_tags` were added to `SettingsRecords` (translation.ts:135-137) and to en/de/es/fr in the same position. The English text follows the brief's wording. de uses "du" and es uses "tú", which matches the existing strings in those files. fr uses "vous". The fr file already mixes "tu" and "vous", so this is not a blocker.

TASK-2: PASS
notes: TodoSettings.svelte:22-30 and :40-48 wrap the existing lists in `{#if … .length === 0}<p>…</p>{:else}…{/if}`. The `<p>` uses exactly the passkey empty-state classes. The original `{#each}` wrappers are unchanged. No new state was added. `todos.categories` and `todos.workspaces` start as `$state([])` (Todos.svelte.ts:43,45), so `.length` is always safe.

TASK-3: PASS
notes: TagSettings.svelte:18-26 uses the same pattern. The `<p>` stays in normal flow after the heading, which has `mb={6}`. The absolutely positioned "+" button is placed against the `relative` `<section>` in settings/+page.svelte, so the two do not overlap. `tags.tags` starts as `$state([])` (Tags.svelte.ts:9).

TASK-4: PARTIAL (not a blocker)
notes: The developer could not run `npm run check` or `npm run lint` because `node_modules` is missing here too. I reviewed the code by hand instead. The keys are declared in the type and present in all four locales, `ts` is in scope in both components, and the markup is valid Svelte 5. I found nothing that would make check or lint fail. Before merging, someone should run `npm run check` once in an environment that has the dependencies installed.

## Security

none (markup and i18n strings only, no data handling).

## Overall

APPROVED

No blockers. The implementation matches tasks.md and stays in scope.
