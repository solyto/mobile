# Verdict: notebook search and long-press follow-ups

id: wonder
reviewer: @reviewer
date: 2026-11-22

## Review

Second round. Branch verified: `feature/wonder_notebook-search-and-long-press-follow-ups`.
Diff reviewed: `git diff main...HEAD`. Changes since the first verdict:
`d40bc0f` (`flushSync` fix), `40a68d2` and `2e04e67` (implementation.md, fr
string). Nothing changed outside what `implementation.md` describes.

TASK-1: PASS
notes: `NoteSearch.svelte:93-94` uses `notes.search_placeholder` for both
`placeholder` and `aria-label`. The key is in `types/translation.ts:532` and
all six locales. Per implementation.md the `translator` agent reviewed the
de/es/fr/it/ru values against `docs/I18N.md` and changed fr to
"Rechercher des notes" (`2e04e67`), which matches the other fr search strings.
The first-round blocker is resolved.

TASK-2: PASS
notes: `Notes.svelte.ts:189-202` uses a recursive `findCategory()` and still
falls back to `'-'`. `Notes.test.ts:153-159` covers a third-level folder.

TASK-3: PASS
notes: `Notes.svelte.ts:225-228` now assigns `searchVisible` and then calls
`flushSync()` with no argument. In the browser this mounts `NoteSearch`
inside the gesture. In the node `stores` project, where `flushSync` is a noop,
the assignment still happens, so `Notes.test.ts:392-400` holds again. All
three callers are event handlers (desktop button, mobile `openSearch`, the
Ctrl+K handler in `routes/notes/+layout.svelte:94`), not effects or render,
so `flushSync` is safe there. The flush lives in one place. The comment
explains a non-obvious platform constraint, which is allowed. Not verified on
an iOS device (noted in implementation.md).

TASK-4: PASS
notes: `NoteSearch.svelte:30-37,98` registers the keys in `onfocus`, guarded
against registering twice. They are released in `closeSearch()` and
`onDestroy`, all through `KeyManager`.

TASK-5: PASS
notes: `ContextMenuHelper.ts:14` adds `pointer-coarse:select-none` literally
in the file, so Tailwind picks it up. `-webkit-touch-callout` stays
unconditional.

TASK-6: N/A (manual, not for @developer)
notes: Still open. It needs a human with an iOS and an Android device.

Note: this worktree has no `node_modules`, so `npm test`, `npm run check`,
`npm run lint` and `npm run build` were run neither by the developer nor by
me. Judged by reading the code, the fix is correct. Run them before merging.

## Security

none

## Overall

APPROVED

Nothing blocks the merge. TASK-6 (device testing) and the
"unverified on iOS" note for TASK-3 stay with a human, as the brief planned.
