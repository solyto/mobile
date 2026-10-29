# Tasks: 23 Hidden note categories from their own endpoints

id: mixture
analyst: @analyst
date: 2026-10-14

<!-- Produced by @analyst from brief.md. -->

## Context (what the code does today)

- Branch verified: worktree HEAD is
  `feature/mixture_23-hidden-note-categories-from-their-own-endpoints`.
- `Notes.load()` (`src/lib/state/Notes.svelte.ts:68-78`) reads only
  `GET notes`. `Notes.loadCategories()` (`:98-108`) reads only
  `GET notes/categories`. It finds the journal with
  `JournalService.findJournalCategory` and then drops `is_system` roots from
  `categories`.
- Nothing in the frontend reads `is_hidden`. The `updateCategoryHidden` route
  is wired but never called (see `docs/jobs/archive/exist_notebook-journal`).
  So today a hidden **user** folder shows up in the tree like any other
  folder, and its notes show up in the tree, overview (newest, last updated)
  and favorites. "Keep behaving as today" therefore means: hidden user folders
  and their notes must still show up in `categories` and `notes`.
- Callers of the store lists:
  - `categories`: `NoteNavigationDesktop.svelte:97,122`,
    `NoteNavigationMobile.svelte:117,135`, `NoteNavigationCategoryRenderer`
    (recursive through `children`), `getCategoryTitle`, `openModal` (edit).
  - `notes`: journal (`getJournalEntry`, `getJournalEntryDates`,
    `isJournalNote`), `getNotesForCategory`, `getVisibleNotes`, newest, last
    updated, favorites, `selectNote` (`/notes/[id]`), and the post-save lookups
    in `create`/`saveContent`.
- `apiRoutes.notes.newest` is not used anywhere in `src/`.
- Callers that read `GET notes` directly, outside the store:
  - `src/lib/components/dashboard/Inspiration.svelte:56`: dashboard "newest
    notes".
  - `src/lib/state/Calendars.svelte.ts:431`: event attachments. This is
    **out of scope** per the brief.
- No note search exists in `src/lib/components/notes`. Nothing to change there.

## Task breakdown

TASK-1: Add `listHidden: API_URL + '/notes/hidden'` and
`listHiddenCategories: API_URL + '/notes/categories/hidden'` to
`apiRoutes.notes`.
files: src/lib/config/apiRoutes.ts
depends: none
risk: low. These are two additive constants with no callers until TASK-3/TASK-4.

TASK-2: Add a pure, unit-tested method that merges the hidden category tree
into the plain category tree. Each hidden root with `parent_id === null`
becomes a root. Each hidden root with a `parent_id` is grafted into the
`children` of that parent, searched recursively in the plain tree. If the
parent can't be found, it falls back to a root. The method must not mutate
its inputs.
files: src/lib/services/JournalService.ts (the brief names it as the
candidate home), tests/unit/services/JournalService.test.ts
depends: none
risk: medium. The brief doesn't spell out the exact shape of the hidden tree
(for example, how a hidden child of a visible parent is returned) or the
sibling order. See open questions 1 and 2.

TASK-3: In `Notes.loadCategories()`, fetch `notes.listCategories` and
`notes.listHiddenCategories` in parallel. Update state only when **both**
succeed, so a single failed call can't wipe the journal. Resolve
`journalCategory` from the merged tree. Keep filtering `is_system` out of
`categories` as today, so hidden user folders stay in the tree and
`.journal` stays out of it.
files: src/lib/state/Notes.svelte.ts
depends: TASK-1, TASK-2
risk: medium. This changes the source of every navigation tree render and of
the journal lookup.

TASK-4: In `Notes.load()`, fetch `notes.list` and `notes.listHidden` in
parallel and concatenate them into `notes`. As in TASK-3, update only when
both succeed. The journal filters (`isJournalNote` / `getVisibleNotes`) keep
journal entries out of the ordinary surfaces, and hidden-folder notes stay
visible as today.
files: src/lib/state/Notes.svelte.ts
depends: TASK-1
risk: medium. `load()` is called after every mutation (save, tag, favorite,
delete, import, drag), so a mistake here affects the whole notebook.

TASK-5: Update the `Notes` store tests for the two-endpoint loading:
- Route the `api.list` mocks by URL. `'/notes/categories'` now also matches
  `'/notes/categories/hidden'`, and a blanket `mockResolvedValue` now
  duplicates entries. This affects at least the tests "loadCategories resolves
  the journal folder…" (`:301`), "re-snapshots the overview lists…" (`:438`)
  and "reloads the categories after creating one" (`:525`).
- Add cases for:
  - `.journal` found only in the hidden tree;
  - a hidden user folder that stays in `categories`;
  - journal entries coming only from `GET notes/hidden`;
  - no state change when the hidden call fails.
files: tests/unit/stores/Notes.test.ts
depends: TASK-3, TASK-4
risk: low. These are test-only changes.

TASK-6: Verification. Run `npm test`, `npm run check` and `npm run lint`.
Then, against an API at `b34ec21`, manually:
- create and open journal entries (today and a past day);
- check that a hidden user folder and its notes still show in the desktop and
  mobile navigation;
- check newest, last updated and favorites;
- open a note in a hidden folder via `/notes/[id]`.
files: none
depends: TASK-1 to TASK-5
risk: low. Nothing changes in this task. Note that the manual run needs a
local API at the new commit.

## Open questions / scope notes

1. **Hidden tree shape.** I'm assuming that a hidden folder whose parent is
   visible comes back from `GET notes/categories/hidden` as a root node with
   its real `parent_id`, and that descendants of hidden folders are nested
   under them. I couldn't check this because the API repo isn't in this
   workspace. If the API instead returns each hidden folder under its real
   parent, TASK-2's grafting logic changes.
2. **Sibling order after merge.** Today the API's order is used as is. When a
   hidden folder is grafted into a visible list, its position isn't defined.
   Proposal: append it and don't re-sort, which is the smallest change. A
   reviewer should confirm whether the order should follow `sort_order`
   instead.
3. **Dashboard `Inspiration.svelte`.** It reads `GET notes` directly, so after
   the API change it loses notes in hidden user folders. As a side effect it
   also stops showing journal entries, which arguably fixes a leak. The brief
   lists "newest" among the callers to check but doesn't say to change this
   one, so I added **no task** for it. If hidden-folder notes must keep
   showing on the dashboard, add a task that also fetches `notes.listHidden`
   there and filters the journal out.
4. **"Hidden folder toggle" in the manual run.** No UI in this repo calls
   `updateCategoryHidden`, so there is no toggle to test in the frontend.
   TASK-6 checks the display of a folder already marked hidden, for example
   one set through the API.
5. **Where the merge lives.** I put it in `JournalService` because the brief
   names it, but merging trees is not specific to the journal. A separate
   pure service would be a new file or abstraction, so it should only be
   created if the reviewer prefers that.
6. Event attachments (`Calendars.svelte.ts:431`) and note export are out of
   scope per the brief, and are left alone.
