# Tasks: theming on admin page

id: would
status: open
analyst: @analyst
date: 2026-08-27

<!-- Produced by @analyst from brief.md. -->

## Scope note

Branch check: brief.md specifies `branch: feature/would_theming-on-admin-page`; confirm
`git branch --show-current` matches before implementing (worktree should already be on it).

Analyzed the whole admin section (`src/routes/admin/**`, `src/lib/components/admin/**`).
Two files already use the app's theme tokens correctly and need no changes:
`src/lib/components/admin/AdminNavbar.svelte` and `src/lib/components/admin/UserList.svelte`
(both already use `bg-c-bg`, `bg-c-bg-surface`, `border-c-neutral-*`/`dark:border-s-dark-3`,
`c-btn`, `c-btn-hover`, `c-success`, etc.). Re-check them only if TASK-2/TASK-3's color
mapping introduces a new token that should also be reflected in the nav.

The rest of the admin section hardcodes raw Tailwind palette classes (e.g. `bg-teal-50`,
`text-blue-600`, `bg-white`, `dark:bg-gray-800`, `border-gray-200`) instead of the app's
themed CSS variables (`c-bg`, `c-bg-surface`, `c-neutral-*`, `c-primary`, `c-btn`, `c-action`,
`c-danger`, `c-success`, `c-warning`, `s-dark-*`), which are the only tokens that get
redefined per theme in `static/themes/*/*.css`. Raw Tailwind colors (`teal-50`, `purple-600`,
`gray-800`, ...) do not change with the theme, which is the bug described in the brief.

## Task breakdown

TASK-1: Replace the hardcoded page-header icon badge classes (`bg-teal-50 dark:bg-teal-900/20` +
`text-teal-600` on `/admin`, `bg-blue-50 dark:bg-blue-900/20` + `text-blue-600` on
`/admin/users`) with themed classes consistent with the rest of the app (e.g. neutral/surface
background + a semantic accent color token).
files: src/routes/admin/+page.svelte, src/routes/admin/users/+page.svelte
depends: none
risk: low — isolated, purely visual change confined to two header blocks.

TASK-2: Rework `StatisticWidget`'s `colorClasses` map (`teal/blue/green/purple/orange/red/yellow`
→ raw Tailwind `bg-*-50`/`text-*-600`/`border-*-400` classes) to use the app's semantic theme
tokens (`c-primary`, `c-btn`, `c-action`, `c-danger`, `c-success`, `c-warning`, `c-neutral-*`,
opacity variants thereof, etc.) so widget icon colors follow the active theme.
files: src/lib/components/admin/StatisticWidget.svelte
depends: none
risk: medium — the theme system only exposes ~9 semantic accent tokens, but this component is
used with 7 distinct "colors" across ~30 call sites in `/admin/+page.svelte`; a clean 1:1
mapping isn't obvious from the existing palette and may need a judgment call (e.g. reusing
tokens for multiple categories, or using opacity/shade variants of the same token). Flag to
brief author if the resulting reduced palette feels wrong.

TASK-3: Replace the raw Tailwind role-color helper (`getRoleColor()` in `UserEntry.svelte`,
returning `text-purple-600 bg-purple-50` / `text-blue-600 bg-blue-50` / `bg-c-neutral`) with
theme tokens so the role icon background and role badge colors track the active theme.
files: src/lib/components/admin/UserEntry.svelte
depends: none (should reuse whatever token scheme is chosen in TASK-2 for consistency between
role colors and stat widget colors)
risk: low — small, self-contained function, two call sites in the same file.

TASK-4: Re-theme `UserGrowthChart`'s card container, which currently hardcodes
`bg-white`, `dark:bg-gray-800`, `border-gray-200`, `dark:border-gray-700` instead of the
`bg-c-bg-surface` + `border-c-neutral-1 dark:border-s-dark-3` pattern used by every other card
in the admin section (`StatisticWidget`, `UserEntry`) and the app at large.
files: src/lib/components/admin/UserGrowthChart.svelte
depends: none
risk: low — single container `div`, direct pattern match already established in sibling files.

TASK-5 (needs scope confirmation before starting): `SmoothLineChart`, the shared echarts
wrapper rendered inside `UserGrowthChart`, hardcodes a fixed line/area color (`#61d96a`) rather
than reading a theme CSS variable, so the growth chart's line will not follow the active theme
even after TASK-4. This component is also used by `/check-in/trends`, `/finances`, and
`/finances/wealth`, so it is shared infrastructure, not admin-only — fixing it here would
change chart colors on three non-admin pages too, which is arguably outside "the admin
section" as scoped in the brief.
files: src/lib/components/charts/SmoothLineChart.svelte (shared — affects non-admin routes)
depends: none
risk: high — touches a shared component with three consumers outside the admin section;
recommend confirming with the brief author whether this is in scope, or whether the admin
growth chart should get its own themed color via a prop instead (smaller, admin-only change:
pass a themed color, e.g. `var(--color-c-success)`, into `SmoothLineChart` as a new optional
prop rather than changing its hardcoded default — would keep the other three routes unaffected).

## Open questions for brief author

- TASK-2: acceptable to collapse the 7-color `StatisticWidget` palette down to the app's
  smaller set of semantic tokens (some categories reusing the same token), or is visual
  distinction between all 7 categories a hard requirement?
- TASK-5: is recoloring the shared `SmoothLineChart` line/area in scope, or should the fix be
  admin-local only (e.g. a new optional color prop used solely by `UserGrowthChart`)?
