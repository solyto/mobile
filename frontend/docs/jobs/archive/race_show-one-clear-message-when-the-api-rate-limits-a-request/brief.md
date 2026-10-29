# Brief: Show one clear message when the API rate-limits a request

type: feature
id: race
branch: feature/race_show-one-clear-message-when-the-api-rate-limits-a-request
date: 2026-10-29
author: Leander Muskalla

## What

Handle 429 in one place, the same way network failures are handled:

1. In `ApiService.fetchWithRecovery` (`src/lib/services/ApiService.ts`, next
   to the 426 branch), throw a new `RateLimitedError` on status 429. It
   carries `retryAfter` (seconds or null) and `code` (`errors[0]`, e.g.
   `too_many_requests`, `export_rate_limited`), both read from a clone of the
   body, like `readMinClientVersion` does. It sits next to `NetworkError`.
2. In the root layout (`src/routes/+layout.svelte:87-106`), handle unhandled
   `RateLimitedError` rejections like `NetworkError`: stop the loading
   indicator and show "Too many attempts. Please try again in {n} minutes."
   (or "…in a moment" without `retryAfter`). Extend `NetworkErrorHelper` or add
   a sibling helper. Don't duplicate the throttling of repeated notifications.
3. Go through every caller of a rate-limited endpoint and make sure a thrown
   `RateLimitedError` neither leaves the page stuck nor gets turned into the
   wrong message:

   | Endpoint | Caller | What to check |
   |---|---|---|
   | login, passkey options/authenticate | `routes/auth/login/+page.svelte` | the passkey `catch` turns everything into `passkey_error`: let `RateLimitedError` through |
   | register | `routes/auth/register/+page.svelte` | submit state resets |
   | verify | `routes/auth/verify/[user_id]/[token]/+page.svelte` | `loaded` is never set and the page stays blank: catch it and show the message in the card |
   | forgot-password | `routes/auth/forgot-password/+page.svelte` | no success message after a 429 |
   | reset-password | `routes/auth/reset-password/+page.svelte` | not shown as "invalid link" |
   | confirm-account-deletion, me/deletion-request | `routes/auth/confirm-account-deletion/+page.svelte`, the deletion request in settings | submit state resets |
   | export start | `components/settings/ExportSettings.svelte:67` | catch `export_rate_limited` and show the existing, unused `export_rate_limited` string (with the remaining time if available) instead of the server's English `message` |

   A page that keeps its own state (submitting flags, `loaded`) needs a
   `try/finally` or its own `catch`. A page that only stops the loading
   indicator can rely on the layout handler.
4. New strings in all five locales and `translation.ts`, following
   `docs/I18N.md`.

## Why

The API rate-limits login, register, verify, forgot/reset password, passkey
login, account deletion and export. Today the app shows a 429 as something
else: "login error" (users think the password is wrong and reset it), a fake
success on forgot-password, a dead end on the verify page, and an untranslated
server message on export.

## Steps

1. `RateLimitedError` and the 429 branch in `ApiService`, with tests next to
   the existing `ApiService` and `NetworkErrorHelper` tests.
2. Layout handler and strings.
3. The caller audit from the table, one page at a time.

## Out of scope

Disabling a form until the wait time is over. Showing the message is enough.

## Notes

- Needs `api/docs/backlog/rate-limit-response-says-when-to-retry.md` for
  `retry_after` and the codes. Without it, the message falls back to "…in a
  moment".
- Do this before `resend-verification-email.md`. Its form then gets 429 handling
  from this change and needs nothing of its own.
- Safety: `check` and the unit tests, plus a manual run: six wrong logins
  within a minute → the rate-limit message, not `login_error`; the same on
  the verify page and on forgot-password.
- Check: `grep -rn "RateLimitedError" src/lib/services/ApiService.ts` → at
  least 1.
