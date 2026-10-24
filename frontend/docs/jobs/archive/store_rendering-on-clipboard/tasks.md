# Tasks: rendering on clipboard

id: store
status: open
analyst:
date: 2026-08-27

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Render newlines in the clipboard history list text entries
     files: src/lib/components/clipboard/ClipboardList.svelte
     depends: none
     risk: low — isolated markup/CSS change in one component; content stays
     escaped either way (no XSS surface). Recommended implementation: add
     Tailwind `whitespace-pre-wrap` (+ `break-words` for long unbroken strings)
     to the `<p class="pr-16 text-sm">` that renders `entry.content`, keeping
     Svelte's default escaping. Alternative that matches the existing codebase
     pattern: `{@html DOMPurify.sanitize(nl2br(entry.content))}` (same as
     QuoteWidget / DevRequestEntry / RecipeDetail). No markdown rendering.
     Copy (line 74) and delete must keep using the full `entry.content`.

TASK-2: Add a pure `truncate(text, maxLength)` helper with unit tests
     files: src/lib/helpers/FormatHelper.ts, tests/unit/helpers/FormatHelper.test.ts
     depends: none
     risk: low — pure function + unit tests, no UI impact. Behavior: if
     `text.length > maxLength`, return `text.slice(0, maxLength)` with trailing
     whitespace/newlines trimmed, plus the literal `"..."` (three dots);
     otherwise return the text unchanged. Cover in tests: short text unchanged,
     long text truncated with "...", exact-boundary length, trailing-newline
     edge case (ellipsis must not sit on its own line), empty string.

TASK-3: Apply max-length truncation ("...") to clipboard list text entries
     files: src/lib/components/clipboard/ClipboardList.svelte
     depends: TASK-1, TASK-2
     risk: medium — the brief does not specify the numeric max length (product
     decision). Pick a sensible default as a named constant (e.g. 200
     characters) and flag it for confirmation. Render the truncated content via
     the TASK-2 helper before newline rendering; the copy action must still
     copy the full content.

TASK-4: Verify the change
     files: none (verification only)
     depends: TASK-1, TASK-2, TASK-3
     risk: low — run `npm run check` (type-check + i18n sync), `npm test`
     (new helper tests), and `npm run lint`; visually confirm multi-line
     entries render with line breaks and a cap. Requires a running API for
     visual confirmation (dev server expects http://localhost:8000); if no API
     is available, static verification (tests + check + lint) is the fallback.