# Verdict: starring or renaming an open note silently drops its unsaved text on the next save

id: lost
reviewer: reviewer
date: 2026-11-18

## Review

Diff `main...HEAD`: `src/lib/state/Notes.svelte.ts` (+3), `tests/unit/stores/Notes.test.ts` (+89), job docs. Nothing outside tasks.md.

TASK-1: PASS
notes: `Notes.svelte.ts:214-219` matches brief §3 exactly. The single comment is a why-comment for a constraint the code cannot express (STANDARDS 10.1). Different id → `localContent` is null, behaviour unchanged; unknown id → `activeNote` null, guarded.

TASK-2: PASS
notes: `mockServerNotes()` sits next to the unchanged `mockLists()` and returns `structuredClone`d objects per call. No new shared helper.

TASK-3: PASS
notes: `describe('reload of the open note')` covers `updateFavoriteStatus`, `changeTitle`, `addTag`. Each asserts the local content and the server field. With the old `selectNote` the reload would return the cloned server `<p>old</p>`, so these tests fail without TASK-1.

TASK-4: PASS
notes: The deferred `api.update` follows the existing pattern. The test asserts that the PUT payload was the pre-change content and that the later local content survives.

TASK-5: PASS
notes: `selectNote takes the server content of a different note` in `describe('active note')`.

TASK-6: PASS
notes: Re-run by the reviewer: `vitest` Notes.test.ts 54/54 passed, eslint clean on both files, `npm run check` 0 errors / 0 warnings. No `$derived`/`$effect`, formatting per 1.10, no debug leftovers.

## Security

none — no new input handling, no API or auth change.

## Overall

APPROVED

No blockers.
