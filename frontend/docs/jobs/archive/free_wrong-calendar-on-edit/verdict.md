# Verdict: wrong calendar on edit

id: free
status: reviewed
reviewer: opencode (glm-5.2)
date: 2026-08-17

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

TASK-1: PASS
notes: `src/lib/components/calendars/ChooseCalendar.svelte:22-27` — `getSelected` now guards on `Number(id)` (falsy → null) and compares `Number(c.id) === normalizedId`. Case matrix verified: string `"5"` vs numeric `Calendar.id` 5 now resolves (the reported bug); numeric-vs-numeric is behaviorally identical; `0`/`""`/`null`/`undefined` all coerce falsy and keep the create-path fallback. `ChooseCalendar` has exactly one consumer (`EventEdit.svelte:206`, grep-verified), so no other call site changes behavior. Follow-ups (contacts `ChooseAddressBook`, scattered `parseInt` in views, unused `preSelect` prop) correctly left untouched per tasks.md.

TASK-2: PASS
notes: `src/lib/components/calendars/EventEdit.svelte:47-49` — form seed is now `Number(calendars.activeEvent.calendar_id)` when truthy, `0` otherwise; create mode (`activeEvent = null`) keeps the `0` fallback exactly as before. Remount-per-open verified: `CalendarView.svelte:17-19` mounts `EventEdit` under `{#if calendars.editSidebar}` and `Calendars.showSidebar` (`Calendars.svelte.ts:332-345`) calls `hideSidebar()` (→ `editSidebar = false`, unmount), `await tick()`, then sets `activeEvent` + `editSidebar = true` — so the coercion runs on every edit open, for all desktop/mobile views (all route through `showSidebar(null, item)`). The request body sends a numeric `calendar_id`, the same runtime type the create flow has always sent via the write-back of `Calendar.id`, so no new API-shape risk.

TASK-3: PASS
notes: `src/lib/components/calendars/ChooseCalendar.svelte:14-20` — `selectedCalendar` falls back to `availableCalendars[0]` only when `Number(calendar)` is falsy (create case); a present-but-unresolvable id yields `null`, rendering the existing `ts.get.calendar.choose_calendar` placeholder (key present in all four locales, en/de/es/fr), and the `$effect` write-back is guarded by `if (selectedCalendar)`. The guard also removes a pre-existing TypeError: old code did `selectedCalendar.id` unconditionally, which threw (`undefined.id`) whenever `availableCalendars` was empty during create (e.g. still loading). No reactivity loop: writing `selectedCalendar.id` back re-derives to the same calendar object. User-picks-from-menu path unchanged (`calendar = c.id` resolves).

TASK-4: PARTIAL (command results not independently re-executed here; manual UI pass not runnable in this environment)
notes: This review session's shell is restricted to git read/commit commands, so `npm run check` / `npm test` / `npm run lint` could not be re-run. Static verification supports the developer's claims: the diff touches no i18n keys, no exported signatures, and no module contracts; `tests/` covers pure helpers/services only and references none of the calendar components (grep-verified), so 366/366 green is structurally consistent. The reported lint failures are credible and pre-existing: `CalendarEvent` (EventEdit.svelte:13), `getDateDiffInDays` and `getDateDiffInMinutes` (line 24) appear only in their import statements — untouched by this diff. The manual UI pass (edit an event of a non-default calendar; create preselects the default; save keeps the calendar) was substituted with a code trace, which is justified: the SPA's every route sits behind an auth guard against the external solyto API and no backend exists in this environment (no render report exists for this job either). The trace is sound — under the old code, a *resolvable* calendar could only fail to display via a strict-`===` type mismatch, which TASK-1/TASK-2 now normalize away, and the unresolvable-id case is now explicitly handled by TASK-3. Residual: the analyst's string-vs-number payload assumption is unverifiable from this repo; whichever type the API actually sends, the comparison is now type-agnostic. The manual pass should still happen in a normal dev environment at the next convenience — non-blocking.

## Security

No new security surface. Two-line normalization change inside an existing component; no new requests, no new user input reaching the DOM (Svelte escaping unchanged), no tokens or user data logged. No findings.

## Overall

APPROVED

All three code tasks are implemented exactly as specified, scoped to the two files named in tasks.md, and verified by case-by-case inspection of the `ChooseCalendar` derived/effect interplay and the `showSidebar` → `EventEdit` remount flow. Blockers: none.

Non-blocking observations (recorded for transparency, no action required):
- Commit hygiene: the TASK-1 commit (9886f98) carries three changes unrelated to TASK-1 — the analyst's `tasks.md` content (belonging to the analyst phase), an `AGENTS.md` population (empty at main, now a verbatim copy of `docs/AGENTS.md`; tooling mount sync), and the deletion of four stale `.opencode/jobs/highlight_rename-category/*` files (duplicates of the job already archived under `docs/jobs/archive/` at main). None touch production code, all are content-correct, and none are mentioned in `implementation.md`. History rewrite is impossible under the session git shim and reverting the deletions/sync would leave the repo in a worse state, so these are flagged, not blocked.
- TASK-4 has no dedicated commit, but it specifies "files: none (no production code changes)" and its results are documented in `implementation.md`; an empty commit would violate commit discipline.
- The manual UI pass remains outstanding for a backend-equipped environment (see TASK-4 notes).
