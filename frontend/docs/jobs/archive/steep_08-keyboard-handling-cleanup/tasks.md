# Tasks: 08 Keyboard handling cleanup

id: steep
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

Branch verified: worktree HEAD is `feature/steep_08-keyboard-handling-cleanup`, which matches `brief.md`.

## Findings that shape the tasks

- `src/lib/KeyManager.svelte.ts` groups keys into `primaryKeys` (`Enter`, `Escape`, `Space`), `characterKeys` (`e f s n`) and `functionKeys` (`F1`). Each group has its own typed slot in `handlers`, its own `is*Key` guard, its own `handle*` method and its own branch in `registerKeyDown`/`unregisterKeyDown`/`handleKeyDown`. `handledKeys` decides whether a key is handled at all. `SupportedKey` and the group types live in `src/lib/types/keydown.ts`.
- There is no `KeyManager` test yet. Store tests (`tests/unit/stores/*.test.ts`, node env, project `include: tests/unit/stores/**`) create store classes directly with `new X()`. That works for `KeyManager` too: `setContext` is only called in `setKeyManager()`. Node has no `KeyboardEvent`, so the test needs a plain `{ key, preventDefault: vi.fn() } as unknown as KeyboardEvent`.
- `ShelfView.svelte:62-65,76-77` listens on `window` for `ArrowLeft`/`ArrowRight` and calls `navigate(-1|1)`. It **does not** call `preventDefault`. `KeyManager` defaults to `preventDefault: true`. Registering with the defaults would change behaviour: arrows would stop moving the caret in any text input (e.g. the library search field) while the shelf view is mounted. So the registration must pass `preventDefault: false` to keep the shortcut unchanged (brief: "Changing any shortcut" is out of scope).
- `keyHandlers = $state(...)` occurs in exactly 35 files under `src/` (list below). None of them reads `keyHandlers` in markup, `$derived` or `$effect`. `ManageShortcuts.svelte:71` reassigns the whole object, and `NoteHeader.svelte:122` adds a `CtrlS` key. Both work unchanged with a plain `let`.
- `KeyManager.svelte` is imported by 38 files under `src/` plus `tests/components/helpers/ContextHarness.svelte` (39 total, plus the new test from TASK-1).

## Task breakdown

TASK-1: Add a failing unit test `tests/unit/stores/KeyManager.test.ts`. It covers `ArrowLeft`/`ArrowRight`: a registered handler runs on keydown, `preventDefault: false` is respected, and `unregisterKeyDown` removes the handler. Add one existing-key case (e.g. `Enter`) as a baseline.
     files: tests/unit/stores/KeyManager.test.ts (new)
     depends: none
     risk: low. Test only, and it is expected to fail (red) until TASK-2.

TASK-2: Add `ArrowLeft`/`ArrowRight` to `SupportedKey` and to `KeyManager`: type, key list, `handlers` map and `handledKeys`. Suggested: add them to the existing `PrimaryKey` group so no new group, guard or handle method is needed (see open question 1). Make TASK-1 pass.
     files: src/lib/types/keydown.ts, src/lib/KeyManager.svelte.ts
     depends: TASK-1
     risk: low. Additive; existing keys' paths are untouched, and arrows were previously ignored by `handleKeyDown`.

TASK-3: Switch `ShelfView.svelte` from the `window` listener to `KeyManager`.
     - Register `ArrowLeft` → `navigate(-1)` and `ArrowRight` → `navigate(1)` with `{ preventDefault: false }`.
     - Keep the ids in a plain `let keyHandlers` (idiom in STANDARDS 9.1) and release them with `unregisterAll` in `onDestroy`.
     - Remove `onKeydown` and the `window.addEventListener`/`removeEventListener` lines. Remove `onMount` from the import if it becomes unused.
     - Each handler keeps the `(event: KeyboardEvent) => void` contract (rule 12.1).
     files: src/lib/components/libraries/shared/ShelfView.svelte
     depends: TASK-2
     risk: medium. Defaults (`preventDefault: true`) would silently break caret movement in inputs, and a higher-priority handler with `preventOthers` could swallow arrows. Verify manually on /libraries/books and /libraries/music in shelf view: arrows navigate, and arrows still move the caret in the search input.

TASK-4: Move `src/lib/KeyManager.svelte.ts` to `src/lib/state/KeyManager.svelte.ts` (use `git mv` to keep history). Update every `$lib/KeyManager.svelte` import to `$lib/state/KeyManager.svelte`. No other change to the file.
     files: src/lib/KeyManager.svelte.ts → src/lib/state/KeyManager.svelte.ts;
       src/routes/+layout.svelte, src/routes/+page.svelte, src/routes/admin/+layout.svelte;
       tests/components/helpers/ContextHarness.svelte, tests/unit/stores/KeyManager.test.ts;
       src/lib/components/: ui/PopupConfirmationModal, users/Friends, quick-add/QuickAddModal, settings/CategoryEdit, settings/CreateEntry, shortcuts/ManageShortcuts, shortcuts/ShortcutEdit, time-tracking/TimeTrackingNavigation, todos/actions/TodoCreate, todos/ListAndAdd, todos/props/{Category,Description,Link,Subtask,Subtasks,Tags,Title}, libraries/links/CategoryCreate, libraries/shared/{LibrarySearchModal,Search,ShelfView}, notes/{CreateNoteCategory,NoteHeader,NoteTags}, contacts/{Search,AddressBookCreate}, dev-requests/{Comments,DevRequestEntry}, finances/{AddBudget,AddWealthField,BudgetField,WealthField}, forms/TimePicker, calendars/{CalendarCreate,EventAttachments,RecurrenceActionModal} (all `.svelte`)
     depends: TASK-3 (so ShelfView's new import is moved too; otherwise none)
     risk: low. Mechanical rename. `npm run check` and `npm test` catch any import that was missed. Afterwards, `grep -rn "lib/KeyManager" src tests` must be empty.

TASK-5a: Change `keyHandlers = $state<T>({...})` to `let keyHandlers: T = {...}` in the todos area and the root page (10 files). Keep the existing type annotation as is.
     files: src/routes/+page.svelte, src/lib/components/todos/actions/TodoCreate.svelte, src/lib/components/todos/ListAndAdd.svelte, src/lib/components/todos/props/{Category,Description,Link,Subtask,Subtasks,Tags,Title}.svelte
     depends: TASK-4 (only to avoid merge noise on the same import blocks)
     risk: low. No file reads `keyHandlers` reactively.

TASK-5b: The same change in notes, calendars, contacts and libraries (11 files).
     files: src/lib/components/notes/{NoteTags,NoteHeader,CreateNoteCategory}.svelte, src/lib/components/calendars/{CalendarCreate,EventAttachments,RecurrenceActionModal}.svelte, src/lib/components/contacts/{AddressBookCreate,Search}.svelte, src/lib/components/libraries/shared/{Search,LibrarySearchModal}.svelte, src/lib/components/libraries/links/CategoryCreate.svelte
     depends: TASK-4
     risk: low. Same reason. NoteHeader adds a `CtrlS` key at runtime, which its index-signature type already allows.

TASK-5c: The same change in the remaining 14 files.
     files: src/lib/components/dev-requests/{Comments,DevRequestEntry}.svelte, src/lib/components/quick-add/QuickAddModal.svelte, src/lib/components/finances/{BudgetField,AddBudget,WealthField,AddWealthField}.svelte, src/lib/components/shortcuts/{ShortcutEdit,ManageShortcuts}.svelte, src/lib/components/ui/PopupConfirmationModal.svelte, src/lib/components/settings/{CreateEntry,CategoryEdit}.svelte, src/lib/components/forms/TimePicker.svelte, src/lib/components/users/Friends.svelte
     depends: TASK-4
     risk: low. `ManageShortcuts.svelte:71` reassigns the whole object; this is still valid with `let`.
     After 5a–5c: `grep -rn 'keyHandlers = \$state' src` must be empty.

TASK-6: Verification.
     - Run `npm run check`, `npm run lint` and `npm test`.
     - The STANDARDS 9 check `grep -rnE "addEventListener\('key|<svelte:(window|document|body) onkey|onkeydown=" src` should no longer list ShelfView.
     - Manual pass over a few shortcuts: Enter/Escape in todos `Title`, `f` in a library search, Ctrl+S in a note, and arrows in shelf view.
     files: none
     depends: TASK-1 … TASK-5c
     risk: low. Verification only.

## Open questions / unclear scope (not guessed)

1. **Which group the arrow keys join.** Adding them to `PrimaryKey` reuses the existing code path and adds no abstraction. A separate `ArrowKey`/`NavigationKey` group would mirror the existing grouping style, but it means a new type, list, guard and handle method. Recommended: `PrimaryKey`. The developer or reviewer may decide otherwise.
2. **Docs that name the old path or the known violations.** These are not in the brief, so no task was created:
   - `docs/STANDARDS.md` lines 737, 769-777 and 862-864: the KeyManager path, the `SupportedKey` list and the ShelfView "known violation".
   - The three entries in `docs/STANDARDS_BACKLOG.md` (lines 21, 34, 91-92).
   These will be stale after this job. Ticking or updating them should be confirmed by the owner, or added as a follow-up task.
3. `KeyManager.helperKeyTimeouts` is also `$state` bookkeeping that is never rendered (rule 3.6). It is out of scope for this brief and is left untouched; it could be a follow-up.
