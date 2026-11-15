# Backlog: OPML import polling ignores error responses

created: 2026-11-15

## What

While an OPML import runs, `FeedImport` (`src/lib/state/FeedImport.svelte.ts`)
asks `GET /feeds/import/state` every second. Count an error response from the
server as a failed poll, like a network error, instead of as "no change".

- `refresh()` (`:60-70`) returns `false` when `apiService.get()` gives no
  result, which is what happens for a non-OK response that isn't a 429
  (e.g. 500, 404, 401 without a successful token refresh).
- `poll()` (`:110-126`) ignores that return value: it resets `failedPolls` and
  `pollError` and polls again after one second.
- Only `NetworkError` and `RateLimitedError` reach `backOff()`; anything else
  thrown stalls at once.

Possible change: in `poll()`, treat `refresh() === false` like a failed poll
(raise `failedPolls`, back off, show the existing error state after a few
attempts), or stall right away for a 404, because that means the import state
is gone (it expires after an hour, `CACHE_TTL` in the API's
`OpmlImportService`).

## Why

When the server answers with errors during an import, the progress bar just
stops moving. The app keeps polling every second without telling the user,
until `POLL_TIMEOUT_MS` (5 minutes without progress) calls `stall()` and shows
the generic error.

It's bounded: polling stops after those 5 minutes and when the feeds layout is
destroyed (`onDestroy` in `src/routes/feeds/+layout.svelte`). Network errors
and 429 already back off correctly. So this is about feedback and a few
hundred unnecessary requests, not about a loop that never ends.

New with the OPML import in 1.1.3. Found in the 1.1.3 release review
(2026-11-15); kept out of the release because the polling logic was already
changed several times in that release.

## Notes

- Tests in `tests/unit/stores/FeedImport.test.ts` mock `ApiService`: add a
  case where `get()` resolves to null for a few polls and check that the
  error state appears before the 5-minute timeout, and that a later
  successful poll clears it.
- Check: stop the API (or make `/feeds/import/state` return 500) during a
  running import; the import UI shows an error within a few seconds instead
  of after 5 minutes.
