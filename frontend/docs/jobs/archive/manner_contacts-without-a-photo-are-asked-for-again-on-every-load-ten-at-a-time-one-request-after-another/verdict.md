# Verdict: contacts without a photo are asked for again on every load, ten at a time, one request after another

id: manner
reviewer: reviewer
date: 2026-11-16

## Review

Diff reviewed: `git diff main...HEAD` (`src/lib/state/Contacts.svelte.ts`, `tests/unit/stores/Contacts.test.ts`, job docs). No changes outside the task scope.

TASK-1: PASS
notes: plain `private checkedPhotoUris = new Set<string>()`. Contacts to fetch are filtered on it, and every URI of a successful batch is marked (misses too). `if (!res) continue;` leaves a failed batch unchecked, so it is retried.

TASK-2: PASS
notes: `update()` deletes the URI only on success, before `load()`. `create()`/`delete()` untouched, as planned.

TASK-3: PASS
notes: `Object.assign(this.contactPhotos, res.data)` writes per key through the `$state` proxy. `updateContactPhoto()` left as is (out of scope).

TASK-4: PASS
notes: `photoRun` field plus `while (this.photoRun) await this.photoRun.catch(...)`. The follow-up run is computed after the running one settles, so it only picks up still-unchecked URIs. The field is cleared in `finally`, and `contactPhotosLoaded` is set after every successful call. The loop always ends because the starter clears the field, and a waiter that resumes before that just waits again. The in-flight race with `update()` is documented in implementation.md, as the task asked. Since `load()` does not await `loadContactPhotos()` (that was already the case), the first `post` still fires synchronously.

TASK-5: PASS
notes: all five cases (a–e) are covered. I traced each test by hand against the new code, including the deferred promise in (c) and the synchronous `post` in (b), and they hold. The old "skips already-cached" test was replaced, which is justified because the filter changed.

TASK-6: N/A. Blocked on purpose and not implemented, which is correct.

Not verified: `npm test`, `npm run lint` and `npm run check` could not be run (no `node_modules`, and installing needs approval). They must pass in CI or locally before merge.

## Security

none (not run; there is no security-relevant surface: no new input, auth or storage).

## Overall

APPROVED. There are no blockers.
