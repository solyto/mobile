# Brief: OPML import polling ignores error responses

type: feature
id: assume
branch: feature/assume_opml-import-polling-ignores-error-responses
date: 2026-11-17
author: Leander Muskalla

updated: 2026-11-17 (scope decided by the owner, ready for implementation)

## Job (decided, do exactly this)

While an OPML import runs, `FeedImport` (`src/lib/state/FeedImport.svelte.ts`)
polls `GET /feeds/import/state` every second. When the server answers with an
error, treat that poll exactly like a failed poll from a network error.

Today:
- `refresh()` (`:59-69`) returns `false` when `apiService.get()` gives no
  result. That is what happens for a non-OK response that isn't a 429 (e.g.
  500, 404, 401 without a successful token refresh).
- `poll()` (`:111-128`) ignores that return value: it resets `failedPolls` and
  `pollError` and polls again after one second. The user only sees an error
  when `POLL_TIMEOUT_MS` (5 minutes without progress) calls `stall()`.
- Only a thrown `NetworkError` or `RateLimitedError` reaches `backOff()`
  (`:130-137`).

Change, in `poll()` only:
- When `refresh()` returns `false`: count it as a failed poll the same way a
  `NetworkError` is counted today: `failedPolls` goes up, `pollError` becomes
  `'network'`, and the next poll waits the same backed-off delay as for a
  network error (`POLL_INTERVAL_MS * 2 ** failedPolls`, capped at
  `MAX_POLL_INTERVAL_MS`).
- When `refresh()` returns `true`: unchanged (reset `failedPolls` and
  `pollError`).
- Adjust `backOff()` so it can be used for this case without constructing a
  fake `NetworkError` (e.g. pass the error kind and the retry-after delay).
  Its behaviour for `NetworkError` and `RateLimitedError` must stay exactly
  the same.
- Everything else stays: the 5-minute no-progress timeout, `stall()` for
  unexpected thrown errors, stopping when the import finishes or the layout is
  destroyed.

## Out of scope (do not do)

- A separate "server error" message or a new `pollError` variant. The existing
  `'network'` message is shown (no new strings, no i18n work).
- Special handling for 404 (e.g. stopping at once because the import state
  expired). `apiService.get()` doesn't return the status, and adding a
  status-returning GET is not part of this job.
- Changes to `ApiService` or to the API.

## Tests

In `tests/unit/stores/FeedImport.test.ts`, next to "backs off on network
errors, reports them, and clears the error once a poll succeeds" (`:244`):
- `api.get` resolves `null` for two polls, then a running state: `pollError`
  is `'network'` after the first failed poll, the polls are spaced with the
  same backed-off delays as in the network test, and `pollError` is `null`
  again after the successful poll while polling continues.
- The existing network, rate-limit, timeout and stall tests keep passing
  unchanged.

## Checks

- `npm run check`, `npm run lint` (eslint) and `npm test` pass.
- No new packages, no i18n changes.

## Background (for context, no action)

Bounded today: polling stops after 5 minutes without progress and when the
feeds layout is destroyed (`onDestroy` in `src/routes/feeds/+layout.svelte`).
This change is about feedback within seconds instead of 5 minutes, and fewer
pointless requests. Found in the 1.1.3 release review (2026-11-15).

You are allowed to run all npm commands you need.