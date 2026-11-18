# Tasks: status filters on the dev request list for admins

Branch verified: `feature/leather_status-filters-on-the-dev-request-list-for-admins`.

## Findings that shape the plan

- `devRequests.entries` is already sorted by `DevRequestSortingService` on every
  `load()`, and `update()` reloads. So a pure filter that keeps input order keeps
  the sort, and counts computed from `entries` update after a status edit with
  no extra wiring.
- A shared control already exists: `src/lib/components/forms/SegmentedControl.svelte`
  (`bind:value`, `options: { label, value }[]`, `aria-pressed`, selected =
  `bg-c-btn`). Use it (STANDARDS 7.1); the counts go into the label
  ("Backlog (14)"). No new UI component.
- Route is optional-param `[[id]]`, so going from `/dev-requests` to
  `/dev-requests/<id>` keeps the page component (and its filter state) alive.
  The reset must hook navigation: `afterNavigate` from `$app/navigation`, as in
  `src/routes/todos/+page.svelte:41`. Not `$effect` (STANDARDS 5.1).
- There are **six** locales: `en, de, es, fr, it, ru` (`ru.ts` puts several dev
  keys on one line, e.g. `:659`).
- Existing tests to mirror: `tests/unit/services/DevRequestSortingService.test.ts`.

---

## TASK-1: Add a pure `DevRequestFilterService` with unit tests

Add a service that, given entries and a filter (`all | backlog | open |
in-progress | waiting-for-deployment`), returns the matching entries in their
original order, with "open" = `backlog` + `pending`, and tests for it.

- Files:
  - `src/lib/services/DevRequestFilterService.ts` (new; same class style as
    `DevRequestSortingService.ts`)
  - `src/lib/types/dev_request.ts` (add a `DevRequestFilter` union type)
  - `tests/unit/services/DevRequestFilterService.test.ts` (new)
- Tests (per brief): "open" includes backlog and pending and nothing else;
  each filter excludes completed/cancelled; "all" returns everything;
  input order is preserved; count for a filter equals the length of its
  filtered list.
- Dependencies: none
- Risk: low — pure function, no UI, covered by its own tests.

## TASK-2: Add the "All" and "Open" filter labels (en + type)

Add two keys under `dev.requests` (e.g. `filter_all`, `filter_open`) to
`DevRecords` in the translation type and to `en.ts`; hand `de, es, fr, it, ru`
to the `translator` agent per `docs/I18N.md`.

- Files:
  - `src/lib/types/translation.ts` (the `requests` block near `:776-793`)
  - `src/lib/i18n/en.ts` (`dev.requests`, near `:793-815`)
  - `src/lib/i18n/{de,es,fr,it,ru}.ts` (via translator, not by hand)
- Status labels are reused from `status_backlog`, `status_in_progress`,
  `status_waiting_for_deployment`; no new keys for them.
- Dependencies: none
- Risk: low — additive keys; `npm run check` catches a missing locale.

## TASK-3: Admin filter row on the dev request list

In the list page, show a `SegmentedControl` with All / Backlog / Open /
In progress / Waiting for deployment (each label with its count) for admins
only, filter the current list through TASK-1, hide the resolved section when
the filter isn't "All", and reset to "All" on navigation to a request id.

- Files: `src/routes/dev-requests/[[id]]/+page.svelte`
- Details:
  - `const auth = getAuth(); const isAdmin = auth.isAdmin();` as in
    `DevRequestEntry.svelte:22-25`. Non-admins: no control, markup otherwise
    unchanged.
  - `let filter = $state<DevRequestFilter>('all')` — plain state, not
    persisted (no `LocalStorageService`).
  - Current list (`:39`): when `filter === 'all'`, unchanged behaviour
    (everything not completed/cancelled); otherwise the TASK-1 result.
  - Counts: computed from `devRequests.entries` via the same service, so they
    follow store reloads. Build the options in a small function called from
    markup rather than a long inline expression (STANDARDS 1.1); avoid adding
    `$derived` unless strictly needed (project rule). Brief doesn't specify a
    count for "All"; showing one is consistent with "each with a count", so
    use the total of all entries — **developer: confirm this reading or
    leave "All" without a count only if the brief owner says so**.
  - Hide `Divider`, the "Resolved Requests" heading and the resolved list
    (`:43-51`) when `filter !== 'all'`.
  - `afterNavigate(() => { if (page.params.id) filter = 'all'; })` so a
    linked request is never filtered out (covers both first load and in-page
    navigation between ids).
  - Placement: above the current list, inside the header/list area; keep copy
    minimal (no heading or helper text for the filter).
- Dependencies: TASK-1, TASK-2
- Risk: medium — touches the page layout and navigation behaviour; the
  `[[id]]` component reuse makes the reset easy to get subtly wrong.

## TASK-4: Reorder selects in the edit modal

Change the select order in `DevRequestEdit.svelte` (`:116-122`) to priority,
status (with "fixed in version" directly below it, as now), type; on create
(no `entry`) the order is priority, type.

- Files: `src/lib/components/dev-requests/DevRequestEdit.svelte`
- Implementation note: priority first; then `{#if entry}` status +
  fixed-in-version `{/if}`; then type; then the existing create-only
  `FileUpload` + URL block. That likely means splitting the current
  `{#if entry}…{:else}…{/if}` into two blocks around the type select.
- Dependencies: none
- Risk: low — markup reorder only, no logic change.

## TASK-5: Verify

Run `npm run check`, `npm run lint`, `npm test`; then walk the brief's check
list (admin "Open (n)" = backlog + pending and completed section hidden;
status change to in progress moves the entry out of "Open" and updates both
counts; non-admin page unchanged; `/dev-requests/<id>` lands on "All"; edit
modal shows priority, status, type).

- Files: none (verification only)
- Dependencies: TASK-1, TASK-2, TASK-3, TASK-4
- Risk: low — read/run only.

## Open points

- "All" button count: brief says "each with a count" but its example only
  shows a status filter. Plan assumes "All (total)". Low impact either way.
