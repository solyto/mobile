# Implementation: 23 Hidden note categories from their own endpoints

id: mixture
developer: @developer
date: 2026-10-14

## Summary

The `Notes` store now loads the plain and the hidden lists for both notes
and categories in parallel. It merges them so the journal (`.journal`) and
hidden user folders behave as they did before the API change. State is only
updated when both calls succeed. The tree merge is a pure, tested method on
`JournalService`.

## Changes

TASK-1: `src/lib/config/apiRoutes.ts`: added `notes.listHidden`
(`/notes/hidden`) and `notes.listHiddenCategories` (`/notes/categories/hidden`).

TASK-2: `src/lib/services/JournalService.ts`: added
`mergeCategories(visible, hidden)`. Hidden roots with `parent_id === null`
become roots. Hidden roots with a `parent_id` are grafted onto the matching
node, searched recursively through the visible tree. If no match is found,
they fall back to being a root. The visible tree is deep-copied, so neither
input is mutated. Grafted items are appended without re-sorting, following
proposal 2 in tasks.md. Tests are in
`tests/unit/services/JournalService.test.ts`.

TASK-3: `src/lib/state/Notes.svelte.ts` `loadCategories()`: fetches
`listCategories` and `listHiddenCategories` with `Promise.all`, then merges
the results. `journalCategory` is resolved from the merged tree, and
`is_system` roots are still filtered out of `categories`. The result is that
hidden user folders stay in the tree and `.journal` stays out of it.

TASK-4: `src/lib/state/Notes.svelte.ts` `load()`: fetches `list` and
`listHidden` with `Promise.all` and concatenates the results into `notes`.
The existing `isJournalNote` filters keep journal entries off the ordinary
surfaces. TASKs 3 and 4 are in a single commit because they touch the same
file.

TASK-5: `tests/unit/stores/Notes.test.ts`: added a `mockLists()` helper that
routes `api.list` by URL suffix, and switched every `api.list` mock to use
it. New cases:
- `.journal` only in the hidden tree
- a hidden user folder that stays in `categories`
- journal entries that only come from `GET notes/hidden`
- no state change when the hidden call fails, checked for both `load()` and
  `loadCategories()`

TASK-6: **Not done in this session.** `node_modules` is missing from the
workspace, and the hard rules say not to install packages without asking.
So `npm test`, `npm run check` and `npm run lint` were **not run**.

The only verification was a throwaway script run with Node 22 type stripping
on a copy of `JournalService`. It checked the merge cases: root, nested
graft, unknown-parent fallback, no mutation, and journal lookup.

The manual run against an API at `b34ec21` was also not done.

Before review, run `npm ci && npm test && npm run check && npm run lint`.
Then do the manual checks listed in TASK-6.

## Known issues / follow-ups

- **Tests, check and lint have not been run** (see TASK-6).
- The open questions from tasks.md are still unresolved:
  - Q1, the shape of the hidden tree: if the API nests hidden folders under
    their real visible parent instead of returning them as roots that carry
    `parent_id`, `mergeCategories` needs changing.
  - Q2, sibling order: grafted folders are appended at the end.
- `dashboard/Inspiration.svelte:56` still reads only `GET notes`, so the
  dashboard no longer shows notes in hidden user folders. As a side effect it
  also stops leaking journal entries. No task covered this (Q3).
- `Calendars.svelte.ts:431` (event attachments) is out of scope and
  unchanged.
- `findJournalCategory` only searches two levels deep. This is unchanged
  from before.
- `/workspace/.mcp.json` shows as modified in the worktree. That change was
  not made in this job, so I left it uncommitted.
