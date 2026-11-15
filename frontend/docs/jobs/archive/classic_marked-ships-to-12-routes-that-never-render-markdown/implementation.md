## Summary

Moved `markdownToHtml` and the `marked` import out of `FormatHelper.ts` into a new `MarkdownHelper.ts`. Now only code that actually renders markdown imports `marked`. Routes that use only `nl2br`/`truncate`/`stripHtml` (the dashboard, clipboard, feeds, dev-requests and the libraries) should no longer pull in the `marked` chunk.

## Changes

TASK-1: New `src/lib/helpers/MarkdownHelper.ts` with the same `markdownToHtml` code. I removed the function and the `marked` import from `src/lib/helpers/FormatHelper.ts`.
TASK-2: `src/lib/components/todos/props/Description.svelte` now imports `markdownToHtml` from `$lib/helpers/MarkdownHelper`.
TASK-3: Moved the `markdownToHtml` tests unchanged from `tests/unit/helpers/FormatHelper.test.ts` into the new `tests/unit/helpers/MarkdownHelper.test.ts` (no jsdom directive, since `marked` runs in node) and removed the function from the FormatHelper test import.
TASK-4: Not run. The worktree has no `node_modules`, so `vitest`, `svelte-check` and `eslint` were not found. Installing them would have broken the "no installs without asking" rule. What I checked instead, by reading the code: `marked` is now imported only in `MarkdownHelper.ts` and `TipTapEditor.svelte`, and `Description.svelte` is the only caller of `markdownToHtml`.

## Known issues / follow-ups

- Still to do after `npm ci`: run `npm test`, `npm run check`, `npm run lint`, then `npm run build` and check the manifest/chunks (brief §5).
- Brief §4 (lazy-loading `canvas-confetti`) was left out on purpose. It needs the owner to decide.
