# Report: CalDAV VTODO sync for solyto todos
read: true

Date: 2026-10-14
Job: `state_report-caldav-vtodo`
Scope: can solyto offer CalDAV sync of todos as `VTODO` components, and if so, how?
Method: the todo model and the existing DAV touchpoints were read in this (frontend)
repository; the mapping was done against RFC 5545 §3.6.2 (VTODO) and RFC 4791
(CalDAV), plus RFC 6578 (sync-collection) for change tracking.

> **Limitation.** The CalDAV/CardDAV server (`https://dav.solyto.de`) and the todo
> persistence live in the backend repository, which is not part of this workspace.
> Everything below about the backend — the DAV library, how collections are stored,
> how recurrence instances are generated, whether VTODOs are currently rejected — is
> an **assumption** derived from the API shape the frontend sees, and is marked as
> such. Section 8 lists the questions the backend repo has to answer.

---

## 1. Summary

**If: yes, feasible.** The solyto `Todo` maps onto `VTODO` better than most
proprietary task models: UUID ids fit `UID`, title/description/link/due/progress/
completion all have direct iCalendar properties, and the recurrence model
(frequency + interval + end date) is a strict subset of `RRULE`. The calendar
side already proves the backend can speak CalDAV and track ETags
(`CalendarEvent.uri`, `CalendarEvent.etag`).

**The hard parts are not the field mapping but three model mismatches:**

1. **Recurrence.** solyto materialises occurrences server-side as separate todos
   (`auto_generated`, `parent_task_id`); CalDAV clients expect one `VTODO` with an
   `RRULE` and handle "complete → next occurrence" themselves, each client
   differently. This is the single largest risk.
2. **Statuses.** solyto has five working statuses plus a separate completed flag;
   iCalendar has four `STATUS` values. Three solyto statuses can only survive a
   round trip through an `X-` property.
3. **Subtasks.** solyto subtasks are lightweight checklist rows (numeric id, title,
   done flag) owned by a todo; in iCalendar a subtask is a full `VTODO` linked via
   `RELATED-TO`, and client support for that is uneven.

**Recommendation (labelled as such, not a decision):** offer sync through
**dedicated VTODO-only collections, one per todo category plus one for
uncategorised todos** (Option B1 below), expose recurring todos **as their
materialised instances without `RRULE`** in a first version (read-only recurrence
from the client's point of view), map subtasks to **child `VTODO`s with
`RELATED-TO`**, and preserve solyto-only fields and unknown client properties
round-trip. Rough sizing: frontend work is small (an entry point and copy, see §6);
the effort sits almost entirely in the backend and cannot be estimated from here.

---

## 2. Current state: the todo model as the frontend sees it

Source: `src/lib/types/todo.ts`, `src/lib/types/tag.ts`,
`src/lib/state/Todos.svelte.ts`, `src/lib/config/apiRoutes.ts`.

### 2.1 `Todo`

| Field | Type | Notes relevant to sync |
| --- | --- | --- |
| `id` | `string` (UUID) | Stable, globally unique — a natural `UID`. |
| `title` | `string` | |
| `description` | `string` | Plain text holding Markdown (rendered via `markdownToHtml` in `todos/props/Description.svelte`). |
| `link` | `string \| null` | Single URL. |
| `priority` | `'low' \| 'medium' \| 'high'` | No "none" value. |
| `status` | `'backlog' \| 'pending' \| 'in-progress' \| 'waiting' \| 'almost-done'` | Independent of `is_completed`. `backlog` todos are hidden by default (`filterOutBacklog`). |
| `effort` | `null \| 'low' \| 'medium' \| 'high'` | No iCalendar equivalent. |
| `progress` | `null \| number` | Percent. |
| `is_completed` | `boolean` | Completion is a flag, not a status. |
| `due_at` | `string` (typed non-null) | The code treats it as nullable (`t.due_at === null` in `Todos.useFilters`; `changeDue(todo, null)`), so the type is narrower than reality. Date-only vs. date-time and the timezone are not visible. |
| `category` | `TodoCategory \| null` | At most one. |
| `tags` | `Tag[]` | Many; a tag has `name` and `color`, and is shared across features (`/tags`). |
| `subtasks` | `TodoSubtask[]` | See 2.2. |
| `relevance` | `number \| null` | Computed **client-side** by `TodoRelevanceService`; not persisted data. |
| `recurrence_frequency` | `'daily' \| 'weekly' \| 'monthly' \| 'yearly' \| null` | |
| `recurrence_interval` | `number` | |
| `recurrence_ends_at` | `string \| null` | Recurrence requires a due date (`recurrence_requires_due` in `TodoCreate`). |
| `parent_task_id` | `string \| null` | Links a generated occurrence to its series. |
| `auto_generated` | `boolean` | Occurrence created by the backend. The UI hides generated todos due more than 3 days ahead (`Todos.useFilters`), which implies the backend generates ahead of time. |
| `created_at`, `updated_at`, `completed_at` | `string` | `completed_at` is typed non-null but is presumably null while open. |

There is **no `etag`** on `Todo` and the REST update (`PATCH`-style partial
`UpdateTodoRequest`) carries no version, so web edits are last-write-wins today.
Calendar events by contrast carry `uri` and `etag`.

### 2.2 Related entities

- **`TodoSubtask`** — `id: number`, `title`, `is_completed`, timestamps. No due date,
  no description, no own UUID; addressed as `/todos/{uuid}/subtasks/{id}`.
- **`TodoCategory`** — `id: number`, `title`. One per todo at most.
- **`TodoWorkspace`** — `id`, `title`, `is_hideable`, `categories: TodoCategory[]`.
  Categories are attached/detached (`attachWorkspaceCategory`/`detach…`), so
  whether a category can belong to more than one workspace is not visible from here.
  Workspaces are a view/grouping concept ("hide it"), not ownership.
- **`Tag`** — `id`, `name`, `color`; shared with other features.
- **Event ↔ todo attachments** — `calendars/events/{id}/attachments/todos`. A todo
  can be attached to a calendar event; this is a solyto-side relation.

### 2.3 Existing DAV touchpoints in the frontend

- `src/lib/components/dav/SyncModal.svelte` shows server `https://dav.solyto.de`
  (hard-coded), username = account email, password = "your solyto password".
- Opened from `CalendarNavigation.svelte`, `MobileCalendarHeader.svelte` (state
  `calendars.syncModal`) and `ContactNavigation.svelte` (`contacts.syncModal`);
  rendered in `routes/calendar/+page.svelte` and `routes/contacts/+page.svelte`.
- i18n `dav.*` keys (`DavRecords` in `types/translation.ts`), headline text:
  "…synchronize your calendars and contacts…".
- The calendar view shows todos by due date (`Calendars.getTodosForDate`) and
  toggles completion — todos already appear *next to* calendars in the UI, but
  they are not part of any calendar collection.
- There is nothing todo-related in the DAV UI today.

---

## 3. Field mapping: `Todo` → `VTODO`

Classification: **lossless** (round-trips exactly), **lossy** (round-trips only
with an `X-` property or loses precision), **solyto-only** (no standard property;
`X-` property at best, clients will ignore it), **client-only** (a VTODO property
solyto has no field for — must be preserved, see §5.3).

| solyto | VTODO | Class | Notes / options |
| --- | --- | --- | --- |
| `id` | `UID` | lossless (outbound) | Client-created VTODOs bring their own `UID`, which is not guaranteed to be a UUID. Either store the client UID separately from `id`, or reject/normalise non-UUID UIDs (open question Q4). |
| `title` | `SUMMARY` | lossless | |
| `description` | `DESCRIPTION` | lossless | Markdown arrives as plain text in clients, which is acceptable. |
| `link` | `URL` | lossless | Apple Reminders stores its own URL field differently (assumption, verify per client). |
| `due_at` | `DUE` | lossless if date/time semantics match | Date-only due → `DUE;VALUE=DATE`; date-time → UTC or `TZID`. Depends on how the backend stores `due_at` (Q5). |
| — | `DTSTART` | client-only | Several clients set a start date; solyto has none. Preserve, or add a field later. |
| `is_completed` + `completed_at` | `STATUS:COMPLETED` + `COMPLETED` | lossless | Clients that only set `PERCENT-COMPLETE:100` or only `COMPLETED` should also mark done. |
| `status` | `STATUS` + `X-SOLYTO-STATUS` | lossy | `pending`→`NEEDS-ACTION`, `in-progress`→`IN-PROCESS`; `backlog`, `waiting`, `almost-done` have no equivalent (`NEEDS-ACTION`/`IN-PROCESS` + X-property). Inbound `IN-PROCESS` without X-property → `in-progress`. Inbound `CANCELLED` has no solyto equivalent (options: treat as completed, as delete, or add a status). |
| `progress` | `PERCENT-COMPLETE` | lossless | |
| `priority` | `PRIORITY` | lossy | RFC 5545: 1–4 high, 5 medium, 6–9 low, 0 = undefined. Outbound high→1, medium→5, low→9 (what Apple uses, assumption). Inbound ranges map back; `0`/absent has no solyto value — options: default to `medium`, or add a "none" priority to the model. |
| `effort` | `X-SOLYTO-EFFORT` | solyto-only | |
| `relevance` | — | not mapped | Derived client-side, not data. |
| `category` | collection membership (B1) or `CATEGORIES` | lossless in B1 | See §4. Putting both category and tags into `CATEGORIES` conflates them and makes inbound parsing ambiguous. |
| `tags` | `CATEGORIES` | lossy | Names round-trip; colours don't (RFC 7986 `COLOR` is per component, not per category). A client adding an unknown category → create a tag, or ignore (Q7). Renaming a tag changes every tagged todo's ETag. |
| `subtasks` | child `VTODO`s with `RELATED-TO;RELTYPE=PARENT:<todo UID>` | lossy | Subtasks need a stable UID (e.g. derived `<todo-uuid>-<subtask-id>` or a new UUID column). Alternatives: render as a checklist inside `DESCRIPTION` (read-only, lossy), or don't map. Clients may give children their own due/notes — data with nowhere to go. |
| `recurrence_*` | `RRULE:FREQ=…;INTERVAL=…;UNTIL=…` | lossless *as a rule* | solyto's model is a subset of RRULE. Inbound RRULEs with `BYDAY`, `COUNT`, `BYMONTHDAY`, etc. cannot be represented. The real problem is instances, see §4.3. |
| `parent_task_id`, `auto_generated` | `RELATED-TO` / `X-` / `RECURRENCE-ID` | depends on option | See §4.3. |
| `created_at` | `CREATED` | lossless | |
| `updated_at` | `LAST-MODIFIED`, `DTSTAMP` | lossless | |
| workspace | — | solyto-only | Derived from category; nothing to sync. |
| event attachments | — | solyto-only | Could be `RELATED-TO` the event UID, but clients won't use it. Not mapped. |
| — | `VALARM` | client-only | Reminders are the main reason people sync tasks to phones. solyto has no alarm field; at minimum they must be preserved (§5.3). |
| — | `CLASS`, `LOCATION`, `GEO`, `ATTACH`, `X-APPLE-*` … | client-only | Preserve. |

Outbound example (Option B1, one-off todo):

```
BEGIN:VTODO
UID:0f6c4f6e-2b0a-4a3e-9a8f-3f0c9b1d2e11
DTSTAMP:20261014T091500Z
CREATED:20261001T080000Z
LAST-MODIFIED:20261014T091500Z
SUMMARY:Renew passport
DESCRIPTION:Bring **two** photos.
URL:https://example.org/appointment
DUE;VALUE=DATE:20261020
STATUS:NEEDS-ACTION
X-SOLYTO-STATUS:waiting
PRIORITY:1
X-SOLYTO-EFFORT:low
PERCENT-COMPLETE:20
CATEGORIES:admin,errands
END:VTODO
```

---

## 4. Architecture options

### 4.1 Where do the VTODOs live?

**Option A — VTODOs inside the existing calendar collections.**
Todos would need a `calendar_id`; solyto todos have none and are not tied to
calendars. Mixed collections (`VEVENT` + `VTODO`) are legal, but client behaviour
varies: some clients list such a collection in both the calendar and the task app,
others expect task lists to be separate (assumption, verify per client).
*Consequences:* a new todo↔calendar relation in the data model; categories lose
their natural home; deleting a calendar would have to decide what happens to its
todos. **Not recommended.**

**Option B — dedicated task-list collections** (`supported-calendar-component-set`
= `VTODO` only), under the same principal/home as calendars (assumption: the
backend's DAV layer can host collections that are not backed by the `calendars`
table — Q2).

- **B1 — one collection per category, plus an "Uncategorised" collection.**
  Category ↔ collection is 1:1 and a todo has at most one category, so every todo
  is in exactly one collection. Moving a task between lists in a client
  (DELETE + PUT with the same UID, or `MOVE`) = category change; the server must
  recognise the same UID and update instead of delete-and-recreate (otherwise
  subtasks, tags and event attachments are lost). Creating a list in the client
  (`MKCALENDAR`) = create category; deleting a list = delete category (needs a
  decision: delete its todos or uncategorise them — Q8). Collection display name
  = category title.
- **B2 — one collection per workspace.** Workspaces group categories and are a
  view concept; if a category can be attached to several workspaces, a todo would
  appear in several collections, which CalDAV cannot express (same UID in two
  collections of the same user is ill-defined for many clients). **Not recommended.**
- **B3 — a single "solyto todos" collection**, category as `CATEGORIES`.
  Simplest server-side; clients show one big list, category and tags collide in
  `CATEGORIES`. Acceptable as a fallback if B1 turns out too costly.

**Recommendation: B1.**

### 4.2 Change tracking and conflicts

- Each todo resource needs an **ETag** that changes on *every* change visible in
  its VTODO: the todo itself, its subtasks (if mapped as children, those have
  their own ETags), a renamed tag, a renamed category (collection display name).
- Each collection needs a **CTag** / **sync-token** (RFC 6578 `sync-collection`
  REPORT). Every REST write path (`/todos`, `/todos/{id}/subtasks/…`, `/tags`,
  `/todos/categories`) must bump them — otherwise the web app and DAV clients
  silently drift. This is the most invasive backend change: it touches every todo
  write path, not just a new DAV endpoint.
- **Conflicts:** DAV clients send `If-Match` with the ETag; the server answers
  `412` on mismatch and the client re-fetches. The web app has no ETag today, so a
  web edit always wins over a DAV edit in flight and vice versa (last-write-wins).
  That is acceptable for a first version but should be a conscious decision (Q9).
- **Deletes:** a DAV `DELETE` deletes the todo (with subtasks). Some clients
  "clear completed" by deleting; users should know that this removes them from
  solyto too. Deleting a single generated occurrence vs. the series: see 4.3.

### 4.3 Recurrence — the main risk

solyto: the series is a todo with `recurrence_*`; the backend creates the next
occurrences as separate todos (`auto_generated: true`, `parent_task_id` = series),
apparently ahead of time (the UI hides those due > 3 days out). How a completed
occurrence and the next one relate is backend logic not visible here (Q3).

CalDAV clients: a recurring task is one `VTODO` with `RRULE`. On completion,
clients behave differently — some advance `DUE` on the same object, some create a
completed copy plus the advanced original, some write a `RECURRENCE-ID` override
(behaviour per client is an assumption to verify). None of them know about
server-generated siblings.

Options:

- **R1 — instances only, no `RRULE` (recommended for v1).** Expose each
  occurrence as its own plain VTODO; do not expose `RRULE`. Apply the same
  look-ahead window as the web UI so clients don't see far-future generated
  instances. Completing an occurrence in a client = completing that todo, the
  backend generates the next one as it does today. *Lossless for solyto, simple;*
  the client can't see or edit the recurrence rule, and a recurring todo created in
  a client (with `RRULE`) needs a policy (convert to solyto recurrence if it fits
  the subset, else store as one-off and keep the RRULE as preserved property — Q10).
- **R2 — series as one VTODO with `RRULE`, instances hidden.** Matches the client
  model, but then the client drives completion semantics and the backend must
  translate each client's completion style into "complete occurrence, generate
  next". High complexity, per-client edge cases.
- **R3 — series with `RRULE` and instances as `RECURRENCE-ID` overrides** in the
  same resource. Closest to RFC semantics, hardest to implement, weakest client
  support for recurring-task overrides.

### 4.4 Client landscape (to verify during implementation)

| Client | Notes (assumptions unless tested) |
| --- | --- |
| Apple Reminders (iOS/macOS) | Uses CalDAV `VTODO` for non-iCloud accounts. Supports due, priority, notes, URL, alarms, recurrence. Newer features (subtasks, tags, sections) are iCloud-only or poorly represented over CalDAV — expect subtasks to show as flat tasks. |
| Thunderbird | Native CalDAV tasks; status, percent, priority, categories, `RELATED-TO` partially. |
| Android: DAVx⁵ + jtx Board / Tasks.org / OpenTasks | Best coverage incl. subtasks via `RELATED-TO`, percent, status; DAVx⁵ is the usual route on Android. |
| Outlook | No native CalDAV; requires third-party plugins. Not a target. |
| GNOME Evolution / Endeavour, KDE Kontact | CalDAV tasks supported; lower priority. |

---

## 5. Round-trip concerns

### 5.1 solyto-only data
`effort`, the three non-standard statuses and (in B3) the category are emitted as
`X-SOLYTO-*` properties and read back when present. Clients that rewrite the
whole VTODO without unknown properties would drop them — the server should treat
a missing `X-SOLYTO-*` property on update as "unchanged", not "cleared".

### 5.2 Mapping instability
Lossy mappings must not degrade data on a no-op client round trip: e.g. a
`waiting` todo comes back as `STATUS:NEEDS-ACTION` without the X-property → it
should stay `waiting`, not become `pending`. Rule of thumb: only change a solyto
field when the client's value actually differs from what the server last emitted.

### 5.3 Client-only properties
`VALARM`, `DTSTART`, `LOCATION`, `X-APPLE-*` etc. have no solyto field. Unless the
backend stores the original iCalendar blob per todo and merges solyto fields into
it on output, these are lost on the next sync and users' reminders disappear.
Whether the event side already stores raw calendar data (the `uri`/`etag` fields
suggest a resource-oriented store) is unknown (Q2).

### 5.4 Authentication
The sync modal tells users to use their solyto password. Users who only sign in
with a passkey may have no usable password for DAV; this is a pre-existing issue
for calendars/contacts but becomes more visible with another sync feature (Q11).

---

## 6. Frontend impact (if built)

Small and mostly mechanical:

- **Entry point:** a "Synchronize with devices" item in
  `components/todos/TodoNavigationDesktop.svelte` and `TodoNavigationMobile.svelte`,
  a `syncModal` flag on the `Todos` state (same pattern as `Calendars`/`Contacts`),
  and rendering `SyncModal` in `routes/todos/+page.svelte`. `SyncModal` itself can
  be reused unchanged.
- **Copy:** `dav.synchronize_headline` currently says "calendars and contacts" —
  update in `en`, `de`, `es`, `fr` (and possibly a todo-specific hint, e.g. that
  each category becomes a list). `DavRecords` in `types/translation.ts` only
  changes if a new key is added.
- **Types (only if the backend changes the model):** `Todo.etag` if web edits
  should get conflict detection; a `'none'` priority if `PRIORITY:0` is to be
  represented; possibly `'cancelled'` status; making `due_at`/`completed_at`
  nullable in the type would align it with how the code already treats them
  (outside this feature's scope, but sync will exercise those nulls).
- **Optional:** a per-category "sync this list" toggle in category settings, if
  not every category should be exposed.
- Pure services that would need tests if logic moved to the frontend: none —
  all mapping logic belongs in the backend.

## 7. Backend prerequisites (assumed, to be validated in the backend repo)

1. DAV layer can serve VTODO-only collections not backed by the `calendars` table
   (or a "task list" calendar type), with `supported-calendar-component-set`.
2. Per-todo ETag and per-collection CTag/sync-token, bumped from every REST write
   path (todos, subtasks, tags, categories) and from occurrence generation.
3. VTODO serialiser/parser implementing §3, including `X-SOLYTO-*` properties and
   storage/merge of unknown properties (§5.3).
4. UID handling for client-created todos and for subtasks.
5. Recurrence policy (R1 recommended) and the look-ahead window for generated
   instances.
6. Collection lifecycle ↔ category lifecycle (`MKCALENDAR`, rename, delete).
7. Same-UID move between collections treated as a category change.

---

## 8. Open questions for the backend repo

| # | Question |
| --- | --- |
| Q1 | Which DAV server/library backs `dav.solyto.de`, and does it currently reject, ignore or store `VTODO` components PUT into calendars? |
| Q2 | How are calendar objects stored — raw iCalendar per resource (`uri`/`etag`) or only parsed fields? Can the same approach store todos? |
| Q3 | Exactly how are recurring occurrences generated (when, how far ahead, on completion or on schedule) and what is a series vs. an occurrence in the DB? |
| Q4 | Is `todos.id` required to be a UUID? Can a separate `uid` column hold arbitrary client UIDs? |
| Q5 | How is `due_at` stored — date-time in UTC, with a timezone, or date-only? Is there an "all-day" notion? |
| Q6 | Can a category be attached to more than one workspace? (Affects B2 only.) |
| Q7 | Unknown `CATEGORIES` from a client: auto-create tags or ignore? Tags are shared across features. |
| Q8 | Deleting a list in a client: delete the category's todos or uncategorise them? |
| Q9 | Is last-write-wins between web app and DAV acceptable for v1, or should `Todo` get an ETag the web app sends back? |
| Q10 | Policy for client-created recurring VTODOs whose `RRULE` exceeds solyto's subset. |
| Q11 | How do passkey-only users authenticate against DAV (app passwords)? |
| Q12 | Is todo sharing between users planned? Nothing in the frontend model suggests it; this report assumes single-user todos. |
