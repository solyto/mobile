# Brief: calendar-ics-file-import

type: feature
id: bank
branch: feature/bank_calendar-ics-file-import
date: 2026-11-24
author: Leander Muskalla

## What

Users can import events from an `.ics` file into a new calendar (name prefilled from the
filename) or into one of their own existing calendars. The calendar import modal gets a
choice between "CalDAV account" (current flow) and ".ics file". The API contract is room decision
`01M871VQHC2G6TGT49VB4D037E` (`POST /calendars/import/file`, progress via
`GET /calendars/import/state`, new stage `failed`, `events_skipped`).

## Why

Users can export calendars as `.ics` but can't import them back, or bring in files from
other calendar apps.

## Out of scope

- Opening `.ics` files from outside the app (OS file handler / share target):
  `docs/backlog/calendar-open-ics-with-solyto.md`.
- De-duplication, webcal subscriptions, importing to-dos.

## Notes

- Backlog entry: api repo `docs/backlog/calendar-ics-file-import.md`.
- The existing ImportModal's hardcoded strings move to `ts.get`; the translator does the
  non-English locales.
