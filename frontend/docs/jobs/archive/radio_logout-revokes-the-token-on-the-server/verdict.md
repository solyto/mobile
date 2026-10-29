# Verdict: logout revokes the token on the server

id: radio
reviewer: reviewer
date: 2026-10-29

## Review

TASK-1: PASS
notes: `apiRoutes.auth.logout` added; listed in `AUTH_ENDPOINTS`, so
`fetchWithRecovery` returns a 401 unchanged and never calls the unauthorized
handler. `/auth/logout` prefixes no other route.

TASK-2: PASS
notes: optional trailing `signal` on `postWithStatus` only, passed through
`init`. An abort rejects `fetch` and `send()` wraps it as `NetworkError`.
Existing callers are unchanged.

TASK-3: PASS
notes: `signOut()` posts only when a token is set, uses `AbortSignal.timeout(3000)`,
catches every error (NetworkError, RateLimitedError, abort) and clears state
in `finally`. Non-ok results (401/5xx/426) resolve without an error and also
clear state. It does not go through `expireSession()`. The ApiService token
is kept in sync on login, load and refresh, so the request carries the current token.

TASK-4: PASS
notes: `await auth.signOut()` inside the existing async `onMount`; the delay
and redirect are unchanged. The only user-facing logout (the profile link to
`urls.logout`) goes through this page, so no other UI path skips the server call.

TASK-5: PASS
notes: `expireSession`, `changePassword`, `requestAccountDeletion` and
`confirmAccountDeletion` still call only `logout()`. `implementation.md`
gives a reason for each, which matches the client code and comments.

TASK-6: PASS
notes: covers success (endpoint and signal checked, state and storage cleared),
401/500, a rejecting call, no session-expired handler, and no token. The mocks
match the existing patterns.

TASK-7: PASS
notes: a 401 from logout skips the handler and makes exactly one fetch, and
the signal is passed through to `fetch`.

Scope: nothing changed outside the planned files. Tests, check and lint could
not be run here because `node_modules` is missing. I reviewed them by reading
the code and found no problems.

## Security

Not run separately. This change closes the token-reuse window the brief describes.

## Overall

APPROVED. Nothing needs to change before merging.
