# Verdict: 05 Recurrence rule parser/serialiser as a service

id: male
reviewer: @reviewer
date: 2026-10-13

## Review

Reviewed `git diff main...HEAD` (branch `feature/male_05-recurrence-rule-parser-serialiser-as-a-service`).
Every changed file is accounted for in implementation.md.

TASK-1: PASS
notes: `tests/unit/services/RecurrenceRuleService.test.ts`. Committed red, before the service existed (27d10c2 precedes 8c64eea). It covers every case tasks.md asked for: INTERVAL=2, UNTIL, both together, COUNT, WKST, `parse(null)` defaults, the weekly fallback, MO..SU ordering, and the open-point-1 `null` cases. Start dates are fixed local dates, and BYMONTHDAY/BYMONTH match them. I ran the file against the real service with a node type-stripping harness and a vitest shim (TZ=UTC): 42/42 pass.

TASK-2: PASS
notes: `src/lib/services/RecurrenceRuleService.ts`. `parse` splits on `;` and reads each KEY=VALUE once. It switches on FREQ, with no `includes()` sniffing (13.3). Unmodelled parts go into `preserved`, verbatim and in order, and `build` appends them after the modelled fields. Edge inputs I traced fall back to `null`, which means the original string is sent unchanged, so nothing is lost: empty parts, a trailing `;`, a `RRULE:` prefix, lowercase keys, duplicate modelled keys, an empty `BYDAY=`, and BYMONTHDAY/BYMONTH that don't match the start date. Non-canonical but parseable rules are rewritten in an equivalent canonical form. implementation.md documents this, and it is not data loss.

TASK-3: PASS
notes: the five type labels, "on the" and ordinals 1–4 are present in `translation.ts` and in all four locales. The `[key: number]: string` index signature on `weekdays` is a small change outside the task list. It is documented and mirrors the existing `weekdays_short`.

TASK-4: PASS
notes: `ChooseRecurrenceRule.svelte` has no `$effect`, `$derived` or local `$state`. It takes one bindable `selection` and has one keyed `{#each WEEKDAYS}`. Every label comes from `ts.get`. `toggleWeekday` starts from `effectiveWeekdays`, so the fallback day survives when another day is clicked. The `Select` `onchange(value: string)` contract matches `forms/Select.svelte`. When the user unchecks the sole fallback day, the DOM shows it unchecked while the start weekday is still saved. That is the same as the old behaviour and is documented.

TASK-5: PASS
notes: `EventEdit.svelte` calls `parse` once at open, and the editor renders only when the result is non-null. `buildRequest` sends `build(...)`, or the original `form.recurrence_rule` when `parse` returned `null`. `recurrence` is reset along with `form` after a save. EventEdit sits inside `{#if calendars.editSidebar}`, so every open remounts it and runs a fresh `parse`, and there is no stale state. A canonical existing rule with INTERVAL/UNTIL is sent back byte-identical; the round-trip tests confirm this.

TASK-6: PARTIAL
notes: the worktree has no `node_modules`, so neither the developer nor I could run `npm test`, `npm run check` or `npm run lint`. I covered `npm test` for the new file with the harness above (42/42). I checked i18n key parity across the four locales by hand. There is no `$effect` and there are no bare-word labels in the component. Leaving `STANDARDS_BACKLOG.md` untouched is correct, since that work was optional and unconfirmed. `svelte-check` and `eslint` should still be run once dependencies are installed, but I found nothing in the diff I expect them to flag.

## Security

none (not run). The change is client-only and pure parsing/serialisation, with no new I/O.

## Overall

APPROVED

No blockers. For the owner:
- The brief asked for the "preserve vs. refuse" decision to be recorded in `brief.md`. Agents cannot edit that file, so tasks.md and implementation.md record the decision instead: unknown fields are preserved, and rules the form can't show return `null` and are sent back unchanged.
- Run `npm run check` and `npm run lint` in an environment with dependencies installed before merging.
