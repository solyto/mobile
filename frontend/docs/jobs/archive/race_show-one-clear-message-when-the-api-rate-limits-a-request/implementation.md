# Implementation: Show one clear message when the API rate-limits a request

id: race
developer: developer
date: 2026-10-29

## Summary

A 429 now throws `RateLimitedError` (`retryAfter`, `code`) from `ApiService`. The root
layout's unhandled-rejection handler stops the loading indicator and shows
"Too many attempts. Please try again in {n} minutes." (or "…in a moment"), sharing
the existing network-error throttle. Pages that turned every error into their own
message now let the rate limit through; the verify page shows it in its card; export
shows the translated `export_rate_limited` string.

## Changes

TASK-1: `src/lib/services/ApiService.ts` — `RateLimitedError` next to `NetworkError`;
`fetchWithRecovery` throws it on 429 (no 401 recovery, no retry). `retryAfter` is read
from `meta.retry_after` or a top-level `retry_after` (the API entry was not available
to check which one), `code` from `errors[0]`, both from a clone of the body, null on
anything unexpected. Tests in `tests/unit/services/ApiService.test.ts`.
TASK-2: `src/lib/helpers/NetworkErrorHelper.ts` — `createNetworkErrorHandler` also
handles `RateLimitedError`, through a new `notifyRateLimited(error)` callback and the
same throttle. Tests updated and extended.
TASK-3: `layout.rate_limited`, `rate_limited_minutes_singular/_plural` and
`settings.export_rate_limited_hours_singular/_plural` in `translation.ts` and all five
locales. `rateLimitedMessage` (minutes, rounded up) and `exportRateLimitedMessage`
(hours, rounded up, since the export limit is 24 h) in `NetworkErrorHelper.ts`, with tests.
TASK-4: `src/routes/+layout.svelte` — passes the rate-limit callback.
TASK-5: login — the passkey `catch` rethrows `RateLimitedError`. Password login needs
no change: `auth.login` throws, and the layout stops the indicator and shows the message.
TASK-6: register — no change needed (no local submit state, the throw skips `register_error`).
TASK-7: verify — catches `RateLimitedError`, sets `loaded`, shows the message in the card.
TASK-8: forgot-password — no change needed: the throw skips `sent = true` and the cooldown.
TASK-9: reset-password — no change needed: the throw skips `failed = true`.
TASK-10: confirm-account-deletion page and `AccountDeletionSettings.svelte` rethrow
`RateLimitedError` from their catch-all; `finally` still stops the indicator.
TASK-11: `ExportSettings.svelte` — `try/finally` resets `loading`; `export_rate_limited`
shows the translated message with the remaining hours; other codes go to the layout.

## Known issues / follow-ups

- Not verified: there is no `node_modules` in the workspace, and installing needs
  approval. So `npm test`, `npm run check` and `npm run lint` were not run, and
  neither was the manual run from the brief. Run all of them before merging.
- I couldn't invoke the translator agent from this session, so I wrote de/es/fr/it
  myself following `docs/I18N.md`. They need review by the owner or the translator agent.
- A 429 on `/auth/refresh` now throws instead of returning status 429. The existing
  catches (`refreshOrTransient`, `validateSession`) still treat it as transient.
  `Auth.load()` doesn't catch it, so the layout shows the rate-limit message there,
  which is the same thing that already happens for a `NetworkError`.
- Rate limit and network error share one 5 s throttle, so in a burst only the first
  of the two messages appears.
