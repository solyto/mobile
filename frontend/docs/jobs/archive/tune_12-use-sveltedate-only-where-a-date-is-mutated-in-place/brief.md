# Brief: 12 Use SvelteDate only where a date is mutated in place

type: feature
id: tune
branch: feature/tune_12-use-sveltedate-only-where-a-date-is-mutated-in-place
date: 2026-10-13
author: Leander Muskalla

## What

Go through the 16 files importing `SvelteDate` and replace it with plain `Date` wherever no setter is ever called on the value (loaded API data, helper return values, read-only props). Keep it for form state that is edited in place (`EventEdit`).

## Why

`SvelteDate` only exists to make in-place mutation reactive; everywhere else it adds proxy overhead and blocks fake-timer tests.

## Out of scope

Changing any date logic.

## Notes

After this, date-dependent store tests can use `vi.setSystemTime`; add one such test where it was previously impossible to prove the point. Rule: 14.1.
