# Brief: 04 Move calendar event conversion and grouping into a service

type: feature
id: sun
branch: feature/sun_04-move-calendar-event-conversion-and-grouping-into-a-service
date: 2026-10-13
author: Leander Muskalla

## What

`Calendars.loadEvents()` currently fetches, converts API strings to dates, and builds the by-day index in one 60-line body. Split the two pure parts into a `CalendarEventService` with unit tests, and give the API payload its own type.

- `CalendarEventResponse` (strings, as the API sends them) and `CalendarEvent` (dates) as separate types; one typed `fromApi()`; no casts.
- `groupByDay(events)` including the multi-day expansion.
- Plain `Date` instead of `SvelteDate` for loaded events (nothing mutates them in place).
- `loadEvents()` becomes fetch, convert, assign.

## Why

The method is the hardest-to-read piece of store code in the repo, its type signature is false (the `Date` fields hold strings at the cast), and none of its logic is testable without a network mock.

## Out of scope

The other `Calendars` methods. Changing what the views receive.

## Notes

Tests first: characterise the current output of `loadEvents()` through the existing `Calendars` tests (events, `sortedEvents` keys incl. multi-day), then write the service tests, then refactor. Rules: 12.2, 12.3, 12.4, 14.1, 13.1.
