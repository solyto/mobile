# Verdict: OPML import modal — timeout and error states

id: city
reviewer: reviewer
date: 2026-11-14

## Review

Verified on `feature/city_opml-import-modal-timeout-and-error-states` against
`main...HEAD`. `npx vitest run tests/components/feed-import-modal.test.ts`
(8/8 after the re-review fix), `npm run check` (0 errors, 0 warnings) and eslint on the changed files
are clean. The diff matches `implementation.md`; nothing unlisted changed.

TASK-1: PASS
notes: `FeedImportModal.svelte` — `lastProgressAt`/`lastProcessed` are plain
`let`s (3.6), seeded in `startPolling()`, reset in `continuePolling()` when
`processed` changes; `POLL_TIMEOUT_MS = 300000`. `finished` and `destroyed`
paths unchanged.

TASK-2: PASS
notes: `open()` catches, sets `import_error_generic` and the new `'unavailable'`
view with Close / Try again; `retry()` clears the error and re-runs `open()`.
`try/finally` around the loading indicator kept (15.7). `'failed'` unchanged.

TASK-3: PASS
notes: `upload()` (409 branch) sets `import_error_running`, refreshes and
calls `showStage()`. Re-review (dcae714): `showResult()` now clears `error`, so
the message stays above the progress bar but is gone once the result shows,
on both the polling path and an immediate `finished` on the 409 refresh.
`showResult()` is only reached from those two paths and `open()`, where no
error should survive, so clearing there is safe. New test "clears the
already-running message once that import finishes" covers it.

TASK-4: PASS
notes: `bind:input={fileInput}` and `fileInput.value = ''` in `upload()`'s
`finally`. `$state` is used because a plain `let` triggers
`non_reactive_update`; that's the fallback tasks.md allowed.

TASK-5: PASS
notes: `import_retry` added to de/es/fr/it and also `ru` (`ru.ts` exists and
`npm run check` requires it, so that's needed). The developer wrote these by
hand because the `translator` agent wasn't available in the session, and said
so in implementation.md. The owner may want to review them.

TASK-6: PASS
notes: The 5 new tests cover 1a/1b/1c, the retry flow and 409 → progress, and
they assert visible text and roles. The stall test checks both sides of the
limit (no error at 200 s, error after 301 s, call count frozen afterwards).

## Security

none (not run; no auth, token, or untrusted-HTML handling touched).

## Overall

APPROVED

Re-review of dcae714: the single blocker from the first review (stale 409
message over the result view) is fixed and tested. No remaining blockers.
