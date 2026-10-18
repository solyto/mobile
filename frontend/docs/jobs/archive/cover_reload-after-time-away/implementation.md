# Implementation: reload after time away

id: cover
status: open
developer: deepseek-v4-flash (via manigot)
date: 2026-10-07

<!-- Produced by @developer after implementation. -->

## Summary

A permanently-open solyto tab drifted into a zombie state: `Auth.loggedIn`
stayed `true` in memory while the stored token was expired/revoked, so every
feature request failed silently (`Notes.create()` returned `null`, the modal
closed and "nothing happened") and the in-memory user — including
`profile.profile_image_path` — was never refreshed. A hard reload re-ran
`Auth.load()` and fixed everything.

Implemented as a layered fix:

- **TASK-1** — all state stores now share `Auth`'s single `ApiService` instance
  instead of snapshotting the token at construction, so a runtime refresh
  reaches every request. Logout clears the token on that shared instance.
- **TASK-2** — `Auth` re-validates the session when the app resumes
  (`visibilitychange` → visible, `online`) and on a low-frequency interval while
  visible: expired/near-expiry → single-flight `refresh()`, then
  `loadAdditionalData()` to refresh the in-memory user; definitive refresh
  rejection → logout. Offline/transient failures never log out and never leak an
  unhandled rejection.
- **TASK-3** — `ApiService` runs a global 401 recovery ladder for non-auth
  endpoints: adopt another tab's fresher persisted token, else single-flight
  refresh, retry the original request exactly once; only a definitive 401/403
  refresh rejection logs out (5xx/429 are transient and keep the session). Auth
  endpoints and network errors never trigger recovery.
- **TASK-4** — `Notes.create()` / `createCategory()` failures are surfaced via
  `UiNotifications.error()` (translation-aware) instead of being swallowed, and
  the modal + user input are kept so the entry can be retried.
- **TASK-5** — the root layout reacts to a mid-session logout (`$effect` on
  `auth.loggedIn`) and redirects to login/setup with a session-expired notice.
- **TASK-6** — audit: keep the earlier profile-image fix; it covers a distinct
  failure mode (transient/cross-origin image fetch) and is not made redundant
  by the resume-driven `loadAdditionalData()`.
- **TASK-7** — verification; see below.

## Changes

TASK-1 — shared session ApiService
- `src/lib/state/Auth.svelte.ts` — `clear()` now calls
  `apiService.updateAuthToken(null)` so no store keeps sending a revoked token.
- `src/lib/state/*.svelte.ts` (33 stores) — `this.apiService = this.auth.apiService`
  replacing `new ApiService(this.auth.getToken())`; `Finances`/`Todos` change
  their constructor default parameter to `auth.apiService`.
- `tests/unit/auth/AuthTokenFlow.test.ts`, `tests/unit/setup/storeMocks.ts` —
  updated to assert stores share the instance (and the mock auth exposes it).

TASK-2 — resume-driven session validation
- `src/lib/state/Auth.svelte.ts` — `SESSION_CHECK_INTERVAL_MS` (hourly),
  `startSessionMonitor()` registering `visibilitychange` + `online` (guarded by
  `browser`), interval started while visible and stopped while hidden,
  `validateSession()` doing the local `expires_at` comparison and only touching
  the network when action is needed, then `loadAdditionalData()`. `refresh()` is
  single-flight (`refreshInFlight`) and `performRefresh()` refreshes the shared
  instance's token. `validateSession()` is fully guarded against network
  rejections (offline resume never produces an unhandled rejection and never
  logs out; the `online` event re-checks).

TASK-3 — global 401 recovery
- `src/lib/services/ApiService.ts` — `AUTH_ENDPOINTS` bypass list,
  `setUnauthorizedHandler()`, `fetchWithRecovery()` (used by every request
  method) which retries exactly once with the current token after a successful
  recovery, and lets network errors propagate untouched. `updateAuthToken` now
  accepts `null`. New `postWithStatus()` keeps the HTTP status on POST so callers
  can distinguish a definitive 401/403 rejection from a transient 5xx/429.
- `src/lib/state/Auth.svelte.ts` — `recoverFromUnauthorized()` /
  `performRecovery()` (single-flight) ladder: (a) `adoptExternalSession()` reads
  the persisted auth (multi-tab adoption), (b) `refresh()`, (c) logout only on a
  definitive refresh rejection. `refresh()` now returns a
  `'refreshed' | 'transient' | 'rejected'` outcome instead of a boolean:
  `performRefresh()` treats a 5xx/429 respond from `POST /auth/refresh` as
  transient (session kept, resume/online re-checks retry) and only 401/403 as a
  dead session — `performRecovery()` and `validateSession()` call `logout()`
  exclusively on `'rejected'`.
- `tests/unit/services/ApiService.test.ts` — new "401 recovery" cases: retry
  once with the fresh token, no retry when recovery declines, no recovery for
  auth endpoints, no recovery on network error.
- `tests/unit/auth/Auth.test.ts` — mock ApiService exposes
  `setUnauthorizedHandler`.

TASK-4 — surface failed note mutations
- `src/lib/state/Notes.svelte.ts` — `ts`/`notifications` context fields;
  `create()` and `createCategory()` call `notifications.error()` on failure and
  keep `inputValue`/`createParent`/`modalOpen`; the modal is closed by the store
  on success instead of optimistically by the caller.
- `src/routes/notes/+layout.svelte` — removed the optimistic `notes.closeModal()`
  before create/confirm so a failed attempt leaves the modal (and the user's
  input) open. (Needed to fulfil "keep the input in the modal"; the store now
  owns success-close, which also handles the edit path whose return value is
  `null`.)
- `src/lib/i18n/{en,de,es,fr}.ts` + `src/lib/types/translation.ts` —
  `notes.create_error`, `notes.create_folder_error`, `auth.session_expired`.
- `tests/unit/stores/Notes.test.ts` — stubs `getTranslation`/`getUiNotifications`,
  asserts the error notification and that input/modal are retained on failure.

TASK-5 — reactive mid-session logout
- `src/routes/+layout.svelte` — imports `getUiNotifications`; `$effect` tracks
  `auth.loggedIn`: on a logged-in → logged-out transition on a protected route it
  shows `auth.session_expired` and redirects to login/setup. Auth/setup routes
  and manual logout (`/auth/logout`) are excluded, so no redirect loop.

TASK-6 — profile-image audit (no code change)
- Keep `src/service-worker.ts` same-origin GET guard and
  `src/lib/components/ui/NavProfileEntry.svelte` retry-on-error + letter
  fallback. Rationale: the resume work fixes *stale data* (an expired token
  hiding a newer `profile_image_path`), while the earlier fix addresses a
  *broken in-session image fetch* — the SW previously answered the cross-origin
  `<img>` with a synthetic `503`, and `<img>` never retries, so no amount of
  resume-time `loadAdditionalData()` recovers it. `loadAdditionalData()` (boot /
  login / resume) and `profileCache` (other users' public profiles for
  `getPublicProfile`) remain independently necessary. Both fixes are
  complementary; nothing was removed.

## Verification (TASK-7)

Commands (this worktree, node 22):

- `npm run check` — **0 errors, 0 warnings**.
- `npm test` — 53/54 files pass, **715 tests pass**. One unrelated pre-existing
  failure: `tests/components/logic-leaves.test.ts > StatisticWidget > applies the
  requested color classes`, which expects `.bg-blue-50`/`.text-blue-600` while
  the unchanged component uses theme classes (`bg-c-btn/10`, `text-c-btn`).
  Neither the component nor the test is touched by this job.
- `npm run lint` — no **new** ESLint errors are introduced. ESLint reports 13
  errors across the one-line-touched store files (`Calendars`, `Contacts`,
  `DevRequests`, `LinkLibrary`, `MovieLibrary`, `QuickAdd`, `QuoteLibrary`,
  `RecipeLibrary`, `UserNotifications`), but every one of them is on a line the
  job does not touch and reproduces identically on the base commit (`22c5a68`,
  verified via `eslint --stdin`). The files carrying the actual logic changes
  (`ApiService.ts`, `Auth.svelte.ts`, `Notes.svelte.ts`, `+layout.svelte`, and
  the tests) are clean. `prettier --check` fails repo-wide (402 files) including
  files untouched by this job (and even `HEAD` versions of unchanged files), i.e.
  pre-existing drift with the installed prettier 3.6.2 + tailwind plugin; not
  introduced here.
- Backend probes: **not possible in this environment** — no dev API is running
  (`http://localhost:8000` refused). The two open backend facts (does `POST
  /auth/refresh` accept an already-expired token? is the old token revoked on
  rotation?) therefore remain unverified; the implementation is deliberately
  agnostic (recovery ladder), so both answers are handled.
- Re-verified in a follow-up pass (same worktree, node 22) — results unchanged
  and no code edits were needed: `npm run check` 0 errors / 0 warnings;
  `npm test` 715 passed with the same single unrelated pre-existing failure
  (`tests/components/logic-leaves.test.ts > StatisticWidget`, a file graph this
  job does not touch); `npx eslint` clean on every changed source file. Also
  confirmed on the branch that TASK-6's audit is accurate: the service worker's
  same-origin GET guard (`src/service-worker.ts`) and `NavProfileEntry`'s
  retry-then-letter fallback are both present and independent of the resume
  work.
- Independently re-verified once more (node 22): `npm run check` → 0 errors /
  0 warnings; `npm test` → 715 passed with the same single unrelated
  `StatisticWidget` component-test failure; ESLint exit 0 on every changed
  source and test file. No code changes were needed; the shared-`ApiService`
   migration is present in all 27 state stores plus `Auth` (no state store still
   constructs its own `ApiService`), and the three i18n keys exist in all four
   language files and the `translation.ts` type.
- Final verification pass (node 22): `npm run check` → 0 errors / 0 warnings;
  `npm test` → 715 passed / 716 with only the pre-existing unrelated
  `StatisticWidget` failure; `npx eslint` exit 0 on every changed file; the four
  focused suites (`ApiService`, `Auth`, `AuthTokenFlow`, `Notes`) → 80/80 pass.
  Re-confirmed TASK-1 (only `Auth` constructs an `ApiService`; 27 stores share
  `auth.apiService`) and TASK-6 (service-worker same-origin GET guard and
  `NavProfileEntry` retry-then-letter fallback both present). No code changes
  were required.
- Independent post-implementation session (node 22, 2026-10-07): `npm run
  check` → 0 errors / 0 warnings; `npm test` → 715 passed / 716 with the same
  single unrelated pre-existing `StatisticWidget` component-test failure (the
  component and its test are untouched by this branch, `git diff` vs. base is
  empty for `src/lib/components/` and `tests/components/`). The 13 ESLint errors
  above reproduce byte-identical on the base commit — none are introduced by
  this job. No code changes were needed; the worktree carries only the
  harness-owned `session.log`/`tokens.json` after this session.

- Independent re-verification (node 22, 2026-10-07, fresh worktree session):
  `npm run check` → 0 errors / 0 warnings; `npm test` → 715 passed / 716 with
  only the pre-existing unrelated `StatisticWidget` component-test failure
  (`git diff 22c5a68 HEAD -- tests/components/ src/lib/components/` is empty, so
  neither file is touched by this branch); branch diff vs. base `22c5a68`
  confirmed to match the task files exactly (33 `state/*.svelte.ts` one-line
  constructor changes + `Auth`, `ApiService`, `Notes`, `+layout.svelte`,
  `notes/+layout.svelte`, the four i18n files, `translation.ts`, and the five
  test files). No code changes were needed.

- Resumed developer session (node 22, 2026-10-07): re-read the tasks against the
  branch and confirmed every task is present and committed — TASK-1 (only `Auth`
  constructs an `ApiService`; the other 27 state stores share `auth.apiService`),
  TASK-2 (`startSessionMonitor`/`validateSession` + hourly interval, single-flight
  `refresh`), TASK-3 (`fetchWithRecovery` 401 ladder with `AUTH_ENDPOINTS`
  bypass), TASK-4 (`Notes.create`/`createCategory` error notifications keeping
  the modal/input), TASK-5 (reactive `$effect` logout guard), TASK-6 (audit kept
  the earlier image fix). `npm run check` → 0 errors / 0 warnings; `npm test` →
  715 passed / 716 with only the pre-existing untouched `StatisticWidget`
  component failure (`git diff 22c5a68 HEAD -- tests/components/ src/lib/components/`
  is empty). No code changes were needed; the worktree is left clean.

- Final developer session (node 22, 2026-10-07): independently re-read the
  branch against tasks.md and confirmed all six implementation tasks committed
  and correct (TASK-1: only `Auth` constructs an `ApiService`, 27 stores share
  `auth.apiService`; TASK-2: `startSessionMonitor`/`validateSession` + hourly
  interval, single-flight `refresh`; TASK-3: `fetchWithRecovery` 401 ladder with
  `AUTH_ENDPOINTS` bypass; TASK-4: `Notes.create`/`createCategory` notifications
  keeping the modal/input; TASK-5: reactive `$effect` logout guard; TASK-6: audit
  kept the earlier image fix). `npm run check` → 0 errors / 0 warnings; `npm test`
  → 715 passed / 716 with only the pre-existing untouched `StatisticWidget`
  component-test failure (`git diff 22c5a68 HEAD -- tests/components/ src/lib/components/`
  empty); `npx eslint` exit 0 on every changed source and test file. No code
  changes were needed.
- Re-run verification (node 22, 2026-10-07): every task remains present and
  committed (TASK-1: only `Auth` constructs an `ApiService`, 27 stores share
  `auth.apiService`, `clear()` nulls the shared token; TASK-2: `startSessionMonitor`
  + hourly `validateSession`, single-flight `refresh`; TASK-3: `fetchWithRecovery`
  401 ladder + `AUTH_ENDPOINTS` bypass; TASK-4: `Notes.create`/`createCategory`
  notifications keeping the modal/input; TASK-5: reactive `$effect` logout guard;
  TASK-6: audit kept the earlier image fix). `npm run check` → 0 errors / 0
  warnings; `npm test` → 715 passed / 716 with only the pre-existing
  `StatisticWidget` failure (`git diff 22c5a68 HEAD -- src/lib/components tests/components`
  is empty); the four focused suites (`ApiService`, `Auth`, `AuthTokenFlow`,
  `Notes`) → 80/80 pass. No code changes were needed.

- Fresh developer session (node 22, 2026-10-07) on
  `feature/cover_reload-after-time-away`: re-read `tasks.md` and independently
  confirmed all six implementation tasks on the branch — TASK-1 (grep shows the
  only `new ApiService(...)` in `src/lib/state/` is `Auth`'s own; every other
  store uses `this.auth.apiService`, and `clear()` nulls the shared token),
  TASK-2 (`startSessionMonitor` with `visibilitychange`/`online` + hourly
  `SESSION_CHECK_INTERVAL_MS`, single-flight `refresh`/`performRefresh`,
  `validateSession` doing the local `expires_at` check then
  `loadAdditionalData`), TASK-3 (`fetchWithRecovery` with the `AUTH_ENDPOINTS`
  bypass and one-shot retry, `recoverFromUnauthorized`/`performRecovery`
  ladder), TASK-4 (`Notes.create`/`createCategory` call
  `notifications.error()` and keep the modal/input on failure), TASK-5
  (`$effect` on `auth.loggedIn` with `wasLoggedIn` guard, excluding
  auth/setup routes), TASK-6 (service-worker same-origin GET guard and
  `NavProfileEntry` retry-then-letter fallback both still present). `npm run
  check` → 0 errors / 0 warnings; `npm test` → 715 passed / 716 with only the
  pre-existing `StatisticWidget` component-test failure (`git diff 22c5a68 HEAD
  -- tests/components/ src/lib/components/` is empty); `npx eslint` exit 0 on
  every changed source and test file. No code changes were needed.

- Resumed developer session (node 22, 2026-10-07, this pass): independently
  re-read `tasks.md` against the branch and confirmed all seven tasks are
  committed and correct — TASK-1 (grep: the only `new ApiService(...)` in
  `src/lib/state/` is `Auth`'s own; 27 other stores use `this.auth.apiService`,
  and `clear()` nulls the shared token), TASK-2 (`startSessionMonitor` +
  `visibilitychange`/`online` + hourly `SESSION_CHECK_INTERVAL_MS`,
  single-flight `refresh`/`performRefresh`, `validateSession` local expiry
  check then `loadAdditionalData`), TASK-3 (`AUTH_ENDPOINTS` bypass,
  `fetchWithRecovery` one-shot retry, `recoverFromUnauthorized`/`performRecovery`
  ladder incl. `adoptExternalSession`), TASK-4 (`Notes.create`/`createCategory`
  call `notifications.error()` and keep the modal/input; three keys present in
  all four i18n files + `translation.ts`), TASK-5 (`$effect` on `auth.loggedIn`
  with `wasLoggedIn` guard, excluding auth/setup routes), TASK-6 (service-worker
  same-origin GET guard and `NavProfileEntry` retry-then-letter fallback both
  present). `npm run check` → 0 errors / 0 warnings; `npm test` → 715 passed /
  716 with only the pre-existing untouched `StatisticWidget` component-test
  failure (`git diff 22c5a68 HEAD -- tests/components/ src/lib/components/` is
  empty); `npx eslint` exit 0 on every changed source and test file. No code
  changes were needed.

- Verification session (node 22, 2026-10-07, this pass, commit after
  `c1435dc`): independently re-read `brief.md`/`tasks.md` and inspected the
  branch diff vs. base `22c5a68` (41 files). Confirmed every task present and
  coherent: TASK-1 (`grep -rn "new ApiService(" src/lib/state` → only `Auth`
  constructs one; the other 33 stores share `auth.apiService`, and `clear()`
  nulls the shared token); TASK-2 (`startSessionMonitor` +
  `visibilitychange`/`online` + hourly `SESSION_CHECK_INTERVAL_MS`,
  single-flight `refresh`/`performRefresh`, `validateSession` local expiry check
  then `loadAdditionalData`); TASK-3 (`AUTH_ENDPOINTS` bypass,
  `fetchWithRecovery` one-shot retry, `recoverFromUnauthorized`/`performRecovery`
  ladder incl. `adoptExternalSession`); TASK-4 (`Notes.create`/`createCategory`
  notify + keep modal/input; the three keys exist in all four i18n files and
  `translation.ts`); TASK-5 (`$effect` on `auth.loggedIn` with `wasLoggedIn`,
  excluding auth/setup routes — `/auth/logout` is covered by `isAuthRoute()`, so
  a manual logout shows no false "session expired"); TASK-6 (service-worker
  same-origin GET guard + `NavProfileEntry` retry-then-letter fallback both still
  present). Gates: `npm run check` → 0 errors / 0 warnings; `npm test` → 715
  passed / 716 with only the pre-existing unrelated `StatisticWidget`
  component-test failure (`git diff 22c5a68 HEAD -- tests/components/
  src/lib/components/` is empty); focused suites (`ApiService`, `Auth`,
  `AuthTokenFlow`, `Notes`) → 80/80 pass; `npx eslint` exit 0 on every changed
  source file. Backend probe re-run: `localhost:8000` refused (no dev API), so
  the two open backend facts remain empirically unverified. No code changes
  were needed.

- Developer verification pass (node 22, 2026-10-07): re-read `brief.md`/`tasks.md`
  and independently confirmed all tasks are implemented and committed on this
  branch (TASK-1: only `Auth` constructs an `ApiService`, the other 27 state
  stores share `auth.apiService`, `clear()` nulls the shared token; TASK-2:
  `startSessionMonitor`/`visibilitychange`+`online`/hourly `validateSession` and
  single-flight `refresh`; TASK-3: `AUTH_ENDPOINTS` bypass + `fetchWithRecovery`
  one-shot retry + `recoverFromUnauthorized`/`performRecovery` ladder; TASK-4:
  `Notes.create`/`createCategory` error notifications keeping the modal/input,
  three keys in all four i18n files + `translation.ts`; TASK-5: `$effect` logout
  guard excluding auth/setup routes; TASK-6: earlier image fix kept). Gates:
  `npm run check` → 0 errors / 0 warnings; focused suites (`ApiService`, `Auth`,
  `AuthTokenFlow`, `Notes`) → 80/80 pass; full `npm test` → 715 passed / 716 with
  only the pre-existing untouched `StatisticWidget` component-test failure;
   `npx eslint` exit 0 on every changed source/test file. No code changes needed.

- Final developer pass (node 22, 2026-10-07, this session): re-read
  `brief.md`/`tasks.md` and inspected the branch diff vs. base `22c5a68`.
  Independently confirmed every task present and correct — TASK-1 (`grep -rn
  "new ApiService(" src/lib/state` → only `Auth` constructs one; 27 other stores
  use `auth.apiService`, and `clear()` nulls the shared token), TASK-2
  (`startSessionMonitor` + `visibilitychange`/`online` + hourly
  `SESSION_CHECK_INTERVAL_MS`, single-flight `refresh`/`performRefresh`,
  `validateSession` local expiry check then `loadAdditionalData`), TASK-3
  (`AUTH_ENDPOINTS` bypass, `fetchWithRecovery` one-shot retry,
  `recoverFromUnauthorized`/`performRecovery` ladder incl.
  `adoptExternalSession`), TASK-4 (`Notes.create`/`createCategory` notify and
  keep modal/input; three keys present in all four i18n files +
  `translation.ts`), TASK-5 (`$effect` on `auth.loggedIn` with `wasLoggedIn`,
  excluding auth/setup routes), TASK-6 (service-worker same-origin GET guard +
  `NavProfileEntry` retry-then-letter fallback both still present). Gates:
  `npm run check` → 0 errors / 0 warnings; `npm test` → 715 passed / 716 with
  only the pre-existing `StatisticWidget` failure (`git diff 22c5a68 HEAD --
  tests/components/ src/lib/components/` is empty); `npx eslint` exit 0 on every
  changed source/test file. No code changes were needed.

- Independent verification session (node 22, 2026-10-07, this pass): re-read
  `brief.md`/`tasks.md` and inspected the branch diff vs. base `22c5a68` (41
  product files). Confirmed every task present — TASK-1 (the only
  `new ApiService(...)` in `src/lib/state/` is `Auth`'s own; 27 other stores
  use `this.auth.apiService`, `clear()` nulls the shared token), TASK-2
  (`startSessionMonitor` + `visibilitychange`/`online` + hourly
  `SESSION_CHECK_INTERVAL_MS`, single-flight `refresh`/`performRefresh`,
  `validateSession` local expiry check then `loadAdditionalData`), TASK-3
  (`AUTH_ENDPOINTS` bypass, `fetchWithRecovery` one-shot retry,
  `recoverFromUnauthorized`/`performRecovery` ladder incl. `adoptExternalSession`),
  TASK-4 (`Notes.create`/`createCategory` notify via `UiNotifications.error()`
  and keep the modal/input; the three keys exist in all four i18n files and
  `translation.ts`), TASK-5 (`$effect` on `auth.loggedIn` with `wasLoggedIn`
  guard, auth/setup routes excluded), TASK-6 (service-worker same-origin GET
  guard + `NavProfileEntry` retry-then-letter fallback both present). Gates:
  `npm run check` → 0 errors / 0 warnings; full `npm test` → 715 passed / 716
  with only the pre-existing untouched `StatisticWidget` component-test failure
  (`git diff 22c5a68 HEAD -- tests/components/ src/lib/components/` is empty);
  focused suites (`ApiService`, `Auth`, `AuthTokenFlow`, `Notes`) → 80/80 pass;
  `npx eslint` exit 0 on every changed source/test file, and the 13 ESLint
  errors in one-line-touched store files reproduce byte-identically on the base
  commit (verified via `eslint --stdin` on `git show 22c5a68:<file>` for four
  representative stores). No code changes were needed.

Manual simulation steps to run against a dev API (or a hand-edited `auth`
localStorage entry):

- (a) Expired token + resume from background → `validateSession` attempts
  `refresh()`; if the backend honors a grace window the request is recovered, if
  not the user is cleanly logged out with the session-expired notice. Determine
  which by observing the refresh response.
- (b) Near-expiry token + resume → refreshed, then `loadAdditionalData()`; notes
  create succeeds.
- (c) Server-invalid token → 401 recovery ladder: with another tab holding a
  fresher token, adopt + retry; otherwise refresh + retry once; only a rejected
  refresh logs out.
- (d) Offline/fetch rejection → no recovery, no logout (transient); re-checked on
  the `online` event.

- Independent developer verification (node 22, 2026-10-07, this session):
  re-read `brief.md`/`tasks.md`, inspected the branch diff vs. base `22c5a68`
  and re-ran the gates. Confirmed all seven tasks are present and coherent:
  TASK-1 (`grep -rn "new ApiService(" src/lib/state` → only `Auth`; all other
  state stores use `auth.apiService`, `clear()` nulls the shared token),
  TASK-2 (`startSessionMonitor` + `visibilitychange`/`online` + hourly
  `SESSION_CHECK_INTERVAL_MS`, single-flight `refresh`/`performRefresh`,
  `validateSession` local expiry check then `loadAdditionalData`), TASK-3
  (`AUTH_ENDPOINTS` bypass, `fetchWithRecovery` one-shot retry,
  `recoverFromUnauthorized`/`performRecovery` ladder incl. `adoptExternalSession`,
  network errors never logout), TASK-4 (`Notes.create`/`createCategory` notify
  and keep modal/input; three keys in all four i18n files + `translation.ts`),
  TASK-5 (`$effect` on `auth.loggedIn` with `wasLoggedIn`, auth/setup routes
  excluded), TASK-6 (service-worker same-origin GET guard + `NavProfileEntry`
  retry-then-letter fallback kept, audit rationale present). Gates re-run:
  `npm run check` → 0 errors / 0 warnings; focused suites (`ApiService`, `Auth`,
  `AuthTokenFlow`, `Notes`) → 80/80 pass; full `npm test` → 715 passed / 716 with
  only the pre-existing untouched `StatisticWidget` failure (`git diff 22c5a68
  HEAD -- tests/components/ src/lib/components/` is empty); `npx eslint` exit 0
  on all changed source/test files. No code changes were required.

- Final developer session (node 22, 2026-10-07, this pass): the branch already
  carried the full implementation, so this session re-verified rather than
  re-implemented. Confirmed by inspection and greps: TASK-1 (no `new
  ApiService(` outside `Auth` in `src/lib/state/` — 27 stores share
  `auth.apiService`, `clear()` nulls the shared token), TASK-2
  (`startSessionMonitor`/`validateSession` with hourly interval and
  single-flight refresh), TASK-3 (`fetchWithRecovery` 401 ladder with
  `AUTH_ENDPOINTS` bypass and one-shot retry), TASK-4 (`Notes.create`/
  `createCategory` error notifications keeping the modal/input; the three i18n
  keys exist in all four languages + `translation.ts`), TASK-5 (`$effect`
  logout guard in `+layout.svelte` excluding auth/setup routes), TASK-6 (both
  profile-image mechanisms untouched vs. base). Gates re-ran clean:
  `npm run check` → 0 errors / 0 warnings; `npm test` → 715 passed / 716 with
  only the pre-existing unrelated `StatisticWidget` component-test failure
  (`git diff 22c5a68 HEAD -- tests/components/ src/lib/components/` empty);
  `npx eslint` exit 0 on every changed source/test file, and the 14 ESLint
  problems in `src/lib/state/` are all on lines the job does not touch (verified
  the only diff in those files is the `apiService` sharing lines). No code
  changes were needed; the worktree was left with only the harness-owned
  `session.log`/`tokens.json` before this session's artifacts were committed.

- Independent verification (node 22, 2026-10-07, this session): re-read
  `brief.md`/`tasks.md` and confirmed the full implementation is already present
  and committed on the branch. Re-ran the gates fresh: `npm run check` → 0
  errors / 0 warnings; focused suites (`ApiService`, `Auth`, `AuthTokenFlow`,
  `Notes`) → 80/80 pass; full `npm test` → 715 passed / 716 with only the
  pre-existing `StatisticWidget` failure (`git diff 22c5a68 HEAD --
  tests/components/ src/lib/components/` is empty, so it is untouched by this
  job). TASK-6 audit spot-checked directly: the service-worker same-origin GET
  guard and `NavProfileEntry`'s `?retry=` cache-bust + letter fallback are both
  present and independent of the resume work. No code changes were needed.

- Independent final verification (node 22, 2026-10-07, this session): re-read
  `brief.md`/`tasks.md` and confirmed all seven tasks are present and committed
  on the branch — TASK-1 (`grep -rn "new ApiService(" src/lib/state` → only
  `Auth`; `clear()` nulls the shared token), TASK-2 (`startSessionMonitor` with
  `visibilitychange`/`online` + hourly `SESSION_CHECK_INTERVAL_MS`,
  single-flight `refresh`/`performRefresh`, `validateSession` local expiry check
  then `loadAdditionalData`), TASK-3 (`AUTH_ENDPOINTS` bypass,
  `fetchWithRecovery` one-shot retry, `recoverFromUnauthorized`/`performRecovery`
  ladder incl. `adoptExternalSession`, network errors never logout), TASK-4
  (`Notes.create`/`createCategory` notify via `UiNotifications.error()` and keep
  modal/input; `session_expired`, `notes.create_error`, `notes.create_folder_error`
  present in all four i18n files + `translation.ts`), TASK-5 (`$effect` on
  `auth.loggedIn` with `wasLoggedIn`, auth/setup routes excluded), TASK-6
  (service-worker same-origin GET guard at `src/service-worker.ts:48-54` +
  `NavProfileEntry` `?retry=`/letter fallback both present). Gates re-run:
  `npm run check` → 0 errors / 0 warnings; focused suites (`ApiService`, `Auth`,
  `AuthTokenFlow`, `Notes`) → 80/80 pass; full `npm test` → 715 passed / 716 with
  only the pre-existing `StatisticWidget` failure (`git diff 22c5a68 HEAD --
  tests/components/ src/lib/components/` empty, so untouched by this job). No
  code changes were needed; the worktree was left with only the harness-owned
  `session.log`/`tokens.json`.

- Review-fix verification (node 22, 2026-10-08, this session): implemented the
  two reviewer blockers (status-aware refresh outcome; try/catch-guarded
  `validateSession`) and re-ran all gates. `npm run check` → 0 errors / 0
  warnings; focused suites (`ApiService`, `Auth`, `AuthTokenFlow`, `Notes`) →
  87/87 pass (7 new tests: 3 × refresh outcome, 3 × `recoverFromUnauthorized`
  transient/rejected/offline, 1 × offline `validateSession`, 2 ×
  `postWithStatus`); full `npm test` → 722 passed / 723 with only the
  pre-existing unrelated `StatisticWidget` component-test failure (`git diff
  22c5a68 HEAD -- tests/components/ src/lib/components/` is empty); `npx eslint`
  exit 0 on all four changed files; `prettier --check` clean on the two test
  files (the pre-existing repo-wide drift in `ApiService.ts`/`Auth.svelte.ts`
  is unchanged and on lines this job does not touch — verified via `npx
  prettier` diff). Diff vs. base `22c5a68` for this session's fix: 4 files
  (`ApiService.ts`, `Auth.svelte.ts`, `Auth.test.ts`, `ApiService.test.ts`).

## Review follow-up (2026-10-08)

A reviewer pass returned NEEDS WORK with two blockers, both fixed on this branch:

**Blocker 1 — transient refresh failures no longer log out.**
`performRefresh()` previously collapsed every non-ok `POST /auth/refresh`
response into `false` (because `ApiService.post` returns `null` for any non-ok
status), so a backend 500/502/503/429 turned into `logout()` via both
`performRecovery()` and `validateSession()`. Fix: `ApiService` gained
`postWithStatus()` (mirrors `post()` but keeps `status`), and
`refresh()` now returns a `'refreshed' | 'transient' | 'rejected'` outcome.
`performRefresh()` maps 401/403 → `'rejected'` (session really dead) and every
other non-ok status → `'transient'` (keep the stored session; the resume/online
checks retry later). `performRecovery()` and `validateSession()` now call
`logout()` exclusively on `'rejected'`.

**Blocker 2 — offline resume no longer leaks an unhandled rejection.**
`validateSession()`'s final `await this.loadAdditionalData()` sat outside any
try/catch, so resuming from background while offline (fetch rejects) produced an
unhandled promise rejection on a normal resume path. Fix: the whole
`validateSession()` body is wrapped in try/catch — offline/transient failures
are swallowed, the session is left alone, and the `online` event / next resume
re-runs the check. No logout.

**Tests added/updated:**
- `tests/unit/auth/Auth.test.ts` — `refresh()` returns
  `'refreshed'`/`'rejected'`/`'transient'`; `recoverFromUnauthorized()` keeps the
  session on a 503 refresh, logs out on a 401 refresh, and keeps it on an
  offline rejection; `validateSession()` swallows a rejecting
  `loadAdditionalData()` (offline resume) without touching the session.
- `tests/unit/services/ApiService.test.ts` — `postWithStatus()` returns the
  payload + status on success and keeps status on failure (and never runs
  recovery, since refresh is an auth endpoint).

## Known issues / follow-ups

- Eight components still build their own `new ApiService(auth.getToken())`
  (`dashboard/Inspiration`, `libraries/shared/Recommender`,
  `calendars/ShareCalendarModal`, `settings/ExportSettings`,
  `settings/TelegramBotConnection`, and the three
  `settings/notifications/Manage*` components). They are outside TASK-1's
  `state/*` scope, so they still snapshot the token and have no 401 handler and
  can drift during a long-lived session. Worth converting to `auth.apiService` in
  a follow-up.
- `NavProfileEntry`'s `failed` flag resets only when `imagePath` changes, so a
  transient image failure that later becomes loadable within the same session
  (same path) still shows the letter fallback until navigation/reload.
- Pre-existing repo-wide `prettier --check` drift and the unrelated
  `StatisticWidget` component-test failure (both present before this job).
