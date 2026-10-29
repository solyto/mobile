# Implementation: Let users request a new confirmation email

id: narrow
developer: @developer
date: 2026-10-29

## Summary

Users can request a new confirmation link via `POST /auth/resend-verification`,
from a new `/auth/resend-verification` page (linked from login) and directly
on the verify page when the token is expired or mismatched. Both use one
shared form component.

## Changes

TASK-1: `apiRoutes.auth.resendVerification`, `urls.resendVerification`, `Auth.resendVerification(email, platform)`; added to `AUTH_ENDPOINTS` in `ApiService.ts` like `forgotPassword`.
TASK-2: `resend_verification_{link,title,hint,send,sent_desc}` in `en.ts` and `types/translation.ts`. Reuses `email`, `email_error`, `login`, `forgot_password_sent_title` ("Check your inbox!") and `forgot_password_resend` ("Send again").
TASK-3: `de`, `es`, `fr`, `it` translations. No subagent tool was available in this session, so I wrote them myself following `docs/agents/translator.md` and `docs/I18N.md` (informal address, glossary "Email" terms, French spacing before `?`). Please review `de`.
TASK-4: `src/lib/components/auth/ResendVerificationForm.svelte` — email field, send button, neutral success message, 60 s "Send again" cooldown. Loading indicator stops in `finally`; errors (incl. `RateLimitedError`) are not caught, so the success state is only reached after a resolved request. Props: optional `title`, required `hint`.
TASK-5: `src/routes/auth/resend-verification/+page.svelte`, laid out like forgot-password (logo, redirect home if logged in, login link).
TASK-6: Login page: "Didn't get the confirmation email?" link centered below the Sign In button inside the form card. The password label row already holds "Forgot Password?", so a second link there would not fit one line on narrow screens.
TASK-7: Verify page: the `token_mismatch` / `token_expired` messages are now the form's hint, with the form below them.
TASK-8: `npm run check` / `npm run lint` could not run: `node_modules` is not installed in this workspace and installing was not authorised. Locale key parity was checked by hand (5 new keys in all five locales and in the type).

## Known issues / follow-ups

- Run `npm run check` and `npm run lint` with dependencies installed.
- Manual flow (register → expire token in DB → open link → request new → confirm with new mail) needs the API change deployed and must be done by a human.
- No `shot` render was taken (no dev server/dependencies); the login link placement should be checked visually.
