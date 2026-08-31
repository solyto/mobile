# Findings: profile picture doesnt load

id: one
date: 2026-08-17
tasks covered: TASK-1 (repro), TASK-2 (auth payload), TASK-3 (service worker trace)

## Root cause (confirmed)

The profile picture is served **cross-origin** from the API host
(`https://api.solyto.app/storage/user/<path>` — app origin `my.solyto.app` /
`app.solyto.de`, see `src/lib/config/platform.ts` domainMap and
`API_USER_STORAGE_URL` in `src/lib/config/apiRoutes.ts`).

The app's service worker intercepts that request and, on a transient network
failure during a **cold browser session**, replaces it with a synthetic
`503 text/plain` response. `<img>` never retries, so the picture stays broken
for the whole page load. On reload the network is warm (DNS/TLS/HTTP2 pooled by
the first load's API calls) and the picture loads.

### Evidence chain (TASK-3)

1. `src/service-worker.ts:45-49` — the fetch handler only skips non-GET and
   `/api`-prefixed requests: `url.pathname.startsWith('/api')`. The image path
   is `/storage/user/...` → **not skipped → intercepted**, even though it is
   cross-origin (a service worker sees every fetch made by a controlled page,
   cross-origin included).
2. The SW **is registered in production**, but not from this repo: the
   deployment layer injects a registration snippet into the served HTML
   (verified on the live sites `my.solyto.app` and `app.solyto.de`):
   `if ('serviceWorker' in navigator) { addEventListener('load', function () { navigator.serviceWorker.register('./service-worker.js'); }); }`
   This is why `grep serviceWorker.register` finds nothing in the repo while
   the settings pages still call `navigator.serviceWorker.ready` (push
   notifications depend on that injected registration).
3. The deployed `https://my.solyto.app/service-worker.js` (16 KB bundle) is this
   repo's handler — verified by its `aj-cache-` prefix, `startsWith("/api")`
   guard, `respondWith`, and the `"Offline – please check your connection."`
   body (saved as `repro/prod-service-worker.js` snapshot during analysis).
4. `src/service-worker.ts:62-67` — SWR branch: `<img>` requests are
   `no-cors`, so a successful response is **opaque** (`status === 0`). The
   `networkResponse.status === 200` guard therefore never caches it →
   `cache.match` is cold on every fresh session → no offline copy can ever
   mask the failure.
5. `src/service-worker.ts:68-77` — on a transient failure of `fetch()` (cold
   DNS/TLS race at browser start) the catch returns
   `new Response('Offline…', { status: 503, 'Content-Type': 'text/plain' })`.
   The `<img>` in `NavProfileEntry.svelte` has no `onerror` handling → broken
   image until the next full page load. "Sometimes" = only when the transient
   failure actually happens; "reload fixes it" = warm network on retry.
6. API JSON calls (`/api/v1/...`) bypass the SW via the `/api` prefix, which is
   why the rest of the app boots fine while only the storage image breaks.

### Why the service worker is pure downside for these URLs

It cannot cache opaque responses (status-200 guard), so it adds nothing for
`/storage/...`; it only inserts an extra hop whose catch path converts
transient errors into permanent-for-that-load broken images.

## TASK-1 — reproduction

Executed in a follow-up session (writable git mount): the harness below was
run in a real (headless) browser via the `shot` render tool; screenshots and
render reports are committed under `screenshots/`:

- `http://127.0.0.1:8199/prod/` → page verdict element (class `bad`):
  **"PICTURE BROKEN (no retry, stays broken until reload)"** — the reported
  bug reproduced end-to-end with the pre-fix SW handler and plain `<img>`.
- `http://127.0.0.1:8199/fixed/` → page verdict element (class `good`):
  **"PICTURE LOADED (after one retry — self-healed, no reload needed)"**
  under the same simulated cold-start failure.
- The api-origin server log corroborates both runs: the first
  `/storage/user/pic.png` request was destroyed at socket level in each run;
  the fixed run's `?retry=1` request was answered `200 PNG`.
- Only render-report finding is a WCAG contrast complaint about the harness's
  own terminal-style log `<pre>` (light green on near-black) — harness
  cosmetics, not app code.

A self-contained, dependency-free harness is committed at `repro/` that
reproduces both the broken and the fixed behaviour in any browser:

```
node repro/server.mjs          # app origin :8199, api origin :8299
# then open:
#   http://127.0.0.1:8199/prod/    → production SW copy + plain <img>  → PICTURE BROKEN
#   http://127.0.0.1:8199/fixed/   → fixed SW + retry/fallback <img>   → PICTURE LOADED (after one retry)
```

The api origin destroys the first storage request at the socket level after
each `/ping` (simulating the cold-start transient failure) and serves a real
PNG afterwards. The `prod` SW is an instrumented verbatim copy of the current
`src/service-worker.ts` fetch handler; its on-page log shows the whole chain:
`intercepted CROSS-ORIGIN …/storage/user/pic.png` → `network fetch REJECTED
(TypeError)` → `returning synthetic 503` → `img ERROR`.

## TASK-2 — auth/state race (Suspect A): eliminated as the cause

A missing `profile` in the `/users/me` or `/auth/refresh` payload would show
the **initial-letter placeholder** (not a broken picture) and would be
persisted to LocalStorage by `Auth.save()`, so a reload would **not** fix it —
the opposite of the reported symptom. A failed `/users/me` fetch leaves the
hydrated user untouched (`res` null guard, `Auth.svelte.ts:74-79`). The
reload-fixes-it signature points squarely at a per-request failure, i.e. the
service-worker path above. TASK-6 (defensive profile preservation) is
therefore **skipped**; if the backend ever returns a user without `profile`,
that would surface as the letter placeholder and is a backend contract issue.

## Fixes

- TASK-4: `src/service-worker.ts` — handle same-origin GETs only, so
  cross-origin storage images always go directly to the network.
- TASK-5: `src/lib/components/ui/NavProfileEntry.svelte` — on image error,
  retry once with a cache-buster, then fall back to the initial letter instead
  of a broken image. Covers any remaining transient failure even without the
  SW in the picture (e.g. desktop/mobile shells).
