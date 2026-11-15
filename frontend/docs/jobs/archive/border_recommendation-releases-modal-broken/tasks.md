# Tasks: recommendation / releases modal broken

id: border
analyst: analyst
date: 2026-11-10

## Context

Both modals open `ContentModal` with `transparent={true}`. In
`PopupContentModal.svelte` that drops `bg-c-bg-modal`, the border and the
shadow from the content panel. Before, each entry (`MusicRelease`,
`BookRelease`, `MovieRelease`, `Recommendation`) had its own boxed card, so the
see-through panel looked fine. Those cards are gone now, so the content floats on
the blurred backdrop. The other library modals (`CreateModal`, `DetailModal`,
`LibrarySearchModal`) don't pass `transparent` and use `rounded="2xl" p="8"`.

These two files are the only callers of `transparent`. `BottomSheetModal`
(mobile) never reads the prop, so the fix only matters for the desktop popup.

## Task breakdown

TASK-1: Make the releases modal a normal modal: drop `transparent={true}` and pass `rounded="2xl" p="8"` like `CreateModal`/`LibrarySearchModal`. Adjust the inner wrapper's spacing (`pt-6 pb-4`) only if it looks wrong in the padded panel.
  files: src/lib/components/libraries/shared/Releases.svelte
  depends: none
  risk: low — one component with a single call site, and the modal already handles the non-transparent case for every other library modal.

TASK-2: Make the recommender modal a normal modal the same way: drop `transparent={true}` and pass `rounded="2xl" p="8"`. Keep the fixed `md:h-92 md:w-112` content size.
  files: src/lib/components/libraries/shared/Recommender.svelte
  depends: none
  risk: low — same one-prop change; the option buttons and the result keep their markup.

TASK-3: Once TASK-1 and TASK-2 are done, nothing passes `transparent`. Remove the prop and its conditional classes (`top-3`/`left-15` title offset, the `max-md:h-[...]` toggle, and the four `class:*={!transparent}` toggles become unconditional) so no dead code is left behind.
  files: src/lib/components/ui/PopupContentModal.svelte
  depends: TASK-1, TASK-2
  risk: medium — this is a shared modal used across the app; the change must be identical to today's `transparent = false` output, so the diff has to be checked carefully. It is optional: skip it if the owner wants to keep the prop.

## Unclear / for the developer or owner

- Releases list: the entries no longer have cards, so several releases stacked in a solid modal may run together. The brief doesn't ask for separators. Don't add them unless the render shows a problem, and if it does, ask first.
- The "no releases" empty state in `Releases.svelte` (line ~73) and the recommender option buttons (`recommenderOption` snippet) still use the bordered `bg-c-bg-surface shadow-sm` card style. The brief only covers the modal background, so leave them alone. Flag in implementation.md if a box inside the modal looks odd.
- Verification is visual: check both modals on desktop, light and dark theme. Mobile (bottom sheet) should not change.
