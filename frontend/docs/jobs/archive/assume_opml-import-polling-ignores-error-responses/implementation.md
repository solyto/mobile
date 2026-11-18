# Implementation: OPML import polling ignores error responses

id: assume
developer: developer agent
date: 2026-11-17

## Summary

OPML import polling now counts an error response from `GET /feeds/import/state` (`refresh()` returns `false`) as a failed network poll. `failedPolls` goes up, `pollError` becomes `'network'`, and the next poll uses the same backed-off delay. Before, the poll was treated as a success.

## Changes

TASK-1: `src/lib/state/FeedImport.svelte.ts`: `backOff()` now takes `(kind: FeedImportPollError, retryAfterMs = 0)` instead of an error object. The `catch` in `poll()` passes `'rate_limited'` plus `retryAfter * 1000` for `RateLimitedError` and `'network'` for `NetworkError`, so both behave exactly as before.
TASK-2: `src/lib/state/FeedImport.svelte.ts`: `poll()` resets `failedPolls`/`pollError` only when `refresh()` returns `true`. Otherwise it sets `delay = this.backOff('network')`. The timeout, stall and stop handling are unchanged.
TASK-3: `tests/unit/stores/FeedImport.test.ts`: new test "backs off on error responses like on network errors…". `api.get` resolves `null` twice, then `running(2)`. It checks `pollError === 'network'`, the 2000 ms and 4000 ms spacing, and that `pollError` is cleared while polling continues.
TASK-4: Not run. There is no `node_modules` in the worktree, so `npm run check`, `npm run lint` and `npm test` cannot run. Installing the dependencies (`npm ci`) needs approval under the project's hard rules. The changes were only checked by reading the code.

## Known issues / follow-ups

- Run `npm ci && npm run check && npm run lint && npm test` before merging. TASK-4 verification is still open.
