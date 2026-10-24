# Tasks: profile picture doesnt load

id: one
status: open
analyst: @analyst
date: 2026-08-17

## Context (analysis summary)

Symptom: on the first load of a fresh browser session the profile picture in the
DesktopNavbar does not load; a reload fixes it.

Render path: `+layout.svelte` → `DesktopNavbar.svelte` → `NavProfileEntry.svelte`
renders a plain cross-origin `<img src={API_USER_STORAGE_URL + '/' + profile_image_path}>`
(web prod: `https://api.solyto.app/storage/user/<path>`). No auth header, no
`onerror` handling, no cache-busting.

Two candidate root causes found in the code; both are plausible and not yet
distinguishable from the frontend repo alone:

- **Suspect A — state race (`src/lib/state/Auth.svelte.ts`)**: `Auth` hydrates
  `user` from LocalStorage synchronously, then `load()` may `await refresh()`
  (token within 5 days of expiry — likely after a browser was closed for days)
  and always `await loadAdditionalData()` (`/users/me`); both **replace
  `this.user` wholesale** and `save()` the result. If the `/auth/refresh` (or
  `/users/me`) payload omits `profile.profile_image_path`, the navbar `<img>`
  unmounts / breaks on first load. On reload the LS-cached user (restored by
  `/users/me`) has the path and no refresh runs → image loads.
- **Suspect B — service worker (`src/service-worker.ts`)**: the fetch handler
  only skips `url.pathname.startsWith('/api')`, so the cross-origin
  `/storage/user/*` image request **is intercepted** (a SW sees all fetches from
  pages it controls, cross-origin included). It falls into the
  stale-while-revalidate branch; on any transient network error (cold DNS/TLS on
  a fresh session, racing app boot) the catch returns
  `new Response('Offline …', 503, text/plain)` → guaranteed broken `<img>` with
  no retry. Only 200 responses are cached, so a warm reload succeeds — matching
  the symptom exactly.

Uncertainty: response shapes of `/auth/refresh` and `/users/me` (does `profile`
always come back?) are defined in the backend repo — out of scope here; verify
empirically via the Network tab.

## Task breakdown

TASK-1: Reproduce the failure on a cold first load and capture evidence (which
request for `/storage/user/...` fails, its status/initiator, whether the SW fetch
handler is in the path, and whether `auth.user.profile.profile_image_path` is set
at that moment).
files: docs/jobs/one_profile-picture-doesnt-load/implementation.md (findings), no code changes
depends: none
risk: low — read-only investigation; reproduction may be flaky because it needs a fresh session (restart browser / new profile with the SW already installed and auth in LocalStorage).

TASK-2: Determine empirically whether `/auth/refresh` or `/users/me` responses
can omit `profile.profile_image_path`, and whether `Auth.load()`'s wholesale
user replacement (`refresh()` → `this.user = refresh.user`,
`loadAdditionalData()` → `this.user = res.data`) blanks the navbar image.
files: src/lib/state/Auth.svelte.ts (read-only), runtime API payloads
depends: TASK-1 (can share the same repro session)
risk: low — analysis only, but depends on hitting the `shouldRefresh` window (token within 5 days of expiry) to observe the refresh path.

TASK-3: Trace the service worker fetch handler against the profile image
request: confirm `/storage/...` slips past the `/api` skip, trace the opaque
no-cors response through the stale-while-revalidate branch, and confirm the
catch path returns a 503 text/plain Response on transient cold-start errors.
files: src/service-worker.ts (read-only analysis)
depends: none
risk: low — analysis only.

TASK-4: Fix the service worker fetch handler to only intercept same-origin
requests (early-return unless `url.origin === self.location.origin`), so
cross-origin storage image URLs are never proxied through the SW error path.
files: src/service-worker.ts
depends: TASK-3 (confirmation that interception is occurring/possible)
risk: medium — changes global caching/offline behavior for every request; needs verification that app shell, theme CSS and other same-origin assets still cache, and existing installed SWs only pick this up on the next deploy/version change.

TASK-5: Add failure resilience to the navbar profile image: `onerror` fallback
on the `<img>` in `NavProfileEntry.svelte` that falls back to the initial-letter
placeholder instead of a broken image.
files: src/lib/components/ui/NavProfileEntry.svelte
depends: TASK-1 (confirm observed failure mode)
risk: low — isolated presentational component, same pattern as the existing `{:else}` branch.

TASK-6 (conditional — only if TASK-2 confirms a payload gap): Preserve
`profile` (and `settings`) on `this.user` when an incoming API user payload
omits them, instead of replacing the user wholesale in `refresh()` /
`loadAdditionalData()`.
files: src/lib/state/Auth.svelte.ts
depends: TASK-2
risk: medium — touches the core auth state consumed by the whole app; regression risk around login/logout/save flows. Skip entirely if TASK-2 shows all payloads include `profile`; if the gap is backend-side, file it as a follow-up against the API repo instead of papering over it here.

TASK-7: Verify: `npm run check` plus a manual matrix (cold first load, reload,
offline toggle) confirming the navbar picture renders or falls back cleanly in
all cases; document results per task in implementation.md.
files: docs/jobs/one_profile-picture-doesnt-load/implementation.md
depends: TASK-4, TASK-5, TASK-6 (if executed)
risk: low — verification only, but cold-start cases are inherently flaky to reproduce deterministically.

## Open questions

- Exact meaning of "fresh browser session" (browser restart with session cookies
  cleared vs. first PWA launch) and platform (web vs. desktop shell) — affects
  which suspects are reachable; assume web + browser restart unless repro says
  otherwise.
- `/auth/refresh` and `/users/me` payload shapes live in the backend repo; if
  evidence points there, report back rather than adding frontend workarounds
  beyond TASK-5/TASK-6.
