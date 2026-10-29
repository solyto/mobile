# Verdict: Report: CalDAV VTodo

id: state
reviewer: @reviewer
date: 2026-10-14

## Review

Branch `report/state_report-caldav-vtodo`, diff `main...HEAD`: only the job files
and the new `docs/reports/2026-10-14-caldav-vtodo-sync.md`. No source changes. This is
in scope for a report-only job. `.mcp.json` is modified in the worktree, but it is not
committed and not part of the diff (implementation.md mentions this).

I checked the report's claims against the code: `Todo` fields/enums (`types/todo.ts`),
nullable `due_at` usage and the 3-day `auto_generated` look-ahead (`Todos.svelte.ts:180-189`,
`changeDue` :445), subtask/category/workspace routes (`apiRoutes.ts:53-66`), `SyncModal`
hard-coded server and entry points (Calendar/MobileCalendarHeader/Contact navigation,
`syncModal` flags in `Calendars`/`Contacts`), `etag`/`uri` on calendar types,
`recurrence_requires_due`, Markdown description rendering, and the existence of
`TodoNavigationDesktop/Mobile.svelte`. All of them are accurate.

TASK-1: PASS
notes: Report §2 lists the todo model, the related entities and the DAV touchpoints. It
also points out the type mismatch on `due_at`/`completed_at`.

TASK-2: PASS
notes: §3 maps every field to VTODO with a lossless/lossy/solyto-only/client-only
class. It covers status, priority, subtask and recurrence mappings as options, as the
task asked. It includes an example VTODO.

TASK-3: PASS
notes: §4–5 cover option A versus B1–B3, ETag/CTag/sync-token, conflicts, deletes,
recurrence options R1–R3, preserving X- and unknown properties, and the client
landscape. Claims about the backend and clients are labelled as assumptions.

TASK-4: PASS
notes: §6 covers the frontend impact (nav entry, `syncModal` flag, copy in all four
i18n files, possible type changes). §7 covers the backend prerequisites.
Non-blocking: the es/fr `synchronize_headline` only says "CalDAV / CardDAV
synchronisation", so only en/de mention "calendars and contacts".

TASK-5: PASS
notes: The report is at the planned path. It has a labelled recommendation, the
limitation stated at the top, and open questions Q1–Q12 for the backend repo.

## Security

Not run. This is a docs-only change, and the report contains no secrets or user data.

## Overall

APPROVED. Nothing needs to change before merge.
