# Implementation: calendar-ics-file-import

id: bank
developer: charmaine
date: 2026-11-24

## Summary

The calendar import modal offers two sources, "CalDAV account" (the existing flow) and
".ics file". A file goes into a new calendar (name prefilled from the filename, empty
means the API picks the name; optional colour via the colour picker next to the name) or into one of the user's own calendars. Both flows share
one progress, result and failure view, driven by the polled import state. The API contract
is room decision `01M871VQHC2G6TGT49VB4D037E`.

## Changes

TASK-1: `types/calendar.ts` gets `ImportSource`, `ImportStage` (+ `failed`),
`ImportFileTarget`, and `source`/`events_skipped` on `ImportState`. The unused `ImportForm`
is removed. `apiRoutes.calendars.startFileImport` added. New pure `CalendarImportService`:
default name from the filename, target calendar filter (`!is_shared && !is_external`),
multipart request, status → error mapping per source, state → view, progress, and a
progress marker for stall detection. Unit tests included.

TASK-2: `CalendarImport` store rewritten. `open()`/`close()`, `startCaldavImport`,
`selectCaldavCalendars`, `importFile`, all through `postWithStatus` and returning a typed
error. State polling lives in the store (1 s interval). It stops on `select`, `finished`
and `failed`, and after 5 minutes without progress (`stalled`). Network and rate-limit
errors keep it polling. The file upload's response already carries the initial state;
the CalDAV endpoints answer with an empty list, so a local `started` state stands in.
Progress counts imported + skipped events against `events_count`. On finish it reloads calendars and events. If the modal is closed
by then, it shows a notification instead. Finished/failed states are treated as stale when
the modal opens, and a running import is resumed. `destroy()` is called from
`routes/calendar/+layout.svelte`. Store tests use fake timers.

TASK-3: `ImportModal.svelte` rewritten as a shell around `calendars/import/CaldavForm`,
`CaldavSelect` and `FileForm`. Errors go through `SaveAction` (notification).
`CalendarNavigation` and `MobileCalendarHeader` call `calendarImport.open()`. The old
hardcoded strings (URL/Username/Secret/Import) now reuse the `connect_*` keys plus 12 new
`calendar.import_*` keys. en is written by charmaine, the other locales by silvio.
Component tests in `tests/components/calendar-import-modal.test.ts`.

TASK-4: Read-only shared calendars (the human's instruction at 15:47, `01M873TEBZREFM7QRRR31MZVE0`; API change `80317ff`):
`Calendar.is_read_only`. A 403 on an event write maps to `EventWriteResult` `read_only`
with the message `calendar.event_read_only`. `Calendars.writableCalendars()` /
`isEventReadOnly()`: the event form offers only writable calendars, and an event of a
read-only calendar opens without Save/Delete. Week and month views don't let those
events be dragged. Store, service, helper and component tests included.

## Known issues / follow-ups

- "Open .ics with solyto" (PWA file handler/share target, Electron/Capacitor):
  `docs/backlog/calendar-open-ics-with-solyto.md`.
- Behaviour change: a finished CalDAV import now shows the result view with a Close button
  instead of closing itself with a notification. Both sources behave the same.
- Not verified against the running API or with a rendered screenshot: there's no API in
  this environment, and the calendar route needs a login. Covered by component tests.
- The `ColorPicker` setup in `FileForm` is the 7th copy of the same block (STANDARDS 1.6),
  tracked in `docs/backlog/shared-color-picker-component.md`.
- `FileForm` reads `targets` once for the initial picker value. Calendars are loaded
  before the modal can be opened, so this is fine in practice.
