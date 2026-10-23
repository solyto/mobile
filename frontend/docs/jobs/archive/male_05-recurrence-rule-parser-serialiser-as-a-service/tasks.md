# Tasks: 05 Recurrence rule parser/serialiser as a service

id: male
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

## Context (what the code does today)

- `src/lib/components/calendars/ChooseRecurrenceRule.svelte` is the only RRULE
  reader/writer in the client. `initializeFromRule` (l. 22-49) sniffs the
  string with `includes()`, and `createRecurrenceString` (l. 113-153) rebuilds
  it. Two `$effect`s: l. 107-111 resets the weekday booleans whenever
  `startDate` changes, and l. 155-157 writes `recurrenceRule` on mount, which
  drops `INTERVAL`, `UNTIL`, `COUNT`, etc.
- It has 10 `$state` primitives (7 weekday booleans), 7 copy-pasted checkbox
  blocks, and hardcoded labels (`Every Day`, `Weekly`, `Monthly on this date`,
  `Monthly on weekday`, `Every year`, `1st`–`4th`, `Monday`–`Sunday`,
  `Mon`–`Sun`, `on the`).
- Only one consumer: `src/lib/components/calendars/EventEdit.svelte:247-250`
  (`bind:recurrenceRule={form.recurrence_rule}`, `startDate={form.start_date}`),
  rendered under `{#if form.is_recurring}`. `buildRequest()` (l. 118-139) sends
  `form.recurrence_rule` when `is_recurring` is on.
- `CalendarDragService.buildMoveRequest` passes `event.recurrence_rule`
  through untouched. Not affected.
- Weekday labels already exist: `ts.get.calendar.weekdays` and
  `ts.get.calendar.weekdays_short` (keys `1`=Monday … `7`=Sunday). The type
  options, ordinals and "on the" have no keys yet.
- Service convention: `export default class XService` in
  `src/lib/services/`, with any helper types exported from the same file
  (e.g. `CalendarDropTarget` in `CalendarDragService.ts`). Tests live in
  `tests/unit/services/XService.test.ts`.

## Decision: unknown fields are preserved, not refused

The brief asks for this to be decided. Its "Out of scope" line ("supporting
RRULE fields the UI cannot edit beyond preserving them") already points to
preservation, so this plan uses that:

- The parser models only what the form edits: `FREQ`, `BYDAY`, `BYSETPOS`,
  `BYMONTHDAY`, `BYMONTH`.
- Every other `KEY=VALUE` part (`INTERVAL`, `UNTIL`, `COUNT`, `WKST`, …) is
  kept verbatim and in its original order in a `preserved: string[]` field on
  the selection. `build` appends it unchanged after the modelled fields.
- Canonical output order: `FREQ`, then the modelled fields for the type (as
  today: `BYDAY`; `BYMONTHDAY`; `BYDAY;BYSETPOS`; `BYMONTH;BYMONTHDAY`), then
  `preserved`. Round-trip tests use inputs in this order and assert exact
  string equality.

**Owner to confirm** (I can't edit `brief.md`, so please add a line there):
this decision, plus the two open points below.

## Open points (unclear, not guessed — flag to owner/reviewer)

1. **Modelled fields with values the form can't show**, e.g.
   `FREQ=MONTHLY;BYDAY=2MO` (ordinal inside BYDAY), `BYSETPOS=-1`,
   `FREQ=HOURLY`, or `FREQ=MONTHLY;BYDAY=MO,TU;BYSETPOS=1`. The brief doesn't
   cover these. The conservative suggestion for TASK-2: `parse` returns `null`
   for them, and the parent then keeps the original string unchanged and
   doesn't render the editor. That means refusing to edit only for these
   cases. The developer should not invent other handling; if this
   suggestion is rejected, stop and ask.
2. **Behaviour change on start-date edits.** Today the effect re-derives the
   monthly ordinal/weekday from `startDate` on every change. With no effect,
   `parse(null, startDate)` sets those defaults once, when the form opens.
   Weekly stays live through the fallback below; monthly-weekday doesn't.
   This is the intended fix per rule 5.1, but the reviewer should know about it.

## Task breakdown

TASK-1: Write the failing unit tests for `RecurrenceRuleService.parse`/`build` before the service exists: round-trip cases for every type, including `FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=2`, `FREQ=DAILY;UNTIL=20271231T000000Z`, a rule with both `INTERVAL=2` and `UNTIL=…`, a `COUNT=` rule, defaults from `parse(null, startDate)`, the weekly fallback to the start weekday when `weekdays` is empty, weekday output in MO…SU order regardless of selection order, and the `null` return for the open-point-1 cases.
  files: tests/unit/services/RecurrenceRuleService.test.ts (new)
  depends: none
  risk: low — new test file only. Note: it is red because the module doesn't exist yet; the `INTERVAL`/`UNTIL` cases are the ones the current inline logic would fail (rule 13.1). Use fixed `new Date(y, m, d)` start dates (tests run with `TZ=UTC`) and keep each test's `BYMONTHDAY`/`BYMONTH` consistent with its start date, since `build` derives those from `startDate` the way the current code does.

TASK-2: Add `src/lib/services/RecurrenceRuleService.ts` (default-export class, pure methods): export `Weekday` (`'MO'|…|'SU'`), the ordered `WEEKDAYS` constant, and `RecurrenceSelection` (`type`, `weekdays: Weekday[]`, `monthlyOrdinal: 1|2|3|4`, `monthlyWeekday: Weekday`, `preserved: string[]`). Implement `parse(rule: string | null, startDate: Date): RecurrenceSelection | null`, which splits on `;`, reads each `KEY=VALUE` once and switches on `FREQ` (rule 13.3, no `includes()` chains). Implement `build(selection, startDate): string`, plus a small `effectiveWeekdays(selection, startDate): Weekday[]` (chosen weekdays, or `[start weekday]` if none) used by both `build` and the form.
  files: src/lib/services/RecurrenceRuleService.ts (new)
  depends: TASK-1
  risk: medium — this is the data-integrity core. A mistake in field handling or order silently changes users' recurring events on the backend. TASK-1 must be fully green before moving on.

TASK-3: Add i18n keys to the `calendar` section for the recurrence form labels: the five type options, the four ordinals (1st–4th) and "on the". Add them to the `CalendarRecords` type and all four locale files. Reuse the existing `weekdays`/`weekdays_short` for day names (no new day keys).
  files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
  depends: none
  risk: low — additive keys; `npm run check` enforces that the four files match. Watch the wording of the ordinals in de/es/fr (e.g. "1." / "1er" / "1º").

TASK-4: Rebuild `ChooseRecurrenceRule.svelte` as a dumb form: one prop `selection = $bindable<RecurrenceSelection>()` plus `startDate: Date`. No `$effect`, no `$derived`, no local `$state`. Use one `{#each WEEKDAYS}` over `Checkbox` with `isChecked` from `effectiveWeekdays(selection, startDate).includes(day)` and a named toggle handler that writes `selection.weekdays`. Build every label from `ts.get` (TASK-3 keys and `calendar.weekdays[_short]`).
  files: src/lib/components/calendars/ChooseRecurrenceRule.svelte
  depends: TASK-2, TASK-3
  risk: medium — UI behaviour has to stay the same. The toggle handler must start from the effective list when `selection.weekdays` is empty, so the shown fallback day isn't lost when the user clicks another day. Check against rules 3.3, 4.1, 5.1, 8.1, 13.2, 13.4.

TASK-5: Wire `EventEdit.svelte` to the new contract. Hold a `recurrence` value (`RecurrenceSelection | null`) set once at form open via `parse(activeEvent?.recurrence_rule ?? null, form.start_date)`, and bind it to `ChooseRecurrenceRule` (render the editor only when it isn't `null`). In `buildRequest()`, send `build(recurrence, form.start_date)` when recurring and editable, and send the original `recurrence_rule` unchanged when `parse` returned `null` (open point 1).
  files: src/lib/components/calendars/EventEdit.svelte
  depends: TASK-2, TASK-4
  risk: medium — this is the one place the rule reaches the API. Check that an untouched existing rule with `INTERVAL`/`UNTIL` is sent back byte-identical, and that the `form = { ...emptyForm }` reset after save doesn't leave a stale `recurrence`.

TASK-6: Verify: `npm test`, `npm run check`, `npm run lint`. Confirm `grep -n '\$effect' src/lib/components/calendars/ChooseRecurrenceRule.svelte` finds nothing and that there are no bare-word labels left in the component. Tick the matching items in `docs/STANDARDS_BACKLOG.md` (the "Larger" entry at l. 102 and the `ChooseRecurrenceRule` note in the `$effect` audit at l. 119-120) only if the owner wants backlog bookkeeping in this job.
  files: docs/STANDARDS_BACKLOG.md (optional)
  depends: TASK-1–TASK-5
  risk: low — verification only. Backlog edits are optional and should be confirmed rather than assumed.

## Not in scope

- Editing `INTERVAL`, `UNTIL`, `COUNT` in the UI (only preserved).
- `recurrence_end` handling in `EventEdit`/`Calendars` (separate field, untouched).
- Todo recurrence (`todos/props/Recurrence.svelte`); it uses its own non-RRULE fields.
- Backend recurrence semantics.
