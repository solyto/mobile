# Tasks: wrong calendar on edit

id: free
status: open
analyst: architect
date: 2026-08-17

<!-- Produced by @analyst from brief.md. -->

## Analysis summary

Symptom: opening an existing event for edit shows the default (first) calendar
in the picker instead of the event's own calendar.

Flow: a view calls `calendars.showSidebar(null, item)` → `activeEvent` is set →
`CalendarView.svelte` mounts `EventEdit.svelte` under `{#if editSidebar}` →
`EventEdit` seeds `form.calendar_id` from `activeEvent.calendar_id` →
`ChooseCalendar.svelte` resolves it via
`getSelected(calendar) ?? availableCalendars[0]` with a **strict `===`**
against `Calendar.id`.

Root cause: when `getSelected` finds no match it silently falls back to
`availableCalendars[0]`, and its `$effect` writes that id back into
`form.calendar_id` — so the picker *displays* the default and a save would
silently move the event into it. The mismatch is most plausibly a runtime type
difference between `event.calendar_id` and `calendar.id` (number vs. string):
`views/month/Entry.svelte:12` already does `parseInt(item.calendar_id)`, which
only makes sense if the API delivers `calendar_id` as a string at runtime,
while `Calendar.id` from the calendars endpoint is numeric. The declared TS
type (`calendar_id: number`) hides this.

Assumption (could not be verified from this repo — backend is external): the
events endpoint returns `calendar_id` in a different JSON type than the
calendars endpoint returns `id`. Both fix tasks below normalize the comparison
and therefore work whether the payload sends string or number.

## Task breakdown

TASK-1: Make `ChooseCalendar` resolve the bound calendar id reliably by
normalizing the type before comparing (e.g. compare `Number(c.id)` against
`Number(id)`), so an event's calendar is found instead of falling back to the
default.
     files: src/lib/components/calendars/ChooseCalendar.svelte
     depends: none
     risk: low — isolated component, identical behavior for numeric ids; only
     the previously-failing string/number case changes.

TASK-2: Normalize `calendar_id` when seeding the edit form from
`calendars.activeEvent` (coerce to number, keep the `0` create-mode fallback)
so `EventEdit` always binds a numeric id matching `Calendar.id`.
     files: src/lib/components/calendars/EventEdit.svelte
     depends: none
     risk: low — one-line change in the form initializer; create flow keeps
     the existing default-calendar behavior.

TASK-3: Guard the write-back `$effect` in `ChooseCalendar` so a present but
unresolvable calendar id is not silently overwritten with
`availableCalendars[0].id` (show the "choose calendar" placeholder instead);
keep the fallback-to-first only for the create case (`id` empty/0).
     files: src/lib/components/calendars/ChooseCalendar.svelte
     depends: TASK-1
     risk: medium — changes behavior in the edge case where the event's
     calendar is not in `calendars.calendars`; needs manual check that the
     create flow still preselects the default calendar.

TASK-4: Verify: `npm run check`, `npm run lint`, `npm test` (existing suites
must stay green), plus manual pass — edit an event from a non-default calendar
(picker must show that calendar on desktop month/week/day/list and mobile
views) and create a new event (picker must still default to the first
calendar); saving an edited event must not change its calendar.
     files: none (no production code changes)
     depends: TASK-1, TASK-2, TASK-3
     risk: low — read-only verification; no component test added because the
     fix is a two-line normalization (optional small test in
     tests/components/ could follow if the developer prefers).

## Follow-ups (out of scope, do not touch in this job)

- `src/lib/components/contacts/ChooseAddressBook.svelte` has the identical
  `getSelected` strict-equality fallback pattern; if contacts ever show the
  same symptom, apply the same normalization there.
- `views/month/Entry.svelte:12` uses `parseInt(item.calendar_id)` while all
  other views pass `item.calendar_id` raw into `isCalendarHidden` — once
  TASK-1/TASK-2 land, consider normalizing the event payload once in
  `Calendars.loadEvents()` instead, and drop the scattered coercions.
- `ChooseCalendar` declares an unused `preSelect?: Calendar` prop (mirrored in
  `ChooseAddressBook`); either implement it or remove it in a future cleanup.
