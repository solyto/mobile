# Backlog: notebook search and long-press follow-ups

created: 2026-11-18

## What

Small issues in the notebook search and the touch long-press menu added
after 1.1.3. (Ctrl+K opening the search over the Move-to-folder modal is
known and deliberately not tracked.)

1. **Search input has no label.** `NoteSearch.svelte` input has no
   placeholder and no `aria-label`: it shows as an empty box.
2. **Folder name missing for deep folders.** `Notes.getCategoryTitle`
   (`Notes.svelte.ts:189`) only looks two levels deep, while `MoveNoteModal`
   offers folders at any depth. A result in a third-level folder shows "-".
3. **iOS focus.** `NoteSearch.svelte` ~23-31 focuses inside a 50 ms
   `setTimeout`, outside the tap, so iOS usually doesn't open the keyboard. If
   focus never lands, `focusout` never fires and ArrowUp/ArrowDown stay
   captured (priority 0, `preventDefault`), which blocks caret movement with a
   hardware keyboard (iPad). Suspected, not tested on a device.
4. **Long press, real devices.** `ContextMenuHelper.ts` handles scroll and
   move cancel. Not verified on iOS/Android: whether a compatibility
   mousedown/touchstart after the long press reaches `clickOutside` and closes
   the menu right after it opens.
5. **Titles can't be selected on desktop.** `ContextMenuHelper.ts:14` sets
   `user-select: none` on every nav row, also for mouse users.

## Suggestion

1. Add a placeholder and `aria-label` (new i18n key).
2. Walk the folder tree recursively (or build an id → title map once).
3. Focus synchronously in the click handler; release the arrow-key handlers
   when the search closes for any reason.
4. Test on one iOS and one Android device; fix only if it reproduces.
5. Apply `user-select: none` only for touch (e.g. `@media (pointer: coarse)`).
