# Brief: Explain an unconfirmed email on login and offer to resend

type: feature
id: passenger
branch: feature/passenger_explain-an-unconfirmed-email-on-login-and-offer-to-resend
date: 2026-10-29
author: Leander Muskalla

## What

When login returns 401 with the error code `email_unverified` (see
`api/docs/backlog/login-reports-unverified-email.md`), show "Please confirm
your email address first" instead of the generic `login_error`. Add a
"Send a new link" action that calls `auth.resendVerification(email, PLATFORM)`
with the email already typed in, so the user doesn't have to enter it again.

`auth.login` (`src/lib/state/Auth.svelte.ts:113`) uses `apiService.post`, which
returns `null` for any non-OK response, and the method returns a bare boolean.
Switch it to `postRaw` (like `verify` and `resetPassword`) and return enough
for the page to tell `email_unverified` apart from other failures. Update the
callers in `src/routes/auth/login/+page.svelte`.

## Why

Today an unconfirmed user gets "login error" and assumes the password is wrong.
They reset it, which doesn't help either, because a password reset doesn't
confirm the email.

## Steps

1. `Auth.login` returns a result that carries the error codes.
2. Login page: a dedicated message and a resend action for `email_unverified`.
   Every other failure behaves as today.
3. Strings in all five locales and `translation.ts`.

## Notes

- Depends on the API entry and on `resend-verification-email.md` (for
  `auth.resendVerification`).
- Check that the other callers of `auth.login` still compile, if there are any
  (`grep -rn "auth.login(" src`).
- Safety: `check`, plus a manual run with an unconfirmed account: wrong
  password → generic error; correct password → the new message and a working
  resend.
