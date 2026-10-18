# Tasks: search bar overlays buttons in libraries

id: lot
analyst: @analyst
date: 2026-10-10

<!-- Produced by @analyst from brief.md. -->

## Root cause

`src/lib/components/libraries/shared/Search.svelte` renders its inline search input
inside an absolutely positioned, full-width, transparent container:

```
<div class="absolute z-30 flex w-full justify-center">
```

When `library.searchVisible` is true, this container floats above the whole header
row (the same header that holds Filter / Releases / Recommender / genre-edit /
Create buttons, rendered by `libraries/shared/Header.svelte`). The container has no
background, so the buttons stay visible, but it intercepts every click across the
header width, making them unclickable — exactly what the brief describes.

`Search.svelte` is the only inline search implementation for libraries (used only by
`shared/Header.svelte`, which all eight library pages route through); the separate
`LibrarySearchModal.svelte` is a modal and is not affected.

Fix: make the overlay container click-through (`pointer-events-none`) and restore
pointer events only on the input and the close button (`pointer-events-auto`). The
input itself keeps blocking clicks underneath it (with `inputExpanded`, `w-72` /
`md:w-96`), which per the brief is the correct behaviour. Visual layout is unchanged.

## Task breakdown

TASK-1: In `Search.svelte`, add `pointer-events-none` to the search-overlay container
     (`absolute z-30 flex w-full justify-center`) and `pointer-events-auto` to the
     search input and to the close (circle-x) button, so only the actual input area
     blocks clicks while the search is open and the rest of the header stays clickable.
     files: src/lib/components/libraries/shared/Search.svelte
     depends: none
     risk: low — one-file, CSS-class-only change; no visual or logic change, no new
     UI strings (no i18n impact). Also closes the same click-blocking during the
     collapsed/fade-in state (`w-0` input) for free.

TASK-2: Verify the fix: run `npm run check` (+ `npm run build`) and manually confirm
     that with the search open, the header buttons (Filter, Releases, Recommender,
     genre edit, Create — desktop and mobile variants) and the ViewSwitcher remain
     clickable on both sides of the centered input, at desktop and mobile widths,
     and that typing in the input still works and blocks what sits behind it.
     files: none (verification only — no code change expected)
     depends: TASK-1
     risk: low — verification task; jsdom cannot model pointer-event hit-testing, so a
     component test would not genuinely validate the click-through, and no such test
     exists for this component today.

## Notes for the developer

- Do not change the container's `w-full`, the input widths, or the z-indices —
  the visual layout is intentional (centered search bar over a full-width header).
  The only required change is pointer-event behaviour.
- An alternative (constraining the container width to the input's width) is a valid
  approach but wider-reaching and more fragile across breakpoints (input `w-72` vs
  `md:w-96` + the 30px close-button overhang); prefer TASK-1's pointer-events fix.
- Re-opening the search by clicking the magnifier icon while the overlay is open is
  a no-op and stays harmless after the change.