# Tasks: transparency in search

id: pair
status: open
analyst: analyst
date: 2026-08-31

<!-- Produced by @analyst from brief.md. -->

## Context

Two components implement the same "expandable overlay search input" pattern
(icon button → absolutely-positioned input that grows in width, with an
`IconCircleX` clear/close button, `Ctrl+F` shortcut via `KeyManager`):

- `src/lib/components/libraries/shared/Search.svelte` (used by all library
  headers: books, movies, music, games, links, quotes, recipes, plants)
- `src/lib/components/contacts/Search.svelte` (contacts page)

Reference for correct transparency/blur styling is
`src/lib/components/ui/Notifications.svelte`, whose surface uses
`bg-c-neutral/60 ... backdrop-blur-sm ... dark:bg-s-dark/80`.

Current state of the two search inputs:
- Library search: `bg-transparent ... backdrop-blur-xs` — has a blur utility
  but no tinted background, so the blur has nothing to visually anchor to
  (looks flat/invisible rather than a frosted-glass surface like the
  reference).
- Contacts search: `bg-c-bg-surface` — fully opaque, no `backdrop-blur-*` at
  all. This is the one where the effect has most clearly "got lost".

I looked for other components using the same overlay-search pattern
(`searchVisible` / `inputExpanded` state, `IconSearch` + `IconCircleX`,
`Ctrl+F` via `KeyManager`) and found only these two. Other `IconSearch` uses
(`admin/UserList.svelte`, `weather/ManageWeatherCity.svelte`,
`feeds/FeedNavigation.svelte`) are plain inline/modal filter inputs with a
different visual language (opaque surfaces inside already-opaque
modals/panels) — not the same search functionality, so treated as out of
scope per the brief's focus on "the same search functionality" as the
library one.

## Task breakdown

TASK-1: Restyle the library search input (`libraries/shared/Search.svelte`) to use a tinted, blurred surface matching the `UiNotifications` reference instead of `bg-transparent`.
    files: src/lib/components/libraries/shared/Search.svelte
    depends: none
    risk: low — pure Tailwind class change on one input element; the component is shared across 8 library routes, so must be checked against light/dark and on each of those pages, but no logic changes.

TASK-2: Restyle the contacts search input (`contacts/Search.svelte`) to add the same tinted, blurred surface (currently fully opaque `bg-c-bg-surface`, no blur).
    files: src/lib/components/contacts/Search.svelte
    depends: none
    risk: low — pure Tailwind class change on one input element, same visual pattern as TASK-1, isolated to the contacts page.

TASK-3: Visually verify both restyled search inputs render as intended (light + dark theme, over varied background content) and that legibility/contrast of typed text and placeholder is not degraded by the new semi-transparent background.
    files: none (verification only, via render/screenshot tooling — not available to this read-only analyst pass)
    depends: TASK-1, TASK-2
    risk: low — verification step, but flagged because "renders as expected" is a visual judgment call the brief explicitly asks to match against a reference; should not be skipped.

## Out of scope / open question for the developer

- Whether TASK-1 and TASK-2 should converge on a single shared component
  (the two files are near-duplicates already) is a reasonable follow-up but
  is a refactor beyond "restore transparency/blur" — not doing this here
  per the "do not refactor things unrelated to the current task" rule,
  unless the developer judges the class change is trivial to apply
  identically to both and prefers to leave the duplication as-is (matches
  current codebase pattern, since both files already duplicate this logic).
- Exact shade/opacity to use (e.g. reusing `bg-c-neutral/60 dark:bg-s-dark/80`
  verbatim vs. a lighter variant more suitable for a small input vs. the
  notification card) is a visual judgment call for the developer, guided by
  the `UiNotifications` reference the brief points to.
