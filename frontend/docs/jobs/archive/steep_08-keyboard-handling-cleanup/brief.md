# Brief: 08 Keyboard handling cleanup

type: feature
id: steep
branch: feature/steep_08-keyboard-handling-cleanup
date: 2026-10-13
author: Leander Muskalla

## What

- Declare `keyHandlers` as a plain `let` instead of `$state` in the 35 components that copied the old idiom.
- Move `src/lib/KeyManager.svelte.ts` to `src/lib/state/` (38 imports).
- Add `ArrowLeft`/`ArrowRight` to `SupportedKey` and `KeyManager`, and switch `libraries/shared/ShelfView.svelte` from its private `window` listener to `KeyManager`.

## Why

Handler ids are never rendered, so reactive bookkeeping is noise and a loop hazard; `KeyManager` is a store in every respect except its path; and `ShelfView` is the one remaining private key listener.

## Out of scope

Changing any shortcut.

## Notes

Add a `KeyManager` test for the new keys first. The rest is mechanical, verified by `check` and a manual pass over a few shortcuts. Rules: 3.6, 9.1, 9.2, 11.1.
