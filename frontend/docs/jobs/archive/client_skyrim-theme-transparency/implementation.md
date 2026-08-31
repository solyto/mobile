# Implementation: skyrim theme: transparency

id: client
status: open
developer: glm-5.2 (manigot developer session)
date: 2026-08-17

## Summary

Fixed the unreadable mobile secondary navigations under the skyrim theme (and any future
transparent theme) by introducing two theme-hook classes, following the existing pattern of
`nav-mobile-container` / `content-container` (classes with no base CSS, styled only in theme CSS
files):

- `secondary-nav-mobile-container` — navs that are full-screen/mobile overlays below Tailwind's
  `lg` breakpoint (settings drawer, todos drawer, feeds panel, time-tracking panel).
- `secondary-nav-mobile-container-sm` — navs that are overlays only below `sm` (notes drawer is
  `sm:hidden`; contacts panel switches to an inline sidebar at `sm`, so its fix must not darken
  the 640–1024px sidebar, which keeps the intended transparent desktop look).

The skyrim theme styles both classes with `rgba(14, 14, 18, 0.9)` — the same surface treatment as
`.content-container` — scoped to the exact widths where each element is an overlay, using range
media queries that are the exact inverse of Tailwind v4's `lg:`/`sm:` queries (no fractional-pixel
gap). Under skyrim the `dark` class is never present (`supportsDarkMode: false` →
`Theme.svelte.ts` removes it), which is why the old `bg-c-bg` (transparent in skyrim's `:root`)
plus the inert `dark:bg-s-dark-1` fallback left the drawers unreadable over the wallpaper.

Why this wins the cascade: skyrim.css is appended to `<head>` as a `<link>` at runtime, after the
app stylesheet, so its equal-specificity rule beats the `bg-c-bg` utility — the same mechanism the
existing `.nav-mobile-container` rule already relies on.

## Changes

TASK-1 — mobile-only drawers get the hook class (first position, matching the
`nav-mobile-container` convention):

- `src/lib/components/settings/SettingsNavigationMobile.svelte` — added
  `secondary-nav-mobile-container` (`lg:hidden` drawer).
- `src/lib/components/todos/TodoNavigationMobile.svelte` — added
  `secondary-nav-mobile-container` (`lg:hidden` drawer).
- `src/lib/components/notes/NoteNavigationMobile.svelte` — added
  `secondary-nav-mobile-container-sm` (`sm:hidden` drawer).

TASK-2 — dual-purpose panels (overlay on mobile, sidebar at larger widths) get the hook class:

- `src/lib/components/feeds/FeedNavigation.svelte` — added
  `secondary-nav-mobile-container` (overlay below `lg`).
- `src/lib/components/time-tracking/TimeTrackingNavigation.svelte` — added
  `secondary-nav-mobile-container` (overlay below `lg`).
- `src/lib/components/contacts/ContactNavigation.svelte` — added
  `secondary-nav-mobile-container-sm` (overlay below `sm`; sidebar at `sm`+ stays transparent).

TASK-3 — theme rule:

- `static/themes/skyrim/skyrim.css` — new block after the nav rules:
  `@media (width < 64rem) { .secondary-nav-mobile-container { background-color: rgba(14, 14, 18, 0.9); } }`
  and the analogous `width < 40rem` rule for `-sm`. Only skyrim gets rules; all other themes have
  opaque `--color-c-bg` and are unaffected.

TASK-4 — verification (partial, see Known issues):

- `npm run check` / `npm run lint` could NOT be executed: `node_modules` is absent in this
  container and the project rules forbid installing packages without approval.
- Manual verification performed instead: full diff review (purely additive class strings, no
  logic/TS/i18n changes); grep confirms no pre-existing `secondary-nav-*` collisions; sweep of all
  `fixed`/`absolute` + `bg-c-bg*` elements confirms exactly the six intended navs are covered and
  the desktop-only sidebars (finance, library, calendar) are untouched; cascade and breakpoint
  reasoning above.
- Prettier: `/static/` is in `.prettierignore`; the Svelte edits follow the existing
  `nav-mobile-container`-first ordering that already passes lint, and prettier cannot reflow
  long attribute strings.
- Browser-level check (dev server, skyrim on mobile widths) not possible in this container (no
  node_modules, no browser/shot tool).

## Known issues / follow-ups

- **Commits could not be created**: the session's git shim allows commits, but the container
  mounts the repository's `.git` directory read-only
  (`/home/leo/code/solyto/app/.git` → `ro`), so `git add`/`git commit` fail with
  `Unable to create '.../index.lock': Read-only file system`. All changes are present in the
  working tree; the intended commits were attempted per task with messages:
  `[client] tasks: add task breakdown`, `[client] TASK-1: …`, `[client] TASK-2: …`,
  `[client] TASK-3: …`, `[client] implementation: add summary`. They need to be re-run from an
  environment where `.git` is writable.
- **`npm run check` / `npm run lint` unexecuted** (no `node_modules`; installs require approval).
  Expected to pass — changes are static class strings + ignored-dir CSS — but should be run once
  dependencies are installed. Say the word and I'll run `npm ci` + both commands.
- Under skyrim, small overlays using `bg-c-bg-surface` / `bg-c-bg-elevated` (autocompletes,
  right-click menu, notification popover, library filter popovers) are also transparent. They are
  not secondary navigations, so they were left alone (out of scope), but a future job could give
  them the same hook-class treatment.
- `dark:bg-s-dark-1` on the three drawers references a token that `tokens.css` never defines
  (`--color-s-dark-1`), so it appears to be dead in the default theme as well; left untouched.
