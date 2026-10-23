# Tasks: Make admin page themable

id: drop
analyst: @analyst
date: 2026-10-14

## Findings (read before the tasks)

- Theme loading already reaches `/admin`. `src/routes/admin/+layout.svelte` is a
  normal nested layout, not `+layout@`, so the root `+layout.svelte` wraps it and
  runs `theme.load()`. The theme stylesheet and the `.dark` / `.theme-dark`
  classes are therefore already on `<html>` on admin pages. **No state or loading
  work is needed.**
- The problem is the admin markup. In several places it skips the hooks that the
  rest of the app gives to the theme CSS (`static/themes/*/*.css` and
  `src/styles/base.css`):
  1. `AdminNavbar.svelte` paints a fixed gradient,
     `not-dark:bg-gradient-to-b not-dark:from-c-btn not-dark:to-c-success dark:bg-s-dark-3`.
     The main `DesktopNavbar.svelte` uses `.gradient-down` instead, which reads
     the theme's `--t-gradient-colors`. AdminNavbar also lacks the
     `nav-desktop-container` / `nav-desktop` / `logo` classes that themes target
     (Skyrim, Y2K, Paper, Dracula, Gruvbox, Atari and Terminal all style `.logo`
     or the nav containers). This is the most visible un-themed element.
  2. Both admin pages paint their own page background,
     `bg-c-neutral ... dark:bg-s-dark`. No other feature page does this (they
     inherit `bg-c-bg` from the layout). So the admin pages show the
     "neutral/inactive" grey token instead of the theme's background.
  3. In `admin/+layout.svelte`, the content wrapper sets an opaque `bg-c-bg` on
     top of the root layout's `.content-container`. This hides Skyrim's
     translucent content background and wallpaper.
  4. The active filter button in `UserGrowthChart.svelte` uses a hard-coded
     `text-white` on `bg-c-btn`. The shared buttons use the `text-c-btn-text`
     token (overridden by Y2K).
- The rest of the admin components (StatisticWidget, UserEntry, UserList)
  already use semantic tokens (`c-bg-surface`, `c-neutral-*`, `c-primary`,
  `c-btn`, …), and the themes override those tokens. I don't plan to change
  them unless a render shows otherwise.
- No render report exists for this job. These findings come from reading the
  code only.

## Task breakdown

TASK-1: In `AdminNavbar.svelte`, use the same theme hooks as `DesktopNavbar.svelte`:
  - Add `nav-desktop-container` to the outer div.
  - Replace `not-dark:bg-gradient-to-b not-dark:from-c-btn not-dark:to-c-success dark:bg-s-dark-3`
    with `nav-desktop gradient-down`. `base.css` already maps `.gradient-down`
    to `s-dark-3` in dark mode.
  - Add `class="logo"` to the `<img>`.
  Leave the entries, transition and links as they are.
  files: src/lib/components/admin/AdminNavbar.svelte
  depends: none
  risk: low — class-only change that copies an existing, working pattern; the default light theme's navbar gradient will change from btn→success to lightblue→green (`--t-gradient-colors`), which is the intended app look.

TASK-2: Remove the page-level background override (`bg-c-neutral` and
  `dark:bg-s-dark`) from the root `<div>` of both admin pages. They will then
  inherit the theme background from the layout, like every other feature page.
  files: src/routes/admin/+page.svelte, src/routes/admin/users/+page.svelte
  depends: none
  risk: low — two class removals; in the default light theme the page becomes white (`c-bg`) instead of gray-50, so the white `c-bg-surface` cards lose some contrast against it, but their `border-c-neutral-1` and shadow should still mark them out (check by eye).

TASK-3: Remove the redundant `bg-c-bg` from the content wrapper in
  `admin/+layout.svelte` (line 57). The root layout's `.page-container` /
  `.content-container` already provide the themed background, and this extra
  opaque layer is what blocks Skyrim's translucent background.
  files: src/routes/admin/+layout.svelte
  depends: TASK-2 (verify together: after both, the admin background must come only from the root layout)
  risk: medium — the admin layout nests a second `w-screen` container inside the root layout's content container, so whether every theme still gets a solid background here needs checking by eye (default light/dark, one dark single-mode theme such as Nord, and Skyrim).

TASK-4: In `UserGrowthChart.svelte`, swap `class:text-white` on the active
  filter button for `class:text-c-btn-text`. This matches `TextButton` /
  `IconButton`.
  files: src/lib/components/admin/UserGrowthChart.svelte
  depends: none
  risk: low — one token swap; only Y2K overrides `c-btn-text`, so other themes look the same.

## Verification (for @developer / reviewer)

- `npm run check` and `npm run lint` must pass. There are no unit tests, because
  this is markup only (`docs/TESTING.md`: don't test markup).
- Look at `/admin` and `/admin/users` with these themes: Default (light and
  dark), Nord, Catppuccin Latte, and Skyrim. The navbar gradient/logo and the
  page background should match the main app's navbar and pages under the same
  theme.

## Out of scope / unclear (not planned, flag only)

- The admin pages contain hard-coded English strings ("Dashboard",
  "Overview of platform statistics", "User Growth", "By Month", role labels,
  "No users found", …) that are not in the i18n tables. That is a
  translation issue, not a theming one, so I left it out. Raise it as a
  separate job if wanted.
- `admin/+layout.svelte` calls `setAuth()`, `setTranslation()`, `setKeyManager()`
  and others again even though the root layout already provides them, and it
  renders a second full-screen (`w-screen`, `innerHeight`) shell inside the root
  shell. That is a structural issue that may deserve its own job, but this job
  doesn't need it, so I left it alone.
- In `UserList.svelte`, the clear-search button is bound to a local
  `searchQuery` that is never set (search goes through
  `userManagement.search`), so the button never appears. This is a bug, not
  theming, and is out of scope.
- If the owner meant more than "use the theme's colours, gradient, logo and
  background" (for example a dedicated admin look per theme, or theme-specific
  rules for the admin navbar), that needs clarifying. These tasks only bring
  admin up to the theming the main app already has.
