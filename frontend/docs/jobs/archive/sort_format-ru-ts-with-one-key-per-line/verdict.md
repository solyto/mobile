# Verdict: format ru.ts with one key per line

id: sort
reviewer: reviewer
date: 2026-11-17

## Review

TASK-1: PASS
notes: Script kept out of the repo; diff contains no script or temp files.

TASK-2: PASS
notes: `d299ed3` touches only `src/lib/i18n/ru.ts`. Removing all whitespace from old (`main`) and new ru.ts gives byte-identical content, so the change is whitespace-only (no key, value, order or comment changes). Inline nested objects (`weekdays_short`, `recurrence_ordinals`, `recurrence_weekdays`, each inner object of `recurrence_ordinals_by_weekday`) are expanded like `en.ts`. Every line's tab indent matches its brace depth; no space indents; no trailing comma before closing braces; 28 blank lines before and after.

TASK-3: PASS
notes: Re-verified independently: importing old and new ru.ts with Node gives `deepStrictEqual` and identical `JSON.stringify` output. Exactly 19 multi-entry lines remain (ru.ts:413-431), and their key lists match en.ts's 19 grouped lines in order; those lines are not in the diff.

TASK-4: PASS
notes: `eslint src/lib/i18n/ru.ts` passes. The change is whitespace-only, so `check` and `test` results cannot differ from `main`; the developer reports both pass.

## Security

none

## Overall

APPROVED
