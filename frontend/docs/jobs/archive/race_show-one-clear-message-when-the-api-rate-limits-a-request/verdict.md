# Verdict: Show one clear message when the API rate-limits a request

id: race
reviewer: reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD`. Every changed file is covered by tasks.md and
implementation.md; nothing out of scope. The two `chore: commit all` commits only
touch brief.md/tasks.md.

TASK-1: PASS
notes: `RateLimitedError` sits next to `NetworkError`; the 429 branch in `fetchWithRecovery` comes after 426 and before 401 recovery, so there is no recovery and no retry. The body is read from a clone and tolerates a non-JSON body and missing fields. Tests cover the envelope, top-level `retry_after`, the null fallbacks and no-recovery. Brief check: `grep RateLimitedError ApiService.ts` → 4 hits.

TASK-2: PASS
notes: `createNetworkErrorHandler` gets a separate `notifyRateLimited(error)` callback and shares the single throttle (no second throttle). The existing tests are updated, and there are new tests for routing and the shared throttle.

TASK-3: PASS
notes: The `_singular`/`_plural` pairs and the `{n}` placeholder follow docs/I18N.md and existing keys such as `period_sports_*`. All five locales and `translation.ts` are updated. Minutes are rounded up with a floor of 1. Tests compare against `en`.

TASK-4: PASS
notes: `+layout.svelte` passes `rateLimitedMessage(error.retryAfter, ts.get.layout)`.

TASK-5: PASS
notes: The passkey `catch` rethrows `RateLimitedError`, `finally` still stops the indicator, and the layout shows the message. For password login, the throw from `auth.login` skips `login_error`, and the layout stops the indicator.

TASK-6: PASS
notes: register has no local submit flag, and the throw skips `register_error` and the shake. No change is needed.

TASK-7: PASS
notes: The verify page catches only `RateLimitedError`, always sets `loaded`, and shows the message as the first `{#if}` branch in the card.

TASK-8: PASS
notes: In both `onsubmit` and `resend`, the throw skips `sent = true` and `startCooldown()`. No change is needed.

TASK-9: PASS
notes: The throw skips `failed = true`, so there is no "invalid link". No change is needed.

TASK-10: PASS
notes: The confirm page and `AccountDeletionSettings.svelte` both rethrow `RateLimitedError` before setting `failed`/`requestError`. `finally` still stops the indicator.

TASK-11: PASS
notes: `try/finally` resets `loading`. Only `export_rate_limited` is caught, and it is shown through `exportRateLimitedMessage` (hours, rounded up). Other errors are rethrown to the layout.

Not verified by me: there is no `node_modules` in the workspace, so I could not run `npm test`, `npm run check` or `npm run lint`, and I did not do the manual six-logins run either. I checked the tests by reading them against `fetchWithRecovery` and the existing 426 test mocks, and they look correct. The developer wrote the de/es/fr/it strings themselves instead of using the translator agent (flagged in implementation.md). They follow the existing voice (du/tu) and placeholders.

## Security

none (not run)

## Overall

APPROVED

No blockers.
