# Verdict: calendar-ics-file-import

id: bank
reviewer: janice (app reviewer)
date: 2026-11-24

## Review

Re-review at `f6594c2`. It covers `346546a` (the earlier blockers) and `02b40f6` /
`a2ece0c` / `f6594c2` (read-only shared calendars, added on the human's request per
rosalie's message `01M874JKTENWRZ2MDX5W0JNNJK`). The worktree is clean. All 164 test
files and 2465 tests pass, `eslint .` passes, and `svelte-check` reports 0 errors and
0 warnings.

TASK-1: PASS
notes: Types, `apiRoutes.calendars.startFileImport` and `CalendarImportService` match the
contract (decisions `01M871VQHC2G6TGT49VB4D037E` and `01M872BJE7PBQ3BN0JQ4GTM14M`).
`fileRequest` sends `color` only when one is set, and tests cover both cases.

TASK-2: PASS
notes: Polling stops on select, finished, failed and after a 5-minute stall. Network and
429 errors keep it polling, and `destroy()` is called from the calendar layout (11.4). The
`start`/`post` signatures now follow 1.10.

TASK-3: PASS
notes: The modal shell plus `CaldavForm` / `CaldavSelect` / `FileForm` reuse the
`forms/`/`ui/` primitives (7.1) and route errors through `SaveAction` (15.7). All strings go
through `ts.get`, and the six locales are in sync. The optional colour for a new calendar
(decision D2) is now in `FileForm`; leaving it untouched sends no colour.

TASK-4: PASS
notes: A 403 on an event write maps to `read_only` with `calendar.event_read_only`, and
the key is in all six locales. `Calendars.writableCalendars()` / `isEventReadOnly()`: the
event form defaults to and offers only writable calendars. A read-only event opens
without Save/Delete, and drag is disabled in both drag paths (`week/Day.svelte`,
`month/Entry.svelte`). Store, service, helper and component tests are included.
The task is now in `tasks.md` (`e08ec24`).

## Security

Not run. Nothing security-relevant stood out. The upload goes through `ApiService`, and no
tokens or user data are logged.

## Overall

APPROVED

No blockers.
