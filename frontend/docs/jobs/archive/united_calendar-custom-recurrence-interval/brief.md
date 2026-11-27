# Brief: calendar-custom-recurrence-interval

type: feature
id: united
branch: feature/united_calendar-custom-recurrence-interval
date: 2026-11-24
author: Leander Muskalla

# Custom recurrence interval for events ("every N days")

**Status:** open — research done (2026-11-24), ready to implement
**Area:** app (frontend) only
**Origin:** user request (an event that repeats every 12 days)

## Goal

In the event editor, users can set how often a recurring event repeats:
"Every [ N ] days / weeks / months / years". Examples: every 12 days, every 2 weeks
on Mon + Thu, every 3 months on the 15th, every 2 years.

## Current state (as found in the code)

- **Backend needs no change.**
  - `StoreEventRequest` / `UpdateEventRequest` only validate `recurrence_rule` as
    `nullable|string`, so any RRULE is accepted.
  - Occurrences are expanded by sabre's `Sabre\VObject\Recur\EventIterator`
    (`api/app/Dav/Backend/AppCalendarsPDO.php:687` and `:1413`), which supports `INTERVAL` natively.
  - Events with `INTERVAL` created by CalDAV clients (phones, Thunderbird) already display
    correctly in the calendar today.
- **The frontend editor doesn't know `INTERVAL`.**
  - `app/src/lib/services/RecurrenceRuleService.ts`: `MODELLED_KEYS` is
    `FREQ, BYDAY, BYSETPOS, BYMONTHDAY, BYMONTH`. Every other part (including `INTERVAL`)
    goes into `selection.preserved` and is written back unchanged by `build()`.
  - `app/src/lib/components/calendars/ChooseRecurrenceRule.svelte`: type dropdown (daily, weekly,
    monthly by date, monthly by weekday, yearly), weekday checkboxes, ordinal/weekday
    selects and an end row. There's no interval field.
  - Tests: `app/tests/unit/services/RecurrenceRuleService.test.ts`.
- `CalendarDragService.ts` passes `recurrence_rule` through as it is (no change needed).

## Existing bug this fixes

For an event from another client with e.g. `FREQ=DAILY;INTERVAL=12`:

1. The editor shows **"Daily"**, which is misleading.
2. Switching the type (e.g. to "Weekly") keeps the hidden `INTERVAL=12`, so the event
   silently becomes **every 12 weeks**.

Treating `INTERVAL` as a normal field in the editor fixes both.

## Implementation

1. **`RecurrenceRuleService.ts`**
   - Add `INTERVAL` to `MODELLED_KEYS`.
   - Add `interval: number` to `RecurrenceSelection` (default `1` in `defaults()`).
   - `parse()`: read `INTERVAL`. If it's not a positive integer, return `null`, i.e. treat
     it like any other rule the editor can't model. Check what `EventEdit` does with
     `null` today and keep that behaviour.
   - `build()`: write `INTERVAL=N` after `FREQ` (before `BY…` parts) when `N > 1`; leave it out
     for `1`, so existing rules round-trip unchanged.
2. **`ChooseRecurrenceRule.svelte`**
   - Number input "Every [ N ] <unit>" in the same row as or next to the type dropdown.
     Unit follows the type: days / weeks / months (both monthly variants) / years,
     singular for 1, plural otherwise.
   - Min 1. Pick a sensible max (e.g. 999) and clamp on blur, like the existing
     `restoreUntil()` handling for the end date.
   - Check the layout at phone width (the Android app uses the same component).
3. **`defaultUntil()`**: consider scaling the default end date by the interval (today
   it's +1 month, or +1 year for yearly). Otherwise "every 2 years" with "ends on date"
   defaults to a date with zero repeats. Small, but worth doing.
4. **Translations:** the "every" label and singular/plural units in all locales. Check how
   the existing recurrence strings handle plurals (`recurrence_ordinals_by_weekday` shows
   locale-specific forms already exist).

## Tests

Extend `app/tests/unit/services/RecurrenceRuleService.test.ts`:

- Parse and build with an interval for each type: daily, weekly (+ `BYDAY`), monthly by date,
  monthly by weekday (`BYDAY` + `BYSETPOS`), yearly.
- `INTERVAL=1` is left out when building; rules without `INTERVAL` round-trip unchanged.
- Invalid `INTERVAL` (`0`, `-1`, `abc`, duplicate key) → `parse()` returns `null`.
- Switching type keeps the chosen interval, now visibly in the selection.
- `INTERVAL` combined with `UNTIL` / `COUNT` and with other preserved parts (e.g. `WKST`):
  order and content are kept.

## Manual check

With an "every 12 days" event (and one "every 2 weeks on Mon + Thu"):

- Correct in month and week views, across a month boundary.
- Edit a single occurrence, delete a single occurrence, edit the whole series.
- Drag the event to another day.
- Shows correctly in a CalDAV client (e.g. Thunderbird or DAVx⁵ + phone calendar).
- "Your day" widget on Android shows it on the right days.
- Open an `INTERVAL` event that was created in a CalDAV client: the editor shows the right
  interval, and saving without changes leaves the rule as it was.

## Out of scope

- More complex rules (e.g. "last weekday of the month", several `BYMONTHDAY` values).
  Rules the editor can't model keep going through `preserved` as today.
