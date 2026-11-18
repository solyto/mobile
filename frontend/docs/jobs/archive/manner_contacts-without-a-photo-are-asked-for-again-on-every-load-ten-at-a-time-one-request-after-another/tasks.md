# Tasks: contacts without a photo are asked for again on every load, ten at a time, one request after another

id: manner
analyst: analyst
date: 2026-11-16

<!-- Produced by @analyst from brief.md. -->

## Scope

All code changes are in `src/lib/state/Contacts.svelte.ts` (`loadContactPhotos()`,
`update()`, and the fields next to `contactPhotos`) plus tests in
`tests/unit/stores/Contacts.test.ts`. No API change, no new dependency, no UI or i18n change.

Out of scope (brief section 4 / 6): the `URL.revokeObjectURL` no-op in
`ListView.svelte:25-27`, `contactsAZ` performance, and backend behaviour.

## Task breakdown

TASK-1: Remember photo misses: keep a plain (non-`$state`, STANDARDS 3.6) `Set<string>` of checked URIs, add every URI of a batch to it after a successful response (also those missing from `res.data`), and select contacts to fetch with `!checkedPhotoUris.has(c.uri)`.
  files: src/lib/state/Contacts.svelte.ts
  depends: none
  risk: low — local change to one method; note: on a failed request (`post` returns `null`) the batch must NOT be marked checked, so it is retried on the next load.

TASK-2: In `update()`, delete the updated contact's URI from the checked set before `load()` runs, so a photo changed elsewhere (CardDAV sync) is requested again.
  files: src/lib/state/Contacts.svelte.ts
  depends: TASK-1
  risk: low — one line; `create()` needs nothing (new URI is unchecked) and `delete()` needs nothing.

TASK-3: Write photo results in place (`this.contactPhotos[uri] = url` per entry of `res.data`) instead of spreading the whole map per batch, so only changed avatars re-render.
  files: src/lib/state/Contacts.svelte.ts
  depends: none
  risk: low — `contactPhotos` is a deep `$state` proxy, so per-key writes are reactive; readers (`ListView.svelte:53-55`, `ContactDetail.svelte:96-98`, `getContactPhoto`) only read by key. Leave `updateContactPhoto()` / `removeContactPhoto()` as they are unless the developer finds a reason in this job (do not refactor unrelated code).

TASK-4: Prevent overlapping runs: keep the running `loadContactPhotos()` promise in a plain field; a call while it is running returns/awaits it, and afterwards a new run starts only for contacts that are still unchecked (so URIs un-checked by `update()` during a run are still picked up). Clear the field when the run ends, also on error (`try/finally`).
  files: src/lib/state/Contacts.svelte.ts
  depends: TASK-1
  risk: medium — async ordering: `contactPhotosLoaded` must still end up `true`, the follow-up run must not loop forever (stop when nothing is unchecked), and a batch already in flight for a URI that `update()` just un-checked must not re-mark it as checked without the follow-up request (simplest: compute the follow-up list after the running promise settles and accept that an in-flight response for that URI marks it checked — developer should document the chosen behaviour in implementation.md).

TASK-5: Add store tests in `tests/unit/stores/Contacts.test.ts` (mocked `ApiService` via `storeMocks`): (a) a contact missing from the response is not requested on the next `loadContactPhotos()`; (b) `update()` makes that contact's photo get requested again; (c) two concurrent `loadContactPhotos()` calls send each URI only once; (d) 25 contacts produce 3 batches (10/10/5); (e) a failed batch (`post` → `null`) is requested again next time. Adjust the existing "skips already-cached contacts" test if its premise changes.
  files: tests/unit/stores/Contacts.test.ts
  depends: TASK-1, TASK-2, TASK-3, TASK-4
  risk: low — test-only; (c) needs a deferred/unresolved `api.post` promise to hold the first run open.

TASK-6 (BLOCKED — do not implement in this job): Run photo batches in parallel with a small limit (3–4 in flight) or raise `batchSize`.
  files: src/lib/state/Contacts.svelte.ts
  depends: TASK-1, TASK-4
  risk: high — the brief explicitly says to check with the backend owner first how expensive one batch of `/address-books/contacts/photos` is (possibly a CardDAV read per contact); that is not verified and cannot be decided here. There is also no concurrency-limit helper in the codebase, so this would add a new pattern. After TASK-1 the serial cost only applies to the first load of a session, which reduces the urgency. Keep batches serial with `batchSize = 10` until the owner decides.

## Open questions

- TASK-6: needs a decision from the backend owner (parallel requests and/or larger batch size). Left out of this job on purpose.
- Photos removed on another device are still never re-checked for contacts that already have a cached photo (existing behaviour, not changed here; `update()` in TASK-2 only covers edits made in this client).
- Checked URIs live only in memory, so a full page reload still re-checks the whole book once — consistent with the brief (it asks for a plain `Set`, not persistence).
