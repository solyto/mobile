# Tasks: OPML import modal — timeout and error states

id: city
analyst: analyst
date: 2026-11-14

<!-- Produced by @analyst from brief.md. -->

## Context

All four fixes are in `src/lib/components/feeds/FeedImportModal.svelte`. The
store (`src/lib/state/FeedImport.svelte.ts`) and `FileUpload` need no changes:
- `FeedImport.refresh()` returns `false` on a non-OK response and **throws** on
  `NetworkError` / `RateLimitedError`. The root layout turns unhandled rejections
  into a toast (`NetworkErrorHelper`), which is why `open()` currently ends up
  with a toast and a blank modal.
- `refresh()` already reloads the feed list on the `running → finished`
  transition, so polling until `finished` is enough to fix the stale feed list.
- `FileUpload` exposes `input` as `$bindable` and calls `onfile` synchronously
  before it reads the file itself, so clearing `input.value` after the upload
  `await` is safe.

Binding rules: `docs/STANDARDS.md` 3.6 (bookkeeping such as timestamps and
timers stays a plain `let`), 15.7 (loading indicator stops on every path),
8.1/8.2 + `docs/I18N.md` (new strings), 10.1 (no comments unless they're needed).

## Task breakdown

TASK-1: Keep polling while the import makes progress. Time out only after a
period without progress, measured from the last change to `processed`, not
from when polling started.
  files: src/lib/components/feeds/FeedImportModal.svelte
  details: In `continuePolling()`, when `feedImport.state.processed` differs
    from the last value seen, record the new value and reset the timestamp (a
    plain `let`, per 3.6; renaming `pollStartedAt`, e.g. to `lastProgressAt`,
    is fine). Raise `POLL_TIMEOUT_MS` to 300000 (the API job's `$timeout = 300`).
    Queue wait happens before `processed` first changes, so a 120 s stall limit
    could still fire too early. Set the counter when polling starts
    (`startPolling`). Keep the existing `finished` → `showResult()` path and the
    `destroyed` guards.
  depends: none
  risk: medium — changes when polling stops. A mistake either brings back the
    early "failed" view or polls forever, and fake-timer tests are the only
    real check.

TASK-2: Catch a failing first `feedImport.refresh()` in `open()` and show an
error view with a retry button that runs `open()` again.
  files: src/lib/components/feeds/FeedImportModal.svelte, src/lib/i18n/en.ts,
    src/lib/types/translation.ts (if keys are declared there)
  details: Add a `catch` in `open()` that sets `error` (reuse
    `ts.get.feeds.import_error_generic`) and a view to show. Either reuse
    `'failed'` with a retry button added to it, or add a new `'unavailable'`
    member to `View`. A retry only makes sense when the load failed, not after
    a poll timeout, so a separate view (or a flag that isn't `$state`) is
    cleaner than changing `'failed'`. The retry handler clears `error` and
    calls `open()`. Keep the `try/finally` around `loadingIndicator` (15.7).
    New `en` string for the button label, e.g. `feeds.import_retry: 'Try
    again'`; no retry/try-again key exists in `en.ts` today.
  depends: none
  risk: low — new branch in an async function that's already guarded; the
    only side effect is that the global toast no longer appears for this
    request, which is intended because the modal now shows the error.

TASK-3: On a 409 from upload, refresh the import state and switch to the view
for the server's current stage (progress view + polling when it's running).
  files: src/lib/components/feeds/FeedImportModal.svelte
  details: In `upload()`, when `res.status === 409`, set the error message as
    before, then `await feedImport.refresh()` and call
    `showStage(found ? feedImport.state?.stage : undefined)` inside the
    existing `try/finally`. Decide whether the "An import is already running."
    message stays above the progress bar (it's still accurate, so keeping it
    is reasonable). `refresh()` can throw here too; leaving that to the global
    handler is consistent with `upload()` today.
  depends: none (touches the same function as TASK-4; do them in sequence)
  risk: low — reuses `showStage()`, which already handles running/finished.
    See open question 1 for the `parsed` case.

TASK-4: Clear the file input after every upload attempt, so choosing the same
file again fires `change`.
  files: src/lib/components/feeds/FeedImportModal.svelte
  details: `bind:input` on `<FileUpload>` and set `input.value = ''` in
    `upload()`'s `finally`. The element ref isn't rendered state (3.6); use a
    plain `let` if Svelte 5 accepts it for a component prop binding without a
    warning, otherwise `$state`. `npm run check` decides. No change to
    `FileUpload.svelte`.
  depends: TASK-3 (same function; avoids conflicting edits)
  risk: low — a one-line reset. On a successful upload the picker unmounts
    anyway.

TASK-5: Translate the new retry string into the other locales via the
`translator` agent.
  files: src/lib/i18n/de.ts, es.ts, fr.ts, it.ts
  depends: TASK-2
  risk: low — one key; `npm run check` enforces that all locales match.

TASK-6: Component tests for TASK-1 to TASK-3 in the existing test file.
  files: tests/components/feed-import-modal.test.ts (existing
    `helpers/FeedImportModalContext.svelte` and `renderWithContext` are
    enough)
  details: Use the same pattern as the existing tests (fake timers,
    `vi.spyOn(FeedImport.prototype, ...)`):
    - TASK-1a: `refresh` mock reports `running` with `processed` going up
      over time; advance well past 300 s in total and assert polling continues
      and the generic error text isn't shown.
    - TASK-1b: `processed` never changes; after the stall timeout, polling
      stops (call count frozen) and the error text is shown.
    - TASK-1c (optional): `finished` after a long run shows the result view.
    - TASK-2: first `refresh` rejects (e.g. `new NetworkError(...)`); assert
      the error text and the retry button; retry with `refresh` resolving to
      `false` → picker hint shown.
    - TASK-3: `refresh` → `false` (picker), `upload` mocked to
      `{ ok: false, status: 409 }`, next `refresh` sets `running`; trigger the
      file input with `@testing-library/user-event` `upload()` (already a
      devDependency) and assert the progress label. Follow `docs/TESTING.md`:
      assert visible text/roles, not markup.
    TASK-4 needs no test; the brief doesn't ask for one and jsdom doesn't
    reproduce the browser's same-file `change` suppression.
  depends: TASK-1, TASK-2, TASK-3
  risk: medium — fake timers combined with async refreshes and file-input
    events in jsdom are easy to get subtly wrong (tests that pass without
    actually testing anything).

## Open questions / unclear scope

1. **409 while the other session is in `parsed`.** If another tab uploaded a
   file but hasn't picked feeds yet, and the API also returns 409 for that,
   `showStage('parsed')` falls back to the picker and the user is stuck in the
   same loop. From the code it looks like the API only returns 409 for a
   running import (the message says so), so the tasks assume that. Not
   verified against the backend.
2. **Note from the brief, unchanged:** a finished import stays on the server
   for an hour, and the modal shows its result on every open until "Import
   another file" is clicked. TASK-1 doesn't change this; the developer should
   just mention it in `implementation.md`.
