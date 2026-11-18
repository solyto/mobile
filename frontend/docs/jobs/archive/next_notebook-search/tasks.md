# Tasks: notebook search

id: next
analyst: analyst
date: 2026-11-16

## Context (read before starting)

- Visual + shortcut reference: `src/lib/components/libraries/shared/Search.svelte`
  (search icon button, Ctrl+F opens, Escape closes, centered glass input
  `rounded-xl border-1 border-c-neutral-2 !bg-c-neutral/60 backdrop-blur-sm
  dark:!bg-s-dark/80`, width transition, circle-x close button). Contacts has a
  near-copy in `contacts/Search.svelte`.
- Libraries keep search state in the store (`searchVisible`, `searchTerm`,
  `search()`). Follow that: notebook search state lives in `NotesSvelte`, not
  in a component-local `$state` shared by two navs.
- Difference from libraries (brief): the notebook view is **not** filtered.
  With a non-empty term, the search bar grows into a larger box listing
  matching notes. Click → navigate to the note. ArrowUp/ArrowDown move the
  highlight, Enter opens the highlighted note.
- Keys must go through `KeyManager` (STANDARDS §9). `KeyManager` has no
  ArrowUp/ArrowDown yet → extend it (§9.2), do not use `onkeydown`.
- Matching logic goes into a pure, unit-tested service (STANDARDS §12/§13),
  not into the store or component.
- Notes are already loaded by `routes/notes/+layout.svelte` (`notes.notes`);
  no API call is needed.

## Decisions taken (flag to the owner in implementation.md if you disagree)

The brief does not specify these; the analyst picked the conservative option:

1. **Fields searched:** title and plain-text content (HTML tags stripped with a
   regex, as `JournalService.hasContent` does, so the service stays
   node-testable — `FormatHelper.stripHtml` needs a DOM). Case-insensitive
   substring match. Title matches are listed before content-only matches.
2. **Which notes:** `notes.getVisibleNotes()` — journal entries are excluded,
   matching the rest of the notebook navigation (they open via the journal
   route, not `/notes/[id]`).
3. **Result display:** title plus folder name (`notes.getCategoryTitle`) for
   context; no content snippet. Cap the list (e.g. 10) so the box stays small.
4. **Empty term:** box collapses back to the plain input, no list.
5. **No results:** one short line (reuse an existing "no results" string if one
   fits, else one new `en` key).

## Task breakdown

TASK-1: Add `ArrowUp` and `ArrowDown` as supported primary keys in `KeyManager`.
  files: src/lib/types/keydown.ts, src/lib/state/KeyManager.svelte.ts,
         tests/unit/stores/KeyManager.test.ts
  depends: none
  risk: low — additive; extend the existing `it.each(['ArrowLeft','ArrowRight'])`
        cases to cover the two new keys.

TASK-2: Create a pure `NoteSearchService` with `search(notes: Note[], term: string, limit): Note[]`
        implementing decisions 1 and 3 (trimmed, case-insensitive, title matches first,
        tags stripped from content, empty term → `[]`), with unit tests.
  files: src/lib/services/NoteSearchService.ts (new),
         tests/unit/services/NoteSearchService.test.ts (new)
  depends: none
  risk: low — pure function; test HTML-in-content (a term matching a tag name
        like `p` or `strong` must not match), ordering, limit, empty/whitespace term.

TASK-3: Add search state and actions to `NotesSvelte`: `searchVisible`, `searchTerm`,
        `searchResults`, `searchIndex`, and methods `openSearch()`, `closeSearch()`,
        `search()` (calls the service on `getVisibleNotes()`, resets index to 0),
        `moveSearchSelection(delta)` (clamped), and `openSearchResult(note?)`
        (selects the note, closes/clears search, `goto(resolve(urls.note, { id }))`).
  files: src/lib/state/Notes.svelte.ts, tests/unit/stores/Notes.test.ts
  depends: TASK-2
  risk: medium — touches a central store; keep it additive, no `$derived`/`$effect`
        (results are updated in `search()` from the input handler), and add store
        tests for search/move/open with the mocked ApiService already used there.

TASK-4: Create `NoteSearch.svelte`, rendered once in `routes/notes/+layout.svelte`:
        registers Ctrl+F (open), and while open Escape (close), ArrowUp/ArrowDown
        (move), Enter (open highlighted) via `KeyManager` with priority 0 so they win
        over other notebook handlers (e.g. `NoteHeader` title edit Enter/Escape);
        releases them on close and in `onDestroy`. Shows the library-style input;
        when `searchResults`/term non-empty, expands into a larger panel below the
        input listing results (highlighted row = `searchIndex`, click → `openSearchResult`).
  files: src/lib/components/notes/NoteSearch.svelte (new),
         src/routes/notes/+layout.svelte
  depends: TASK-1, TASK-3
  risk: medium — keyboard priority/cleanup interplay with the TipTap editor and
        `NoteHeader` handlers; Ctrl+F must not fire while a `ConfirmationModal` is
        open (mirror the library's `createModalVisible` guard with `notes.modalOpen`).
        Reuse the library input classes verbatim; keep markup expressions one-liners (§1).

TASK-5: Add a search icon button that calls `notes.openSearch()` to the desktop
        navigation's top-right button group and to the mobile navigation's root header
        (mobile: close the slide-in panel first so the search overlay is not hidden
        behind its `z-50` layer).
  files: src/lib/components/notes/NoteNavigationDesktop.svelte,
         src/lib/components/notes/NoteNavigationMobile.svelte
  depends: TASK-3, TASK-4
  risk: low — small markup addition; check overlay z-index against the mobile panel
        and that the absolute button row in the desktop nav still fits at `min-w-72`.

TASK-6: Add any new UI strings (search placeholder / no-results) to `en.ts` and the
        translation type, then hand the other locales to the `translator` agent.
  files: src/lib/i18n/en.ts, src/lib/types/translation.ts,
         src/lib/i18n/{de,es,fr,it}.ts (via translator)
  depends: TASK-4
  risk: low — skip entirely if existing keys (e.g. `search`, `no_results`) fit;
        `npm run check` enforces locale parity.

TASK-7: Verify: `npm run check`, `npm run lint`, `npm test`, and the §9 grep
        (`grep -rnE "addEventListener\('key|<svelte:(window|document|body) onkey|onkeydown=" src`)
        returns nothing new.
  files: none
  depends: TASK-1..TASK-6
  risk: low — verification only.

## Unclear / for the owner

- Content search vs. title-only, and journal inclusion, were decided above
  without owner input (decisions 1–2). Easy to change in TASK-2/TASK-3 if wrong.
- The brief's "Why" and "Out of scope" sections are empty; tag-based search,
  search highlighting inside the opened note, and server-side search are
  assumed out of scope.
