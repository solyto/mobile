# Tasks: bottom sheet modal should sit above keyboard

id: permission
status: open
analyst:
date: 2026-09-05

<!-- Produced by @analyst from brief.md. -->

## Context / finding

`BottomSheetModal.svelte` (and the structurally identical `BottomSheetConfirmationModal.svelte`)
anchor the sheet to the bottom of the viewport with `fixed top-0 left-0 h-dvh w-screen flex items-end`.
On mobile (PWA and the dedicated app shell) the on-screen keyboard opens over the sheet: neither `dvh`
(which stays at the full layout-viewport height) nor `fixed` positioning accounts for the keyboard, so the
sheet's bottom — often the interactive controls — is hidden underneath it.

There is currently no `visualViewport` / keyboard handling anywhere in `src/`. The cleanest fix is to track
the `window.visualViewport` and lift the sheet's bottom edge up by the keyboard height
(`window.innerHeight - visualViewport.height`).

Note: `ContentModal`, `QuickAddModal`, and `MobileCalendarHeader` all delegate to `BottomSheetModal`, so
fixing the shared component covers them. `PopupContentModal` / `PopupConfirmationModal` are centered dialogs,
not bottom sheets, and are out of scope.

## Task breakdown

TASK-1: In `BottomSheetModal.svelte`, add a reactive keyboard-aware bottom offset: listen to
     `window.visualViewport` `resize`/`scroll` in `onMount` (with proper cleanup), compute the keyboard
     height as `max(0, window.innerHeight - visualViewport.height)`, and apply it as an inline
     `padding-bottom` style on the overlay `<div>` so the sheet sits above the keyboard while keeping the
     existing `pb-16 2xl:pb-0` classes as the no-keyboard default. Guard against counting normal browser
     chrome / small jitter as a keyboard (only lift when the height difference exceeds a small threshold,
     e.g. ~60px), and keep it SSR-safe (guarded to the client, no-op when `visualViewport` is unavailable,
     e.g. desktop/older browsers).
     files: src/lib/components/ui/BottomSheetModal.svelte
     depends: none
     risk: medium — keyboard detection differs across iOS Safari / Chrome Android; threshold tuning and
     listener lifecycle are the main pitfalls.

TASK-2: Mirror the exact same keyboard-aware bottom-offset logic in `BottomSheetConfirmationModal.svelte`,
     which uses the identical `fixed ... h-dvh ... items-end` structure. If the developer finds the two
     copies of the listener logic are drifting, extracting a tiny shared helper in `src/lib/helpers/` is
     acceptable, but two small self-contained implementations are preferred over a new abstraction
     (per the "do not add abstractions not already present" rule).
     files: src/lib/components/ui/BottomSheetConfirmationModal.svelte
     depends: TASK-1
     risk: low — same change, second component; main risk is forgetting cleanup of the added listeners.

TASK-3: Verify the change compiles cleanly with `npm run check` (and `npm run build` if feasible). No new
     UI strings, so no i18n changes are expected. Manual on-device validation of keyboard behavior is the
     only way to fully confirm the fix, but the code path is limited to the two bottom-sheet components.
     files: none (verification only)
     depends: TASK-1, TASK-2
     risk: low — type-check only; no new dependencies or strings.
