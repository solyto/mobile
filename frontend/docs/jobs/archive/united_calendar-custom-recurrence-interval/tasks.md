# Tasks: calendar-custom-recurrence-interval

id: united
analyst: analyst
date: 2026-11-24

## Notes before starting

- Paths in the brief start with `app/`; in this repo they are at the root
  (`src/lib/...`, `tests/...`).
- **`parse()` returning `null`**: `EventEdit.svelte` shows
  `calendar.recurrence_not_editable` and `recurrenceRule()` sends
  `form.recurrence_rule` back unchanged (lines 149-153, 277-281). Keep that path
  for an invalid `INTERVAL`; `EventEdit.svelte` itself needs no change.
- **Where `INTERVAL` goes when building (my reading of the brief, please check).**
  The brief says to write `INTERVAL` "after `FREQ`". It also says an unedited
  rule from a CalDAV client must save unchanged and that the order of other parts
  is kept. Today many tests expect `INTERVAL` to keep its original position (for
  example `FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=2` and
  `FREQ=MONTHLY;BYDAY=WE;BYSETPOS=2;UNTIL=…;INTERVAL=3` round-trip unchanged, and
  `UNTIL` is replaced in place in front of `INTERVAL=2`). Writing `INTERVAL` right
  after `FREQ` every time would reorder rules that were not edited. Both
  requirements hold if `INTERVAL` is handled like `UNTIL`/`COUNT` today:
  - If the rule already had `INTERVAL`, write the current value in that same
    position.
  - If it had none and the interval is now > 1, insert it right after `FREQ`.
  - If the interval is 1, leave it out.

  If the owner wants `INTERVAL` always right after `FREQ`, the existing order
  tests listed in TASK-2 have to be rewritten instead of kept.
- **Plurals:** `pluralize(count, singular, plural)` in `FormatHelper.ts` only
  knows singular and plural. Following `docs/I18N.md`, the keys come in
  `_singular`/`_plural` pairs. Russian needs three forms (день/дня/дней), and
  "every" changes with them. The todo feature avoids this with abbreviations
  (`дн.`, `нед.`). The translator decides how to handle it. If it needs a
  grammatical variant, it goes in an optional key with a fallback, as with
  `recurrence_ordinals_by_weekday`. The component must not branch on the locale.
- **Wording overlap, not in scope:** the type options in `en` are "Every day" /
  "Every year". Next to "Every [12] days", a row like "Every 12 days · Every day"
  reads twice. I'm only flagging this; renaming the type labels is not in the
  brief.

## Task breakdown

TASK-1: Model `INTERVAL` in `RecurrenceRuleService`: add `interval: number` to
`RecurrenceSelection` (default `1`) and `INTERVAL` to the keys it reads, and make
`parse()` return `null` for an `INTERVAL` that is not a positive integer or is
duplicated. `build()` writes it as described in "Notes" (kept in its original
position, otherwise right after `FREQ`, left out when it is 1).
  files: src/lib/services/RecurrenceRuleService.ts
  depends: none
  risk: medium — `build()` must keep the byte-for-byte round-trip that the UNTIL/COUNT handling relies on (`preservedParts` places the end part by its index in `preserved`), so moving `INTERVAL` out of `preserved` must not shift where `UNTIL`/`COUNT` land.

TASK-2: Update and extend `RecurrenceRuleService.test.ts`:
  - Update the existing tests that now see `interval` in the selection:
    - the `selection()` fixture gets `interval: 1`;
    - "keeps unknown fields verbatim and in order" now expects `interval: 2` and
      `preserved: ['UNTIL=…']`;
    - "keeps preserved fields when the type changes" is now about the interval.
  - Keep the current round-trip and UNTIL/COUNT-in-place cases green without
    changing them.
  - Add cases:
    - parse and build an interval for daily, weekly + `BYDAY`, monthly by date,
      monthly by weekday and yearly;
    - `INTERVAL=1` is left out and rules without `INTERVAL` stay unchanged;
    - a new interval is inserted after `FREQ`;
    - `INTERVAL=0`, `-1`, `abc`, `1.5` and a duplicate `INTERVAL` give `null`;
    - after a type switch the selection still has its interval;
    - `INTERVAL` with `UNTIL`/`COUNT` and with `WKST` keeps order and content.
  files: tests/unit/services/RecurrenceRuleService.test.ts
  depends: TASK-1
  risk: low — pure unit tests on a pure service.

TASK-3: Scale `defaultUntil()` by the interval, so "ends on date" never defaults
to a date with no repeat:
  - yearly: + interval years;
  - monthly (both types): + interval months;
  - daily/weekly: the later of + 1 month and + interval days/weeks.

  Add tests for each type and keep the existing two `defaultUntil` cases green.
  files: src/lib/services/RecurrenceRuleService.ts, tests/unit/services/RecurrenceRuleService.test.ts
  depends: TASK-1
  risk: low — small pure function; watch month-end overflow of `setMonth` (e.g. Jan 31 + 1 month), same as the current behaviour.

TASK-4: Add the English strings for the interval row to the `calendar` section:
  - an "every" label;
  - `_singular`/`_plural` unit keys for day, week, month and year.

  Then hand de/es/fr/it/ru to the `translator` agent (`docs/agents/translator.md`,
  rules in `docs/I18N.md`). That includes the Russian plural/agreement decision
  from "Notes", with optional keys only if needed.
  files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts, src/lib/i18n/it.ts, src/lib/i18n/ru.ts
  depends: none
  risk: low — additive keys; `npm run check` catches missing locales.

TASK-5: In `ChooseRecurrenceRule.svelte`, add an "Every [N] <unit>" row next to
or under the type `Select`:
  - Reuse `NumberInput` the way `todos/props/Recurrence.svelte` does.
  - Allow 1–999 and clamp on blur, with an invalid or empty value falling back
    to the last valid one (same pattern as `rememberUntil`/`restoreUntil`).
  - The unit follows `selection.type` (both monthly types say "months") and is
    singular for 1, plural otherwise, via `pluralize` or the same `count === 1`
    choice.
  - Don't add `$derived`/`$effect`.
  files: src/lib/components/calendars/ChooseRecurrenceRule.svelte
  depends: TASK-1, TASK-4
  risk: medium — `NumberInput` binds `number | null`, so empty input must never reach `build()`; layout must still fit at phone width next to the type select.

TASK-6: Optional component test for the interval row: the unit label follows
the type and its singular/plural, and blur clamps to 1–999. Use
`renderWithContext()` from `tests/components/helpers/context.ts`; test the logic,
not the markup (`docs/TESTING.md`).
  files: tests/components/calendars/ChooseRecurrenceRule.test.ts (new)
  depends: TASK-5
  risk: low — additive test; skip if the reviewer considers the service tests sufficient.

TASK-7: Run `npm run check`, `npm run lint` and `npm test`, then do the manual
check from the brief. That covers month/week views, single-occurrence edit and
delete, drag, a CalDAV client, the Android widget, and an unedited CalDAV rule
saving unchanged. Also look at the row at phone width.
  files: none (verification)
  depends: TASK-1..TASK-5
  risk: medium — the CalDAV, Android and drag checks need a running backend and devices, which an unattended agent can't do; record them as open for a human if they can't be run.
