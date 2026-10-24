# Verdict: theming on admin page

id: would
status: open
reviewer: @reviewer (deepseek-v4-flash)
date: 2026-08-27

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

Verified: branch `feature/would_theming-on-admin-page` matches brief; base `main`
(`.manigot/manigot.json`); diff `main...HEAD` covers exactly the files in
implementation.md (4 admin components + 2 admin routes + shared `SmoothLineChart` +
job docs). Per-task commits `[would] TASK-N:` present; implementation.md has its own
commit (`f73c23a`). The two blockers from the previous verdict (`bdfcff7`) are resolved:
TASK-5 was implemented via the admin-only path (commits `35c3562`), and
`placeholder-gray-400` was themed (commit `f61fc9d`).

Theme system verified: all tokens used in this job (`c-primary`, `c-btn`, `c-success`,
`c-heading`, `c-action`, `c-danger`, `c-warning`, `c-neutral-4`, `c-bg-surface`,
`s-dark-3`) are defined in `src/styles/tokens.css` `@theme` and redefined in all 10
`static/themes/*/*.css` at `:root` (`--color-c-heading` present in every theme).
`dark:` is class-based (`@custom-variant dark (&:where(.dark, .dark *))` in
`src/app.css`); theme CSS loads via `<link>` into `<head>` (`Theme.svelte.ts`) and
overrides cascade from `:root`, so Tailwind v4 `color-mix()` opacity utilities
(`bg-c-primary/10`, `dark:bg-c-primary/20`) pick up the runtime theme value. The
`token/10 dark:token/20` pattern is already established elsewhere in the app
(`check-in/stats/Averages.svelte:119`, `QuickAddModal.svelte:160,192`). The removed
`dark:bg-opacity-20` utilities were dead in Tailwind v4 (opacity is inline `/n`), so
their removal is correct and the new `dark:bg-token/20` classes are what actually fix
dark-mode contrast.

Remaining raw palette classes in the admin section: only `text-white`/`dark:text-white`
(contrast-on-accent text; `--color-white` is itself theme-overridden, e.g. nord.css:48)
and one inert HTML comment in `src/routes/admin/+layout.svelte:61` (renders nothing).
Neither is a theming defect.

TASK-1: PASS
notes: `src/routes/admin/+page.svelte:52-53` (`bg-c-primary/10 dark:bg-c-primary/20` +
`text-c-primary`) and `src/routes/admin/users/+page.svelte:23-24` (`bg-c-btn/10
dark:bg-c-btn/20` + `text-c-btn`); both tokens exist in every theme, mapping matches the
TASK-2 scheme.

TASK-2: PASS
notes: `src/lib/components/admin/StatisticWidget.svelte:19-27` — all 7 colors map 1:1 to
distinct semantic tokens (teal→c-primary, blue→c-btn, green→c-success, purple→c-heading,
orange→c-action, red→c-danger, yellow→c-warning); all tokens defined in all themes. All
call sites in `/admin/+page.svelte` use only the 7 defined names. Non-blocking: the
`border` field of `colorClasses` remains unused dead code (pre-existing, present before
this job).

TASK-3: PASS
notes: `src/lib/components/admin/UserEntry.svelte:66-68` — `getRoleColor()` returns
`text-c-heading bg-c-heading/10 dark:bg-c-heading/20` (super_admin) and
`text-c-btn bg-c-btn/10 dark:bg-c-btn/20` (admin), consistent with the TASK-2 scheme;
default `text-c-neutral-6 bg-c-neutral` was already themed. The adjacent `text-teal-500` →
`text-c-success` confirmed-badge change (line 92) is the same raw-color bug in the same
file and consistent with the brief; acceptable.

TASK-4: PASS
notes: `src/lib/components/admin/UserGrowthChart.svelte:152` — container now
`border-c-neutral-1 bg-c-bg-surface ... dark:border-s-dark-3`, matching `StatisticWidget`
and `UserEntry` card pattern.

TASK-5: PASS
notes: `src/lib/components/charts/SmoothLineChart.svelte` — new optional `color` prop
(default `#61d96a`, so `/check-in/trends`, `/finances`, `/finances/wealth` are untouched —
verified none pass `color`; default path resolves to `rgb(97, 217, 106)` and rebuilds the
identical `0.25 → 0.02` gradient, so those charts render exactly as before).
`UserGrowthChart.svelte:176-181` passes `color="var(--color-c-success)"`. The
`resolveColor()` probe (create div, set `style.color`, `getComputedStyle`) correctly
resolves the CSS var from the active theme at render time, and `withAlpha()` rebuilds the
filled-area gradient. Graceful degradation if a browser ever returns a non-`rgb()` format
(`withAlpha` falls back to the raw string — two identical gradient stops, no crash).
Chart is created inside `onMount`/client `$effect` only — no SSR exposure. Known
limitation (no live repaint when the theme changes mid-session) is pre-existing for all
echarts consumers and documented in implementation.md.

TASK-6 (verdict blocker, not in original task list): PASS
notes: `src/lib/components/admin/UserList.svelte:20` — `placeholder-gray-400` →
`placeholder-c-neutral-4`, matching the adjacent search icon's `text-c-neutral-4`
(`c-neutral-4` is a theme token redefined by every theme; Tailwind v4 `placeholder-*`
variant generates `::placeholder { color: var(--color-c-neutral-4) }`).

## Security

None. Changes are presentation-only (CSS class strings + ~40 lines of plain TypeScript
in `SmoothLineChart`); no data handling, no new dependencies, no i18n string changes
(nothing added to `en/de/es/fr`).

## Overall

APPROVED

What must change before this can be merged:
- Nothing. Both blockers from the previous review round are resolved (TASK-5 themed
  chart color via the admin-only prop path; `placeholder-gray-400` themed). Non-blocking
  notes above (`withAlpha` rgb()-only regex, dead `border` field, no live chart repaint on
  theme switch, inert comment in admin `+layout.svelte`) are pre-existing or out of scope
  and do not gate merge.