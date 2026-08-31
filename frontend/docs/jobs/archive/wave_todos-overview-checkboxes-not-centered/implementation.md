# Implementation: todos overview: checkboxes not centered

id: wave
status: open
developer: opencode (deepseek-v4-flash)
date: 2026-08-17

## Summary

Fixed the vertically misaligned checkbox in the todos **overview** view (the compact card rows).

TASK-1 confirmed at runtime (headless Chromium + the project's compiled CSS) that the checkbox square sat ~3px above the card's vertical center in every breakpoint (360/768/1280/1920 px), light and dark. Root cause: in `CompactCard.svelte` the shared `Checkbox` is wrapped in a block-level `<div class="shrink-0">`, and the Checkbox's own outer container is `display: inline-flex` — an inline-level box. As inline content it participates in the wrapper's line box, which gets inflated (26px vs the 20px checkbox, due to Barlow font-metric/baseline alignment) and the inline-flex box is pinned toward the top of that line box. The row's `items-center` only centers the 26px wrapper, not the 20px checkbox inside it.

TASK-2 fixed it with a one-class change in `CompactCard.svelte`: the checkbox wrapper is now a flex container (`flex shrink-0 items-center`), so its height collapses to the checkbox height and the row centers it perfectly. Re-verified in headless Chromium: checkbox delta 0 and checkmark delta 0 in all scenarios (with/without due date, long/short titles, checked/unchecked, mobile/tablet/desktop, dark mode).

TASK-3 was **not** triggered: TASK-1 proved the cause lives in the CompactCard wrapper / `inline-flex` interaction, not in the shared `Checkbox` component. All other Checkbox call sites (list entry, kanban card, subtasks, dashboard widgets, form rows) place the component as a *direct* flex item, where it renders correctly; the shared component was left untouched.

TASK-4 verified the fix and ran the quality gates (see below).

## Changes

- TASK-1: Reproduction and root-cause analysis (read-only; no production change). Set up a headless-Chromium harness (project CSS + verbatim component markup cross-checked against the compiled SSR output) to measure checkbox vs. card geometry. Findings documented in Summary above.
- TASK-2: `src/lib/components/todos/views/CompactCard.svelte` — checkbox wrapper changed from `<div class="shrink-0">` to `<div class="flex shrink-0 items-center">` so the checkbox is vertically centered within the overview card row regardless of sibling heights (title/due-date line boxes).
- TASK-4: Verified across breakpoints and themes (measurements above) and ran `npm run check` (0 errors / 0 warnings), `npm run test` (74/74 passed), `npm run lint` (see known issues).

## Known issues / follow-ups

- `npm run lint` (prettier --check + eslint) fails on the repo **before** this change: 255 files have pre-existing Prettier formatting issues (e.g. `src/styles/base.css`, `src/lib/components/forms/Checkbox.svelte`) and 284 pre-existing eslint errors (`svelte/no-navigation-without-resolve` etc.). The changed file passes eslint; its only Prettier complaint (the long `class` attribute on the card row, line 28) also exists before this change. `npm run format` was therefore not run repo-wide, since `prettier --write .` would reformat 255 unrelated files — out of scope for this job. If desired, a follow-up chore commit can run `npm run format` repo-wide.
- For reproducibility, the browser-verification harness (headless Chromium measurement script) was kept out of the repo (temporary tooling only). System browser libs and the playwright dev-dependency used for verification were not committed.