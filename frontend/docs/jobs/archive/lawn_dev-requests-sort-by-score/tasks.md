# Tasks: dev requests: sort by score

id: lawn
analyst: analyst
date: 2026-10-29

## Context

- Dev requests are sorted client-side in `DevRequests.sort()`
  (`src/lib/state/DevRequests.svelte.ts`, l. 48–58). That runs in `load()`,
  and `load()` runs again after every create/update/vote, so a new sort
  order also applies right after a vote.
- Current order: non-completed first, cancelled after the rest, then
  `priority` descending (`null` counts as 0).
- `DevRequest.score: number` already exists in `src/lib/types/dev_request.ts`
  (the API sends it, and `Score.svelte` shows it). No API or type change is needed.
- `DevRequests.svelte` (component) splits entries into "current"
  (not completed/cancelled) and "resolved" lists by filtering
  `devRequests.entries`, so it keeps whatever order the store produces.
  No component change is needed.
- `docs/STANDARDS.md` 15.8: sorting is pure logic and belongs in a
  `*Service.ts` with unit tests. Today the sort lives inline in the store,
  which is an existing violation (not in `docs/backlog/`). Changing that
  comparator without moving it out would add to the violation, so TASK-1
  moves it into a service, following the `TodoSortingService` pattern.

## Assumptions (scope is not fully specified in the brief)

1. **Score replaces priority as the main sort key** inside each status
   group (sorted descending, so the highest score comes first). The
   completed/cancelled grouping stays as it is.
2. **Priority becomes the tie-breaker** when scores are equal (descending,
   `null` = 0), so priority is not lost completely. If the owner wants
   score only, drop the tie-breaker. That is a one-line change.
3. **No UI toggle.** The brief asks for a fixed order, not a user-selectable
   sort like the todos `SortByScore` action. A toggle would need new UI,
   new i18n strings and maybe a stored preference, so it is out of scope
   unless asked for.

If any of these is wrong, the reviewer or owner should say so before
TASK-2 lands.

## Task breakdown

TASK-1: Add a pure `DevRequestSortingService` with a `sort(requests: DevRequest[]): DevRequest[]` method that returns a new array, keeping the current status grouping and ordering by `score` descending, then `priority` descending (null = 0).
  files: src/lib/services/DevRequestSortingService.ts (new)
  depends: none
  risk: low — a new pure function that nothing calls yet; it follows the existing `TodoSortingService` shape (default-exported class, `[...arr].sort`).

TASK-2: Add Vitest unit tests for `DevRequestSortingService.sort`: score descending, priority as the tie-breaker (including null priority), completed and cancelled entries sorted after open ones, and the input array not mutated.
  files: tests/unit/services/DevRequestSortingService.test.ts (new)
  depends: TASK-1
  risk: low — node-only test of a pure function, same setup as `tests/unit/services/TodoSortingService.test.ts`.

TASK-3: Replace the inline comparator in `DevRequests.sort()` with a call to the new service (`this.entries = new DevRequestSortingService().sort(this.entries)`, or the service held as a field, whichever matches how other stores use their services).
  files: src/lib/state/DevRequests.svelte.ts
  depends: TASK-1
  risk: low — the method is only called from `load()`; switching from an in-place sort to assigning a new array is fine for a `$state` array and does not change behaviour for the components.

## Not needed

- No i18n changes (no new visible strings).
- No change to `src/lib/types/dev_request.ts`, `apiRoutes.ts`, or any
  dev-requests component.
