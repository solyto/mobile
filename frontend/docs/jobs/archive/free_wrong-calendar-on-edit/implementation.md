# Implementation: wrong calendar on edit

id: free
status: open
developer: opencode (glm-5.2)
date: 2026-08-17

## Summary

Fixed the edit-event sidebar showing the default calendar instead of the event's own calendar. The root cause was a strict `===` between the bound `calendar_id` and `Calendar.id` in `ChooseCalendar.getSelected` (which silently fell back to `availableCalendars[0]` when the runtime types differed, e.g. string vs. number from the API) plus an unconditional `$effect` that wrote the fallback id back into the form.

TASK-1 normalized the comparison in `ChooseCalendar.svelte`: `getSelected` now compares `Number(c.id) === Number(id)` (after an early `!Number(id)` guard), so an event's calendar is found regardless of whether the payload delivered the id as string or number. Behavior for numeric ids is unchanged.

TASK-2 normalized the form seed in `EventEdit.svelte`: `form.calendar_id` is now `Number(calendars.activeEvent.calendar_id)` when editing, keeping the `0` create-mode fallback, so the component always binds a numeric id matching `Calendar.id`.

TASK-3 guarded the write-back `$effect` in `ChooseCalendar.svelte`: the fallback to `availableCalendars[0]` now only applies in the create case (`id` empty/0); a present-but-unresolvable id keeps `selectedCalendar = null`, so the picker shows the "choose calendar" placeholder instead of silently overwriting the id with the first calendar's (which previously would have silently moved the event into the default calendar on save). The effect only writes back when a calendar actually resolved — which also removes a latent `undefined.id` throw when `availableCalendars` is empty.

TASK-4 verified (see below). Traced all edit entry points: every view (month `Entry.svelte`, week `Day.svelte`, list `Day.svelte`, `MobileMonthView.svelte`) routes through `calendars.showSidebar(null, item)` → `activeEvent` → the shared `EventEdit` seeding, so the fix applies uniformly to desktop and mobile. Create flow: `activeEvent = null` → `form.calendar_id = 0` → falsy → falls back to `availableCalendars[0]` and preselects the default calendar, exactly as before. Saving an edited event no longer changes its calendar when the runtime id type differed.

## Changes

- TASK-1: `src/lib/components/calendars/ChooseCalendar.svelte` — `getSelected` normalizes both sides with `Number()` before comparing.
- TASK-2: `src/lib/components/calendars/EventEdit.svelte` — `form.calendar_id` seeded via `Number(calendars.activeEvent.calendar_id)` (create-mode `0` fallback unchanged).
- TASK-3: `src/lib/components/calendars/ChooseCalendar.svelte` — `selectedCalendar` falls back to `availableCalendars[0]` only when the bound id is empty/0; otherwise an unresolvable id yields `null` (placeholder shown). `$effect` write-back is guarded with `if (selectedCalendar)`.
- TASK-4: no production changes. `npm run check`: 0 errors, 0 warnings. `npm test`: 34 files, 366/366 tests passed. `npm run lint`: fails as before this change — see known issues.

## Known issues / follow-ups

- `npm run lint` is red on this branch **before** this change: `prettier --check .` flags 288 files (the base version of `EventEdit.svelte` already failed; `ChooseCalendar.svelte` remains prettier-clean), and `EventEdit.svelte` carries 3 pre-existing eslint unused-import errors (`CalendarEvent`, `getDateDiffInDays`, `getDateDiffInMinutes`, lines 13/24) — verified identical at base. `ChooseCalendar.svelte` passes eslint. Reformatting the repo or touching unrelated imports is out of scope for this job.
- The manual UI pass from TASK-4 (edit an event of a non-default calendar in the running app) could not be executed here: the app is a pure client-side SPA whose every route is behind an auth guard against the solyto API (no backend exists in this environment), so a rendered page would only show the login redirect, never the edit sidebar. Verified by code trace across all view entry points instead (see Summary).
- `node_modules` was not present in this worktree; `npm ci` (lockfile-exact, no package changes) was run to execute the mandated checks.
- Follow-ups from tasks.md remain out of scope and untouched: the same strict-equality fallback in `contacts/ChooseAddressBook.svelte`, the scattered `parseInt(item.calendar_id)` coercions in the views (candidate: normalize once in `Calendars.loadEvents()`), and the unused `preSelect?: Calendar` prop.
