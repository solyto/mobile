# Brief: logout revokes the token on the server

type: feature
id: radio
branch: feature/radio_logout-revokes-the-token-on-the-server
date: 2026-10-29
author: Leander Muskalla

## What

Logging out only clears local state. `Auth.logout()`
(`src/lib/state/Auth.svelte.ts:182`) calls `this.clear()`, and nothing in the
app calls `POST /auth/logout` (there is not even an `apiRoutes.auth.logout`).
The token therefore stays valid on the server until it expires: 7 days on web,
90 days on mobile and desktop.

Make a user-initiated logout revoke the token on the server first.

## Why

A user who logs out expects that session to be over. Today anyone who copied
the token (shared computer, leaked localStorage) keeps full access for up to
90 days.

It is also the prerequisite for the Android widgets (job 1 of 6 in
`solyto/mobile` `docs/reports/android-homescreen-widgets-decisions.md`, D13).
The widget token is deleted together with its session token (cascade), so
logout only ends widget access if the server token is revoked.

## Steps

1. Add `logout: API_URL + '/auth/logout'` to `apiRoutes.auth` and add it to
   `AUTH_ENDPOINTS` in `ApiService.ts`. A 401 from logout (token already gone)
   must never start the refresh/expire recovery, or logout could loop.
2. Add an async method on `Auth` for a user-initiated logout (for example
   `signOut()`): `POST /auth/logout` with the current token, then the existing
   local `logout()`. Clear local state whatever the outcome: offline, 401 and
   5xx must not keep the user logged in. Keep the request short (a timeout of
   a few seconds), so logging out offline does not hang.
3. Use it in `src/routes/auth/logout/+page.svelte`.
4. Leave the other `logout()` callers on local-only clearing, because their
   server token is already gone or invalid: `expireSession()` (session
   rejected), and the account-deletion and password flows at
   `Auth.svelte.ts:302,311,317` (check each and note in the implementation
   which one does what on the server).
5. Tests (vitest): a successful logout calls the endpoint and clears state; a
   failed or offline call still clears state; a 401 from logout does not run
   `recoverFromUnauthorized`.

## Out of scope

- "Log out everywhere" in the UI.
- Any change to the API: `POST /auth/logout` already exists and deletes the
  current token.

## Notes

- Applies to web, desktop and mobile alike. Behaviour change for users: after
  logout, the token stops working at once.
- Old self-hosted servers have had `POST /auth/logout` for a long time, so no
  version check is needed.
