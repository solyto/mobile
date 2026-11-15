# Report: the service worker precaches ~3 MB on every deploy and its "stale-while-revalidate" waits for the network

Date: 2026-11-14
Scope: `src/service-worker.ts` (install and fetch handlers).
Method: read the service worker at `24203b0`, ran `npm run build`, and pulled the
precache list from the built `build/client/service-worker.js`. For each entry, I
summed the file size and its `.br` size where adapter-node writes one. No code was
changed and nothing was measured in a real browser.

**Overall: a clear performance win, mostly on first visit and after each deploy.**
The install step downloads every file the build produces, including assets no
browser will ever load. The fetch handler also adds a network round trip to
requests that already have a cached answer.

---

## 1. Finding: the precache list is the whole build (verified)

`service-worker.ts:12` sets `ASSETS = [...build, ...files]`, and line 19 calls
`cache.addAll(ASSETS)` on install. With the current build that is **334 files,
5.6 MB raw, about 3.0 MB on the wire** (brotli where available):

| Type | Raw | Transferred (br / as-is) | Notes |
|---|---:|---:|---|
| JS (every route's chunks) | 3.37 MB | 0.90 MB | 216 route nodes, including admin, all eight libraries, etc. |
| JPG | 1.05 MB | 1.05 MB | `wood-shelf.jpg` 436 KB (spine view only), `themes/xp/wallpaper.jpg` 330 KB, `themes/skyrim/wallpaper.jpg` 286 KB (only used by those two themes) |
| PNG / ICO | 0.50 MB | 0.50 MB | includes `android-chrome-512x512.png` 185 KB, `logo.png` 56 KB, `logo_cut.png` 49 KB |
| `.woff` fonts | 223 KB | 223 KB | **never used.** `@fontsource` lists `woff2` first, and every browser that can run a service worker supports `woff2` |
| `.woff2` fonts | 233 KB | 233 KB | all subsets (latin-ext, cyrillic, vietnamese, …) of six families, most used by one theme only |
| CSS | 240 KB | 45 KB | |

Why this matters:

- **First visit.** Install runs while the first page is still loading. The
  roughly 3 MB / 334 requests compete with the page's own chunks and its first
  API calls. This hurts most on mobile, which is where the PWA gets installed.
- **Every deploy.** `CACHE` is keyed on `version` (line 10), and `activate`
  deletes the old cache. So every release re-runs `addAll` over all 334 URLs.
  The hashed `_app/immutable/*` files may come from the HTTP cache (adapter-node
  sends `immutable`), but that only works if the HTTP cache still has them.
  The un-hashed static files (`wood-shelf.jpg`, wallpapers, icons) are fetched
  or revalidated every time (*inferred*, depends on the browser's HTTP cache).
- **Fragility.** `addAll` is all-or-nothing. If one of the 334 requests fails
  on a flaky connection, the install fails and the user gets no offline shell
  at all.

## 2. Finding: the "stale-while-revalidate" branch is network-first (verified)

Lines 70-75:

```ts
const networkResponse = await fetch(event.request);
if (networkResponse && networkResponse.status === 200) {
	await cache.put(event.request, networkResponse.clone());
}
return cachedResponse || networkResponse;
```

This branch handles every same-origin GET that isn't in `ASSETS`. In this SPA
that includes **every navigation** (`/todos`, `/notes`, …) and any non-precached
file. It has two problems:

1. It always waits for the network, even when `cachedResponse` exists. The cached
   copy is only returned *after* the fetch resolves, so it saves no time. When
   the network is slow (not offline), the user waits for the full round trip.
   This is network-first. It is not stale-while-revalidate.
2. `await cache.put(...)` reads the whole body into the cache before the response
   goes back to the page. That adds latency to every such request, including
   when there is no cached copy.

Also, every visited URL (with its query string) goes into the cache and stays
there until the next deploy (*minor*).

## 3. Suggested fix

Small changes, all in `src/service-worker.ts`. No new dependency is needed.

1. **Precache only the app shell.** Filter `build` and `files` before `addAll`:
   - drop `*.woff`, because `woff2` is always used;
   - drop the large theme and feature images (`/themes/*/wallpaper.jpg`,
     `/wood-shelf.jpg`, `android-chrome-512x512.png`) and let the runtime
     branch cache them the first time they are used;
   - optionally precache only the `build` entries the root layout needs and let
     route chunks be cached at runtime. If that is too fiddly, the first two
     points alone already remove about 1.3 MB of the roughly 3 MB.
2. **Make the runtime branch real SWR.** If a cached response exists, return it
   at once and refresh it in the background with
   `event.waitUntil(fetch(...).then(r => r.ok && cache.put(...)))`. If not, return
   the network response right away and do the `cache.put` inside `waitUntil`
   instead of awaiting it.
   For navigations, network-first is a valid choice: a stale `index.html` can
   point at chunks the new deploy has deleted. If that is the intent, keep
   network-first but drop the awaited `cache.put` and add a short timeout before
   falling back to the cache. Either way, the code and its comment ("stale-
   while-revalidate") should agree.
3. **Reuse unchanged immutable files across deploys** (optional, follow-up). In
   `activate`, before deleting the old cache, copy over the `_app/immutable/*`
   entries that are also in the new `ASSETS`, or keep a separate long-lived
   cache for them. Their names are content hashes, so they can't go stale.

## 4. How to verify

- Before/after: build, then count the precache size with the same approach as
  above (parse `build/client/service-worker.js`, sum file sizes).
- In Chrome DevTools > Application > Cache Storage, check the entry count after
  install. In the Network panel (throttled to "Fast 4G"), compare the first-load
  waterfall and the time until `nodes/0` and the first API call finish.
- For the SWR change: with the cache warm, throttle to "Slow 4G" and reload
  `/todos`. The document should be served from the service worker at once
  instead of after the network round trip.

## 5. Not covered

- The push handler (lines 94+) and its `console.log`/`console.error` calls.
- Whether the desktop/mobile shells register the service worker at all.
- Whether the backend sends `Cache-Control` headers for the un-hashed static
  files. That changes how much of point 1 shows up on repeat deploys.
