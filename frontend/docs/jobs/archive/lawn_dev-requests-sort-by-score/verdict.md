# Verdict: dev requests: sort by score

id: lawn
reviewer: reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD`. Code changes are limited to the three files in
tasks.md (plus job docs). Nothing changed that implementation.md doesn't mention.

TASK-1: PASS
notes: `src/lib/services/DevRequestSortingService.ts` is a default-exported class
whose `sort()` returns a new array (`[...requests].sort`). The status rank
(open 0 / cancelled 1 / completed 2) gives the same group order as the old
pairwise comparator (old one: completed after everything, cancelled after
non-completed, so open < cancelled < completed). Inside a group it sorts by
`score` desc, then `priority` desc (`?? 0`). Types match
`src/lib/types/dev_request.ts`.

TASK-2: PASS
notes: `tests/unit/services/DevRequestSortingService.test.ts` covers score
order, the priority tie-breaker, null priority, status grouping winning over
score, score order inside the cancelled and completed groups, and that the
input isn't mutated. The fixture builds a complete `DevRequest`, and every
status used is a valid `DevRequestStatus`. `node_modules` isn't installed in
this worktree, so I couldn't run Vitest. I ran the comparator (with type
annotations stripped) in plain node, and the grouping case gave [4,3,2,1] and
the tie-breaker/null case gave [3,2,1,4], as expected.

TASK-3: PASS
notes: `src/lib/state/DevRequests.svelte.ts` holds a `sortingService` field,
the same pattern as `Todos.svelte.ts` l. 63, and `sort()` now assigns
`this.entries = this.sortingService.sort(this.entries)`. The only caller is
`load()` (l. 30). `loadProfiles()` runs afterwards on the reassigned `$state`
array, so its in-place `created_by_user` updates still work.

## Security

none (not run; client-side sort only, no new data flow)

## Overall

APPROVED

No blockers. The developer couldn't run `npm test` / `npm run check` /
`npm run lint` because `node_modules` isn't installed, and I couldn't either,
so run them before merging.
