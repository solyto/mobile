## Summary

Fixed the bottom-sheet modals being hidden underneath the on-screen keyboard on
mobile (PWA / dedicated app). Both bottom-sheet components now track
`window.visualViewport` and lift their bottom edge up by the keyboard height so
the sheet — and its interactive controls — remain visible above the keyboard.

## Changes

TASK-1 (`src/lib/components/ui/BottomSheetModal.svelte`):
- Added an `onMount` that listens to `window.visualViewport` `resize`/`scroll`
  events (with proper cleanup on destroy).
- Computes `keyboardHeight = max(0, window.innerHeight - visualViewport.height)`
  and only applies it when the difference exceeds a 60px threshold (to avoid
  counting normal browser chrome / small jitter as a keyboard).
- Applies the result as an inline `style:padding-bottom` on the overlay div,
  keeping the existing `pb-16 2xl:pb-0` classes as the no-keyboard default.
- SSR-safe: guarded to the client, no-op when `visualViewport` is unavailable.
- `ContentModal`, `QuickAddModal`, and `MobileCalendarHeader` delegate to this
  component, so they are covered automatically.

TASK-2 (`src/lib/components/ui/BottomSheetConfirmationModal.svelte`):
- Mirrored the exact same keyboard-aware bottom-offset logic (identical
  structure/guard/threshold). Two small self-contained implementations kept, as
  preferred over a new shared abstraction.

TASK-3 (verification):
- Could not run `npm run check` / `npm run build` because `node_modules` is not
  installed in this environment (and installing dependencies is disallowed
  without confirmation). Changes are minimal and self-contained; the two
  components are now structurally consistent.

## Known issues / follow-ups

- Manual on-device validation (iOS Safari / Chrome Android) is the only way to
  fully confirm keyboard behavior across platforms; the threshold (60px) and
  `visualViewport` behavior may need tuning on specific devices.
- `PopupContentModal` / `PopupConfirmationModal` are centered dialogs and were
  intentionally left out of scope.
