# Tasks: Let users request a new confirmation email

id: narrow
analyst: @analyst
date: 2026-10-29

## Context checked

- Branch matches brief (`feature/narrow_let-users-request-a-new-confirmation-email`).
- Prerequisite `show-rate-limit-message` is already in: `ApiService` throws
  `RateLimitedError` on 429 (`src/lib/services/ApiService.ts:35,144`), and the
  root layout's unhandled-rejection handler stops the loading indicator and
  shows the message (`src/lib/helpers/NetworkErrorHelper.ts`). So a form that
  does `start(); await auth.resendVerification(...); stop(); sent = true;`
  never reaches `sent = true` on a 429 — no catch needed, just don't swallow
  the error.
- `/auth/*` routes are already reachable logged-out (`isAuthRoute()` in
  `src/lib/helpers/NavHelper.ts`), so the new page needs no guard change.
- The verify page's error codes are `token_expired` / `token_mismatch`
  (the brief's `verify_token_expired` is the i18n key, not the code).

## Task breakdown

TASK-1: Add the `resendVerification` API route, the `/auth/resend-verification` client URL, and `Auth.resendVerification(email, platform)` next to `forgotPassword`.
  files: src/lib/config/apiRoutes.ts, src/lib/config/urls.ts, src/lib/state/Auth.svelte.ts, src/lib/services/ApiService.ts (add to `AUTH_ENDPOINTS`, same as `forgotPassword`, so a stray 401 never triggers session recovery)
  depends: none
  risk: low — additive, mirrors `forgotPassword` one-to-one.

TASK-2: Add the English strings (form title, hint, send button, neutral success title/message, login-page link "Didn't get the confirmation email?") to `en.ts` and the `AuthRecords` type, reusing existing keys (`email`, `email_error`, `login`, `forgot_password_resend`) where they fit.
  files: src/lib/i18n/en.ts, src/lib/types/translation.ts
  depends: none
  risk: low — strings only; keep copy short per "less text in UIs".

TASK-3: Hand the new keys to the `translator` agent for `de`, `es`, `fr`, `it` per docs/I18N.md.
  files: src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts, src/lib/i18n/it.ts
  depends: TASK-2
  risk: low — `npm run check` fails until all locales match, so gaps are caught.

TASK-4: Build a shared `ResendVerificationForm` component (email field, send button, neutral success state, resend cooldown like forgot-password) that calls `auth.resendVerification(email, PLATFORM)` and only flips to success after the await resolves.
  files: src/lib/components/auth/ResendVerificationForm.svelte (new)
  depends: TASK-1, TASK-2
  risk: medium — must stop the loading indicator on every exit path (STANDARDS 15.7) and must not catch/swallow `RateLimitedError`; the success text must not echo whether the address exists.

TASK-5: Add the page `src/routes/auth/resend-verification/+page.svelte`, laid out like the forgot-password page (logo, redirect home if logged in, login link) and rendering the shared form.
  files: src/routes/auth/resend-verification/+page.svelte (new)
  depends: TASK-4
  risk: low — copies an existing page's structure.

TASK-6: Link to the new page from the login page as "Didn't get the confirmation email?" next to the "Forgot password" link.
  files: src/routes/auth/login/+page.svelte (~line 124–131)
  depends: TASK-1, TASK-2
  risk: low — but the "Forgot password" link sits inside the password label row; placement of a second link there (or below the form) is a layout choice, so check it stays one line on narrow screens.

TASK-7: Render the shared form under the `token_expired` and `token_mismatch` messages on the verify page.
  files: src/routes/auth/verify/[user_id]/[token]/+page.svelte
  depends: TASK-4
  risk: low — the page already branches on those two codes; the form just appears below the existing text.

TASK-8: Run `npm run check` and `npm run lint`; note in implementation.md that the manual flow (register → expire token in DB → open link → request new → confirm) needs the API change deployed and must be done by a human.
  files: none (verification only)
  depends: TASK-1..TASK-7
  risk: low — no unit-testable pure logic is added, so no new Vitest tests are expected.

## Open points (not blocking)

- The brief does not say whether the new page/verify form should prefill the
  email; the verify URL only carries `user_id`, so there is nothing to
  prefill. Assumed: empty field.
- Resend cooldown on the success state is assumed to mirror forgot-password
  (60 s); drop it if the reviewer prefers a single-shot form.
