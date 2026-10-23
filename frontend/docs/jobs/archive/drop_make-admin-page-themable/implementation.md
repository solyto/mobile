# Implementation: Make admin page themable

id: drop
developer: @developer
date: 2026-10-14

## Summary

Brought the admin area up to the same theme hooks the main app uses: the admin navbar now uses the theme gradient and nav/logo classes, and the admin pages/layout no longer paint their own opaque backgrounds, so the root layout's themed background shows through. Class-only markup changes.

## Changes

TASK-1: `src/lib/components/admin/AdminNavbar.svelte` — added `nav-desktop-container` to the outer div, replaced the hard-coded `not-dark:bg-gradient-to-b not-dark:from-c-btn not-dark:to-c-success dark:bg-s-dark-3` with `nav-desktop gradient-down` (same as `DesktopNavbar.svelte`), added `class="logo"` to the logo `<img>`.
TASK-2: `src/routes/admin/+page.svelte`, `src/routes/admin/users/+page.svelte` — removed `bg-c-neutral` and `dark:bg-s-dark` from the root div so pages inherit the theme background.
TASK-3: `src/routes/admin/+layout.svelte` — removed the opaque `bg-c-bg` from the content wrapper so translucent theme backgrounds (e.g. Skyrim) are not covered.
TASK-4: `src/lib/components/admin/UserGrowthChart.svelte` — active filter button uses `text-c-btn-text` instead of `text-white`.

## Known issues / follow-ups

- Not verified: `node_modules` is not installed in this workspace (`svelte-kit: not found`, eslint cannot resolve its config), and installing packages requires permission. So `npm run check`, `npm run lint` and `shot` renders were not run. The visual checks from tasks.md still need doing: Default light/dark, Nord, Catppuccin Latte and Skyrim on `/admin` and `/admin/users`. Pay special attention to TASK-3 (whether the nested `w-screen` shell still gets a solid background in every theme) and to card contrast on the white default-light background (TASK-2).
- `/.mcp.json` shows as modified in the worktree. This was not done by me, so I left it uncommitted.
- Out-of-scope items flagged by the analyst still apply: hard-coded English strings in admin, the duplicated context setup and shell in `admin/+layout.svelte`, and the dead clear-search button in `UserList.svelte`.
