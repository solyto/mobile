# Verdict: third-party URLs go into `href` with no scheme check

id: teenager
reviewer: reviewer
date: 2026-11-13

## Review

Reviewed `git diff main...HEAD`. Only the files listed in tasks.md changed, plus the job docs. Nothing changed outside the scope of the tasks.

TASK-1: PASS
notes: `src/lib/helpers/UrlHelper.ts` matches the brief's helper. It also rejects `/\host` (documented in implementation.md; browsers treat it like `//host`), which is a reasonable tightening. `tests/unit/helpers/UrlHelper.test.ts` covers every case from the task. I ran a JS copy of the helper under Node 22: http/https/`HTTPS://`/mailto/`/path` pass; `javascript:`, `JavaScript:`, leading spaces, `\n`/`\t`-embedded `javascript:`, `data:`, `vbscript:`, `//h`, `/\h`, `example.com`, `todos/1`, `''`/null/undefined are rejected.

TASK-2: PASS
notes: `CardEntry.svelte`, `CompactEntry.svelte` and `ComfortableEntry.svelte` all use `href={safeHref(item.link)}`.

TASK-3: PASS
notes: `LinkEntry.svelte` and `NewestLinksWidget.svelte` wrap the URL. `SaveToLibraryButton.svelte` is unchanged, as planned.

TASK-4: PASS
notes: `MusicReleasesWidget.svelte` and `BookReleasesWidget.svelte` use `href={safeHref(release.url)}`.

TASK-5: PASS
notes: `DeezerButton`/`HardcoverButton` use `link ? safeHref(link) : getXUrl()`, and the label logic is unchanged. `ExternalLink.svelte` wraps `entry.link`.

TASK-6: PASS
notes: `Entry.svelte` uses `href={safeHref(notification.link)}`. `goTo` only calls `onClose()`, so a rejected link can't navigate any other way. The open question about the backend link format is flagged in implementation.md, as the task asked.

TASK-7: PASS
notes: `openLink()` checks the link once, returns early when it's `undefined`, and uses the checked value for both `goto()` and `window.open()`. The eslint-disable comment is kept. `//example.com` no longer reaches `goto()`.

## Security

No new findings. Only `http:`, `https:`, `mailto:` and single-slash paths reach any sink in the brief's table. The two extra sinks (`QuoteDetail.svelte`, `ShortcutsWidget.svelte`) are correctly left as open questions and are not in scope.

## Overall

APPROVED

No blockers. `npm test`, `npm run check` and `npm run lint` could not be run because `node_modules` is missing in this worktree (the developer reports the same). Run them before merging.
