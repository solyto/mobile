# Tasks: OPML import polling ignores error responses

Branch verified: worktree HEAD is `feature/assume_opml-import-polling-ignores-error-responses` (matches `brief.md`).

## TASK-1: Make `backOff()` take an error kind and retry-after delay instead of an error object

- **Description:** Change the private `backOff(error)` in `FeedImport` to `backOff(kind: FeedImportPollError, retryAfterMs = 0)` (or similar), and have the existing `catch` in `poll()` pass `'rate_limited'` + `(error.retryAfter ?? 0) * 1000` for `RateLimitedError` and `'network'` for `NetworkError`, so the behaviour for both stays exactly the same.
- **Files:** `src/lib/state/FeedImport.svelte.ts` (`backOff` `:130-137`, `catch` in `poll` `:119-125`)
- **Dependencies:** none
- **Risk:** low. It's a private method with one caller. The existing network and rate-limit tests check that the delays and `pollError` values stay the same.

## TASK-2: Count a `false` result from `refresh()` in `poll()` as a failed network poll

- **Description:** In `poll()`, when `await this.refresh()` returns `false`, set `delay = this.backOff('network')` (which raises `failedPolls` and sets `pollError = 'network'`). Only reset `failedPolls`/`pollError` when it returns `true`. `stall()` for unexpected throws, the 5-minute timeout in `continuePolling`, and the stop/destroy handling stay as they are.
- **Files:** `src/lib/state/FeedImport.svelte.ts` (`poll` `:111-128`)
- **Dependencies:** TASK-1
- **Risk:** low. The change is limited to `poll()`. A failed refresh leaves `this.state` unchanged (still `running`), so `continuePolling` keeps scheduling with the backed-off delay and the no-progress timeout still applies.

## TASK-3: Unit test for polls that fail because of an error response

- **Description:** Add a test next to "backs off on network errors…" (`:244`) in which `api.get` resolves `null` twice and then `running(2)`. It asserts that `pollError` is `'network'` after the first poll, that the polls are spaced at 1000 ms, then 2000 ms (call count stays 1 at +1999 ms and is 2 at +1 ms), then 4000 ms (3 calls), and that `pollError` is `null` again while `polling` is still `true`.
- **Files:** `tests/unit/stores/FeedImport.test.ts`
- **Dependencies:** TASK-2
- **Risk:** low. The test copies the existing network-error test's timing and only swaps rejections for `null` resolutions.

## TASK-4: Run checks

- **Description:** Run `npm run check`, `npm run lint` and `npm test`, and confirm that the existing network, rate-limit, timeout and stall tests pass unchanged, with no i18n or package changes.
- **Files:** none (verification only)
- **Dependencies:** TASK-1, TASK-2, TASK-3
- **Risk:** low. It's verification only.

## Notes

- Out of scope as the brief says: no new `pollError` variant, no handling specific to 404, no changes to `ApiService`, no new strings.
