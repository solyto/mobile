# Verdict: OPML import polling ignores error responses

id: assume
reviewer: reviewer agent
date: 2026-11-17

## Review

Reviewed `git diff main...HEAD` on `feature/assume_opml-import-polling-ignores-error-responses`.
Only `src/lib/state/FeedImport.svelte.ts` and `tests/unit/stores/FeedImport.test.ts`
changed outside the job directory. No packages and no i18n changes.

TASK-1: PASS
notes: `backOff(kind: FeedImportPollError, retryAfterMs = 0)` (`FeedImport.svelte.ts:136`).
The `catch` in `poll()` passes `'rate_limited'` with `(error.retryAfter ?? 0) * 1000`, or
`'network'` with no delay. That gives the same `pollError` and delay as before for both error
types. The existing network and rate-limit tests pass unchanged.

TASK-2: PASS
notes: `poll()` (`:116-121`) resets `failedPolls`/`pollError` only when `refresh()`
returns `true`. Otherwise it calls `backOff('network')`. `stall()` for unexpected throws,
the timeout in `continuePolling`, and the stop/destroy handling are untouched.

TASK-3: PASS
notes: The new test (`FeedImport.test.ts:265`) sits next to the network test and resolves
`null` twice, then `running(2)`. It checks that `pollError` is `'network'`, that the polls
are spaced 2000 ms and then 4000 ms apart, and that `pollError` is cleared while `polling`
stays `true`. This matches the brief.

TASK-4: PASS (verified by the reviewer)
notes: The developer could not run the checks because `node_modules` was missing. The brief
allows npm commands, so the reviewer ran `npm ci` and then the checks:
`npm test` passed 1596/1596 across 98 files, `npm run lint` (eslint) was clean, and
`npm run check` reported 0 errors and 0 warnings.

Standards (`docs/STANDARDS.md`): no violations found in the changed code.

## Security

none (not run; the change has no security-relevant surface)

## Overall

APPROVED

No blockers.
