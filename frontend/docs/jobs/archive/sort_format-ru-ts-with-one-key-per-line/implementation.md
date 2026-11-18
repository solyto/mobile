## Summary

Reformatted `src/lib/i18n/ru.ts` to one entry per line at every nesting level, matching `en.ts`. Formatting only, committed alone in `d299ed3`.

## Changes

TASK-1: Wrote a one-off Python script in `/tmp` (not committed). It tokenizes each line into `key: value` entries, handling single and double quoted strings with escapes plus inline `{ … }` objects. It reads the grouped lines from `en.ts` (19 key lists, all in `checkInSummary`) and keeps a ru line unchanged when its key list matches one of them exactly. Every other multi-entry line is split at its own indent, and inline nested objects (`weekdays_short`, `recurrence_ordinals`, each inner object of `recurrence_ordinals_by_weekday`) are expanded into blocks. The script stops on any entry line it cannot parse.
TASK-2: Ran the script on `HEAD:src/lib/i18n/ru.ts`. The rewrite split 223 lines (242 multi-entry lines minus the 19 kept groups) and changed only `src/lib/i18n/ru.ts`.
TASK-3: Verified by importing the old and new file with Node (`--experimental-strip-types`). `assert.deepStrictEqual` passes, and the `JSON.stringify` output is identical, so key order is unchanged too. Also checked: exactly 19 multi-entry lines remain (the en-derived groups, kept verbatim), there is no trailing comma before a closing brace, no line is indented with spaces, and there are 28 blank lines before and after.
TASK-4: `npm run check` (0 errors, 0 warnings), `npm run lint` and `npm test` (1595 tests) all pass. The worktree had no `node_modules`, so I ran `npm ci` from the existing lockfile first. No dependencies were added or changed.

## Known issues / follow-ups

none
