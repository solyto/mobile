# Tasks: logout revokes the token on the server

id: radio
analyst: analyst
date: 2026-10-29

## Findings from reading the code

- `apiRoutes.auth` (`src/lib/config/apiRoutes.ts:11`) has no `logout` entry;
  `src/lib/config/urls.ts:24` `logout: '/auth/logout'` is the *frontend page*
  route, not the API — do not confuse the two.
- `AUTH_ENDPOINTS` (`src/lib/services/ApiService.ts:11`) is matched with
  `startsWith`; `API_URL + '/auth/logout'` prefixes no other route, so adding it
  is safe.
- `ApiService` has no timeout/abort support today. `fetchWithRecovery` spreads
  `init` into `fetch`, so a `signal` passes straight through, and an aborted
  fetch is already wrapped as `NetworkError` by `send()`. `postWithStatus`
  takes no `init`/`signal` parameter yet.
- `postWithStatus` throws on network errors (`NetworkError`) and on 429
  (`RateLimitedError`), returns `{ ok: false }` on 401/5xx, and on 426 returns
  the response after notifying the upgrade handler. `signOut()` must handle all
  of these and still clear local state.
- `logout()` callers besides the logout page: `expireSession()` (`:191`),
  `changePassword` (`:302`, comment says the API revokes every token on
  success), `requestAccountDeletion` (`:311`, account already deleted when
  `status === 'deleted'`), `confirmAccountDeletion` (`:317`, token-link flow;
  the confirm endpoint is in `AUTH_ENDPOINTS` and deletes the account, so its
  tokens go with it). All stay local-only.
- Existing tests: `tests/unit/auth/Auth.test.ts` (mocks `ApiService` with
  `api.postWithStatus` etc.; has a `describe('logout')` block at `:438`) and
  `tests/unit/services/ApiService.test.ts` (has `'never runs recovery for auth
  endpoints'` at `:345`, pattern to copy).

## Task breakdown

TASK-1: Add `logout: API_URL + '/auth/logout'` to `apiRoutes.auth` and add `apiRoutes.auth.logout` to `AUTH_ENDPOINTS` so a 401 from logout never triggers the unauthorized recovery.
  files: src/lib/config/apiRoutes.ts, src/lib/services/ApiService.ts
  depends: none
  risk: low — one route constant and one list entry, matched by an existing prefix check.

TASK-2: Let a caller bound a request by time: add an optional `signal?: AbortSignal` parameter to `ApiService.postWithStatus` and pass it through `init` (an abort surfaces as the existing `NetworkError`).
  files: src/lib/services/ApiService.ts
  depends: none
  risk: low — optional trailing parameter, existing callers unchanged; keep it to this one method, do not add a general timeout abstraction.

TASK-3: Add `async signOut(): Promise<void>` on `Auth` that calls `postWithStatus(apiRoutes.auth.logout, {}, AbortSignal.timeout(<few seconds, e.g. 3000>))` with the current token when one is set, swallows any outcome (non-ok status, `NetworkError`, `RateLimitedError`, abort) and always ends with the existing local `logout()` (e.g. via `try { … } catch { … } finally { this.logout(); }`).
  files: src/lib/state/Auth.svelte.ts
  depends: TASK-1, TASK-2
  risk: medium — must never leave the user logged in or hang offline; also must not fire `sessionExpiredHandler` (it doesn't go through `expireSession`, keep it that way).

TASK-4: Switch `src/routes/auth/logout/+page.svelte` from `auth.logout()` to `await auth.signOut()`, keeping the existing 1.5 s delay and redirect.
  files: src/routes/auth/logout/+page.svelte
  depends: TASK-3
  risk: low — one call inside an already async `onMount`.

TASK-5: Leave `expireSession()`, `changePassword`, `requestAccountDeletion` and `confirmAccountDeletion` on local `logout()`, and record in `implementation.md` for each why no server call is needed (session rejected / API revokes all tokens on password change / account and its tokens deleted).
  files: docs/jobs/radio_logout-revokes-the-token-on-the-server/implementation.md (no code change expected)
  depends: TASK-3
  risk: low — documentation only; flag it instead if any of those claims turns out wrong when checked.

TASK-6: Unit tests in `tests/unit/auth/Auth.test.ts` (new `describe('signOut')`): success calls `postWithStatus` with `apiRoutes.auth.logout` and a signal, then clears state and storage; `{ ok: false, status: 401 }`, `{ ok: false, status: 500 }`, and a rejecting call (offline/abort) each still clear state and resolve without throwing; `sessionExpiredHandler` is not fired.
  files: tests/unit/auth/Auth.test.ts
  depends: TASK-3
  risk: low — mocks already exist for `postWithStatus`.

TASK-7: Unit tests in `tests/unit/services/ApiService.test.ts`: a 401 from `apiRoutes.auth.logout` does not call the unauthorized handler and does not retry (copy of the test at `:345`), and `postWithStatus` forwards the given `signal` to `fetch`.
  files: tests/unit/services/ApiService.test.ts
  depends: TASK-1, TASK-2
  risk: low — follows existing test patterns.

## Notes / open points

- No UI strings change, so no i18n work.
- Exact timeout value is not fixed by the brief ("a few seconds"); 3 s is a suggestion, developer's call.
- If the developer prefers not to touch `ApiService` (TASK-2), the alternative is racing the request against a timer inside `signOut()`; that leaves the fetch running in the background, so the `signal` approach is preferred.
