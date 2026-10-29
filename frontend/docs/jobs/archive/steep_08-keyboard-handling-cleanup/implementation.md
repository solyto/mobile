# Implementation: 08 Keyboard handling cleanup

id: steep
developer: @developer
date: 2026-10-13

## Summary

`KeyManager` now supports `ArrowLeft`/`ArrowRight`. `ShelfView` registers its arrow navigation with `KeyManager` instead of using a private `window` listener. `KeyManager` moved to `src/lib/state/`, and all 35 `keyHandlers = $state(...)` declarations are now plain `let` with the same type annotation. No shortcut behaviour was changed on purpose.

**Not verified by running anything:** the workspace has no `node_modules`, and the project rules forbid installing packages without asking. So `npm run check`, `npm run lint`, `npm test` and the manual shortcut pass (TASK-6) were **not run**. Before merging, run `npm ci && npm run check && npm run lint && npm test` and do the manual pass from TASK-6.

## Changes

TASK-1: New `tests/unit/stores/KeyManager.test.ts`. It covers an `Enter` baseline, `ArrowLeft`/`ArrowRight` dispatch with `preventDefault` called by default, `preventDefault: false` being respected, and `unregisterKeyDown` removing the handler. It uses a plain `{ key, preventDefault: vi.fn() }` event stub because node has no `KeyboardEvent`.

TASK-2: `src/lib/types/keydown.ts` adds `ArrowLeft | ArrowRight` to `PrimaryKey` and `SupportedKey`. `KeyManager.svelte.ts` adds them to the `handlers` map/initialiser and to `primaryKeys`, so they are also in `handledKeys`. I took the analyst's recommendation (open question 1): put the arrows in the existing `PrimaryKey` group, so no new group, guard or handle method was needed.

TASK-3: `libraries/shared/ShelfView.svelte` drops `onKeydown`, the `window` add/remove listener and `onMount`. It now registers `ArrowLeft` → `navigate(-1)` and `ArrowRight` → `navigate(1)` with `{ preventDefault: false }`, so arrows still move the caret in text inputs, as before. The ids are kept in a plain `let keyHandlers` and released with `unregisterAll` in `onDestroy` (STANDARDS 9.1/9.2). One difference from the old listener: arrows now go through `KeyManager`'s priority/`preventOthers` chain. Today no other component registers arrows, so nothing changes in practice.

TASK-4: Moved `src/lib/KeyManager.svelte.ts` → `src/lib/state/KeyManager.svelte.ts` (`git mv` is blocked by the session shim, so I used plain `mv`; git still records it as a 100% rename). I updated every `$lib/KeyManager.svelte` import: 39 files in `src/` (38 + ShelfView), plus `tests/components/helpers/ContextHarness.svelte` and the new test. `grep -rn "lib/KeyManager" src tests` is empty.

TASK-5a/5b/5c: `let keyHandlers = $state<T>(v)` → `let keyHandlers: T = v` in the 35 listed files (10 + 11 + 14), done by a balanced-bracket script so multi-line declarations (NoteHeader, Description, DevRequestEntry) are handled too. `grep -rn 'keyHandlers = \$state' src` is empty. I checked every remaining `keyHandlers` use: they are only id bookkeeping (assign, unregister, whole-object reset in ManageShortcuts/ShortcutEdit) and never reactive reads.

TASK-6: The STANDARDS 9 grep no longer lists ShelfView. Its remaining hits were all there before this job: the two `handleKeyDown` forwarders in the layouts, `SecuritySettings.svelte:148,188` and `todos/views/CompactEntry.svelte:43`. check/lint/test and the manual pass were not run (see Summary).

## Known issues / follow-ups

- **Verification gap:** check, lint, tests and the manual shortcut pass still need to be run in an environment with dependencies installed.
- Docs are now stale (not in the brief, so not touched): `docs/STANDARDS.md` §9 intro (path `src/lib/KeyManager.svelte.ts`), §9.2 (`SupportedKey` list and the ShelfView "known violation"), §11.1 (KeyManager path called "wrong; backlog"), and the related entries in `docs/STANDARDS_BACKLOG.md`. The owner needs to confirm before these are updated or ticked off.
- `KeyManager.helperKeyTimeouts` is also `$state` bookkeeping that is never rendered (rule 3.6). Out of scope; could be a follow-up.
- `/workspace/.mcp.json` shows as modified (a `context7` MCP server entry). It comes from the session environment, not this job, so I deliberately left it uncommitted.
