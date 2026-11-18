## Summary

Admins get a filter row above the dev request list (All / Backlog / Open / In progress / Waiting for deployment, each with a count). Filtering is client-side on `devRequests.entries`, not remembered, and resets to "All" when a `/dev-requests/<id>` link is opened. The edit modal's selects now go priority, status (+ fixed in version), type.

## Changes

TASK-1: New `src/lib/services/DevRequestFilterService.ts` (pure, keeps input order; "open" = backlog + pending) and the `DevRequestFilter` type in `src/lib/types/dev_request.ts`. Tests in `tests/unit/services/DevRequestFilterService.test.ts` cover "open", the single-status filters, completed/cancelled exclusion, order, and counts matching the filtered lists.
TASK-2: `dev.requests.filter_all` / `filter_open` added to `src/lib/types/translation.ts` and all six locales (`en, de, es, fr, it, ru`).
TASK-3: `src/routes/dev-requests/[[id]]/+page.svelte` — `SegmentedControl` shown only when `auth.isAdmin()`. Labels and counts are built in `filterOptions()` from `devRequests.entries`, so they update after a status edit reloads the store. With a filter other than "All" active, the resolved section is hidden. `afterNavigate` resets the filter to "All" when the URL has an id. "All" shows the total count of all requests (open + resolved), which is how I read "each with a count".
TASK-4: `src/lib/components/dev-requests/DevRequestEdit.svelte` — the selects now go priority, status + fixed-in-version (edit only), type. Create shows priority, type.
TASK-5: `npm run check` (0 errors/warnings), `npm run lint` and `npm test` (1558 tests) all pass.

## Known issues / follow-ups

- No translator sub-agent was available in this session, so I wrote the non-English labels (`de` Alle/Offen, `es` Todas/Abiertas, `fr` Toutes/Ouvertes, `it` Tutte/Aperte, `ru` Все/Открытые) myself, following `docs/I18N.md`. The feminine/plural forms agree with "requests" in each language. Please have someone review them.
- I did not render the page in a browser because no API backend was available. The brief's manual checks (admin vs. non-admin view, a status change moving an entry out of "Open") are still open.
