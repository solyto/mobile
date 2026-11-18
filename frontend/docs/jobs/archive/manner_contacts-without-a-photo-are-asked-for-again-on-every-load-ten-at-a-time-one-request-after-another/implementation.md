# Implementation: contacts without a photo are asked for again on every load, ten at a time, one request after another

id: manner
developer: developer
date: 2026-11-16

## Summary

`Contacts` now remembers which contacts were already checked for a photo, including the ones without a photo, so `/contacts` visits and saves no longer send the photo-less part of the address book again. Results are written into `contactPhotos` per key, and a second `loadContactPhotos()` call waits for the running one instead of requesting the same batches again. Batches stay serial with a size of 10 (TASK-6 is blocked).

## Changes

TASK-1: `src/lib/state/Contacts.svelte.ts` — new plain `private checkedPhotoUris = new Set<string>()` (not `$state`, STANDARDS 3.6). Contacts to fetch are now chosen with `!checkedPhotoUris.has(c.uri)`. After a successful batch, every URI in it is marked as checked, including the ones missing from `res.data`. A failed batch (`post` returns `null`) is not marked, so it is retried on the next load.
TASK-2: `update()` removes the contact's URI from the checked set before `load()`, so its photo is requested again.
TASK-3: batch results are written with `Object.assign(this.contactPhotos, res.data)`. This writes each key through the `$state` proxy instead of copying the whole map for every batch.
TASK-4: new `private photoRun` field. `loadContactPhotos()` waits while a run is in progress (`while (this.photoRun) await …`). Then it starts a new run only for contacts that are still unchecked, and clears the field in `finally`. The batch loop moved to `private fetchContactPhotos(contacts)`. `contactPhotosLoaded` is still set at the end of every successful call. A waiter ignores a failed run (only the caller that started it gets the error) and then starts its own run. Chosen behaviour for the race in the task: if `update()` un-checks a URI while a batch that contains it is in flight, that batch's response marks it checked again, and the follow-up run does not request it. This is accepted as rare and harmless; the next `update()` of that contact rechecks it.
TASK-5: `tests/unit/stores/Contacts.test.ts` — replaced "skips already-cached contacts" (its premise changed: the filter is now the checked set, not the photo map) with tests for: (a) a miss is not requested again; (e) a failed batch is requested again; (d) 25 contacts → batches of 10/10/5; (c) two concurrent calls → one request; (b) `update()` requests only that contact's photo again.
TASK-6: not implemented (blocked; it needs a decision from the backend owner).

## Known issues / follow-ups

- **Tests, lint and type-check were not run**: the worktree has no `node_modules`, and installing packages needs approval. Run `npm ci && npm test && npm run lint && npm run check` before merging.
- TASK-6 (parallel batches / larger `batchSize`) is still waiting for the backend owner.
- A photo removed or changed on another device is only picked up after a full reload or after an `update()` of that contact in this client.
