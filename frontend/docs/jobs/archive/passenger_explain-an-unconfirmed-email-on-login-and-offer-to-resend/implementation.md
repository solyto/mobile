# Implementation: Explain an unconfirmed email on login and offer to resend

id: passenger
developer: developer
date: 2026-10-29

## Summary

Login now tells an unconfirmed user to confirm their email and offers a
one-click "Send a new link" using the email already typed in. Every other
failure behaves as before.

## Changes

TASK-1: `Auth.login` uses `postRaw` and returns a `LoginActionResponse`
(`{ success, data?, errors? }`, new type in `src/lib/types/auth.ts`) instead of
a boolean. Success is keyed off `data` being present (as `post` did via
`res.ok`), so the session setup is unchanged. A non-JSON error body
(`SyntaxError` from `res.json()`) returns a plain failure; `RateLimitedError`
and `NetworkError` still propagate. Only caller: the login page.
TASK-2: `src/routes/auth/login/+page.svelte` branches on the result:
`errors` containing `email_unverified` shows an inline message and a
"Send a new link" button (`auth.resendVerification(email, PLATFORM)`, then a
success notification with `resend_verification_sent_desc`). Other failures keep
the `login_error` notification and shake. The flag is cleared on every submit.
Both handlers stop the loading indicator in `finally`. The existing
"Didn't get the confirmation email?" link stays.
TASK-3: New key `auth.login_email_unverified` in `translation.ts` and all five
locales. No subagent tool was available in this session, so I wrote de/es/fr/it
myself following `docs/I18N.md` (informal voice, glossary term for email).
TASK-4: Not run. `node_modules` is not installed in this workspace
(`svelte-kit: not found`), and installing needs approval. The manual run also
needs an API that sends `email_unverified`.

## Known issues / follow-ups

- Still to do: `npm run check`, `npm run lint`, `npm test`, and the manual run
  from the brief.
- Assumed error envelope: `{ success: false, errors: ['email_unverified'] }`
  with status 401 (same as `verify` and the 429 handler). This hasn't been
  checked against the API entry, which isn't in this repo.
- No cooldown on the inline resend button (it's not in the brief). The API's
  429 handling still applies.
- The translator agent should review the four new translations.
