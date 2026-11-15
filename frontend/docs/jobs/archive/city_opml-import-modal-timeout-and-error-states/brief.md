# Brief: OPML import modal — timeout and error states

type: feature
id: city
branch: feature/city_opml-import-modal-timeout-and-error-states
date: 2026-11-14
author: Leander Muskalla

## What

Found in the review of the OPML import (22074bd),
`src/lib/components/feeds/FeedImportModal.svelte`:

1. **The modal gives up while the import is still running.**
   `POLL_TIMEOUT_MS = 120000` (line 17, checked at line 145), but the API job
   has `$timeout = 300`. A 500-feed import can take about 100 s just for
   fetches (25 at a time, 5 s timeout), plus queue wait. The user then sees
   "Something went wrong with the import" while it's still running. Another
   upload gets a 409, and the feed list doesn't reload when the import
   finishes, because polling has stopped.
2. **Blank modal when the first state request fails.** If
   `feedImport.refresh()` throws in `open()` (lines 38-46), `view` stays
   `null` and no branch renders. A global toast appears, but the modal only
   shows its title.
3. **A 409 on upload leaves the user on the file picker.** When an import is
   already running (another tab or device), the 409 branch (line 88) shows
   the message but doesn't switch to the progress view.
4. **Choosing the same file again does nothing.** After a 422, choosing the
   same file again doesn't fire `change` on the input in `FileUpload`, so
   `onfile` never runs.

## Steps

1. Keep polling while the server reports `stage === 'running'`, and use the
   timeout only for when there's no progress. One way: reset `pollStartedAt`
   whenever `processed` changes, or raise the limit above 300 s.
2. In `open()`, catch the error and show an error view with a retry button.
3. On 409, call `feedImport.refresh()` and show the progress view.
4. Reset the input value (`input.value = ''`) after each upload attempt.
   `FileUpload` already exposes `input` as `$bindable`.
5. Tests in `tests/components/feed-import-modal.test.ts` for 1–3.

## Notes

- A finished import stays on the server for an hour, and the modal shows its
  result each time it opens until "Import another file" is clicked. That's
  probably intended; just note it if the polling logic changes.
