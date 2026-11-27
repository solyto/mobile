# Implementation: calendar-custom-recurrence-interval

id: united
developer: developer
date: 2026-11-24

## Summary

The event editor can now set "Every [N] days / weeks / months / years". `INTERVAL`
is part of `RecurrenceSelection`. Rules from CalDAV clients keep `INTERVAL` where
it was, and switching the type no longer carries a hidden interval along. The
default end date scales with the interval.

## Changes

TASK-1: `src/lib/services/RecurrenceRuleService.ts`
- Adds `interval: number` to `RecurrenceSelection` (default `1`).
- `parse()` reads `INTERVAL` and returns `null` when the value is not a positive
  integer or the key appears twice. `EventEdit` then shows "not editable" and
  keeps the rule unchanged, as before.
- Where `build()` writes `INTERVAL`:
  - right after `FREQ` if the rule had it there or had none;
  - in place if it sat anywhere else (it stays in `preserved` like `UNTIL`/`COUNT`);
  - left out when the interval is 1.

TASK-2: `tests/unit/services/RecurrenceRuleService.test.ts`
- Parse/build for all five types, `INTERVAL=1` left out, a new interval goes
  after `FREQ`, a changed interval is written in place, invalid or duplicate
  values give `null`, the interval is kept on type switch, and order is kept
  with `UNTIL`/`COUNT`/`WKST`.
- These tests showed that `FREQ=WEEKLY;INTERVAL=2;BYDAY=…` was being reordered.
  That's our own output and the usual Thunderbird/Apple form. I fixed it in the
  same commit: an `INTERVAL` directly after `FREQ` is not put in `preserved`.
  So "keeps unknown fields verbatim and in order" still expects `INTERVAL=2` in
  `preserved` for that rule, where it doesn't follow `FREQ`. This differs from
  the analyst's suggestion.

TASK-3: `defaultUntil()` adds `interval` years (yearly) or months (both monthly
types). For daily/weekly it uses the later of +1 month and +interval days/weeks.
Tests for each type.

TASK-4: `src/lib/types/translation.ts` and all six locales:
- New keys: `calendar.recurrence_every`, plus `recurrence_unit_{day,week,month,year}_{singular,plural}`.
- Optional `recurrence_every_by_unit`, used only by `fr` for "Toutes les"
  (semaine is feminine). The component falls back to `recurrence_every`, so it
  never branches on the locale.
- `ru` uses "Раз в" (a fixed form that avoids agreement): singular день/неделю/месяц/год,
  plural дн./нед./мес./г., the same abbreviations as the todo recurrence.

TASK-5: `src/lib/components/calendars/ChooseRecurrenceRule.svelte`
- New row next to the type `Select`: "Every [NumberInput] unit". It wraps under
  the select on narrow screens.
- Clamps to 1–999 on blur, falling back to the last valid value, the same
  pattern as `restoreUntil`. The clamping is in the service
  (`intervalWithinBounds`, unit-tested).
- `INTERVAL_UNITS` / `MAX_INTERVAL` are in the service. No `$derived`/`$effect`.
- Render at 375px: `screenshots/localhost-5173-auth-tmp-recurrence-375.png`.
  I rendered it through a temporary `/auth` page, which is removed again.

TASK-6: `tests/components/calendar-recurrence-interval.test.ts` and
`tests/components/helpers/ChooseRecurrenceRuleHarness.svelte` cover: unit per
type, singular/plural, the interval kept on type switch, and blur clamping
including the empty-input fallback.

TASK-7:
- `npm test`: 161 files, 2400 tests pass.
- Full `npm run check` and `npm run lint` are OOM-killed in this container
  (8 GB, no swap). Instead I ran:
  - `tsc --noEmit` over the project: locale typing is fine; the only error is a
    pre-existing `.svelte` shim error in `MultiSelectHelper.ts`;
  - `svelte-check` on a narrowed tsconfig with `ChooseRecurrenceRule` and
    `EventEdit`: 0 errors (it does catch a planted error);
  - `eslint` on every changed file: clean.
- To run the tests I ran `npm ci` from the lockfile into the gitignored
  `node_modules`. No dependencies changed.

## Known issues / follow-ups

- **Manual checks still open (they need a backend and devices):**
  - month/week views across a month boundary;
  - editing or deleting a single occurrence, editing the series;
  - drag;
  - a CalDAV client;
  - the Android "Your day" widget;
  - saving an untouched CalDAV `INTERVAL` rule.
- Please run full `npm run check` / `npm run lint` on a machine with more memory.
- **Translations:** I wrote them myself; I couldn't call the `translator` sub-agent
  from this session. Please review:
  - `de` "Alle 1 Tag" and `fr` "Tous les 1 jour" read stiffly for N = 1, the
    same compromise Google Calendar makes;
  - the `ru` choice of "Раз в".
- An explicit `INTERVAL=1` from another client is dropped on save. The meaning is
  the same; only the text changes.
- An `INTERVAL` above 999 from another client is shown as is, but focusing and
  leaving the field clamps it to 999.
- Pre-existing, not changed: preserved parts that sit before the `BY…` parts
  (e.g. `FREQ=WEEKLY;WKST=SU;BYDAY=MO`) are moved behind them on save.
- Wording overlap the analyst flagged: the type option "Every day" next to
  "Every [12] days". Renaming the type labels is out of scope.
