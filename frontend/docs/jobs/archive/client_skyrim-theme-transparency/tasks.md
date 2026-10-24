# Tasks: skyrim theme: transparency

id: client
status: open
analyst:
date: 2026-08-17

<!-- Produced by @analyst from brief.md. -->

## Context (root cause)

- `static/themes/skyrim/skyrim.css` sets `--color-c-bg: transparent` in `:root` (line 48). Opaque
  values only exist under `html.dark` (lines 88–93).
- Skyrim has `supportsDarkMode: false`, and `src/lib/state/Theme.svelte.ts` (lines 75–82)
  **removes** the `dark` class for such themes. Under skyrim the `dark` class is therefore never
  present: `bg-c-bg` resolves to `transparent` and all `dark:` fallbacks (e.g. `dark:bg-s-dark-1`)
  are inert.
- Mobile secondary navigations render with `bg-c-bg` → fully transparent drawer over the skyrim
  wallpaper / page content → unreadable.
- Established pattern to copy: theme hook classes with **no** CSS in `src/`
  (`page-container`, `content-container`, `nav-mobile-container`, `nav-desktop-container`) that are
  styled only inside theme CSS files. Skyrim already styles `.content-container` with
  `rgba(14, 14, 18, 0.9)`.
- Affected surfaces (all use `bg-c-bg`):
  - Mobile-only drawers: `SettingsNavigationMobile` (< lg), `TodoNavigationMobile` (< lg),
    `NoteNavigationMobile` (< sm).
  - Dual-purpose panels (absolute overlay on mobile via JS `display:block`, sidebar at larger
    widths): `FeedNavigation` (splits at lg), `TimeTrackingNavigation` (splits at lg),
    `ContactNavigation` (splits at sm).
- NOT affected: `LibraryNavigation`, `FinanceNavigation`, `CalendarNavigation` are desktop-only
  (`lg:flex`, no mobile overlay). The `FunnelButton`/`HamburgerButton` themselves are readable under
  skyrim (`not-dark:bg-c-primary` applies because `.dark` is absent) — out of scope.
- Only `skyrim.css` gets a new rule; all other themes have opaque `--color-c-bg` and need no change.

## Task breakdown

TASK-1: Add a mobile theme-hook class (suggested name: `secondary-nav-mobile-container`, following
the existing `nav-mobile-container` convention) to the three mobile-only drawer navigations.
files: src/lib/components/settings/SettingsNavigationMobile.svelte,
src/lib/components/todos/TodoNavigationMobile.svelte,
src/lib/components/notes/NoteNavigationMobile.svelte
depends: none
risk: low — purely additive class on elements that are already `display:none` above their
breakpoint (`lg:hidden` / `sm:hidden`); no logic or layout change.

TASK-2: Add the same hook class to the three dual-purpose navigation panels (mobile overlay +
desktop sidebar in one element).
files: src/lib/components/feeds/FeedNavigation.svelte,
src/lib/components/contacts/ContactNavigation.svelte,
src/lib/components/time-tracking/TimeTrackingNavigation.svelte
depends: TASK-1 (use the identical class name)
risk: medium — the same DOM element doubles as the desktop sidebar (≥ lg, or ≥ sm for contacts);
the class itself is inert, but it enables TASK-3, whose rule must stay mobile-scoped or the skyrim
desktop look changes.

TASK-3: Style the hook class in the skyrim theme with an opaque, theme-matching background, scoped
to mobile widths only (e.g. `@media (max-width: 1023.98px)` to mirror Tailwind's `lg` split, value
suggested `rgba(14, 14, 18, 0.9)` to match `.content-container`).
files: static/themes/skyrim/skyrim.css
depends: TASK-1, TASK-2
risk: medium — the media-query breakpoint must match the components' responsive split points;
`ContactNavigation` switches at `sm` (640px), so a single `max-lg` rule would also make its sm–lg
sidebar opaque under skyrim (currently transparent). Decision needed: accept that (arguably better
readability) or add a second `sm`-scoped class/rule. Specificity is fine: the theme stylesheet is
appended to `<head>` at runtime and wins over Tailwind's `bg-c-bg` (proven by the existing
`.content-container` rule).

TASK-4: Verify — run `npm run check` and `npm run lint`, then manually in `npm run dev`: with
skyrim on mobile widths, open all six navs (settings hamburger, todos/notes/feeds/contacts/
time-tracking funnels) and confirm readability; confirm the skyrim desktop sidebars are unchanged
(still transparent); confirm default theme (light + dark) and at least one other theme are visually
unchanged on mobile and desktop.
files: none
depends: TASK-3
risk: low — verification only; catches regressions in other themes/breakpoints.
