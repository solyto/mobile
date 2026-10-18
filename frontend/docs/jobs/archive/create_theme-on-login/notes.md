# Notes: theme on login (TASK-1 environment facts + findings)

id: create
author: developer
date: 2026-10-07

## TL;DR

The white login surface reported in `brief.md` is caused by literal white
utilities (`bg-white` + `dark:bg-s-dark-2`) that do not react to single-mode
themes. That exact pattern on the auth cards **has already been fixed on `main`**
and is present on this branch after the merge (`8c0ad30`), so no further product
change is required for TASK-2. This job is effectively a duplicate of the earlier
fix; see "Evidence" below.

## Code facts (verified in this checkout)

- Single-mode themes set `supportsDarkMode: false` (`src/lib/config/themes.ts`)
  and `ThemeState.apply()` calls `document.documentElement.classList.remove('dark')`
  for them (`src/lib/state/Theme.svelte.ts:81`). The `dark:` Tailwind variant
  therefore never fires under Nord, skyrim, catppuccin-mocha/-latte, gruvbox,
  dracula, terminal, paper, atari.
- The app's correct themed-surface pattern is the semantic `--color-c-*` tokens
  (`bg-c-bg`, `bg-c-bg-surface`, `bg-c-bg-modal`, `bg-c-bg-elevated`), which every
  `static/themes/*/*.css` overrides at `:root`.
- All six auth cards already use `bg-c-bg-surface` (the fix), not
  `bg-white dark:bg-s-dark-2`:
  - `src/routes/auth/login/+page.svelte:110`
  - `src/routes/auth/register/+page.svelte:92`
  - `src/routes/auth/forgot-password/+page.svelte:72,100`
  - `src/routes/auth/reset-password/+page.svelte:72,85,105`
  - `src/routes/auth/logout/+page.svelte:27`
  - `src/routes/auth/verify/[user_id]/[token]/+page.svelte:44`
- `grep -rn 'bg-white' src/ | grep 'dark:bg-s-dark'` returns **nothing** — the
  problematic class pair has been fully swept from the codebase.
- Inputs are not a source of white: `@tailwindcss/forms`' default white input
  background is already overridden by `src/styles/components/forms.css` to
  `background-color: var(--color-c-bg-elevated)`, which is themed
  (Nord: `#434c5e`).
- Label text is not a source of white either: `src/styles/base.css` sets the root
  text to `text-c-neutral-7` (`dark:text-white`), and
  `src/routes/auth/+layout.svelte` re-scopes it to `text-c-neutral-8`
  (`dark:text-c-neutral-2`), so labels inherit a correctly themed color on the
  now-themed card. The analyst's `dark:text-white` concern applied to the old
  near-white card, which no longer exists.

## Evidence that the fix predates this branch's merge

`git show 70f6236` (`nord theme bug with todos`, Job:
`role_nord-theme-bug-with-todos`, 2026-08-25) changed exactly these auth-card
lines from `... bg-white ... dark:bg-s-dark-2` to `... bg-c-bg-surface ...`
(plus the TimePicker popup from `bg-white ... dark:bg-s-dark-3` to
`bg-c-bg-modal`). `git merge-base --is-ancestor 70f6236 HEAD` is true: the
commit is in this branch via the `main` merge parent. `git diff main...HEAD`
shows only the job's own docs — the branch adds no code relative to `main`.

## Hypothesis resolution (from tasks.md)

- **Hypothesis A (different stored theme):** this is the documented root-cause
  mechanism — with the pre-70f6236 code, `theme=nord` on localhost shows the
  white card because `bg-white` no longer has a `dark:` override — and it is now
  fixed in code.
- **Hypothesis B (version skew):** **disproven** for the current production
  deploy (see "Production facts" below). Production already serves the fixed
  markup and renders the login card correctly under Nord, so it is not running a
  pre-70f6236 build.

## Production facts (captured 2026-10-07, resolves TASK-1)

The previous passes recorded that the prod-browser facts could not be captured.
They can: the production app is reachable at `https://my.solyto.app` (the app
host from `src/lib/config/platform.ts`; the bare `solyto.app` is the marketing
landing page and 404s on `/auth/login`). Measured with Playwright (the engine
`shot` uses) after seeding `localStorage.theme = 'nord'`:

- `localStorage.getItem('theme')` → `"nord"`
- `document.documentElement.className` → `""` (no `dark` class — as designed for
  single-mode themes)
- login card class → `... bg-c-bg-surface ...` (the fixed markup, not
  `bg-white dark:bg-s-dark-2`)
- computed card `background-color` → `rgb(59, 66, 82)` = Nord `#3b4252`
- Nord stylesheet loaded → yes; `--color-white: #eceff4`, `--color-c-bg: #2e3440`

A full theme sweep on production (see `screenshots/render-report.md`) shows the
login card is dark under every single-mode dark theme and light only under the
by-design light themes. The white-card symptom from `brief.md` is not
reproducible on production today.

The other half of TASK-1 (the reporter's *local* instance) is not reachable from
this environment, but it is moot: production now matches the desired behaviour
that local already had.

## Verification (TASK-4) limitation

`node_modules` is not installed in this environment, so `npm run check`,
`npm run lint`, `npm test`, `npm run build`, and `npm run preview` could not be
run. Per the project hard rule ("NEVER install packages without asking") no
packages were installed. The remaining verification is a code/commit review, not
a rendered check. Recommended once dependencies and a backend are available:
preview `/auth/login` and `/auth/register` under default light, default dark, and
each single-mode theme (nord, skyrim, catppuccin-mocha/-latte, gruvbox, dracula,
terminal, paper, atari) and confirm there are no white cards.
