# Brief: third-party URLs go into `href` with no scheme check

type: feature
id: teenager
branch: feature/teenager_third-party-urls-go-into-href-with-no-scheme-check
date: 2026-11-13
author: Leander Muskalla

Source report: `docs/reports/2026-11-13-unvalidated-link-schemes.md`

Then checked in headless Chromium (Playwright 1254 headless shell) whether a
`javascript:` URL runs in each link shape the app uses. The check used a throwaway
page and was not committed. No code was changed.

**Overall: a small security hardening. Nothing is exploitable today in Chromium.**
No URL is checked for its scheme before rendering. Today only browser behaviour
stops a `javascript:` link from running, not the app. Feed items are the main
risk because their URLs come from whoever publishes the feed.

---

## 1. Finding: no scheme allow-list anywhere (verified)

Svelte 5 does not sanitize `href`. The repo has no URL check (`grep -rn
"javascript:\|protocol" src` finds nothing relevant). The sinks:

| Sink | Source of the URL | Who controls it | Link shape |
|---|---|---|---|
| `feeds/CardEntry.svelte:19`, `CompactEntry.svelte:17`, `ComfortableEntry.svelte:23` | `FeedItem.link` | **any feed publisher** | `target="_blank" rel="external"` |
| `libraries/links/LinkEntry.svelte:38`, `dashboard/widgets/NewestLinksWidget.svelte:24` | `Link.url` (also filled from a feed item by `feeds/SaveToLibraryButton.svelte:26`) | user, or **a feed publisher** through "save to library" | `target="_blank"` |
| `dashboard/widgets/{Music,Book}ReleasesWidget.svelte:25` | `release.url` | backend / external metadata API | `target="_blank"` |
| `ui/buttons/{Deezer,Hardcover}Button.svelte:18`, `libraries/shared/ExternalLink.svelte:24` | library entry `link` | user / metadata import | `target="_blank"` |
| `ui/user-notifications/Entry.svelte:47` | `UserNotification.link` | backend | **same tab** |
| `todos/props/Link.svelte:71` | `todo.link` | user | `window.open(…, '_blank', 'noopener,noreferrer')` |

## 2. What the browser does today (verified in Chromium only)

The test page stored a fake token in `localStorage`. Each link set
`document.title` from that token:

| Shape | Result |
|---|---|
| `<a href="javascript:…" target="_blank" rel="external">` | new tab opens on `about:blank`, script **does not run** |
| `window.open('javascript:…', '_blank', 'noopener,noreferrer')` | same, **does not run** |
| `<a href="javascript:…">` (same tab) | script **runs** and reads `localStorage` |

The auth tokens live in `localStorage` (`LocalStorageService`). A script that runs
in the app origin can read them, so a run here would mean account takeover.

## 3. Why it still matters (inferred)

- **The protection is a side effect of `target="_blank"`, not a decision.** If
  someone drops `target="_blank"` from a feed or link entry (for example to keep
  the PWA in standalone mode), the hole opens with no warning.
  `Entry.svelte` already uses the same-tab shape. It is only safe because the
  backend writes notification links.
- **Firefox, Safari and the native shells were not tested.** Only Chromium is
  installed here. The desktop and mobile shells live outside this repo, and their
  WebViews often handle `target="_blank"` themselves: they open it in place, or
  pass it to the OS. That behaviour is unknown.
- **This repo can't see whether the backend filters feed links.** If it stores
  `<link>` from RSS/Atom as-is, a hostile feed publisher can put
  `javascript:` or `data:` URLs into every subscriber's feed list. The same
  applies to the public feed directory (`loadAvailableFeeds`) and friend feeds.
  That needs a check in the backend repo.

## 4. Suggestion

Add one small pure helper and use it at every sink in the table:

```ts
// src/lib/helpers/UrlHelper.ts
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export function safeHref(url: string | null | undefined): string | undefined {
	if (!url) return undefined;
	if (url.startsWith('/') && !url.startsWith('//')) return url;
	try {
		return SAFE_PROTOCOLS.has(new URL(url).protocol) ? url : undefined;
	} catch {
		return undefined;
	}
}
```

```svelte
<a href={safeHref(item.link)} target="_blank" rel="external">
```

Notes:

- An `<a>` without `href` renders as plain text and is not focusable. That is
  the right failure mode for a bad feed link.
- `todos/props/Link.svelte` `openLink()`: return early when `safeHref` gives
  `undefined`. The helper's `//` check also fixes a small bug: today a todo
  link `//example.com` passes `startsWith('/')` and goes to `goto()`, which
  throws for external URLs in SvelteKit 2.
- Add a unit test in `tests/unit/` for `safeHref`: http/https/mailto/relative
  pass; `javascript:`, `JavaScript:` (mixed case), `  javascript:` (leading
  whitespace, which `new URL` trims), `data:`, `vbscript:` and `//host` are
  rejected. `docs/TESTING.md` covers pure helpers like this.
- Optional, out of scope here: add a CSP `script-src` without `'unsafe-inline'`
  as a second layer. That is a deploy/header change, not a frontend one.

**Backend follow-up:** check that the feed fetcher only stores `http(s)` links
for `FeedItem.link` and `image_url`.

## 5. Effort / risk

About 1 helper, 1 test file and roughly 12 one-line call-site changes. Only
links with a non-http(s) scheme change behaviour, and the app produces none of
those.
