# Tasks: third-party URLs go into `href` with no scheme check

id: teenager
analyst: analyst
date: 2026-11-13

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

Every sink from the brief's table was checked against the current code; line
numbers match. No new UI strings, so no i18n work.

TASK-1: Add `safeHref()` to a new `src/lib/helpers/UrlHelper.ts` (allow `http:`, `https:`, `mailto:` and same-origin paths starting with a single `/`; everything else, including unparseable input and `//host`, returns `undefined`) with a unit test.
files: `src/lib/helpers/UrlHelper.ts` (new), `tests/unit/helpers/UrlHelper.test.ts` (new)
depends: none
risk: low — pure function. Test cases from the brief: http/https/mailto/`/path` pass; `javascript:`, `JavaScript:`, `  javascript:` (leading whitespace), `data:`, `vbscript:`, `//host`, `null`/`undefined`/`''` are rejected.

TASK-2: Wrap `item.link` in `safeHref()` in the three feed entry layouts.
files: `src/lib/components/feeds/CardEntry.svelte` (19), `src/lib/components/feeds/CompactEntry.svelte` (17), `src/lib/components/feeds/ComfortableEntry.svelte` (23)
depends: TASK-1
risk: low — one-line change each; a rejected link leaves an `<a>` without `href`, which is the failure mode the brief asks for.

TASK-3: Wrap `Link.url` in `safeHref()` in the links library entry and the newest-links dashboard widget.
files: `src/lib/components/libraries/links/LinkEntry.svelte` (38), `src/lib/components/dashboard/widgets/NewestLinksWidget.svelte` (24)
depends: TASK-1
risk: low — one-line change each. `feeds/SaveToLibraryButton.svelte` stays unchanged: render-time filtering covers links saved from feeds.

TASK-4: Wrap `release.url` in `safeHref()` in the music and book release widgets.
files: `src/lib/components/dashboard/widgets/MusicReleasesWidget.svelte` (25), `src/lib/components/dashboard/widgets/BookReleasesWidget.svelte` (25)
depends: TASK-1
risk: low — one-line change each.

TASK-5: Apply `safeHref()` to the library entry `link` in `DeezerButton`, `HardcoverButton` and `ExternalLink`.
files: `src/lib/components/ui/buttons/DeezerButton.svelte` (18), `src/lib/components/ui/buttons/HardcoverButton.svelte` (18), `src/lib/components/libraries/shared/ExternalLink.svelte` (24)
depends: TASK-1
risk: low — but note: in the two buttons, `href={link ? link : getXUrl()}` and the label both branch on `link`. The simplest safe form is `href={link ? safeHref(link) : getXUrl()}`, which keeps the label logic unchanged (a bad link gives a dead "Show on …" button). Do not restructure the label logic.

TASK-6: Wrap `notification.link` in `safeHref()` in the same-tab notification entry.
files: `src/lib/components/ui/user-notifications/Entry.svelte` (47)
depends: TASK-1
risk: medium — this is the only same-tab sink, and the frontend can't see what format the backend uses for notification links. App paths like `/todos` and absolute http(s) URLs still work, but a bare relative path (e.g. `todos/1`, no leading slash) would now lose its `href`. Check what the backend sends if possible; otherwise flag it in implementation.md.

TASK-7: In `openLink()` in the todo link prop, use `safeHref()` and return early when it is `undefined`. Use the checked value for both the `goto()` branch (paths starting with a single `/`) and the `window.open()` branch.
files: `src/lib/components/todos/props/Link.svelte` (67-75)
depends: TASK-1
risk: low — this also sends `//example.com` to neither `goto()` nor a broken path (the brief's side bug). Keep the existing eslint-disable comment on the `goto` line.

## Open questions (not in scope until the owner confirms)

- Two more `href` sinks with stored URLs are not in the brief's table:
  `libraries/quotes/QuoteDetail.svelte:36` (`entry.source`) and
  `dashboard/widgets/ShortcutsWidget.svelte:45` (`shortcut.url`). Both are
  user-entered and use `target="_blank"`, so they are lower risk than feeds.
  They would be one-line additions with the same helper. Left out because the
  brief limits the scope to "every sink in the table".
- Backend follow-up (separate repo): the feed fetcher should store only
  `http(s)` values in `FeedItem.link` and `image_url`. Not frontend work.
- CSP `script-src` hardening is out of scope, as the brief says.
