## Summary

The admin section (`/admin`, `/admin/users`) hardcoded raw Tailwind palette classes
(`bg-teal-50`, `text-blue-600`, `bg-white`, `dark:bg-gray-800`, `placeholder-gray-400`,
`#61d96a`) instead of the app's themed CSS custom properties, so it never changed
appearance when the user switched themes. Replaced every hardcoded color in the
admin-specific components with the app's semantic theme tokens (`c-primary`, `c-btn`,
`c-heading`, `c-action`, `c-danger`, `c-success`, `c-warning`, `c-neutral-*`,
`c-bg-surface`, `s-dark-3`) so the dashboard, user list, statistic widgets, role badges,
growth chart card, and the growth chart's line/area now follow the active theme.

`AdminNavbar.svelte` and `UserList.svelte` were confirmed (per tasks.md) to already use
themed classes correctly and were left untouched, aside from the color-token mapping
decisions below, which don't require changes to those files (one exception: the
`placeholder-gray-400` the tasks.md analysis missed, fixed in TASK-6 below).

## Changes

TASK-1: `src/routes/admin/+page.svelte`, `src/routes/admin/users/+page.svelte` — replaced the
hardcoded page-header icon badge classes (`bg-teal-50 dark:bg-teal-900/20` + `text-teal-600` on
`/admin`, `bg-blue-50 dark:bg-blue-900/20` + `text-blue-600` on `/admin/users`) with
`bg-c-primary/10 dark:bg-c-primary/20` + `text-c-primary` and `bg-c-btn/10 dark:bg-c-btn/20` +
`text-c-btn` respectively, matching the token mapping chosen for TASK-2.

TASK-2: `src/lib/components/admin/StatisticWidget.svelte` — reworked the `colorClasses` map so
each of the 7 named colors (`teal`/`blue`/`green`/`purple`/`orange`/`red`/`yellow`) maps 1:1 to
one of the app's semantic accent tokens instead of raw Tailwind palette classes:
- `teal` → `c-primary` (default value is `s-teal`)
- `blue` → `c-btn` (default value is `s-lightblue`)
- `green` → `c-success` (default value is `s-green`)
- `purple` → `c-heading` (default value is `s-darkpurple`; confirmed every theme in
  `static/themes/*` redefines this token, so it's safe to reuse as a 7th distinct accent slot)
- `orange` → `c-action` (default value is `s-orange`)
- `red` → `c-danger` (default value is `s-red`)
- `yellow` → `c-warning` (default value is `s-yellow`)

This gives a full 1:1 mapping (no categories share a token) that also happens to match the
original palette's default light-theme hues, resolving the open question in tasks.md about
whether collapsing colors would be necessary — it wasn't. Each `bg`/`text` pair now uses the
`token/10` + `dark:token/20` opacity pattern already used elsewhere in the app (e.g.
`QuickAddModal.svelte`'s `bg-c-danger/10 text-c-danger`), and the redundant `dark:bg-opacity-20`
utility on the wrapping `div` was removed since the token classes already cover both modes.

TASK-3: `src/lib/components/admin/UserEntry.svelte` — `getRoleColor()` now returns
`text-c-heading bg-c-heading/10 dark:bg-c-heading/20` for `super_admin` and
`text-c-btn bg-c-btn/10 dark:bg-c-btn/20` for `admin` (reusing the same token scheme as TASK-2:
purple → `c-heading`, blue → `c-btn`), keeping the existing `text-c-neutral-6 bg-c-neutral`
default unchanged since it was already themed. Removed the now-redundant `dark:bg-opacity-20`
from the two call sites. Also replaced the confirmed-user badge icon's raw `text-teal-500` with
`text-c-success` (same file, same underlying bug — a themed "confirmed/verified" semantic color
fits this checkmark better than the previous raw teal).

TASK-4: `src/lib/components/admin/UserGrowthChart.svelte` — replaced the card container's
`border-gray-200 bg-white ... dark:border-gray-700 dark:bg-gray-800` with
`border-c-neutral-1 bg-c-bg-surface ... dark:border-s-dark-3`, matching the card pattern used by
`StatisticWidget.svelte` and `UserEntry.svelte`.

TASK-5: `src/lib/components/charts/SmoothLineChart.svelte` + `UserGrowthChart.svelte` — resolved
via the admin-only path outlined in tasks.md and required by the reviewer verdict. Added a new
optional `color` prop to `SmoothLineChart` (default stays `#61d96a`, so `/check-in/trends`,
`/finances`, and `/finances/wealth` are unaffected) and `UserGrowthChart` now passes
`color="var(--color-c-success)"`, so the growth chart's line and filled-area gradient follow the
active theme. Because echarts renders to canvas and cannot resolve CSS `var()` itself, the
component resolves the value to a concrete color at render time via a temporary element +
`getComputedStyle`, and rebuilds the area gradient with the resolved color's rgb channels (the
same 0.25 → 0.02 opacity stops as before).

TASK-6 (verdict blocker, not in original task list): `src/lib/components/admin/UserList.svelte` —
replaced the search input's `placeholder-gray-400` (the one raw color the tasks.md analysis
missed, flagged by the reviewer) with `placeholder-c-neutral-4`, matching the adjacent search
icon's `text-c-neutral-4`.

## Known issues / follow-ups

- The echarts charts (all of them, not just this one) are created once on mount and do not
  live-repaint when the theme changes mid-session; `SmoothLineChart`'s color is resolved from
  the theme at render time. This pre-existing limitation affects every chart consumer in the
  app and was left out of scope.
- `src/routes/admin/+layout.svelte` has a stray inert HTML comment
  (`<!-- italic text-orange-500 text-green-300 c-warning ... -->`) listing raw Tailwind color
  classes. It renders nothing and isn't part of the theming bug, so it was left as-is.
- No `shot` render report exists for this job: the session has no dev server, no API at
  `localhost:8000`, and `node_modules` is not installed, so neither `npm run check` nor a live
  render could be produced. All changes are CSS-class-string / plain-TypeScript only.