# Implementation: OPML import modal — timeout and error states

id: city
developer: developer
date: 2026-11-14

## Summary

`FeedImportModal` now keeps polling while the import makes progress, shows an
error view with a retry button when the first state request fails, switches to
the progress view on a 409 upload, and clears the file input after each upload
attempt. Tests cover the timeout, retry and 409 paths.

## Changes

TASK-1: `FeedImportModal.svelte` — the timeout now measures time since the last
change to `processed` (`lastProgressAt` / `lastProcessed`, plain `let`s set in
`startPolling()` and updated in `continuePolling()`), and `POLL_TIMEOUT_MS` is
300000 to cover queue wait before the first progress. The `finished` and
`destroyed` paths are unchanged.

TASK-2: `FeedImportModal.svelte` — `open()` catches a failed `refresh()`, sets
`import_error_generic` and a new `'unavailable'` view with "Close" and "Try
again" (`retry()` clears the error and calls `open()` again). The `'failed'`
view (poll timeout) is unchanged and has no retry button. New key
`feeds.import_retry` in `en.ts` and `types/translation.ts`.

TASK-3: `FeedImportModal.svelte` — on a 409 from `upload()`, the "An import is
already running." message is kept, the state is refreshed and `showStage()`
picks the view (progress + polling when running). After review:
`showResult()` clears `error`, so the message no longer stays above the result
once that import finishes (or is already finished on the 409 refresh).

TASK-4: `FeedImportModal.svelte` — `bind:input={fileInput}` on `FileUpload`,
`fileInput.value = ''` in `upload()`'s `finally`. `fileInput` is `$state`
because a plain `let` triggers Svelte's `non_reactive_update` warning in
`npm run check`.

TASK-5: `import_retry` in `de`, `es`, `fr`, `it` and `ru` ("Erneut versuchen",
"Reintentar", "Réessayer", "Riprova", "Повторить"). This session had no way to
start the `translator` agent, so I followed its rules and `docs/I18N.md`
directly and matched the existing "try again" wording in each locale. The
owner should check `de`.

TASK-6: `tests/components/feed-import-modal.test.ts` — 5 new tests: polling
continues past 400 s while progressing; stalls time out after 300 s (not at
200 s) and polling stops; a long import ends in the result view; a failed first
load shows "Try again", and retrying shows the picker; a 409 upload (via
`userEvent.upload`) shows the progress label and the message. After review, a
6th test: the 409 message is gone once that import finishes and the result
shows (fails without the fix). All 5 fail
against the previous component and pass now. Full suite, `npm run check` and
eslint are clean.

## Known issues / follow-ups

- As noted in the brief: a finished import stays on the server for an hour, and
  the modal shows its result each time it opens until "Import another file" is
  clicked. This change doesn't affect that.
- Open question 1 from tasks.md is still open: if the API also returns 409 while
  another session is in `parsed`, `showStage('parsed')` falls back to the
  picker. Not checked against the backend.
- `node_modules` was missing in the worktree, so I ran `npm ci` from the
  existing lockfile to run checks and tests. No dependencies changed.
