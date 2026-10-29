# Verdict: Let users request a new confirmation email

id: narrow
reviewer: @reviewer
date: 2026-10-29

## Review

TASK-1: PASS
notes: `apiRoutes.auth.resendVerification`, `urls.resendVerification`, `Auth.resendVerification(email, platform)` mirror `forgotPassword`; endpoint added to `AUTH_ENDPOINTS` in `ApiService.ts`.

TASK-2: PASS
notes: Five new keys in `en.ts` and `AuthRecords`; success copy is neutral and matches the brief. Reuses `email`, `email_error`, `login`, `forgot_password_sent_title`, `forgot_password_resend`.

TASK-3: PASS
notes: The developer wrote the translations because no subagent tool was available. They match the existing `forgot_password_hint` phrasing in each locale and the I18N.md glossary (de "E-Mail", fr "e-mail", it "email", es "correo"). All five locales have the same keys.

TASK-4: PASS
notes: `ResendVerificationForm.svelte` stops the loading indicator in `finally`, does not catch `RateLimitedError`, and sets `sent = true` only after the request resolves. On a 429 during "Send again", no new cooldown starts and the layout shows the rate-limit message. The success text does not reveal whether the address exists.

TASK-5: PASS
notes: `/auth/resend-verification` page follows the forgot-password layout (logo, logged-in redirect, login link).

TASK-6: PASS
notes: The link sits centered below the Sign In button instead of in the password label row ("next to" in the brief). This is a reasonable placement because a second link in that row would not fit on one line on narrow screens, and tasks.md left the placement open. A human should check it visually because no render was taken.

TASK-7: PASS
notes: `token_mismatch` and `token_expired` now render the form, with the existing message as the hint. Other states are unchanged.

TASK-8: PARTIAL (not blocking)
notes: `npm run check` / `npm run lint` were not run because `node_modules` is not installed in this workspace. I couldn't run them either. I checked key parity and types by reading the code and found no issues. These still need a run in CI or locally, and the manual end-to-end flow needs the API deployed.

No changes outside the planned files. No scope creep.

## Security

Not run separately. The generic response is kept: the UI never says whether the address exists or is confirmed.

## Overall

APPROVED

No blockers. Before release: run `npm run check` + `npm run lint` with dependencies installed, and do the manual register → expire → resend → confirm flow once the API change is deployed.
