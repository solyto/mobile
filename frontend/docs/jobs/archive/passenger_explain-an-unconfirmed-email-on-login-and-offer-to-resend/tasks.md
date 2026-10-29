# Tasks: Explain an unconfirmed email on login and offer to resend

id: passenger
analyst: analyst
date: 2026-10-29

## Context (verified in the code)

- Branch matches the brief: `feature/passenger_explain-an-unconfirmed-email-on-login-and-offer-to-resend`.
- `auth.login(` has exactly one caller: `src/routes/auth/login/+page.svelte:55`.
- `auth.resendVerification(email, platform)` already exists (`Auth.svelte.ts:274`)
  and is used by `ResendVerificationForm.svelte`, so the `resend-verification-email`
  dependency is already met.
- `apiRoutes.auth.login` is in `AUTH_ENDPOINTS` in `ApiService.ts`, so a 401 from
  login does not trigger session recovery, and `postRaw` is safe to use there.
- `postRaw` calls `res.json()` with no guard, so a response with a non-JSON body
  (e.g. an HTML 502 from a proxy) throws. Today `post` returns `null` on any
  non-OK response, so the page shows `login_error`. See TASK-1 for how to keep that.
- Existing strings can be reused: `auth.resend_verification_send` ("Send a new link")
  for the button, and `auth.resend_verification_sent_desc` for the confirmation.
  Only the message itself is a new string.

## Task breakdown

TASK-1: Make `Auth.login` use `postRaw` and return a typed result carrying the API error codes instead of a bare boolean.
  files: src/lib/state/Auth.svelte.ts, src/lib/types/auth.ts
  depends: none
  risk: medium — this is the only password-login path. A non-JSON error body
    must still count as a plain failure and must not throw, a success has to set
    the session exactly as today, and `RateLimitedError`/`NetworkError` still
    propagate unchanged.
  notes: Add a response type in `types/auth.ts` next to `VerifyActionResponse`
    (e.g. `LoginActionResponse { success: boolean; data?: LoginResponse; errors?: string[] }`).
    Return something the page can branch on, either that response or a small
    `{ success, errors }`. Don't add a new abstraction for it.

TASK-2: On the login page, branch on the result: success as today, `email_unverified` shows the dedicated message and an inline "Send a new link" button, every other failure keeps the `login_error` notification and shake.
  files: src/routes/auth/login/+page.svelte
  depends: TASK-1, TASK-3 (string key)
  risk: medium — UI and flow change on the login screen. The resend handler must
    stop the loading indicator on every exit path (STANDARDS 15.7, try/finally like
    `ResendVerificationForm.send`), and the unverified state must clear on the
    next submit.
  notes: The resend calls `auth.resendVerification(email, PLATFORM)` with the
    email already typed in, then confirms with `resend_verification_sent_desc`
    (a notification is fine). Keep the existing generic "Didn't get the
    confirmation email?" link. Only rendered state is `$state` (STANDARDS 3.6).
    Optional: a cooldown like the one in `ResendVerificationForm`. Ask before
    adding one, it isn't in the brief.

TASK-3: Add the new string `auth.login_email_unverified` ("Please confirm your email address first.") to `translation.ts` and `en.ts`, then hand de/es/fr/it to the `translator` agent.
  files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts,
    src/lib/i18n/es.ts, src/lib/i18n/fr.ts, src/lib/i18n/it.ts
  depends: none
  risk: low — one additive key, and `npm run check` enforces that all locales match.

TASK-4: Verify the change: `npm run check`, `npm run lint`, `npm test`, plus the manual run from the brief (unconfirmed account: wrong password → generic error; correct password → new message and a working resend; a confirmed account still logs in).
  files: none
  depends: TASK-1, TASK-2, TASK-3
  risk: low — verification only. The manual run needs an API that already ships
    the `email_unverified` code.

## Open questions / unclear scope

- **Exact error envelope for `email_unverified` is unverified.** The API entry
  (`api/docs/backlog/login-reports-unverified-email.md`) isn't in this repo.
  This plan assumes the shape used by `verify` and the 429 handler,
  `{ success: false, errors: ['email_unverified'] }` with status 401. If the API
  returns it differently (e.g. `errors: { email: ['email_unverified'] }` or a
  `code` field), TASK-1's type and the check in TASK-2 change. Confirm this
  against the API before implementing.
- Whether the API entry is deployed yet. Without it, the new branch never fires,
  though nothing breaks.
