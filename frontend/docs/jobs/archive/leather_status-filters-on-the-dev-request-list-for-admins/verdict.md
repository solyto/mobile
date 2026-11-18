# Verdict: status filters on the dev request list for admins

id: leather
reviewer: reviewer
date: 2026-11-17

## Review

Reviewed `git diff main...HEAD`. Every change in it is listed in implementation.md. `npm run check` (0 errors/warnings), `npm run lint` and `npm test` (1558 passed) all pass.

TASK-1: PASS
notes: `DevRequestFilterService.filter()` is pure and keeps input order. "open" = backlog + pending, and "all" returns the input unchanged. The new `DevRequestFilter` type is in `types/dev_request.ts`. The tests cover everything the brief asks for: "open" contents, completed/cancelled exclusion, order, and counts matching the filtered lists.

TASK-2: PASS
notes: `filter_all` / `filter_open` are in the type and all six locales; the status labels are reused. The developer wrote the non-en strings by hand rather than through the translator agent (STANDARDS 8.2), and said so. I checked them against docs/I18N.md: sentence case, length, and agreement with the glossary noun for dev requests (fr demandes, es solicitudes, it richieste, ru обращения). Alle/Offen, Todas/Abiertas, Toutes/Ouvertes, Tutte/Aperte, Все/Открытые are correct, and single-word labels have no formal/informal voice to get wrong.

TASK-3: PASS
notes: `+page.svelte` shows the shared `SegmentedControl` (STANDARDS 7.1) only when `auth.isAdmin()`, so non-admins see the same markup as before. `filter` is plain `$state`, not persisted. No new `$derived`/`$effect`. Labels and counts are built in `filterOptions()` from `devRequests.entries`, so they follow store reloads after an edit. "All" keeps the old open list plus the resolved section, and every other filter hides the section. `afterNavigate` resets to "All" whenever the URL has an id. Clicking an entry only toggles it locally (`DevRequestEntry.svelte`), so the reset doesn't fire during normal filtering. "All" shows the total count, the plan's stated reading of "each with a count".

TASK-4: PASS
notes: `DevRequestEdit.svelte` now goes priority → status (+ fixed in version, edit only) → type → create-only upload/URL. On create the order is priority, type. Only the markup moved; no logic changed.

TASK-5: PASS
notes: check/lint/test re-run by the reviewer, all green. The browser checks from the brief were not run because no API was available. The code paths behind them are reviewed above.

## Security

none — client-side filtering of data the user already has; admin gating is presentational only, as before.

## Overall

APPROVED
