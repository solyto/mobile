# Verdict: calendar-custom-recurrence-interval

id: united
reviewer: reviewer
date: 2026-11-24

## Review

Reviewed `git diff main...HEAD`. Re-ran `RecurrenceRuleService.test.ts` and
`calendar-recurrence-interval.test.ts` (143 tests pass) and ran `eslint` on all
changed source and test files (clean). The diff has nothing beyond what
`implementation.md` lists. The temporary `/auth` render route is not in the
branch, and `docs/policies/` and `docs/AGENTS.md` are untouched.

TASK-1: PASS
notes: `INTERVAL` is modelled and `parse()` returns `null` for a value that is
not a positive integer, an empty value, or a duplicate key. `EventEdit`'s
`null` path is unchanged. The developer moved away from the analyst's
suggestion: an `INTERVAL` directly after `FREQ` is taken out of `preserved`,
and one anywhere else stays in place. This meets both parts of the brief: new
intervals go after `FREQ`, and unedited rules round-trip byte-for-byte. Both
are covered by tests. `UNTIL`/`COUNT` placement in `preservedParts` still
works, and all the existing in-place tests stay green.

TASK-2: PASS
notes: Every case the brief and tasks.md list is covered. The extra
"in place" and "changed to 1" cases strengthen the round-trip guarantees.

TASK-3: PASS
notes: `defaultUntil()` scales the end date by the interval as specified. The
two original tests are unchanged and green.

TASK-4: PASS
notes: The keys come in `_singular`/`_plural` pairs in all six locales. The
optional `recurrence_every_by_unit` key with a fallback follows the
`recurrence_ordinals_by_weekday` pattern, and the component does not branch on
the locale. The developer translated the strings directly instead of through
the `translator` agent (STANDARDS 8.2). I checked the output against
`docs/I18N.md`: the voice, plural pairs, no locale logic, and the `ru`
abbreviations, which match the todo recurrence. I found no violation.

TASK-5: PASS
notes: The component reuses `NumberInput` and clamps on blur through the
service (`intervalWithinBounds`, unit-tested), using the same pattern as
`rememberUntil`/`restoreUntil`. It adds no `$derived` or `$effect`, and all
strings go through `ts.get`. The 375px render shows the row wrapping cleanly
under a wide type select. Save is a button click, not a form submit, so blur
always runs before `build()`. That means a `null` interval cannot reach the
saved rule.

TASK-6: PASS
notes: The component test checks the behaviour and values (unit per type,
singular/plural, kept on type switch, clamping, empty fallback) using a
harness, as the other component tests do.

TASK-7: PARTIAL
notes: The tests and per-file lint and type checks pass. Full
`npm run check`/`npm run lint` could not run in the container because it ran
out of memory. The manual checks with a backend and devices (CalDAV client,
Android widget, drag, single-occurrence edit/delete) are left for a human, as
the task expected. This is not a code defect.

## Security

Not run.

## Overall

APPROVED

No code changes required. Before merging, a human should still run full
`npm run check` / `npm run lint` and the manual checks from the brief.
