# Assessment: time tracking

id: whom
status: open
date: 2026-10-10
author: Leander Muskalla (brief) / implementation assessment

## Scope

This is an **assessment-only** document. No source files were changed.

The brief: *"the Time Tracking functionality is the weakest out of all of solyto's
features … visually confusing and inconsistent … the data model doesn't feel
intuitive (the way you add projects, categories, entries) … the way you navigate
doesn't feel intuitive. It has a few good components, but it doesn't feel as easy
to use and natural as the other features."*

Every claim below is grounded in the source with `file:line` references. This
repo is frontend-only, so `src/lib/types/time_tracking.ts` and
`src/lib/config/apiRoutes.ts` are treated as the API contract. There are no
screenshots or render reports for this job, so visual observations are derived
from the templates/classes, not from rendered pixels.

Files reviewed: the whole of `src/lib/components/time-tracking/`, the three
`src/routes/time-tracking/**` routes, `src/lib/state/TimeTracking.svelte.ts`,
`src/lib/types/time_tracking.ts`, `src/lib/config/apiRoutes.ts`, the
`src/lib/components/dashboard/widgets/TimeTrackingWidget.svelte` dashboard
widget, and the four i18n tables.

---

## Executive summary

### What works well

- **Clean store/contract layer.** `TimeTracking` keeps categories, projects,
  entries, the active timer and statistics in one runes store, loads them in
  parallel, and every mutation reloads the affected collections
  (`src/lib/state/TimeTracking.svelte.ts:34-152`). The REST surface is small and
  legible (`src/lib/config/apiRoutes.ts:271-294`).
- **Projects → categories → entries is a genuinely useful shape.** Projects own
  a many-to-many set of globally-defined categories, which is a reasonable way
  to slice time by both a concrete bucket and a cross-cutting tag.
- **The running-timer experience is honest and correct.** A single active timer
  is derived from `entries.find(e => e.stopped_at === null)`
  (`src/lib/state/TimeTracking.svelte.ts:57`); `ActiveTimer` recomputes elapsed
  time from `started_at` every second (`ActiveTimer.svelte:15-28`) rather than
  drifting with a counter, and cleans up its interval (`ActiveTimer.svelte:31-33`).
- **The project-detail page is the best-organised surface.** Header with title,
  description and category chips, a clear total-time card, date-grouped entries,
  and a confirmed delete (`src/routes/time-tracking/[id]/+page.svelte:102-187`).
- **Reuse of shared UI where it happens.** `ProjectCreate`/`EntryCreate`/
  `EntryEdit` all use `ContentModal`, `TextInput`, `Select`, `DateTimeInput`,
  and the standard button components; the feature is not a bespoke island.

### What is broken or weak

- **View state is invisible to the URL.** The Dashboard/Entries tabs live in
  `activeTab` store state; both nav links point at the *same* href and only
  mutate that state (`TimeTrackingNavigation.svelte:156-181`,
  `+page.svelte:17-30`). Deep links, reloads, and back/forward all reset the view
  to Dashboard. This is the single biggest structural problem and is unlike the
  rest of the app (notes/todos/todos-mobile use URL-driven or open-state UI).
- **Category management is hidden inside the navigation sidebar** and its two
  key actions are non-discoverable: rename requires a **double-click**
  (`TimeTrackingNavigation.svelte:300`) and colour editing is an inline third-party
  picker (`:278-288`).
- **The data model has dead and misleading fields.** `project.total_duration`
  exists in the contract but is never read; durations are recomputed by hand in
  three places. `has_exact_times` cannot be updated via the edit request at all.
  There is an `uncategorized` fallback in two breakdown widgets for a state the
  create API forbids (entries must have a `project_id`).
- **Create vs. edit are duplicated and drift.** `EntryCreate` and `EntryEdit`
  are ~90% the same file, and they disagree on timestamp handling (raw
  `datetime-local` vs. `toISOString()`) and on whether `has_exact_times` is sent.
- **The dashboard answers few real questions.** It stacks a timer, an unrelated
  client-only Pomodoro, two per-project breakdowns, recent entries, and the full
  statistics panel onto one page (`DashboardView.svelte:68-97`). The week
  breakdown logic is duplicated verbatim in the dashboard-shell widget
  (`dashboard/widgets/TimeTrackingWidget.svelte:24-52`).
- **Consistency and accessibility gaps.** Hard-coded hex fallbacks (`#1dbda5`,
  `#888`, `#9ca3af`), raw hand-styled `<input>`s next to shared form controls,
  hover-only project controls, colour-contrast risk on category chips, icon-only
  buttons without labels, and six unused i18n keys.

The short version: the **domain model is sound but under-used**, the **CRUD layer
is duplicated and inconsistent**, the **navigation is stateful where it should be
URL-driven**, and the **dashboard mixes concerns instead of answering questions**.
None of this needs a rewrite; it needs a coherent pass to make the model the
single source of truth, unify create/edit, move view state into the URL, and
split the dashboard's concerns.

---

## 1. Navigation & information architecture

### 1.1 Structure

- `/time-tracking` → `+layout.svelte` mounts the navigation sidebar and the
  project-create modal, and loads the store (`+layout.svelte:10,22-26`).
- `+page.svelte` renders either `DashboardView` or `GroupedEntries` depending on
  `tt.activeTab` (`+page.svelte:17-30`).
- `/time-tracking/[id]` renders the project detail (`[id]/+page.svelte:30-32`),
  with an effect that redirects to the list if the project disappears
  (`[id]/+page.svelte:52-56`).
- The sidebar (`TimeTrackingNavigation.svelte`) holds Dashboard/Entries links,
  the project list, and the category manager.

This is a standard "sidebar + content" IA and is easy to understand. The problems
are in how it is *driven*.

### 1.2 View state is not in the URL (high impact)

Both navigation entries resolve to the **same** route:

```svelte
<!-- TimeTrackingNavigation.svelte:156-168 (Dashboard) and :169-181 (Entries) -->
<a href={resolve(urls.timeTracking)} onclick={() => { tt.activeTab = 'dashboard'; handleNavigation(); }}>
<a href={resolve(urls.timeTracking)} onclick={() => { tt.activeTab = 'entries';  handleNavigation(); }}>
```

`activeTab` defaults to `'dashboard'` (`TimeTracking.svelte.ts:26`) and is never
persisted or derived from `page.url`. Consequences:

- **Reload** always lands on Dashboard, even if the user was on Entries.
- **Deep-linking** to the entries view is impossible.
- **Back/forward** cannot restore the view: both links push the *same* URL, and
  the store is not reset, so history navigation silently does nothing (or leaves
  a stale tab).
- The active-tab highlight depends on `activeTab`, so it too can desync from the
  URL (`TimeTrackingNavigation.svelte:159-160,172-173`).

Sibling features do better: `/notes` and `/todos` represent the selected
category/view through routes (`src/routes/notes/[id]`) or through explicit
open/stack state with real overlays, and use the URL to restore context. Time
tracking is the outlier.

**Suggested direction (not code):** make the tab part of the route (e.g. a nested
route or a `?tab=` search param read via `page.url.searchParams`), or remove the
dual-tab model entirely and treat Entries as a route. At minimum, derive
`activeTab` from the URL and write it on click.

### 1.3 Mobile drawer uses a different mechanism than every other feature

`TimeTrackingNavigation` toggles the drawer by mutating inline style:

```svelte
<!-- TimeTrackingNavigation.svelte:68-78 -->
function toggleMobile() { if (navigation) navigation.style.display = 'block'; }
function handleNavigation() { if (navigation && navigation.style.display === 'block') navigation.style.display = 'none'; }
```

The container is `hidden … lg:flex` (`:142-146`), so on mobile it is revealed by
the inline `display:block`; it is closed by re-setting `display='none'`.

Every other feature uses an `open` `$state` flag plus `{#if open}` and a Svelte
`transition:fly`/`fade`, e.g. `TodoNavigationMobile.svelte:23,63-69` and
`NoteNavigationMobile.svelte:18,42-46`. The time-tracking drawer:

- has no enter/exit transition (the others slide in),
- can get stuck in the wrong display mode across a resize (inline `display`
  outranks the `lg:flex` class),
- exposes nothing to the DOM/state model that tests or focus management can use.

This is a concrete instance of the brief's "doesn't feel intuitive/consistent".

### 1.4 Affordances hidden in the sidebar

Project create/edit/delete and *all* category management live inside the
navigation drawer (`TimeTrackingNavigation.svelte:184-314`). On mobile the drawer
is off-screen until the hamburger is tapped; on desktop it is a 64-unit column.
Consequences:

- Create-project is a bare `+` icon next to the "Projects" heading
  (`:184-198`), with no label.
- Project edit/delete are **hover-only** (`opacity-0 … group-hover:opacity-100`,
  `:215-217`) — unreachable by touch until the row is tapped, and effectively
  invisible to new users.
- Category rename is a **double-click** on the label (`:298-303`); category
  delete is an always-visible trash icon that fires immediately (`:306-311`),
  so the destructive action is *more* discoverable than the safe one.
- The category colour picker is embedded in the list row (`:278-288`) and
  commits only on click outside (`:127-132`); leaving the page without clicking
  outside discards the choice (no `onDestroy` flush).

### 1.5 Where each action is reachable (matrix)

| Action | Dashboard tab | Entries tab | Project detail | Nav sidebar |
|---|---|---|---|---|
| Start/stop timer | `TimerWidget` / `ActiveTimer` | — | — | — |
| Add entry | — | `+ Add Entry` (`+page.svelte:23-26`) | `Add Entry` (`[id]/+page.svelte:139-142`) | — |
| Edit entry | — (recent entries are read-only, `DashboardView.svelte:91-93`) | via `Entry` edit (`GroupedEntries.svelte:50-56`) | — (delete only, `[id]/+page.svelte:179`) | — |
| Delete entry | — | `Entry` trash (`Entry.svelte:64-66`) | `Entry` trash (`[id]/+page.svelte:179`) | — |
| Create project | — | — | — | `+` button (`:189-197`) |
| Edit project | — | — | pen button (`[id]/+page.svelte:143-147`) | hover pen (`:218-228`) |
| Delete project | — | — | confirmed (`[id]/+page.svelte:148-152,90-100`) | immediate (`:229-238`) |
| Manage categories | — | — | — | add/rename/recolour/delete (`:244-314`) |

The matrix shows the inconsistency directly: the *same* project can be deleted
with confirmation on one screen and without on another, and entries are editable
from exactly one of three surfaces that show them.

---

## 2. Data model & domain semantics

### 2.1 The model (the contract)

```ts
// src/lib/types/time_tracking.ts
interface TimeTrackingCategory { id: number; title: string; color: string | null; … }
interface TimeTrackingProject  { id: string; title; description; categories: TimeTrackingCategory[];
                                 total_duration: number; … }            // :9-17
interface TimeTrackingEntry    { id: string; description; started_at; stopped_at: string | null;
                                 duration_minutes: number; has_exact_times: boolean;
                                 project: TimeTrackingProject | null; … } // :19-29
```

- Categories are **global** (fetched once from `/time-tracking/categories`), and
  a project links to them via `category_ids` on create/update
  (`CreateTimeTrackingProjectRequest.category_ids?: number[]`, `:44`).
- An entry **must** belong to a project: `CreateTimeTrackingEntryRequest` makes
  `project_id: string` required (`:53-60`), and the timer's `StartTimerRequest`
  too (`:70-73`). Yet the read model still types `project` as nullable (`:26`).

This is a reasonable model. The issues are in how the client *uses* it.

### 2.2 `total_duration` is dead weight

`TimeTrackingProject.total_duration` (`:14`) is declared but **never read**
anywhere in `src/`. Instead the client recomputes totals by hand in at least
three places:

- `TimeTrackingNavigation.svelte:38-47` builds a `projectDurations` map by
  filtering and reducing entries.
- `src/routes/time-tracking/[id]/+page.svelte:44-50` reduces the same entries for
  the project's total.
- `DashboardView.svelte` and `TimeTrackingWidget.svelte` re-derive week/today
  totals from raw entries (`DashboardView.svelte:43-65`,
  `TimeTrackingWidget.svelte:41-52`).

So there are **two competing sources of truth** for the same number (API field
vs. client reduction), and the client chose the more expensive one. The API also
exposes a statistics endpoint (`statistics: '/time-tracking/entries/statistics'`,
`apiRoutes.ts:292`) that the dashboard ignores for its own breakdowns.

**Suggested direction:** pick one authority. Either consume `total_duration` and
the statistics endpoint, or formally deprecate the field. Do not keep both.

### 2.3 The `uncategorized` state cannot exist

Two breakdown widgets carry a fallback for entries with no project:

```ts
const key   = project?.title ?? ts.get.timeTracking.uncategorized;
const color = project?.categories?.[0]?.color ?? '#9ca3af';
```

`DashboardView.svelte:32-33`, `dashboard/widgets/TimeTrackingWidget.svelte:31`.
But the create contract requires `project_id`, and the timer requires a project,
so a project-less entry should be impossible. Either the fallback is dead code
(remove it and simplify) or there is a real server-returned case the client
should handle deliberately (a proper "unassigned" bucket with UX). Right now it
is quietly carrying a hard-coded grey.

### 2.4 `has_exact_times` cannot be edited

The flag is:
- **sent** on create (`EntryCreate.svelte:63,89`, `CreateTimeTrackingEntryRequest.has_exact_times`),
- **read** for display (`Entry.svelte:49-54`),
- but **absent** from `UpdateTimeTrackingEntryRequest` (`types/time_tracking.ts:62-68`).

`EntryEdit` therefore never sends it (`EntryEdit.svelte:68-77`). Editing an
entry to add exact start/stop times updates `started_at`/`stopped_at` but leaves
`has_exact_times` at its old value, so the UI may keep showing (or hiding) the
time range incorrectly after an edit. The domain concept ("do we have real clock
times or just a duration?") leaks into the UI without a way to keep it correct.

### 2.5 Backdating is misleading (`buildTimestamps`)

```ts
// EntryCreate.svelte:65-76
const now  = new Date();
const end  = new Date(`${date}T${now.getHours()}:${now.getMinutes()}:00`);
const start = new Date(end.getTime() - durationMinutes * 60000);
return { started_at: start.toISOString(), stopped_at: end.toISOString() };
```

The **calendar day** comes from the user's `date`, but the **time of day** is
always *the moment the entry is created*. So:

- A duration-only entry added for a past day is stamped with today's wall-clock
  time on that past day — an arbitrary-looking start/stop that the user never
  chose and cannot see (the entry renders as a bare duration unless
  `has_exact_times` is set, `Entry.svelte:49-54`).
- If the duration exceeds the current time-of-day, `start` rolls into the
  **previous calendar day**, so an entry "for 2026-10-01" can silently begin on
  2026-09-30. The date grouping (`[id]/+page.svelte:58-70`,
  `GroupedEntries.svelte:18-30`) then places it under the wrong day.
- The visible `date` field stays on screen even when the exact-times section is
  expanded (`EntryCreate.svelte:130-139` vs. `:149-164`), where it is ignored —
  the user can change it with no effect.

**Suggested direction:** for duration-only entries, anchor at a defined
time (e.g. local midnight, or noon, or the user's chosen time) and compute the
day from that anchor, not from "now". Hide the date field when exact times are in
use, or make the two inputs one coherent control.

### 2.6 Category colour is overloaded as the project colour

A project has **many** categories, each with a colour, but the breakdowns colour
the project by its **first** category:

```ts
const color = project?.categories?.[0]?.color ?? '#9ca3af';
// DashboardView.svelte:33, TimeTrackingWidget.svelte:31
```

If a project's first category changes, the project's chart colour changes. If a
project has several categories, the other colours vanish. The statistics endpoint
does return a per-project `color` (`TimeTrackingStatisticsEntry.color`,
`types/time_tracking.ts:75-80`) which `StatisticsView:47` uses — so the donut and
the breakdowns can disagree about a project's colour. A project needs its own
identity/colour, separate from its category tags.

### 2.7 What the model makes easy vs. awkward

**Easy / natural:** start a timer against a project in one click; add a manual
duration; tag projects with reusable categories; view date-grouped history.

**Awkward:** there is no way to record "I worked on X" without first creating a
project; categories are mandatory to get a coloured chart (else grey); the
project's own total is recomputed rather than trusted; and "when did this happen"
cannot be expressed honestly without discovering the hidden "started at / stopped
at" disclosure.

---

## 3. Create / edit / manage flows (CRUD friction)

### 3.1 `ProjectCreate` doubles as edit (acceptable, with rough edges)

One modal handles create and edit via `projectId`
(`ProjectCreate.svelte:13-18`), titles itself from `existingProject`
(`:69`), and pre-fills fields. Good.

Rough edges:
- Empty title silently no-ops: `if (!title.trim()) return;` (`:44-45`) — no
  message, the Save button appears to do nothing.
- Category selection is a `+` that opens a dropdown of remaining categories
  (`:106-133`); removing a category is an unlabelled `×` (`:98-103`). Both use
  the generic dashed-border style rather than a shared control.
- Colours are hard-coded in two places: chips fall back to `#888` (`:95`) and
  the dropdown dots render only `{#if cat.color}` (`:121-126`), so a category
  without a colour shows no dot at all.

### 3.2 `EntryCreate` vs. `EntryEdit`: ~90% duplicate, and they disagree

The two files share the same structure: project `Select`, description
`TextInput`, duration amount + unit, an exact-times disclosure with two
`DateTimeInput`s, and a save button. But:

| Aspect | `EntryCreate` | `EntryEdit` |
|---|---|---|
| Date field | present (`:130-139`) | absent |
| Default project | first project (`:33`) | entry's project, else first (`:31`) |
| Exact-times initial state | collapsed (`:30`) | collapsed **even if `entry.has_exact_times`** (`:32`) |
| Sends `has_exact_times` | yes (`:89`) | no (field absent from update type) |
| Exact timestamps sent as | raw `datetime-local` value (`:67`) | `new Date(...).toISOString()` (`:75-76`) |
| `started_at` init | empty | `entry.started_at.slice(0,16)` (`:33`) |

Two concrete bugs fall out of this:

1. **Timezone handling differs.** `EntryCreate` sends the raw `datetime-local`
   string (`"2026-10-01T09:00"`, no zone), while `EntryEdit` converts via
   `toISOString()` (UTC). The same times entered in create and edit produce
   different instants. Worse, `EntryEdit` initialises the control from
   `entry.started_at.slice(0,16)` — an ISO/UTC string — and feeds it to a
   `datetime-local` input, which interprets it as *local* time, so an existing
   entry's times shift by the UTC offset the moment the disclosure is opened.
2. **Editing the date is impossible** without expanding the exact-times
   disclosure (there is no date field), even though the entry has a date.

`EntryCreate` also `$derived`s `hasExactTimes = showExactTimes && !!(startedAt && stoppedAt)`
(`:63`) but only sends it on create; and the disclosure can be open with only one
timestamp filled, in which case `hasExactTimes` is false and `buildTimestamps`
falls back to "now" (`:65-76`) while the half-filled inputs remain on screen.

### 3.3 Silent validation

Both entry forms share the same silent guard:

```ts
if (!projectId || durationMinutes <= 0) return;   // EntryCreate.svelte:79; EntryEdit.svelte:64
```

No error, no disabled-button feedback. A user who types a duration but hasn't
picked a project (or types 0) clicks Save and nothing happens. `TextButton` is
always enabled (`EntryCreate.svelte:166`). This is a recurring source of
"the app feels unresponsive".

### 3.4 Default-to-first-project

Three components silently default the project to `tt.projects[0]`:

- `TimerWidget.svelte:14`
- `EntryCreate.svelte:33`
- `EntryEdit.svelte:31` (fallback only)

The project order is `tt.projects` as returned by the API; there is no "most
recent" or alphabetic guarantee. So a manual entry or a timer can be silently
booked against whichever project happens to be first — a data-integrity risk
that is easy to miss because the chosen project is shown but not obvious.

### 3.5 Delete inconsistency

| Thing | Confirmation | Location |
|---|---|---|
| Project (detail page) | `ConfirmationModal` (`[id]/+page.svelte:90-100`) | explicit |
| Project (sidebar) | **none** (`TimeTrackingNavigation.svelte:229-238`) | immediate |
| Category | **none** (`:306-311`) | immediate |
| Entry | **none** (`Entry.svelte:64-66`) | immediate |

The project case is the starkest: deleting from the detail page asks and removes
associated entries (`deletion_description`, `i18n/en.ts:1109-1110`), but the same
destructive call from the sidebar is one click with no prompt and no undo. Entry
and category deletes have no undo anywhere.

### 3.6 Editing availability

- Entries are editable **only** from the Entries tab, via `GroupedEntries` →
  `Entry showEdit` (`GroupedEntries.svelte:50-56`).
- The dashboard's "Recent Entries" are read-only (`DashboardView.svelte:91-93`).
- The project detail page shows entries with delete but **not** edit
  (`[id]/+page.svelte:179`, `Entry showDelete` only).

So a user who spots a mistake while looking at a project's history must navigate
to the Entries tab to fix it — the surface that shows the entry doesn't let you
edit it.

---

## 4. Timer, dashboard & statistics

### 4.1 Timer

- `TimerWidget` shows `ActiveTimer` when `tt.activeTimer` is set, otherwise a
  project `Select`, a description input, and a Start button
  (`TimerWidget.svelte:34-56`). The mutual exclusivity is correct and readable.
- `ActiveTimer` derives elapsed from `started_at` each tick
  (`ActiveTimer.svelte:15-28`) and destroys its interval (`:31-33`) — sound.
- The start form resets `timerDescription` after a start (`TimerWidget.svelte:29`),
  but does **not** reset/re-select the project, which is fine for repeat starts.

Honest state: yes — one timer, derived from entries, not a separate flag. The one
gap is that `startTimer` (`TimeTracking.svelte.ts:132-136`) has no client guard
against starting a second timer; it relies on the UI not offering Start when a
timer is active. Acceptable, but a defensive check would be cheap.

### 4.2 Pomodoro is a fourth, unintegrated timer

`PomodoroWidget` is a fully client-side interval timer (25/5/15 min, beep,
session dots: `PomodoroWidget.svelte:13-16,61-76,100-121`). It:

- creates **no** time entry and links to **no** project (`:1-126` — it only
  imports `getTranslation`),
- is not persisted (reload loses it; `onDestroy` just clears the interval,
  `:123-125`),
- duplicates the concept of "a timer" beside the real one, with a *different*
  visual language (teal/amber, own buttons) than `ActiveTimer` (primary-coloured).

For a feature whose purpose is "track time spent on projects", a prominent timer
that records nothing is actively confusing — it competes with the real timer in
the same grid (`DashboardView.svelte:69-75`). Either wire it to create/link an
entry (and share the timer UI), or demote it out of the time-tracking dashboard.

### 4.3 Dashboard composition mixes concerns

`DashboardView` is a single column that stacks (`DashboardView.svelte:68-97`):

1. a 4-up grid of Timer, Pomodoro, Today-breakdown, This-Week-breakdown,
2. recent entries (read-only),
3. the full `StatisticsView`.

So the "Dashboard" contains a full analytics panel, and the standalone stats
surface doesn't exist as its own tab. `StatisticsView` also fires its own API
call on mount (`StatisticsView.svelte:70-72`), so merely opening the dashboard
triggers a statistics request.

The layout also has a class bug: the breakdown widgets declare
`lg:col-span-1` (`TimeBreakdownWidget.svelte:18`) in a grid that is
`md:grid-cols-2 lg:grid-cols-4` (`DashboardView.svelte:69`); the Timer and
Pomodoro wrappers also say `lg:col-span-1` (`:70,73`). Everything claims one
column, which happens to work for exactly four items but is fragile if the set
changes.

### 4.4 Breakdowns duplicate logic and colour arbitrarily

`DashboardView.groupByProject` (`:26-41`) and
`TimeTrackingWidget.groupByProject` (`:24-39`) are the same function, including
the `#9ca3af` fallback and the first-category colour rule. `TimeBreakdownWidget`
just renders whatever list it is given (`TimeBreakdownWidget.svelte:29-51`).
Grouping happens by **project title**, so two projects with the same title merge.

### 4.5 Statistics

- Embedded, not a tab (see 4.3).
- Date range uses two raw `<input type="date">`s with bespoke classes
  (`StatisticsView.svelte:89-103`) rather than a shared date control; defaults are
  computed from `toISOString()` (`:15-19`), i.e. UTC, so users east/west of UTC
  can get a one-day-off default range.
- The **category filter filters *projects*** by whether any of their categories
  match (`:30-37`) and then recomputes both the donut and the category bar chart
  from the filtered set (`:43-63`). Its label says "Filter by Category" but the
  effect is "restrict to projects tagged with these categories" — defensible, but
  it silently drops projects that have the category plus others' time.
- The `DoughnutChart` uses the server's per-project `color` (`:47`) while the
  breakdown widgets use first-category colour (see 2.6), so colours are not
  consistent across the page.
- Category bar values are converted to hours with one decimal
  (`:67`, `Math.round((c.minutes / 60) * 10) / 10`) while everything else is
  `h m` text — a units inconsistency inside one view.
- `loadStatistics` interpolates `from`/`to` directly into a query string
  (`TimeTracking.svelte.ts:147-152`) without encoding; harmless for date-only
  values but worth noting.

### 4.6 Dashboard shell widget

`dashboard/widgets/TimeTrackingWidget.svelte` is a *separate* week-breakdown
widget used on the home dashboard (`QuickGlance.svelte:14`). It re-implements the
same grouping, colour fallback and totals as `DashboardView` (`:24-52`) and calls
`tt.load()` itself (`:54-59`), so the store can be loaded twice. This is a
textbook DRY violation and a maintenance hazard: fixing a rule in one place
misses the other.

---

## 5. Visual & interaction consistency, accessibility, i18n

### 5.1 Shared controls vs. hand-rolled inputs

The feature is inconsistent about using its own design system:

| Control | Uses shared component? | Evidence |
|---|---|---|
| Project title/description | ✅ `TextInput` | `ProjectCreate.svelte:79,85` |
| Entry description | ✅ `TextInput` | `EntryCreate.svelte:112`, `EntryEdit.svelte:98` |
| Project selector | ✅ `Select` | `EntryCreate.svelte:106`, `TimerWidget.svelte:42` |
| Duration amount | ❌ raw `<input type="number">` | `EntryCreate.svelte:119-126`, `EntryEdit.svelte:105-111` |
| Date | ❌ raw `<input type="date">` | `EntryCreate.svelte:134-138`, `StatisticsView.svelte:89-103` |
| Timer description | ❌ raw `<input type="text">` | `TimerWidget.svelte:43-48` |
| Category inline rename | ❌ raw `<input type="text">` | `TimeTrackingNavigation.svelte:290-296` |

The raw inputs copy the shared classes by hand. Today they happen to match
`TextInput.svelte:30` (`EntryCreate.svelte:125` uses the same
`focus:ring-d-lightblue` / `dark:focus:ring-c-primary` recipe, as does
`TimerWidget`'s input at `:47`), but nothing keeps them in sync, so the
duplication is a latent drift risk. There is no shared `NumberInput`/`DateInput`,
so adding one (or reusing `TextInput` with a `type`) would remove the duplication.

### 5.2 Hard-coded colours

Colour literals are scattered and fall back differently per component:

- `#1dbda5` (brand teal) is the category fallback in the nav
  (`TimeTrackingNavigation.svelte:61,84,130`) and in the statistics filter
  (`StatisticsView.svelte:134,139`).
- `#888` is the fallback in `ProjectCreate.svelte:95` and on the detail page
  category chips (`[id]/+page.svelte:129`).
- `#9ca3af` is the breakdown fallback (`DashboardView.svelte:33`,
  `TimeTrackingWidget.svelte:31`).

Three different "unknown colour" greys/teals for the same concept. The codebase
already exposes theming via CSS variables (`--color-c-primary`, etc.), so these
should be variables, not literals.

### 5.3 Hover-only and touch-hostile affordances

- Project edit/delete hidden until hover (`TimeTrackingNavigation.svelte:216`).
  On touch there is no hover, so these only appear after a tap that also
  navigates. This is the clearest "not natural on mobile" finding.
- Category rename requires double-click (`:300`) — not discoverable, not
  available via keyboard, and awkward on touch (double-tap also zooms).
- `InlineEditButton`/`InlineDeleteButton` reveal their actual clickable button
  only on `group-hover` (`InlineEditButton.svelte:13`,
  `InlineDeleteButton.svelte:12-13`); they render an inert icon underneath, so
  the visible icon is not the button. That is both an a11y and a hit-target
  problem where they're used (entry rows, project header).

### 5.4 Accessibility

- **Double-click to rename a category** (`TimeTrackingNavigation.svelte:300`) is
  a keyboard and screen-reader dead end; nothing signals the action.
- **Icon-only buttons without accessible names**: project add (`:189-197`),
  project edit/delete (`:218-238`), category add (`:249-258`), category delete
  (`:306-311`), and the `Inline*` buttons carry only SVG icons — no `aria-label`
  or visible text.
- **Colour contrast**: category chips render `text-xs text-white` on whatever
  `cat.color` is (`[id]/+page.svelte:127-131`, `ProjectCreate.svelte:93-96`).
  A light category colour gives white-on-light text with no contrast guard; the
  statistics filter pills have the same issue (`StatisticsView.svelte:129-142`).
- **Form labelling**: the entry/project fields use plain `<span>` labels, not
  `<label for>`; none of the inputs are programmatically associated
  (`EntryCreate.svelte:102-139`, `ProjectCreate.svelte:75-86`).
- The mobile drawer's `display` toggling (1.3) gives no focus trap/restore, so
  keyboard focus can move behind the open drawer.

### 5.5 i18n

All four locales define the same key set and are in sync (verified for
`timeTracking`: identical keys across `en.ts`, `de.ts`, `es.ts`, `fr.ts`) — good.

However six `timeTracking` keys are **defined but never referenced** anywhere in
`src/` (excluding the i18n tables):

| Key | `en.ts` line | Notes |
|---|---|---|
| `add_category` | 1078 | UI uses an icon-only `+` instead |
| `edit_category` | 1079 | rename is double-click, no label |
| `color` | 1082 | colour picker is unlabelled |
| `duration_minutes` | 1086 | duration uses a number + unit select |
| `category` | 1088 | singular; only `categories` is used |
| `this_month` | 1107 | dashboard shows Today/This Week only |

Additionally, `dev.features.timeTracking` tips (`timer_tip`, `projects_tip`,
`pomodoro_tip`, `en.ts:1062-1064`) are not consumed by any component: the
welcome tour reads tips from `welcome_tour.steps`, not `dev.features`
(`WelcomeTour.svelte:73-78`), and `OnboardingModalStepFeatures` uses
`welcome_tour` keys (`OnboardingModalStepFeatures.svelte:22-35`). So the
Pomodoro tip in particular documents a feature users are never told about — and
the whole `dev.features.timeTracking` block is orphaned. These are dead strings
that still cost translation effort; the unused ones should be removed (or wired
up).

### 5.6 Heading/spacing conventions

`DashboardView` uses `Heading` for "Recent Entries" (`:90`) but the statistics
heading is inside `StatisticsView` (`:83`); section titles elsewhere are bare
`<span>`s (`TimeBreakdownWidget.svelte:19`, `Projects`/`Categories` in the nav
`:186,246`). Heading levels are therefore inconsistent across one page. Spacing
is also ad-hoc (`gap-8` outer, `gap-4` grid, `gap-6`/`gap-3` sections mixed), so
the vertical rhythm varies between the dashboard and the project detail page.

---

## 6. Prioritised follow-up recommendations

Ranked by impact/effort. Each is a candidate for a separate implementation job;
none is in scope here.

| # | Recommendation | Impact | Effort | Files |
|---|---|---|---|---|
| 1 | **Make view state URL-driven.** Move Dashboard/Entries (and ideally the project selection) into the route or a `?tab=` param; derive `activeTab` from `page.url` so reload/deep-link/back work. | High | M | `TimeTrackingNavigation.svelte`, `+page.svelte`, `TimeTracking.svelte.ts`, `urls.ts` |
| 2 | **Unify `EntryCreate`/`EntryEdit` into one component** that takes an optional `entry`; fix the timestamp/timezone mismatch (always send ISO) and add a real date control. | High | M | `EntryCreate.svelte`, `EntryEdit.svelte`, `GroupedEntries.svelte`, `+page.svelte`, `[id]/+page.svelte` |
| 3 | **Fix backdating semantics** in `buildTimestamps` (defined anchor, correct day, hide the date field when exact times are used). | High | S | `EntryCreate.svelte` |
| 4 | **Single source of truth for durations/colours**: consume `project.total_duration`/statistics, give projects their own colour, delete the duplicated `groupByProject` and the `#9ca3af`/`#888`/`#1dbda5` literals. | High | M | `TimeTracking.svelte.ts`, `DashboardView.svelte`, `TimeTrackingWidget.svelte`, `TimeBreakdownWidget.svelte`, `StatisticsView.svelte`, `types/time_tracking.ts` |
| 5 | **Give Pomodoro a purpose or a home**: either link it to an entry/timer with shared UI, or move it out of the time-tracking dashboard. | Medium | M | `PomodoroWidget.svelte`, `DashboardView.svelte` |
| 6 | **Confirm-or-undo for destructive actions.** Route all project deletes through `ConfirmationModal`; add undo for entry/category deletes. | Medium | S | `TimeTrackingNavigation.svelte`, `Entry.svelte` |
| 7 | **Surface entry editing where entries are shown** (dashboard recent entries, project detail). | Medium | S | `DashboardView.svelte`, `[id]/+page.svelte`, `Entry.svelte` |
| 8 | **Replace the sidebar's `display` toggle with the app's `open`-state + transition drawer pattern** used by todos/notes. | Medium | S | `TimeTrackingNavigation.svelte` |
| 9 | **Make category management discoverable and accessible**: replace double-click-to-rename with an explicit affordance, add `aria-label`s to icon buttons, guard category-chip contrast, avoid hover-only project controls. | Medium | M | `TimeTrackingNavigation.svelte`, `ProjectCreate.svelte`, `Entry.svelte`, `[id]/+page.svelte`, `InlineEdit/DeleteButton.svelte` |
| 10 | **Add explicit form validation feedback** instead of silent `return` on invalid save (disable Save or show a message). | Medium | S | `EntryCreate.svelte`, `EntryEdit.svelte`, `ProjectCreate.svelte` |
| 11 | **Reuse shared form controls** for number/date/timer inputs (or add a `NumberInput`/`DateInput`), removing hand-copied classes. | Low | S | `EntryCreate.svelte`, `EntryEdit.svelte`, `TimerWidget.svelte`, `StatisticsView.svelte` |
| 12 | **Handle or delete the `uncategorized` path** and the un-editable `has_exact_times` flag so the UI matches the contract. | Low | S | `DashboardView.svelte`, `TimeTrackingWidget.svelte`, `types/time_tracking.ts`, `EntryEdit.svelte` |
| 13 | **Remove (or wire up) dead i18n keys** `add_category`, `edit_category`, `color`, `duration_minutes`, `category`, `this_month`, and the orphaned `dev.features.timeTracking` tips, across all four locales. | Low | S | `i18n/{en,de,es,fr}.ts` |
| 14 | **Fix UTC-based default dates** (`new Date().toISOString()`) in entry and statistics defaults to local time. | Low | S | `EntryCreate.svelte`, `StatisticsView.svelte` |
| 15 | **Normalise heading/spacing** in the dashboard and detail page via the shared `Heading` component. | Low | S | `DashboardView.svelte`, `StatisticsView.svelte`, `TimeBreakdownWidget.svelte` |

Suggested sequencing: 1–4 together form the "make the foundations coherent" pass
and unlock most of the rest; 5–10 are the "natural-feeling interactions" pass;
11–15 are polish.

---

## 7. Conclusion

Time Tracking is not a bad feature with broken plumbing — it is a good domain
model wrapped in a UI that hides its model, duplicates it, and drives view state
outside the URL. The clearest wins are structural and cheap to state: put the
view in the URL, unify create/edit, trust the API's own totals and colours, make
category management visible, and stop the Pomodoro timer from competing with the
real one. The store/contract layer and the running-timer widget are solid
foundations to build on.

**Scope note:** per the brief, this is an assessment only — **no source files
were changed**. All recommendations are candidates for follow-up implementation
jobs.
