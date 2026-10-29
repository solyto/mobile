# Implementation: search bar overlays buttons in libraries

id: lot
developer: @developer
date: 2026-10-10

## Summary

Fixed the library search overlay intercepting clicks on the header buttons
(Filter / Releases / Recommender / genre-edit / Create / ViewSwitcher) while
the search is open. The overlay container in `Search.svelte` was
`absolute z-30 flex w-full justify-center` — a full-width, transparent layer
floating above the header row. It had no background, so the buttons stayed
visible, but it swallowed every click across the header width.

The fix makes the overlay container click-through (`pointer-events-none`) and
restores pointer events only on the search input and the close button
(`pointer-events-auto`). The input itself still blocks clicks on whatever sits
behind it (only `w-72` / `md:w-96` wide when expanded), which is the intended
behaviour per the brief. Visual layout is unchanged.

TASK-1: CSS-class-only change in `Search.svelte`.
TASK-2: Verified via `npm run check` (0 errors / 0 warnings), Live
  hit-testing with Playwright + headless chromium at desktop (1280px) and
  mobile (375px) widths, and inspection of the built CSS.

## Changes

TASK-1: `src/lib/components/libraries/shared/Search.svelte`
  - Search-overlay container (`div.absolute.z-30.flex.w-full.justify-center`,
    renders when `library.searchVisible` is true): added `pointer-events-none`
    so clicks pass through the full-width transparent container to the header
    buttons underneath.
  - Search `<input>`: added `pointer-events-auto` so the input itself stays
    interactive (typing, focusing) and continues to block clicks on anything
    directly behind its own footprint.
  - Close button (`<IconCircleX />`, `ml-[-30px]` overhang): added
    `pointer-events-auto` so it stays clickable.
  - No change to `w-full`, input widths, z-indices, or any visual styling.

TASK-2: Verification only — no code change.
  - `npm run check` → 0 errors, 0 warnings.
  - `npm run build` → the Vite transform + Tailwind CSS generation complete
    (`✓ built`, all 1961 modules), and the generated app CSS contains both
    `pointer-events-auto` and `pointer-events-none` utilities. The final
    adapter-node output step is OOM-killed in this environment (2 GB cgroup
    memory limit); this is a pre-existing environment constraint, unrelated to
    the change (the changed files compile cleanly and the client build output
    is produced).
  - Playwright hit-test verification (replicating the exact Header + Search
    overlay structure): with the overlay open at 1280px and 375px,
    * Filter / Create buttons on both sides of the centered input receive
      clicks (click propagates through the overlay container),
    * the close button receives clicks,
    * a button positioned directly under the expanded input does NOT receive
      clicks (correct blocking behaviour),
    * typing into the input works,
    * computed `pointer-events` = `none` on the container, `auto` on input and
      close button.
  - `npm test`: 723/724 pass; the single failure is a pre-existing, unrelated
    failure in `tests/components/logic-leaves.test.ts`
    (`StatisticWidget > applies the requested color classes` — expects a
    `.bg-blue-50` class which Tailwind v4 does not generate as a static
    utility; the assertion exists in HEAD, untouched by this job).

## Known issues / follow-ups

- `npm run build` cannot complete the final adapter-node server output in this
  environment due to a 2 GB cgroup memory limit (the process is OOM-killed
  during app-wide chunk rendering). CI / machines with more memory complete
  it. Not caused by and not addressable from this change.
- Pre-existing test failure in `tests/components/logic-leaves.test.ts`
  (`StatisticWidget > applies the requested color classes`, expecting
  `.bg-blue-50`) — unrelated to the libraries search bar; already failing
  before this job.