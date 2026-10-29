# Implementation: Empty settings need a description

id: document
developer: @developer
date: 2026-10-14

## Summary

The settings sections whose lists can be empty (todo categories, todo workspaces, tags) now show a short muted hint such as "You have no categories yet." when there are no entries. The hint uses the existing passkey empty-state style (`text-sm text-c-neutral-5 dark:text-c-neutral-4`). All other sections were already covered or only show static content (see the audit in tasks.md).

## Changes

TASK-1: Added `settings.no_categories`, `settings.no_workspaces` and `settings.no_tags` to `src/lib/types/translation.ts` and to `en`/`de`/`es`/`fr`, placed after `passkey_no_passkeys`. Following the brief, the wording is "You have no … yet." in all three keys. The translations reuse each locale's existing terms and form of address: de uses "du" and "Arbeitsbereiche", es uses "tú" and "espacios de trabajo"/"etiquetas", and fr uses "tags" and "espaces de travail".
TASK-2: `src/lib/components/settings/TodoSettings.svelte` now wraps the category and workspace lists in `{#if … .length === 0}<p>…</p>{:else}<existing list>{/if}`. No new state was added.
TASK-3: `src/lib/components/settings/TagSettings.svelte` uses the same pattern for `tags.tags`. The `<p>` stays in normal flow below the section heading, so it does not overlap the absolutely positioned "+" button.
TASK-4: I could not run `npm run check` or `npm run lint` because `node_modules` is not installed in this worktree (`svelte-kit: not found`, `@eslint/compat` missing), and installing packages needs approval. I also could not do a visual check because no dev server or API is running. As a substitute, I used grep to confirm that each new key appears exactly once in the type and in all four locale files.

## Known issues / follow-ups

- Someone needs to run `npm run check` and `npm run lint` in an environment that has dependencies installed.
- As the analyst pointed out (open question 1), the "no … yet" text can flash briefly while categories, workspaces or tags are still loading on page mount. This was accepted as the default.
- The hardcoded English strings found during the audit (listed in tasks.md) are still out of scope.
- `.mcp.json` shows as modified in the worktree. It is session tooling config, not part of this job, so I left it uncommitted.
