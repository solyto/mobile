# Brief: 05 Recurrence rule parser/serialiser as a service

type: feature
id: male
branch: feature/male_05-recurrence-rule-parser-serialiser-as-a-service
date: 2026-10-13
author: Leander Muskalla

## What

Replace the inline RRULE handling in `calendars/ChooseRecurrenceRule.svelte` with a `RecurrenceRuleService` (`parse`/`build`) and rebuild the component as a dumb form over one typed `RecurrenceSelection` value bound to the parent.

- No `$effect`; the parent calls `parse` when the form opens and `build` on submit.
- One array of weekdays and one `{#each}` instead of seven booleans and seven checkbox blocks.
- All labels through `ts.get` (currently hardcoded).

## Why

The current component has two effects that are wrong: one wipes the user's weekday selection when the start date changes, the other re-serialises an existing rule on open and silently drops `INTERVAL` and `UNTIL`. That second one is data loss.

## Out of scope

Supporting RRULE fields the UI cannot edit beyond preserving them; the backend's recurrence semantics.

## Notes

Tests first, and red first: the parse/build tests must include rules with `INTERVAL=2` and `UNTIL=…` that round-trip unchanged, which the current code fails. Decide in the brief whether unknown fields are preserved or whether editing such a rule is refused. Rules: 5.1, 13.1–13.4, 8.1.
