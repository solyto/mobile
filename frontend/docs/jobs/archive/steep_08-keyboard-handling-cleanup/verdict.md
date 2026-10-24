# Verdict: 08 Keyboard handling cleanup

id: steep
reviewer: @reviewer
date: 2026-10-13

## Review

Branch checked: `feature/steep_08-keyboard-handling-cleanup` (matches brief). Diff reviewed: `git diff main...HEAD` (47 files). Every changed file is covered by a task or is a job doc. The two `chore: commit all` commits only touch `brief.md`/`tasks.md`. `.mcp.json` is modified in the worktree but is not committed and is not part of the diff.

TASK-1: PASS
notes: `tests/unit/stores/KeyManager.test.ts` has an `Enter` baseline, plus `ArrowLeft`/`ArrowRight` tests for dispatch with the default `preventDefault`, `preventDefault: false`, and `unregisterKeyDown`. It uses the event stub as planned and imports from the new `$lib/state/` path. Commit order (TASK-1 before TASK-2) matches the test-first note.

TASK-2: PASS
notes: `types/keydown.ts` adds the arrows to `PrimaryKey` and `SupportedKey`. In `KeyManager`, the arrows are added to the `handlers` type and initialiser and to `primaryKeys`, so `handledKeys`, `isPrimaryKey`, `handlePrimary` and `unregisterKeyDown` pick them up automatically. This uses the PrimaryKey option the analyst recommended in open question 1. Existing keys are unchanged.

TASK-3: PASS
notes: In `ShelfView.svelte`, `onKeydown`, the `window` add/remove listener and the `onMount` import are gone. Arrows are now registered with `{ preventDefault: false }`, which keeps the old caret behaviour in inputs. The code uses the 9.1 idiom (plain `let keyHandlers`, `unregisterAll` in `onDestroy`). ShelfView only renders under the root layout, whose `KeyManager` receives every keydown. No other component registers arrows, so `preventOthers` cannot swallow them. The STANDARDS 9 grep no longer lists ShelfView, and the remaining hits all existed before this job.

TASK-4: PASS
notes: Git records `src/lib/{ => state}/KeyManager.svelte.ts` as a 97% rename, and the only content changes are TASK-2's. `grep -rn "lib/KeyManager" src tests` is empty: 36 `getKeyManager` imports, 2 layout `get/setKeyManager` imports, ContextHarness and the new test all use `$lib/state/KeyManager.svelte`.

TASK-5a/5b/5c: PASS
notes: There are exactly 35 `$state` → plain `let` conversions (counted from the diff), and each keeps its original type annotation. `grep -rn 'keyHandlers = \$state' src` is empty. The only non-assignment uses of `keyHandlers` are the `unregisterKeyDowns([...])` call in `Description.svelte:57-59` and the whole-object resets in `ShortcutEdit.svelte:37` and `ManageShortcuts.svelte:71`. None of these is reactive, and markup, `$derived` and `$effect` never read `keyHandlers`.

TASK-6: PARTIAL
notes: There are no `node_modules` in the workspace, so neither the developer nor I could run `npm run check`, `npm run lint`, `npm test` or the manual shortcut pass. The developer says this openly in `implementation.md`. The grep part of TASK-6 was done and I confirmed it. Reading the code, I found no type or logic problems: the zero-arg arrow handlers fit `(event: KeyboardEvent) => void | Promise<void>`, and every `keyHandlers` reassignment matches its declared type. This is a limit of the environment, not a defect in the change.

## Security

Not run. The change only touches client-side key-handler wiring and does not affect auth, data or network code.

## Overall

APPROVED

No code changes are required. Before merging, the owner should run `npm ci && npm run check && npm run lint && npm test` and do the manual pass from TASK-6 (arrows in shelf view on /libraries/books and /libraries/music, caret still moving in the search input, Enter/Escape in a todo title, `f` in a library search, Ctrl+S in a note). Neither the developer nor the reviewer could do this in the agent environment.
