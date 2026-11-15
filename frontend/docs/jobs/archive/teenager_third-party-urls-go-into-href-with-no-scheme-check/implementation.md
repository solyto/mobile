# Implementation: third-party URLs go into `href` with no scheme check

id: teenager
developer: developer
date: 2026-11-13

## Summary

Added a pure `safeHref()` helper that only lets through `http:`, `https:`, `mailto:` and same-origin paths. Every sink from the brief's table now uses it, so a `javascript:`, `data:` or similar link from a feed, a saved link or other stored data renders as an `<a>` without `href`, or doesn't open (todo link).

## Changes

TASK-1: `src/lib/helpers/UrlHelper.ts` (new) has `safeHref()`. `tests/unit/helpers/UrlHelper.test.ts` (new) tests it with the cases from the brief plus non-URLs and empty input. Beyond the brief, `/\host` is also rejected because browsers read it like `//host` (it goes to another host).
TASK-2: `feeds/CardEntry.svelte`, `CompactEntry.svelte`, `ComfortableEntry.svelte`: `href={safeHref(item.link)}`.
TASK-3: `libraries/links/LinkEntry.svelte`, `dashboard/widgets/NewestLinksWidget.svelte`: `href={safeHref(…url)}`.
TASK-4: `dashboard/widgets/MusicReleasesWidget.svelte`, `BookReleasesWidget.svelte`: `href={safeHref(release.url)}`.
TASK-5: `ui/buttons/DeezerButton.svelte`, `HardcoverButton.svelte`: `href={link ? safeHref(link) : getXUrl()}` (label logic unchanged). `libraries/shared/ExternalLink.svelte`: `href={safeHref(entry.link)}`.
TASK-6: `ui/user-notifications/Entry.svelte`: `href={safeHref(notification.link)}`.
TASK-7: `todos/props/Link.svelte` `openLink()` checks the link once, returns early if it is rejected, and uses the checked value for both `goto()` and `window.open()`. `//example.com` no longer reaches `goto()`.

## Known issues / follow-ups

- Not verified locally: `node_modules` is missing in this worktree, and installing needs approval. So `npm test`, `npm run check` and `npm run lint` were not run. I checked the helper logic against every test case with plain Node, and all cases passed. Please run `npm test && npm run check && npm run lint` before merging.
- Notification links (TASK-6): this repo doesn't show what format the backend sends. Absolute `http(s)` URLs and paths starting with `/` still work. A bare relative path such as `todos/1` now loses its `href`. Please confirm this in the backend repo.
- Todo links without a scheme (e.g. `example.com`) can no longer be opened. Before, `window.open` treated them as a relative app path, which was broken anyway.
- Not in the brief's table, left out: `libraries/quotes/QuoteDetail.svelte:36` (`entry.source`) and `dashboard/widgets/ShortcutsWidget.svelte:45` (`shortcut.url`). Both are user-entered and could use the same one-line fix.
- Backend follow-up: the feed fetcher should store only `http(s)` values in `FeedItem.link` and `image_url`. A CSP `script-src` without `'unsafe-inline'` would add a second layer (deploy change).
