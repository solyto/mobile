# Brief: Let users request a new confirmation email

type: feature
id: narrow
branch: feature/narrow_let-users-request-a-new-confirmation-email
date: 2026-10-29
author: Leander Muskalla

## What

Use the new API endpoint `POST /auth/resend-verification` (`{ email, platform }`,
always a generic 200; see `api/docs/backlog/resend-verification-email.md`) in
two places:

1. **Verify page, expired-token state**
   (`src/routes/auth/verify/[user_id]/[token]/+page.svelte`). Under
   `verify_token_expired`, show an email field and a "Send a new link"
   button. On submit, show a neutral success message ("If an unconfirmed
   account exists for this address, we've sent a new link"). The
   `token_mismatch` state gets the same form, because a mismatch also happens
   when an older link is opened after a newer one replaced it.
2. **New page `/auth/resend-verification`**, built like
   `src/routes/auth/forgot-password/+page.svelte`. Link to it from the login
   page as "Didn't get the confirmation email?", next to the
   "Forgot password" link (`src/routes/auth/login/+page.svelte:124`).

Add `auth.resendVerification(email, platform)` next to `forgotPassword` in
`src/lib/state/Auth.svelte.ts`, plus the route in `apiRoutes` and `urls`.

## Why

An account whose link expired after 24h, or whose mail never arrived, can't
log in and has no way to get a new link. The verify page currently ends at
"The token has expired" with nothing to do next.

## Steps

1. API route, `urls.resendVerification`, `Auth.resendVerification`.
2. New page and the link on the login page.
3. The form in the expired and mismatch states of the verify page (it can
   share a component with the new page).
4. Strings in all five locales (`src/lib/i18n/{de,en,es,fr,it}.ts`) and
   `src/lib/types/translation.ts`, following `docs/I18N.md`.
5. A 429 is handled app-wide by `show-rate-limit-message.md`, which has to be
   done first: `ApiService` throws `RateLimitedError` and the layout shows the
   message. The form only has to make sure it doesn't show its success
   message or stay stuck in a submitting state.

## Out of scope

Telling the user whether the address exists or is already confirmed. The
response is generic on purpose.

## Notes

- Needs the API change deployed first. The web app ships together with the
  API, but older desktop and F-Droid builds won't have the link. That's
  fine, because nothing changes for them.
- Pass `PLATFORM` as `platform` so the mail's link opens the right app.
- Safety: `check`, plus a manual run: register, expire the token in the
  database, open the link, request a new one, confirm with the new mail.
