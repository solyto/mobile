# Implementation: dev requests: sort by score

id: lawn
developer: developer
date: 2026-10-29

## Summary

Dev requests are now sorted by score (highest first) within each status group. Open requests come first, then cancelled, then completed, as before. When two requests have the same score, the one with the higher priority comes first (`null` counts as 0). The comparator moved out of the store into a pure, unit-tested `DevRequestSortingService`, following `TodoSortingService` and STANDARDS 15.8.

## Changes

TASK-1: New `src/lib/services/DevRequestSortingService.ts`. It is a default-exported class with `sort(requests)`, which returns a new sorted array. A status rank (open 0, cancelled 1, completed 2) replaces the old pairwise status checks and gives the same group order. Within a group it sorts by `score` descending, then `priority` descending.
TASK-2: New `tests/unit/services/DevRequestSortingService.test.ts`. It covers score order, priority as the tie-breaker, null priority, status grouping beating score, score order inside the cancelled and completed groups, and that the input is not mutated.
TASK-3: `src/lib/state/DevRequests.svelte.ts`. The store holds a `sortingService` field (same pattern as `Todos.svelte.ts`). `sort()` now assigns `this.entries = this.sortingService.sort(this.entries)` and no longer sorts in place.

## Known issues / follow-ups

- `node_modules` is not installed in this worktree, so I could not run `npm test`, `npm run check` or `npm run lint` (installing needs approval). I checked the comparator logic by running the same cases in plain node, and all expected orders matched. Before merging, someone should run `npm test` and `npm run check`.
- The tie-breaker on priority follows the analyst's assumption 2. If the owner wants score only, delete the last line of the comparator and the two tie-breaker tests.
