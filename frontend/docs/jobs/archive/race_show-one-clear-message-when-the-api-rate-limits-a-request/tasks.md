# Tasks: Show one clear message when the API rate-limits a request

id: race
analyst: analyst
date: 2026-10-29

## Task breakdown

TASK-1: Add `RateLimitedError` (fields `retryAfter: number | null`, `code: string | null`) next to `NetworkError` and throw it from `fetchWithRecovery` on status 429, reading `retry_after` and `errors[0]` from a clone of the body (the same way `readMinClientVersion` does), with unit tests.
  files: src/lib/services/ApiService.ts, tests/unit/services/ApiService.test.ts
  depends: none
  risk: medium — every `ApiService` method now rejects on 429 instead of returning a falsy/`res.json()` result, so any caller that doesn't catch it gets an unhandled rejection (TASK-2 covers that); `retry_after` and the codes depend on the API backlog item, so the parser has to tolerate them being missing (where `retry_after` sits in the envelope, `meta` or top level, is not specified: check the API backlog entry, or support the documented shape only).

TASK-2: Make the unhandled-rejection handler also deal with `RateLimitedError`: stop the loading indicator and notify through the same throttle, with a separate message callback that receives the error. This means extending `createNetworkErrorHandler` or adding a sibling that shares the throttle, with unit tests.
  files: src/lib/helpers/NetworkErrorHelper.ts, tests/unit/helpers/NetworkErrorHelper.test.ts
  depends: TASK-1
  risk: low — a pure helper with existing tests; the only catch is not adding a second, separate throttle.

TASK-3: Add the rate-limit strings ("Too many attempts. Please try again in %s minutes." and "…in a moment.") to `en.ts` and `translation.ts`, plus a small pure formatter that turns `retryAfter` seconds into the message (round up to whole minutes) with tests; hand de/es/fr/it to the `translator` agent.
  files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts, src/lib/i18n/it.ts, src/lib/helpers/NetworkErrorHelper.ts (or a sibling helper), tests/unit/helpers/
  depends: TASK-1
  risk: low — additive strings; open points: which section they go in (`layout` next to `network_error` seems natural) and whether to handle singular "1 minute" (decide following docs/I18N.md).

TASK-4: Wire the root layout to the extended handler so an unhandled `RateLimitedError` stops the loading indicator and shows the formatted message.
  files: src/routes/+layout.svelte
  depends: TASK-2, TASK-3
  risk: low — a single call site (lines 87-90).

TASK-5: Login page: password login and passkey login must surface the rate-limit message instead of `login_error` / `passkey_error`. In `signInWithPasskey`, rethrow (or show) `RateLimitedError` from the `catch`. In `onsubmit`, make sure `loadingIndicator.stop()` and the `error` flag are not skipped in a way that leaves the page stuck (`auth.login` will now throw).
  files: src/routes/auth/login/+page.svelte
  depends: TASK-1, TASK-4
  risk: medium — this is the main user-facing fix; if the rethrow lands inside the `catch`, `finally` still stops the indicator, but the layout only sees the error if it is actually rethrown, not swallowed.

TASK-6: Register page: a 429 must not leave the form in a broken state (the indicator is stopped by the layout; no `register_error` and no shake on a 429).
  files: src/routes/auth/register/+page.svelte
  depends: TASK-1, TASK-4
  risk: low — no local submitting flag, so the layout handler is probably enough; check that it really is.

TASK-7: Verify page: catch `RateLimitedError` around `auth.verify`, set `loaded = true`, and show the rate-limit message inside the card instead of leaving the page blank.
  files: src/routes/auth/verify/[user_id]/[token]/+page.svelte
  depends: TASK-1, TASK-3
  risk: low — local change, but it adds a new branch to the card's `{#if}` chain.

TASK-8: Forgot-password page: on a 429 in `onsubmit` or `resend`, neither set `sent = true` nor start the cooldown; leave the message to the layout.
  files: src/routes/auth/forgot-password/+page.svelte
  depends: TASK-1, TASK-4
  risk: low — the throw already skips the lines after the `await`; just confirm nothing shows a fake success.

TASK-9: Reset-password page: a 429 must not set `failed` (which shows "invalid link"); the layout shows the message.
  files: src/routes/auth/reset-password/+page.svelte
  depends: TASK-1, TASK-4
  risk: low — the throw skips the `failed = true` branch; confirm and leave it alone if correct.

TASK-10: Account deletion (confirm page and settings request): both catch all errors and turn them into `failed` / `requestError`. Let `RateLimitedError` through (rethrow) or show the rate-limit message so the user doesn't see a generic failure; `finally` already stops the indicator.
  files: src/routes/auth/confirm-account-deletion/+page.svelte, src/lib/components/settings/AccountDeletionSettings.svelte
  depends: TASK-1, TASK-4
  risk: low — small `catch` change in two places.

TASK-11: Export settings: wrap `startExport` so `loading` always resets (`try/finally`), catch `RateLimitedError` with code `export_rate_limited` and show `ts.get.settings.export_rate_limited` (with the remaining time when `retryAfter` is present) instead of the server's English `message`; other 429 codes fall through to the layout.
  files: src/lib/components/settings/ExportSettings.svelte, possibly src/lib/i18n/*.ts + src/lib/types/translation.ts (if a variant with the remaining time is needed)
  depends: TASK-1, TASK-3
  risk: medium — "with the remaining time if available" means either a new string with a placeholder or appending the TASK-3 message; the brief doesn't say which. Keep the existing string and only add one variant if needed.

## Notes / open points

- `retry_after` and the error codes come from a separate API backlog item (`api/docs/backlog/rate-limit-response-says-when-to-retry.md`, not in this repo). Without it, everything falls back to "…in a moment"; the exact envelope location of `retry_after` should be checked against that entry.
- Other `ApiService` callers outside the table (for example passkey registration in `SecuritySettings.svelte`) are not rate-limited per the brief and are out of scope.
- The hardcoded English strings elsewhere in `ExportSettings.svelte` ("Please select at least one feature.", "Export failed.") are existing violations outside this brief; leave them.
- Manual check from the brief: six wrong logins within a minute → rate-limit message, not `login_error`; the same on verify and forgot-password.
