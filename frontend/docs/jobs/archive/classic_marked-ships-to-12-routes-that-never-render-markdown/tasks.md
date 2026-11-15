# Tasks: `marked` ships to 12 routes that never render markdown

id: classic
analyst: @analyst
date: 2026-11-10

## Task breakdown

TASK-1: Move `markdownToHtml` (and the `marked` import) out of `FormatHelper.ts` into a new `src/lib/helpers/MarkdownHelper.ts`, with the same body, so `FormatHelper` no longer imports `marked`.
  files: src/lib/helpers/MarkdownHelper.ts (new), src/lib/helpers/FormatHelper.ts
  depends: none
  risk: low — pure move of a one-line function; only one caller exists (verified by grep).

TASK-2: Point `Description.svelte` at the new module (`import { markdownToHtml } from '$lib/helpers/MarkdownHelper'` on line 7); leave the `nl2br` import on line 8 as it is.
  files: src/lib/components/todos/props/Description.svelte
  depends: TASK-1
  risk: low — import path change only; `npm run check` catches a wrong path.

TASK-3: Move the `describe('markdownToHtml', …)` block out of `FormatHelper.test.ts` into a new `tests/unit/helpers/MarkdownHelper.test.ts`, and drop `markdownToHtml` from the FormatHelper test import.
  files: tests/unit/helpers/FormatHelper.test.ts, tests/unit/helpers/MarkdownHelper.test.ts (new)
  depends: TASK-1
  risk: low — tests move unchanged; the new file needs no jsdom directive (`marked` runs in node), but keeping it is harmless.

TASK-4: Verify: `npm test`, `npm run check`, `npm run lint` green; `npm run build`, then confirm the `FormatHelper` chunk in `build/client/_app/immutable/chunks/` no longer imports the `marked` chunk and that `marked` is reachable only from the todos and notes nodes in `.svelte-kit/output/client/.vite/manifest.json`.
  files: none (verification only)
  depends: TASK-1, TASK-2, TASK-3
  risk: low — read-only check; no code change.

## Out of scope / unclear

- Brief §4 (lazy-loading `canvas-confetti` in `YourDay.svelte`, `TodoEditModal.svelte`, `routes/todos/+page.svelte`) is marked optional and depends on the owner accepting a one-round-trip delay on the first celebration. That decision is not in the brief, so it is not planned here. If the owner wants it, add it as a separate task (risk: low–medium — async call sites change; note `src/lib/effects/confetti.ts` already exists and should be checked first).
- `TipTapEditor.svelte` imports `marked` directly; that is legitimate (notes render markdown) and stays unchanged.
