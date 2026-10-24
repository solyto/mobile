# Implementation: 05 Recurrence rule parser/serialiser as a service

id: male
developer: @developer
date: 2026-10-13

## Summary

The inline RRULE handling in `ChooseRecurrenceRule.svelte` now lives in a pure,
tested `RecurrenceRuleService` (`parse` / `build` / `effectiveWeekdays`). The
component is a dumb form over one bound `RecurrenceSelection`, with no
`$effect`, `$derived` or local `$state`. `EventEdit` parses once when the form
opens and builds on submit. `INTERVAL`, `UNTIL`, `COUNT`, `WKST` and any other
field the form does not edit are kept verbatim, so the data loss from the old
mount effect is gone.

Decision taken (as proposed in tasks.md; it is **not** recorded in `brief.md`,
so the owner should confirm it there): unknown fields are **preserved**. Rules
whose *modelled* fields hold values the form cannot show return `null` from
`parse`. The editor is then hidden, and the original string is sent back
unchanged (open point 1).

## Changes

TASK-1: `tests/unit/services/RecurrenceRuleService.test.ts` (new). 42 cases:
exact round-trips for every type, rules with `INTERVAL=2`, `UNTIL=…`, both,
`COUNT=`, `WKST=`, defaults from `parse(null, …)` (including the ordinal capped
at 4), weekly fallback to the start weekday, MO…SU output order, preserved
fields surviving a type change, and `null` for rules the form can't show
(`BYDAY=2MO`, `BYSETPOS=-1`, multi-day `BYSETPOS`, `FREQ=HOURLY`,
`BYMONTHDAY` not matching the start date, duplicate keys, a missing `FREQ`,
malformed parts). Committed red, since the module didn't exist yet.

TASK-2: `src/lib/services/RecurrenceRuleService.ts` (new). Exports `Weekday`,
`WEEKDAYS`, `RecurrenceType`, `MonthlyOrdinal` and `RecurrenceSelection` (with
`preserved: string[]`). `parse` splits on `;`, reads each `KEY=VALUE` once into
fields, then switches on `FREQ`, with no `includes()` sniffing. `build` writes
`FREQ`, then the modelled fields for the type, then `preserved` in its
original order. `BYMONTHDAY`/`BYMONTH` come from `startDate`, as before.

TASK-3: added `recurrence_daily`, `recurrence_weekly`,
`recurrence_monthly_date`, `recurrence_monthly_weekday`, `recurrence_yearly`,
`recurrence_on_the` and `recurrence_ordinals {1..4}` to the `calendar` section
in `types/translation.ts` and all four locales. Also added
`[key: number]: string` to the `weekdays` type (matching `weekdays_short`), so
the form can index it by number without a `keyof` cast.

TASK-4: `ChooseRecurrenceRule.svelte` was rewritten. The props are
`selection` (bindable) and `startDate`. One `{#each WEEKDAYS}` over
`Checkbox`. `isChecked` comes from `effectiveWeekdays`, and `toggleWeekday`
starts from the effective list, so the fallback day isn't lost. All labels
come from `ts.get`. The option lists are functions called in markup, so they
follow language changes.

TASK-5: `EventEdit.svelte` adds `recurrence = $state(parse(form.recurrence_rule,
form.start_date))`. The editor renders only when `form.is_recurring &&
recurrence`. `buildRequest()` sends `build(recurrence, start_date)`, or the
original `form.recurrence_rule` when `parse` returned `null`. `recurrence` is
reset together with `form` after a save.

TASK-6: static checks pass. There is no `$effect` in the component, no
bare-word labels and no comments in the new files. The service tests pass
(42/42) through an inline Node harness: Node 22 type stripping, a small
`vitest` shim, and `$lib` mapped to `src/lib`. I left `STANDARDS_BACKLOG.md`
alone because the owner hasn't confirmed they want the bookkeeping done in
this job.

## Known issues / follow-ups

- **`npm test`, `npm run check` and `npm run lint` were not run.** The
  worktree has no `node_modules`, and installing packages needs permission.
  Run all three before merging. `svelte-check` matters most for the two
  `.svelte` files, e.g. `bind:selection={recurrence}` inside
  `{#if recurrence}`, and the `string → union` casts in the `Select`
  handlers.
- Rules that parse but aren't in canonical order or form are rewritten to an
  equivalent canonical string on save, even if untouched. Examples:
  `FREQ=WEEKLY;INTERVAL=2;BYDAY=MO` → `FREQ=WEEKLY;BYDAY=MO;INTERVAL=2`,
  bare `FREQ=WEEKLY` → `FREQ=WEEKLY;BYDAY=<start weekday>`, `BYDAY=WE,MO` →
  `MO,WE`. The meaning is the same, but the bytes differ. Canonical rules
  (the ones this client writes) round-trip byte-identical.
- Behaviour change (open point 2): the monthly-weekday defaults come from the
  start date once, when the form opens. They no longer follow later
  start-date edits. Weekly still follows through the fallback.
- If the only checked weekday is the start-weekday fallback and the user
  unchecks it, the native checkbox shows unchecked. The state still means
  "start weekday", the same as the old behaviour.
- Rules that `parse` rejects (open point 1) show no editor at all. The owner
  may want a hint telling the user the rule can't be edited here.
- Rule 5.1 in `STANDARDS.md` suggests a `$derived` for the effective
  weekdays. As tasks.md specified, it is a plain service call instead.
- `.mcp.json` in the repo root was already modified in the environment before
  this job started. It was not committed.
