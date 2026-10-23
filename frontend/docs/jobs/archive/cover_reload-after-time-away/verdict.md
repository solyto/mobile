# Verdict: reload after time away

id: cover
status: open
reviewer: opencode (deepseek-v4-flash)
date: 2026-10-08

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

Reviewed branch `feature/cover_reload-after-time-away` against `main`
(`baseBranch` from `.manigot/manigot.json`). The branch diff (41 product files +
job docs) matches `implementation.md`; no unexpected product file changed and
`git diff main...HEAD -- src/lib/components tests/components` is empty. This
session could not run `npm run check` / `npm test` / `npm run lint` (the shell
shim denies non-git commands), so the gates are taken as reported by the
developer and the review is static.

This pass re-checks the two blockers from the previous verdict
(commit `5e182a2`), which the developer addressed in commit `9690428`. Both are
resolved.

TASK-1: PASS
notes: Only `Auth` constructs an `ApiService` (`src/lib/state/Auth.svelte.ts:56`);
all 27 API-using state stores now use `this.auth.apiService` (verified by grep;
`Finances`/`Todos` default parameters updated to `auth.apiService`). `clear()`
(`Auth.svelte.ts:107-115`) nulls the shared token via
`apiService.updateAuthToken(null)`, so no store keeps sending a revoked token,
and every login/refresh/passkey path re-sets it on the shared instance. Tests
updated (`AuthTokenFlow.test.ts`, `storeMocks.ts`). The ~8 components outside
`state/*` that still do `new ApiService(auth.getToken())` are explicitly outside
TASK-1's declared `state/*` scope and are documented as a follow-up; not counted
against this task.

TASK-2: PASS
notes: `startSessionMonitor` (`Auth.svelte.ts:238-258`) registers
`visibilitychange` + `online` behind the `browser` guard and starts/stops the
hourly interval while visible; `validateSession` (`:281-306`) does the local
`expires_at` comparison, single-flight `refresh()`, then `loadAdditionalData()`.
Previous blocker fixed: the whole `validateSession` body is now wrapped in
try/catch (`:284`, `:302-305`), so resuming offline swallows the rejected
`loadAdditionalData()` fetch — no unhandled rejection, no logout; the `online`
event and next resume re-check. A dedicated test covers the offline resume.

TASK-3: PASS
notes: `AUTH_ENDPOINTS` bypass (`ApiService.ts:8-17,38-40`),
`fetchWithRecovery` one-shot retry with the current token (`:46-64`, never
retries twice), network errors propagated untouched, `recoverFromUnauthorized`/
`performRecovery` single-flight with `adoptExternalSession` (`Auth.svelte.ts:191-236`).
Previous blocker fixed: `ApiService.postWithStatus()` (`ApiService.ts:136-147`)
keeps the HTTP status, and `performRefresh` (`Auth.svelte.ts:156-181`) maps
401/403 → `'rejected'` and every other non-ok status → `'transient'`.
`performRecovery` (`:201-219`) and `validateSession` (`:291-298`) call `logout()`
only on `'rejected'`; a 5xx/429 keeps the persisted session. Tests cover
retry-once, decline, auth-endpoint bypass, network error, and the
refreshed/transient/rejected outcomes.

TASK-4: PASS
notes: `Notes.create()` (`Notes.svelte.ts:203-238`) and `createCategory()`
(`:240-281`) call `notifications.error(...)` on failure and keep
`inputValue`/`createParent`/`modalOpen`; they close the modal on success only.
The optimistic `closeModal()` was removed from `routes/notes/+layout.svelte`, and
`ConfirmationModal` does not self-close, so the modal genuinely stays open on
failure. `notes.create_error`, `notes.create_folder_error`, `auth.session_expired`
exist in all four i18n files and `types/translation.ts`. Tests assert the new
behaviour.

TASK-5: PASS
notes: `routes/+layout.svelte:69-92` adds a `$effect` on `auth.loggedIn` with a
`wasLoggedIn` transition guard and a `browser` guard, excludes auth/setup routes
(so `/auth/logout` — the manual logout path — does not show a false
"session expired"), and redirects to login/setup. No redirect loop: after
`goto`, `isAuthRoute()` becomes true and resets the guard.

TASK-6: PASS
notes: Audit performed with no code change, and its factual claims check out: the
service-worker same-origin GET guard (`src/service-worker.ts:48-54`) and
`NavProfileEntry`'s `?retry=` cache-bust + letter fallback
(`src/lib/components/ui/NavProfileEntry.svelte:28-48`) are both present and
independent of the resume work; `loadAdditionalData()`/`profileCache` retention
is justified. Keeping the earlier fix is the low-risk option the task permits.

TASK-7: PASS
notes: `implementation.md` documents the required manual simulation steps (a)-(d)
and honestly records that the two backend facts could not be probed (no dev API
at `localhost:8000`). Given the environment that is acceptable, and the recovery
ladder is deliberately agnostic to both answers. I could not independently
reproduce the reported gate results (see session note above).

## Security

None found. The 401 recovery adopts the persisted same-origin session token
(`Auth.svelte.ts:221-236`) and never logs tokens; auth endpoints are excluded
from recovery so a failed login cannot loop. No secrets added.

## Overall

APPROVED

Both blockers from the previous `5e182a2` verdict are resolved:
1. `performRefresh` no longer treats every non-ok refresh response as a dead
   session — 5xx/429 are `'transient'` and only 401/403 log out.
2. `validateSession` is fully try/catch-guarded, so an offline resume no longer
   produces an unhandled rejection.

No further blockers. Note only (not a blocker, and already recorded as a
follow-up in `implementation.md`): eight components outside `state/*` still
construct their own `ApiService` and therefore do not share the token or the 401
recovery; the previous profile-image `failed`-flag reset is also unchanged.
