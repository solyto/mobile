# Brief: status filters on the dev request list for admins

type: feature
id: leather
branch: feature/leather_status-filters-on-the-dev-request-list-for-admins
date: 2026-11-17
author: Leander Muskalla

## What

### 1. Filter buttons (admins only)

Above the dev request list (`src/routes/dev-requests/[[id]]/+page.svelte`),
admins get a row of filter buttons, each with a count:

- **All** (default; today's view)
- **Backlog** (`backlog`)
- **Open** (`backlog` + `pending`)
- **In progress** (`in-progress`)
- **Waiting for deployment** (`waiting-for-deployment`)

e.g. "Backlog (14)". Details:

- Admin check: `auth.isAdmin()`, as in `DevRequestEntry.svelte:25`.
  Non-admins see no buttons and no change.
- Filter client-side on `devRequests.entries`; the API already returns all
  requests (`DevRequestService::list()`), so no API change. Keep the
  existing order (`DevRequestSortingService`).
- With a filter other than "All" active, hide the completed/cancelled
  section (`:48-50`); none of the filters can match it.
- The choice isn't remembered: every visit starts at "All".
- Opening a link to a specific request (`/dev-requests/<id>`) resets the
  filter to "All", so the linked request is never filtered out.
- The counts come from the same entries as the list, so they update when a
  request's status changes in the edit modal.
- i18n: labels for "All" and "Open" in all six locales (`src/lib/i18n/`,
  type in `src/lib/types/translation.ts`); the status labels exist already
  (`ts.get.dev.requests.status_*`).

### 2. Field order in the edit modal

In `src/lib/components/dev-requests/DevRequestEdit.svelte` (`:116-121`),
the selects are in the order type, priority, status. Change it to
**priority, status (with "fixed in version" right below it, as now),
type**, the order the list entry shows them in (`DevRequestEntry.svelte`:
priority `:43`, status `:61`, type `:64`). When creating a new request
there's no status, so the order is priority, type.

## Why

With more users, the dev request list has become too long to scan quickly.
Request from the maintainer, decided 2026-11-17: filters only for admins,
the four status filters plus "All", counts on the buttons, nothing
remembered. The edit modal should match the list's order so editing doesn't
need a second look.

## Notes

- Tests: if there's a unit-testable place for the filter (e.g. a small
  helper next to `DevRequestSortingService`), test that "Open" includes
  backlog and pending, and that the counts match the filtered lists.
- Check: as an admin, "Open (n)" shows exactly the backlog and pending
  requests and hides the completed section; changing a request's status to
  in progress moves it out of "Open" and updates both counts; as a non-admin,
  the page looks as before. The edit modal shows priority, status, type.
