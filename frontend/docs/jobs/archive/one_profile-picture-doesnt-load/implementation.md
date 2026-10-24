# Implementation: profile picture doesnt load

id: one
status: open
developer: glm-5.2 (via manigot)
date: 2026-08-17
updated: 2026-08-18 (browser verification executed; commits landed)

## Summary

Root cause found and fixed. On a fresh browser session the navbar profile
picture is requested cross-origin from the API (`https://api.solyto.app/storage/user/…`).
The app's service worker intercepts that request (its skip condition only
covers `/api` paths) and runs it through its stale-while-revalidate branch;
when the underlying `fetch()` hits a transient cold-start network failure, the
catch path answers the `<img>` with a synthetic `503 text/plain` response.
`<img>` never retries, so the picture stays broken until the next reload —
which succeeds because the network is warm by then. The service worker is
registered in production by a deployment-injected HTML snippet (not by this
repo — see findings.md for the live-site evidence), which is why no
registration exists in the codebase.

TASK-1..3 (investigation): confirmed the mechanism against the live production
SW bundle and eliminated the auth/state-race suspect; evidence and a runnable
repro harness are committed under `repro/` + `findings.md`.
TASK-4 (fix): the service worker now handles same-origin GETs only.
TASK-5 (fix): the navbar profile image retries once on error, then falls back
to the initial-letter placeholder instead of a broken image.
TASK-6: skipped as planned — the payload-gap variant would persist across
reloads via `Auth.save()` and show the letter placeholder, contradicting the
reported "reload fixes it" symptom (reasoning in findings.md).
TASK-7 (verification): all green, see below.

## Changes

TASK-1..3 (docs only)
- `docs/jobs/one_profile-picture-doesnt-load/findings.md` — full evidence
  chain: production SW registration snippet, deployed bundle match, opaque-
  response/no-cache analysis, failure chain, and why Suspect A (auth payload
  race) is eliminated.
- `docs/jobs/one_profile-picture-doesnt-load/repro/` — dependency-free
  reproduction harness (`node repro/server.mjs`, then open
  `http://127.0.0.1:8199/prod/` → broken picture with production SW handler,
  `http://127.0.0.1:8199/fixed/` → self-healing picture with both fixes).
  `repro/prod-service-worker.js` is a snapshot of the deployed production
  bundle used as evidence.

TASK-4 — `src/service-worker.ts`
- Fetch handler now returns early unless the request is a same-origin GET
  (`url.origin !== sw.location.origin`), keeping the `/api` path skip for
  same-origin API deployments. Cross-origin storage images go directly to the
  network and can no longer receive the synthetic offline response. The SW
  could never usefully cache these requests anyway (`<img>` responses are
  opaque, `status === 0`, so the 200-guard never cached them).

TASK-5 — `src/lib/components/ui/NavProfileEntry.svelte`
- `onerror` handler: first error re-requests once with a `?retry=1`
  cache-buster (covers remaining transient failures even where no SW exists,
  e.g. native shells); a second error sets `failed` and renders the existing
  initial-letter placeholder instead of a broken image. An `$effect` resets
  the retry state when the profile image path changes.

## Verification

Automated gates re-run on 2026-08-18 in the follow-up (committing) session,
all green:

- `npm run check` — 0 errors, 0 warnings.
- `npm test` — 34 files, 362 tests passed.
- `npx eslint` + `npx prettier --check` on both changed files — clean
  (`apiRoutes.ts` has pre-existing prettier drift, untouched).
- `npm run build` — production build succeeds;
  `build/client/service-worker.js` contains the same-origin guard.
- Repro harness executed in a real (headless) browser via the `shot` render
  tool (`node repro/server.mjs`, then rendering both pages; PNG + render
  reports committed under `screenshots/`):
  - `http://127.0.0.1:8199/prod/` → verdict element (class `bad`): "PICTURE
    BROKEN (no retry, stays broken until reload)" — bug reproduced end-to-end
    with the pre-fix SW handler + plain `<img>`.
  - `http://127.0.0.1:8199/fixed/` → verdict element (class `good`): "PICTURE
    LOADED (after one retry — self-healed, no reload needed)" under the same
    socket-level simulated cold-start failure.
  - Api-origin server log corroborates both runs: first `/storage/user/pic.png`
    destroyed at socket level in each run; `?retry=1` → 200 PNG.
  - Only render-report finding is a WCAG contrast complaint about the
    harness's own terminal-style log `<pre>` — harness cosmetics, not app code.
- Note: dependencies were bootstrapped with `npm ci` from the pinned
  lockfile (node_modules was absent in this worktree); no dependency changes.

## Known issues / follow-ups

- **Commits** (resolved in a follow-up session with a writable git mount): the
  review's blocker is addressed — the work is committed on this branch in the
  prescribed split: TASK-1..3 (findings + repro + tasks.md), TASK-4
  (service-worker.ts), TASK-5 (NavProfileEntry.svelte), implementation +
  verification evidence (implementation.md, screenshots/). The pre-existing
  working-tree noise (AGENTS.md mount artifact, .opencode job-mirror deletions)
  was left uncommitted as instructed.
- Deployed service workers only pick up TASK-4 after the next release
  (new `version` → install → `skipWaiting` + cache cleanup).
- The deployment-injected SW registration (external `deployment/` repo) is
  invisible to this repo's tooling; worth documenting there that
  `src/service-worker.ts` is live in production.
- Push-notification settings rely on that injected registration
  (`navigator.serviceWorker.ready`); with the origin guard nothing changes for
  them (push uses same-origin SW scope).
- If the API ever returns `/users/me` without `profile`, the navbar shows the
  letter placeholder — backend contract issue, tracked in findings.md (TASK-6).
