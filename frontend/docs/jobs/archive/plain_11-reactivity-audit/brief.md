# Brief: 11 Reactivity audit

type: feature
id: plain
branch: feature/plain_11-reactivity-audit
date: 2026-10-13
author: Leander Muskalla

## What

Read every `$effect` (29 files) and every component with five or more `$derived` (6 files), plus the 7 `$derived(() => …)` uses, and fix each hit that violates the reactivity rules.

## Why

The effect-for-state-sync pattern crashed a modal and lost data in two components we looked at; the other 27 effects have not been read.

## Out of scope

Effects that are legitimately external (DOM measurement, third-party instances, timers with cleanup). Rewriting components beyond the reactive declarations.

## Notes

Per hit: name the rule it breaks or mark it as a 5.2 case in the implementation notes. `$derived(() => …)` becomes `$derived.by` or a plain function. Safety is `check` plus the existing tests plus a manual run of each touched screen. Rules: 3.1, 3.2, 3.6, 5.1–5.5.

You're allowed to run npm ci.