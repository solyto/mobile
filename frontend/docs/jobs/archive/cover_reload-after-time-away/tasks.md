# Tasks: reload after time away

id: cover
status: open
analyst:
date: 2026-08-19

<!-- Produced by @analyst from brief.md. -->

## Diagnosis

The session is validated exactly once, at app boot:

- `Auth` (constructor → `load()`) checks `authToken.expires_at`, refreshes only if
  within 5 days (web) / 14 days (native), then fetches `/users/me`. Nothing ever
  re-runs this while the app stays open — no timer, no `visibilitychange` hook.
- Every feature store snapshots the token at construction
  (`new ApiService(this.auth.getToken())`), and `Auth.refresh()` only updates
  Auth's own `ApiService` instance. A refreshed token never reaches the stores.
- `ApiService` swallows every non-ok response (`res.ok ? … : null/false`): no 401
  handling, no retry, no logout, no user feedback.

So a permanently-open tab drifts into a zombie state: `loggedIn === true` in
memory, token expired/invalid → all API calls fail silently (`Notes.create()`
returns `null` and the modal just closes — "nothing happens"; user data incl.
`profile.profile_image_path` is never re-fetched). A hard reload re-runs
`Auth.load()` (expiry check → refresh → `loadAdditionalData()`), which is why
reloading fixes everything.

The earlier profile-image fix (re-fetching `/users/me` via `loadAdditionalData()`
+ `save()`) most likely addressed a symptom of this same root cause; with a
proper resume-driven session check it is probably redundant — audited in TASK-6.

Out of scope: service worker changes (it already skips API calls), backend
token TTL changes, refactoring all stores to a shared ApiService beyond what
token propagation requires.

## Task breakdown

TASK-1 (decided: Option B): Share Auth's `ApiService` instance across stores.
`Auth` already owns an `ApiService` and keeps its token current on
login/refresh; replace each store's `new ApiService(this.auth.getToken())`
with `this.auth.apiService` (one mechanical line per store) so a runtime
refresh reaches every request automatically. `logout()` must clear the token on
that shared instance so no store keeps sending the old token. Do not touch
unrelated store logic.
files: src/lib/state/Auth.svelte.ts, plus the one-line constructor change in
src/lib/state/*.svelte.ts (~36 stores)
depends: none
risk: medium — every API call now goes through one shared instance; the change
is mechanical per store and covered by `npm run check`.

TASK-2: Re-validate the session when the app is used again after time away:
on `visibilitychange` → visible (and `online`), plus a low-frequency interval
while visible (e.g. hourly), check `expires_at` — expired → logout; within
refresh threshold → `refresh()` (single-flight: never two concurrent refreshes);
then `loadAdditionalData()` to refresh the in-memory user incl. profile image
path. Guard all listener registration with `browser` (no SSR access to
`document`). Follow the existing `UserNotifications` pattern
(`visibilitychange` + interval, interval stopped while hidden). The routine
check is a local date comparison — no network unless action is needed.
files: src/lib/state/Auth.svelte.ts
depends: TASK-1
risk: medium — new lifecycle listeners and async races; must not double-refresh,
must behave sanely on the desktop/mobile shells (app resume vs. tab visibility).

TASK-3: Global 401 recovery in `ApiService` — logout strictly as the last
resort. On a 401 from a non-auth endpoint, run a recovery ladder:
(a) re-read the persisted auth from localStorage — if another tab refreshed
the token (multi-tab staleness), adopt it and retry the request (covers
"stale token although user is still authed"); (b) otherwise single-flight
`refresh()` and retry the original request exactly once with the new token;
(c) only log out (with UI notification + redirect via TASK-5) if the refresh
itself fails with a definitive auth rejection. Network errors (fetch
rejection / offline) must NOT log out — they are transient and Layer 2
re-checks on `online`. Must explicitly bypass the auth endpoints
(`auth.login`, `auth.refresh`, forgot/reset password, passkey authenticate) —
a failed login legitimately returns 401 and must not trigger recovery. Never
retry a request more than once. New user-visible strings must be added to all
four i18n files.
files: src/lib/services/ApiService.ts, src/lib/state/Auth.svelte.ts,
src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
depends: TASK-1, TASK-2
risk: high — retry-on-401 logic can loop or misfire; several endpoints return
401 for normal reasons; `postRaw` parses error bodies and needs care.

TASK-4: Stop swallowing failed mutations for the reported symptom: surface
`Notes.create()` / `createCategory()` failures via `UiNotifications.error()`
(translation-aware), keeping the user's input in the modal instead of
discarding it. Do not refactor other stores in this job.
files: src/lib/state/Notes.svelte.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts,
src/lib/i18n/es.ts, src/lib/i18n/fr.ts
depends: TASK-3 (so 401s are recovered rather than toasted twice)
risk: low — small, local change; i18n sync is enforced by `npm run check`.

TASK-5: Make the root layout react to a mid-session logout: the auth guard in
`+layout.svelte` only runs in `onMount`, so `loggedIn` flipping to false after
TASK-2/TASK-3 leaves the user on a dead page. Add a reactive guard (e.g.
`$effect` on `auth.loggedIn`) that redirects to login, without fighting the
existing onMount guard or triggering on auth/setup routes.
files: src/routes/+layout.svelte
depends: TASK-2, TASK-3
risk: low-medium — navigation side effects; must not redirect-loop.

TASK-6: Audit the previous profile-image fix for redundancy: with resume-driven
`loadAdditionalData()` in place, check whether the earlier change (re-fetch of
`/users/me` after login/`load()`, `profileCache`) still guards a distinct
scenario (e.g. image re-upload changing the storage path, cache busting) and
keep or remove it with a written justification in implementation.md.
files: src/lib/state/Auth.svelte.ts, src/lib/components/ui/NavProfileEntry.svelte,
src/routes/profile/+page.svelte
depends: TASK-2
risk: low-medium — removing it without confirming the covered scenario could
re-break the profile image.

TASK-7: Verify: `npm run check`, `npm test`, `npm run lint`; manually simulate
the stale session (dev API with short token TTL or hand-edited `auth` localStorage
entry: (a) expired token + resume from background → refreshed-and-recovered if
the backend honors a grace window, otherwise clean logout — determine which;
(b) near-expiry token + resume → refreshed, notes create works; (c) invalid
token server-side → 401 recovery ladder incl. localStorage adoption for the
multi-tab case; (d) offline/fetch-rejection → no logout, transient only).
Deduced from the client (single bearer token, refresh authenticates with the
current token, empty body): the two open backend facts — (1) does refresh
accept an already-expired token, (2) is the old token revoked on rotation —
are to be probed empirically (curl dev API) and recorded here; the
implementation is deliberately agnostic to both (see recovery ladder), they
only pin down expected outcomes for (a) and (c). Document steps/results in
implementation.md.
files: docs/jobs/cover_reload-after-time-away/implementation.md
depends: TASK-1, TASK-2, TASK-3, TASK-4, TASK-5, TASK-6
risk: low — verification only; no component-test infra exists, so manual steps
are required.
