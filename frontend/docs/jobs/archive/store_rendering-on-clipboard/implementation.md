## Summary

Fixed the clipboard history list rendering: text entries now display newlines instead of folding them into one line, and are capped at a maximum preview length with "..." appended. The copy and delete actions keep using the full `entry.content`.

## Changes

TASK-1: Rendered newlines in clipboard history list text entries.
Changed `src/lib/components/clipboard/ClipboardList.svelte` — added Tailwind `whitespace-pre-wrap` and `break-words` to the `<p>` that renders `entry.content`, so line breaks (and long unbroken strings) render correctly while keeping Svelte's default HTML escaping. No `{@html}`/markdown rendering was introduced.

TASK-2: Added a pure `truncate(text, maxLength)` helper with unit tests.
Changed `src/lib/helpers/FormatHelper.ts` — new exported `truncate` that returns the text unchanged when `text.length <= maxLength`, otherwise returns `text.slice(0, maxLength)` with trailing whitespace/newlines trimmed plus the literal `"..."` (three dots). Added 7 tests in `tests/unit/helpers/FormatHelper.test.ts` covering: short text unchanged, long text truncated with "...", exact-boundary length, trailing-newline edge case (ellipsis never sits on its own line), trailing whitespace/newlines trimmed, newlines preserved inside truncated text, and empty string.

TASK-3: Applied max-length truncation to clipboard list text entries.
Changed `src/lib/components/clipboard/ClipboardList.svelte` — added named constant `MAX_TEXT_PREVIEW_LENGTH = 200` and render `truncate(entry.content, MAX_TEXT_PREVIEW_LENGTH)` for the preview. The copy button still calls `onCopyText(entry.content)` with the full content, and delete is unaffected.

TASK-4: Verification (re-run in follow-up session, results confirmed).
- `npm run check`: 0 errors, 0 warnings (svelte-check + i18n sync).
- `npm test`: 687/689 pass; the new `truncate` tests pass (14/14 in FormatHelper.test.ts). The 2 failures are pre-existing and unrelated (see below).
- `npm run lint`: my changed files are prettier-clean (prettier --check passes) and eslint reports only the 1 pre-existing error in untouched code (ternary-as-statement at ClipboardList.svelte line 53, confirmed present before this job's first commit).
- Visual confirmation was not possible: no API at `http://localhost:8000`, so the static verification (tests + check + lint) fallback documented in the task was used.

Follow-up (review verdict): the filled-in task breakdown in `docs/jobs/store_rendering-on-clipboard/tasks.md` was committed (it was missing from HEAD), and TASK-4 verification was re-run successfully.

## Known issues / follow-ups

- The 200-character cap (`MAX_TEXT_PREVIEW_LENGTH`) was picked as a sensible default because the brief does not specify a number — product confirmation wanted.
- Pre-existing, unrelated to this job: 2 failing tests (`tests/unit/stores/Calendars.test.ts` "goToToday resets navigation to the current date" — date-dependent week number; `tests/components/logic-leaves.test.ts` "StatisticWidget applies the requested color classes" — dynamic Tailwind class not found in jsdom), repo-wide prettier debt (323 files), and 1 eslint error in untouched ClipboardList.svelte code.
- `node_modules` was missing in the workspace; restored the pinned dependency set via `npm ci` (no package.json/lockfile changes) to run verification.