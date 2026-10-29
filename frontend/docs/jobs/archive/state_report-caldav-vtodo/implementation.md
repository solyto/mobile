# Implementation: Report: CalDAV VTodo

id: state
developer: @developer
date: 2026-10-14

## Summary

Report-only job. Wrote `docs/reports/2026-10-14-caldav-vtodo-sync.md`, which
analyses the frontend's todo model, maps it to RFC 5545 VTODO, lays out sync
architecture options and gives a clearly labelled recommendation: dedicated
VTODO-only collections per category (+ "Uncategorised"), recurring todos exposed
as materialised instances without RRULE in v1, subtasks as child VTODOs via
RELATED-TO, and preservation of solyto-only and unknown client properties.
No source code was changed.

## Changes

TASK-1: Read-only inventory of `types/todo.ts`, `types/tag.ts`,
`state/Todos.svelte.ts`, `apiRoutes.ts`, `TodoHelper.ts`, `dav/SyncModal.svelte`,
calendar/contact navigation and `Calendars.svelte.ts` → report §2. No files changed.
TASK-2: Field-by-field mapping table with lossless/lossy/solyto-only/client-only
classification and an example VTODO → report §3.
TASK-3: Collection options (A, B1–B3), change tracking/conflicts, recurrence
options (R1–R3), client landscape → report §4–5. Backend claims marked as assumptions.
TASK-4: Frontend impact (todo nav entry, `syncModal` flag, i18n headline in all
four languages, possible type changes) and backend prerequisites → report §6–7.
TASK-5: Report written and committed as
`docs/reports/2026-10-14-caldav-vtodo-sync.md`, including open questions (§8).

## Known issues / follow-ups

- Backend repo was not available; all server-side statements are assumptions,
  collected as Q1–Q12 in the report.
- Observed while reading (not fixed, out of scope): `Todo.due_at` and
  `Todo.completed_at` are typed as non-null `string`, but the code treats
  `due_at` as nullable (`Todos.useFilters`, `changeDue(todo, null)`).
- Client behaviour per app (Apple Reminders, Thunderbird, DAVx⁵/jtx/Tasks.org)
  is stated from general knowledge and should be verified by testing.
- `/workspace/.mcp.json` shows as modified in the worktree; that change was not
  made by this job (environment/MCP config) and was deliberately left uncommitted.
