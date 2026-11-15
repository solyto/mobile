# Backlog: service worker keeps unchanged assets across deploys

created: 2026-11-10

## What

On install, copy files that didn't change from the previous cache into the
new one, and only download the rest. Today every deploy makes every installed
client download the whole precache again.

- In the `install` handler of `src/service-worker.ts`, before
  `cache.addAll(ASSETS)`: for each path in `ASSETS` under `/_app/immutable/`,
  look it up in the existing `aj-cache-*` caches and `put` a hit into the new
  cache.
- Then `addAll` only the paths that are still missing.
- The `activate` handler stays as it is: it deletes the old caches after the
  copy.

## Why

The cache name contains `version`, so each deploy creates a new cache and
`activate` deletes the old one. Files under `/_app/immutable/` have a content
hash in their name, so a file at the same path is always byte-identical. Most
of them (JS chunks, fonts, images) don't change between two deploys, but are
still downloaded again: about 1.5 MB per client per deploy, in the background
next to the page's own requests. Found while working through
`docs/reports/2026-11-10-service-worker-precache-weight.md`.

## Out of scope

- The `LAZY` list (theme wallpapers and fonts, `.woff`). Those are cached on
  first use and dropped with the old cache. Carrying them over too would be a
  small extension, but not part of this entry. Side effect worth knowing
  (found in the 1.1.2 review, 2026-11-14): a user of a wallpaper theme who
  opens the PWA offline right after a deploy, before loading it online once,
  sees the theme without its wallpaper and fonts. Cosmetic and rare, so it
  was left here rather than fixed separately; if this entry is picked up,
  consider carrying the `LAZY` entries over as well.
- Files from `static/` (`files`). They have no hash in their name, so the same
  path doesn't mean the same content. They are few and small; keep
  downloading them.
- Changing the fetch handler.

## Notes

- Only copy paths that start with `/_app/immutable/`. That is what makes the
  copy safe. Everything else must still be downloaded.
- `cache.addAll` is all-or-nothing. If it fails, the install fails and the old
  service worker stays active, as today. Copying first doesn't change that.
- Verify in DevTools: deploy twice (or build twice with one changed component),
  then check under Network that the second install only downloads the changed
  chunks, and under Application → Cache Storage that the new cache is
  complete.
