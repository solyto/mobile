# Implementation: logout revokes the token on the server

id: radio
developer: developer
date: 2026-10-29

## Summary

A user-initiated logout now calls `POST /auth/logout` (3 s timeout) before
clearing local state. Local state is cleared whatever the outcome (offline,
timeout, 401, 5xx, 429). A 401 from the logout endpoint never starts the
refresh/expire recovery.

## Changes

TASK-1: `src/lib/config/apiRoutes.ts` — added `apiRoutes.auth.logout`.
`src/lib/services/ApiService.ts` — added it to `AUTH_ENDPOINTS`, so a 401 is
returned as is and `recoverFromUnauthorized` never runs for it.

TASK-2: `src/lib/services/ApiService.ts` — `postWithStatus` takes an optional
`signal` and passes it to `fetch`; an abort surfaces as the existing
`NetworkError`.

TASK-3: `src/lib/state/Auth.svelte.ts` — new `signOut()`: posts to
`apiRoutes.auth.logout` with `AbortSignal.timeout(3000)` when a token is set,
swallows every error, and always ends with the existing `logout()`. It does not
go through `expireSession()`, so the session-expired handler is not fired.

TASK-4: `src/routes/auth/logout/+page.svelte` — `await auth.signOut()` instead
of `auth.logout()`; the 1.5 s delay and redirect are unchanged.

TASK-5: the other `logout()` callers stay local-only (no code change):
- `expireSession()` — runs only after the server rejected the token (refresh
  answered 401/403), so there is nothing left to revoke.
- `changePassword()` — logs out only on success; per the existing comment the
  API revokes every token of the user on a password change, including this one.
- `requestAccountDeletion()` — logs out only when `status === 'deleted'`: the
  account is already deleted, its tokens with it.
- `confirmAccountDeletion()` — token-link flow; on success the account is
  deleted, and its tokens with it.
These claims are taken from the client code and its comments; the API itself
was not inspected (separate repo).

TASK-6: `tests/unit/auth/Auth.test.ts` — `describe('signOut')`: success calls
the endpoint with an `AbortSignal` and clears state + storage; 401 and 500 and
a rejecting call still clear state and resolve; the session-expired handler is
not fired; no request without a token.

TASK-7: `tests/unit/services/ApiService.test.ts` — a 401 from
`apiRoutes.auth.logout` does not call the unauthorized handler and does not
retry; `postWithStatus` forwards the given signal to `fetch`.

## Known issues / follow-ups

- `node_modules` is not installed in this worktree, so `npm test`, `npm run
  check` and `npm run lint` could not be run (installing packages needs
  approval). Please run them before merging.
