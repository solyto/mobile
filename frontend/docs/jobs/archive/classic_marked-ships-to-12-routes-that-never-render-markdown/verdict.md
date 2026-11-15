# Verdict: `marked` ships to 12 routes that never render markdown

id: classic
reviewer: @reviewer
date: 2026-11-10

## Review

Reviewed `git diff main...HEAD`. Besides the job docs, it changes only the five files named in tasks.md. Nothing is out of scope; the optional confetti item (§4) was correctly left out.

TASK-1: PASS
notes: `src/lib/helpers/MarkdownHelper.ts` has the same body as before (`marked.parse(text, { async: false })`). `FormatHelper.ts` no longer imports `marked`. Grep confirms `marked` is now imported only in `MarkdownHelper.ts` and `notes/editor/TipTapEditor.svelte`, as intended.

TASK-2: PASS
notes: `Description.svelte:7` now imports from `$lib/helpers/MarkdownHelper`; `nl2br` import on line 8 untouched. It is the only caller of `markdownToHtml` (grep).

TASK-3: PASS
notes: The `markdownToHtml` describe block was moved verbatim into `tests/unit/helpers/MarkdownHelper.test.ts`; `FormatHelper.test.ts` import updated and keeps its jsdom directive (still needed by `stripHtml`/`hasMeaningfulDescription`).

TASK-4: PARTIAL
notes: Not executed — the worktree has no `node_modules` (also true in the review session), and installing is disallowed. The change is a pure function move along a module seam and matches the brief's change exactly, which the brief's author already verified in a throwaway build. Static review finds no reference left to the old export. `npm test`, `npm run check`, `npm run lint` and the build/manifest check (brief §5) should still be run by someone with dependencies installed before or at merge. That is an environment gap, not a defect in the change.

## Security

none — no security-relevant change. `Description.svelte` still sanitizes the output with DOMPurify.

## Overall

APPROVED

No code changes required.
