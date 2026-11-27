# Implementation: paginate-users

id: slowly
developer: wilfred
date: 2026-11-21

## Summary

The admin user list is paged on the server: 25 users per page, with name/email search done by the API.
The user growth chart now gets its cumulative series from the new `GET /users/growth` endpoint, because one page of users is not enough to compute it.
API contract: room decisions 01M7ZJBJN7JHYKHQYFKHG7GSZ8 and 01M7ZJK6FTE25BB483J9DZ1Z8S (solyto-api branch `feature/introduce_paginate-users`).

## Changes

TASK-1:
- `state/UserManagement.svelte.ts`: `load()` requests `page`/`per_page` (always sent, because the API falls back to a page size of 1000 for old clients) plus `search` when it is set. It reads `meta.pagination` and drops responses that a newer request has overtaken. New methods: `goToPage`, `scheduleSearch` (300 ms debounce), `clearSearch`, `loadGrowth`, `groupGrowthBy`, `destroy` (clears the search timer and is called from the admin layout's `onDestroy`). Removed `filterUsers()` (client-side search).
- `types/managed_user.ts`: `ManagedUserPagination`, `ManagedUserListMeta`, `UserGrowthGroupBy`, `UserGrowthPoint`.
- `config/apiRoutes.ts`: `admin.users.growth`.
- `components/ui/Pagination.svelte` (new): previous/next `IconButton`s and "Page {n} of {total}".
- `components/ui/buttons/IconButton.svelte`: optional `label` prop (sets `aria-label`/`title`) for the icon-only pager buttons (STANDARDS 7.2).
- `components/admin/UserList.svelte`: renders the store's current page and the pager. Search is debounced and goes to the server; the field is capped at the API's 255 characters. Also fixes the clear-search button (it toggled a local variable that was never set) and moves its three hardcoded messages to i18n.
- `components/admin/UserGrowthChart.svelte`: receives `points`/`groupBy`/`ongroupby` as props. The client-side bucketing code is removed and `formatCategory` is kept.
- `routes/admin/users/+page.svelte`: loads the list and growth in parallel and handles group changes with the loading indicator.
- i18n: `layout.previous_page`, `layout.next_page`, `layout.page_of`, `admin.no_users`, `admin.no_search_results`, `admin.loading_users` in all six locales.
- `tests/unit/stores/UserManagement.test.ts`: rewritten to cover the query parameters, meta assignment, failed requests, overtaken responses, debounced/cleared search, `destroy`, growth and role updates.
- `tests/components/pagination.test.ts` (new): page label, previous/next callbacks, disabled bounds.

## Known issues / follow-ups

- Verification: `npm test` passes except `tests/unit/scripts/licenses.test.ts`, which expects `@lucide/svelte` in the dependencies. That failure predates this branch: neither `package.json` nor the test was changed. The full `npm run check` and `npm run lint` get killed for lack of memory in this container (about 7 GB). Instead, ESLint passed on every changed file, and `svelte-check` passed on a tsconfig limited to the changed files. That limited run only reports `WidgetBridge.ts` errors, which come from the cut-down config, not from this change. Run the full `npm run check` and `npm run lint` on a machine with more memory before merging.
- Non-English strings were drafted by the developer and reviewed by the translator agent (archibald) against `docs/I18N.md`. He refined two `ru` strings (`admin.loading_users`, `admin.no_search_results`) and left the other locales unchanged.
- Pre-existing hardcoded English in the admin users area was left untouched: the chart's "User Growth" and "By Year/Month/Week/Day", the page heading, and the role labels in `UserEntry`.
- The growth periods are now UTC (computed by the server). Before, they used the browser's local time.
