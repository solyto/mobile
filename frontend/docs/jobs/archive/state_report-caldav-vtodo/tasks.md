# Tasks: Report: CalDAV VTodo

id: state
analyst: @analyst
date: 2026-10-14

## Scope notes

- This is a **report-only** job: the only deliverable is one new Markdown file in
  `docs/reports/`. No source code, types, i18n, or config changes are in scope.
- Proposed file name, following the existing convention
  (`docs/reports/2026-10-14-standards-refactor-audit.md`):
  `docs/reports/2026-10-14-caldav-vtodo-sync.md`.
- **Known limitation, state it in the report:** the CalDAV/CardDAV server
  (`https://dav.solyto.de`, see `src/lib/components/dav/SyncModal.svelte`) and the
  todo persistence live in the backend repo, which is not in this workspace. The
  report can only analyse the todo model as the frontend sees it
  (`src/lib/types/todo.ts`, `src/lib/state/Todos.svelte.ts`, `apiRoutes.ts`).
  Anything about the DAV server's implementation (library used, how calendars
  are exposed, whether VTODO components are already rejected/ignored) must be
  marked as an open question / assumption, not stated as fact.
- The brief's "Why" and "Out of scope" are empty. The report should therefore
  stay analytical (feasibility, mapping, options, risks) and not commit to an
  implementation plan or effort estimate beyond rough sizing.

## Task breakdown

TASK-1: Inventory the current todo data model and behaviours relevant to sync (Todo fields, status/priority/effort enums, subtasks, recurrence, categories/workspaces/tags, `auto_generated`/`parent_task_id` recurrence instances, UUID string ids, timestamps) and the existing DAV touchpoints in the frontend.
  files (read only): src/lib/types/todo.ts, src/lib/types/tag.ts, src/lib/state/Todos.svelte.ts, src/lib/config/apiRoutes.ts, src/lib/helpers/TodoHelper.ts, src/lib/components/dav/SyncModal.svelte, src/lib/components/calendars/TodoEntry.svelte, src/lib/components/calendars/CalendarNavigation.svelte, src/lib/components/contacts/ContactNavigation.svelte, src/lib/types/calendar.ts
  depends: none
  risk: low — read-only analysis of a small, well-typed surface.

TASK-2: Produce a field-by-field mapping of the solyto `Todo` to RFC 5545 VTODO properties (e.g. id→UID, title→SUMMARY, description→DESCRIPTION, link→URL, due_at→DUE, is_completed/completed_at→STATUS:COMPLETED/COMPLETED, status→STATUS + X-property, progress→PERCENT-COMPLETE, priority→PRIORITY 1–9 scale, tags/category→CATEGORIES, recurrence_*→RRULE FREQ/INTERVAL/UNTIL, created_at/updated_at→CREATED/DTSTAMP/LAST-MODIFIED, subtasks→child VTODOs with RELATED-TO or not mapped), classifying each as lossless / lossy / solyto-only (effort, relevance, workspace, backlog/waiting/almost-done statuses).
  files (read only): as TASK-1; external reference RFC 5545 §3.6.2 and RFC 4791 (CalDAV)
  depends: TASK-1
  risk: medium — some mappings (5 statuses vs. 4 iCal STATUS values, 3 priorities vs. 0–9, subtasks without own due/ids as UUID, server-side recurrence instance generation vs. client-side RRULE expansion) are judgement calls and must be presented as options, not decisions.

TASK-3: Describe the sync-architecture options and their consequences: (a) todos exposed as VTODO in existing calendar collections vs. (b) dedicated task-list collections (per category or per workspace, `supported-calendar-component-set` = VTODO), plus round-trip concerns (ETags/ctag/sync-token, conflict handling, preserving unknown/X- properties from clients, delete semantics, how `auto_generated` recurrence instances interact with RRULE-capable clients) and the client landscape (Apple Reminders, Thunderbird, DAVx⁵ + jtx Board/Tasks.org, Outlook not supporting CalDAV natively).
  files (read only): none beyond TASK-1; external references only
  depends: TASK-2
  risk: medium — depends on backend DAV server internals that are not visible here; every backend claim must be flagged as an assumption/open question.

TASK-4: List the frontend-side impact if the feature were built (e.g. a todo "Synchronize" entry reusing `SyncModal.svelte`/`dav` i18n keys in all four languages, possible new types/fields such as an iCal-compatible priority or a per-category sync toggle) and the backend-side prerequisites, without implementing anything.
  files (read only): src/lib/components/dav/SyncModal.svelte, src/lib/components/todos/TodoNavigationDesktop.svelte, src/lib/components/todos/TodoNavigationMobile.svelte, src/lib/i18n/en.ts, src/lib/types/translation.ts
  depends: TASK-3
  risk: low — descriptive only; no code is changed.

TASK-5: Write the report to `docs/reports/2026-10-14-caldav-vtodo-sync.md` with: summary/recommendation ("if"), current-state model (TASK-1), mapping table (TASK-2), architecture options + recommendation ("how", TASK-3), frontend/backend impact (TASK-4), risks, and an explicit "Open questions for the backend repo" section.
  files: docs/reports/2026-10-14-caldav-vtodo-sync.md (new)
  depends: TASK-1, TASK-2, TASK-3, TASK-4
  risk: low — new standalone document; only risk is overstating backend facts, mitigated by the open-questions section.

## Unclear / to confirm with the owner (do not guess)

- Whether the report should recommend a single option or just lay out options — brief says "if and how", so the developer should give a recommendation but clearly label it as one.
- Whether access to the backend repo is expected for a deeper report; without it, server-side feasibility stays an open question.
- Whether todo sharing/multi-user (if any exists backend-side) is in scope — nothing in the frontend todo model suggests sharing, so treat as out of scope unless told otherwise.
