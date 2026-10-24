# Tasks: 04 Move calendar event conversion and grouping into a service

branch: feature/sun_04-move-calendar-event-conversion-and-grouping-into-a-service (verified, worktree HEAD matches)

## Context (what is already there)

- `src/lib/state/Calendars.svelte.ts:117-173` `loadEvents()`: fetches, converts four
  date fields with `new Date(...)`, pushes into `events`, and builds `sortedEvents`
  keyed by `formatDate()` (`dd.mm.YYYY`). It uses three `<CalendarEvent>itemWithDates` casts,
  one `res.data as CalendarEvent[]`, a `start_date !== null` guard on a field typed non-nullable,
  the "create bucket, then push" block twice, and `getDateDiffInMinutes(...) > 1440`.
- **SvelteDate is already gone from the store.** Job `tune_12` (archived) changed `loadEvents()`
  to plain `Date`. `eachDayBetween` is already in `DateHelper` (job `share_02`). The brief's
  "plain `Date` instead of `SvelteDate`" bullet is therefore already done in `src/`. The only
  remaining `SvelteDate` in this area is in the test fixtures (`tests/unit/stores/Calendars.test.ts`),
  which pass `SvelteDate` objects as the fake API payload instead of strings.
- Existing service pattern: `export default class XService { method(...) {...} }`, held by the
  store as a field (`dragService = new CalendarDragService()`). Tests live in
  `tests/unit/services/XService.test.ts` and do `const service = new XService()`.
- The same object is pushed into both `events` and every `sortedEvents` bucket (shared identity).
  The views may rely on that, so it has to be kept.

## Unclear / assumptions (please confirm)

1. **Nullability of `start_date` / `end_date` in the API payload.** `CalendarEvent` types them
   as non-null `Date`, but `loadEvents()` handles `null` for both. The backend is in a separate
   repo, so I can't check it from here. Rule 12.3 treats the guard as dead code. **Assumption:**
   `CalendarEventResponse.start_date: string` and `end_date: string` (non-null), so `fromApi`
   needs no null branch for them and `groupByDay` drops the guard. If the API can send `null`,
   the response type and `CalendarEvent` have to change, and that changes what views receive,
   which is out of scope. In that case, stop and ask.
2. **`getWidgetEvents()`** (`Calendars.svelte.ts:180-184`) also does `res.data as CalendarEvent[]`
   on the same payload shape and returns strings typed as `Date`. The brief puts it out of scope
   ("other `Calendars` methods"). Leave it alone and flag it in `implementation.md` as a follow-up.
3. **Naming "spans more than one day"** (rule 12.4): keep it as a module-private function or constant
   inside `CalendarEventService.ts`, and don't add a new export to `DateHelper`. That avoids adding
   a shared abstraction the brief doesn't ask for.
4. The rule-12.2 example uses `this.currentYearMonth()`, which doesn't exist. Don't add it. Leave the
   URL construction in `loadEvents()` exactly as it is.

## Tasks

TASK-1: Characterise the current `loadEvents()` output in the store tests, using API-shaped string payloads.
- Change the `loadEvents` tests to feed `api.list` plain objects whose date fields are ISO strings
  (`'2026-08-10T10:00:00Z'`-style, `TZ=UTC`), and add assertions for: `events` holding `Date`
  instances with the right timestamps for all four date fields (`recurrence_end` /
  `original_start_date` both null and set), `sortedEvents` keys incl. multi-day (start and end inclusive),
  single-day all-day not expanded, a timed event spanning >1 day *not* expanded, and shared
  object identity between `events[i]` and its `sortedEvents` entries. Leave the existing
  `event()` factory (used by the other describe blocks) alone.
- Files: `tests/unit/stores/Calendars.test.ts`
- Depends on: none
- Risk: low. Tests only, and they must pass against the unchanged store before anything else moves.

TASK-2: Add the `CalendarEventResponse` type next to `CalendarEvent`.
- Same fields as `CalendarEvent`, but `start_date: string`, `end_date: string`,
  `recurrence_end: string | null`, `original_start_date: string | null` (see assumption 1).
  Leave `CalendarEvent` unchanged.
- Files: `src/lib/types/calendar.ts`
- Depends on: none
- Risk: low. It only adds a type, so nothing that already exists changes.

TASK-3: Create `CalendarEventService` with a typed `fromApi()` and write its unit tests.
- `fromApi(response: CalendarEventResponse): CalendarEvent` (one event) converts the four
  date fields to plain `Date`, has no casts, and returns a new object. A store-side `.map(...)` or
  a list overload is fine, as long as there is exactly one conversion function. Tests use real
  string inputs: nulls kept as `null`, all other fields passed through unchanged, and the
  timestamps exact under `TZ=UTC`.
- Files: `src/lib/services/CalendarEventService.ts` (new), `tests/unit/services/CalendarEventService.test.ts` (new)
- Depends on: TASK-2
- Risk: low. This is a pure function with no callers yet.

TASK-4: Add `groupByDay(events: CalendarEvent[]): Record<string, CalendarEvent[]>` to the service and write its tests.
- The behaviour has to match the current loop: key by `formatDate(start_date)`, and expand onto
  `eachDayBetween(start, end)` only when `is_all_day` and the event spans more than 1440 minutes.
  Push the same object reference, and keep the input order within each bucket. Use `(map[slug] ??= []).push(event)`
  and a named "spans more than one day" (assumption 3). Tests: empty input, two days,
  multi-day all-day (end inclusive), exactly-one-day all-day (not expanded), long timed
  event (not expanded), two events on the same day keep their order, identity kept.
- Files: `src/lib/services/CalendarEventService.ts`, `tests/unit/services/CalendarEventService.test.ts`
- Depends on: TASK-3
- Risk: medium. Every calendar view reads `sortedEvents`, so an off-by-one at the day boundary
  would show up everywhere. The TASK-1 characterisation tests guard against that.

TASK-5: Reduce `Calendars.loadEvents()` to fetch, convert, assign.
- Add an `eventService = new CalendarEventService()` field (same as `dragService`). The body becomes:
  fetch (URL unchanged), `if (!res) return;`, convert
  `res.data as CalendarEventResponse[]` via `fromApi`, then assign `events` and
  `sortedEvents = groupByDay(events)`. The `as` at the API boundary is the only cast allowed.
  Remove the imports that become unused (`eachDayBetween`, `getDateDiffInMinutes`, and
  `formatDate` only if nothing else in the file uses it). Leave every other method alone.
- Files: `src/lib/state/Calendars.svelte.ts`
- Depends on: TASK-1, TASK-4
- Risk: medium. It changes store logic that every calendar view depends on. Mitigation: the TASK-1
  tests have to pass unchanged afterwards.

TASK-6: Verify and tick the backlog entry.
- Run `npm test`, `npm run check`, and `npm run lint`. Confirm there's no `<CalendarEvent>` cast left anywhere
  in `src/`. Tick the `Calendars.loadEvents()` item in `docs/STANDARDS_BACKLOG.md` (line ~81) only
  if every part of it is done. Its "drop the unused parameters" part is already done (the signature
  has none). Record the `getWidgetEvents()` follow-up (assumption 2) in `implementation.md`.
- Files: `docs/STANDARDS_BACKLOG.md`, the job's `implementation.md`
- Depends on: TASK-5
- Risk: low. This is verification and docs only.

## Explicitly not in this job

- `getWidgetEvents()` and every other `Calendars` method.
- Any change to the `CalendarEvent` shape, so views get exactly what they got before.
- The `SvelteDate`-based `event()` factory used by the non-`loadEvents` tests.
- A `currentYearMonth()` helper, constructor injection for `Calendars`, and new `DateHelper` exports.
