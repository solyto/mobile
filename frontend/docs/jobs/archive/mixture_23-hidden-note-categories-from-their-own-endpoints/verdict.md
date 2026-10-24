# Verdict: 23 Hidden note categories from their own endpoints

id: mixture
reviewer: @reviewer
date: 2026-10-14

## Review

Reviewed `git diff main...HEAD` on
`feature/mixture_23-hidden-note-categories-from-their-own-endpoints`.
The source changes are limited to `apiRoutes.ts`, `JournalService.ts`,
`Notes.svelte.ts` and the two test files. They match tasks.md and nothing
falls outside the task scope. The two `chore: commit all` commits only touch
`brief.md`/`tasks.md`. The `.mcp.json` change in the worktree is uncommitted
and not part of this branch.

TASK-1: PASS
notes: `src/lib/config/apiRoutes.ts` adds `notes.listHidden` (`/notes/hidden`)
and `notes.listHiddenCategories` (`/notes/categories/hidden`) as specified.

TASK-2: PASS
notes: `JournalService.mergeCategories` (`src/lib/services/JournalService.ts:19-49`)
deep-clones the visible tree. Root hidden nodes stay roots. A node with a
`parent_id` is grafted onto that parent, which it finds by searching
recursively (and that search includes hidden roots added earlier). If the
parent is not found, the node falls back to being a root. Neither input array
or input node is mutated: hidden nodes are pushed by reference into the cloned
parents only. Tests cover root, a visible parent, a nested visible parent,
hidden children kept, an unknown parent, journal lookup, no mutation, and an
empty hidden list. Grafted nodes are appended at the end, as proposal 2
suggested. Open question 1 (the hidden tree shape) is still an unverified
assumption about the API, and the developer documents it.

TASK-3: PASS
notes: `Notes.loadCategories()` (`src/lib/state/Notes.svelte.ts:101-116`)
fetches both lists in parallel and only updates state when both succeed. It
resolves `journalCategory` from the merged tree and still filters `is_system`
roots out of `categories`, so hidden user folders stay in the tree and
`.journal` stays out of it.

TASK-4: PASS
notes: `Notes.load()` (`:68-80`) fetches both lists in parallel, concatenates
them, and only updates when both succeed. `getVisibleNotes`/`isJournalNote`
keep journal entries off the ordinary surfaces, and hidden-folder notes stay
visible.

TASK-5: PASS
notes: The `mockLists()` helper routes requests by URL suffix, checking the
more specific suffixes first. Every old blanket `api.list` mock was switched
to it. All four required new cases are present, and the failure case is
covered for both `load()` and `loadCategories()`. Executed in re-review:
`tests/unit/stores/Notes.test.ts` + `tests/unit/services/JournalService.test.ts`
74/74 passed.

TASK-6: PASS (static verification only, per owner decision)
notes: Re-review on 2026-10-14 after the owner approved `npm ci`:
- `npm test`: 64 files, 948 tests passed
- `npm run check`: 0 errors, 0 warnings
- `npm run lint`: clean
The owner waived the manual run against an API at `b34ec21` ("only static
analysis, no checking against a real api"). The owner also settled open
question 1: hidden folders are always top-level. `mergeCategories` keeps
top-level hidden nodes as roots, so that case is covered by the tests.
The `parent_id` graft path is only a defensive fallback.

Non-blocking observation (not in tasks.md, open question 3):
`dashboard/Inspiration.svelte:56` still reads only `GET notes`. After the API
change, the dashboard's "newest notes" will drop notes in hidden user folders,
and it will also stop leaking journal entries. The owner should decide on
this, but no task required a change here.

## Security

none (not run)

## Overall

APPROVED

Re-review: the earlier blockers (no executed tests/check/lint, no manual
run) are resolved. The checks ran green, and the owner explicitly waived
the manual API run. No blockers remain.
