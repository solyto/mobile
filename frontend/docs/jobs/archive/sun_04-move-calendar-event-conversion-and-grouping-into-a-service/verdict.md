# Verdict: 04 Move calendar event conversion and grouping into a service

id: sun
reviewer: Claude (reviewer agent)
date: 2026-10-13

## Review

Reviewed `git diff main...HEAD` on `feature/sun_04-move-calendar-event-conversion-and-grouping-into-a-service`.
Every change in the diff appears in tasks.md and implementation.md. The two `chore: commit all`
commits only touch the job's brief.md and tasks.md. Nothing outside the scope changed, and no
other `Calendars` method was touched.

TASK-1: PASS
notes: `tests/unit/stores/Calendars.test.ts`: the `loadEvents` tests now use ISO-string payloads
(`apiEvent()`/`loadAugust()`). They cover all four date fields (null and set), the other fields
passing through, the multi-day keys checked with `Object.keys(...).toEqual([...])` (stricter than
the removed `13.08` undefined check), the single-day all-day case and the long timed event. The
shared `event()` factory is unchanged. One deviation: the store-level identity check uses
`toEqual` instead of `toBe`. The developer's reasoning holds. `events` and `sortedEvents` are
separate `$state` roots, so a read through each root returns a different proxy for the same raw
object, and `toBe` would never have passed, not even against the old code. Strict identity is
tested where it can be checked, in the `groupByDay` service test. Acceptable.

TASK-2: PASS
notes: `src/lib/types/calendar.ts`: `CalendarEventResponse` matches `CalendarEvent` field for
field, with the four date fields as strings (start/end non-null, per assumption 1). `CalendarEvent`
is unchanged.

TASK-3: PASS
notes: `CalendarEventService.fromApi()` has no casts and returns a new object with plain `Date`s.
The `...response` spread followed by the overrides type-checks against `CalendarEvent`, and it is
the only conversion function. The tests cover nulls, set values, pass-through, exact UTC
timestamps, and that the input is not mutated.

TASK-4: PASS
notes: `groupByDay()` uses `(byDay[slug] ??= []).push(event)` and a module-private
`spansMoreThanOneDay()` / `MINUTES_PER_DAY`. I traced it against the old loop. The start bucket
comes first, and then, for all-day events longer than 1440 minutes only, `eachDayBetween` adds
start+1 through end inclusive. Keys, order and object references are identical to before.
Dropping the `start_date !== null` guard follows assumption 1. All the listed test cases are present.

TASK-5: PASS
notes: `loadEvents()` is now fetch (URL unchanged), `if (!res) return;`, `map(fromApi)`, and
assign. The only cast left is the `as CalendarEventResponse[]` at the API boundary. The unused
`eachDayBetween` / `getDateDiffInMinutes` imports are removed, and `formatDate` stays because it is
still used at lines 264/274/284. The `eventService` field mirrors `dragService`.

TASK-6: PASS
notes: `grep '<CalendarEvent>' src` returns nothing. The backlog item is ticked, and every part of
it is done: there are no unused parameters, the type and `fromApi`, `groupByDay` with tests, and
plain `Date`, which was already done by tune_12. The `getWidgetEvents()` follow-up is recorded in
implementation.md. `npm test`, `check` and `lint` could not be run because this worktree has no
`node_modules`, and the same is true for this review. I checked the logic statically against
`DateHelper` (`formatDate`, `eachDayBetween`, `getDateDiffInMinutes`) and the lint config (the
`!` non-null assertions in the tests are allowed by `ts.configs.recommended`). The suite still has
to run once dependencies are installed.

## Security

Not run.

## Overall

APPROVED

No blockers. The implementation matches the brief and tasks.md, the behaviour is unchanged for
the views, and the scope is respected.
