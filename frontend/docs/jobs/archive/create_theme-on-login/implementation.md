## Summary

The white surface reported in `brief.md` is the auth **card**, not the page body
and not a late/failed theme load. The six auth cards used the literal pair
`bg-white dark:bg-s-dark-2`. The `dark:` variant only fires when `<html>` carries
the `dark` class, and `ThemeState.apply()` (`src/lib/state/Theme.svelte.ts:81`)
explicitly removes that class for every single-mode theme (`supportsDarkMode:
false`: nord, skyrim, catppuccin-mocha/-latte, gruvbox, dracula, terminal,
paper, atari). Under Nord the themed `dark:bg-s-dark-2` fallback therefore never
applied, so the card stayed at Nord's deliberately near-white
`--color-white: #eceff4` (`static/themes/nord/nord.css:47-48`) on an otherwise-Nord
page — a stable state, not a flash.

That defect is **already fixed and present in this branch**. Commit `70f6236`
("nord theme bug with todos", Job `role_nord-theme-bug-with-todos`, 2026-08-25)
swept the auth cards to the semantic `bg-c-bg-surface` token and
`TimePicker.svelte` to `bg-c-bg-modal`; it reached this branch through the `main`
merge `8c0ad30`. `git diff main...HEAD -- src/ static/ tests/ package.json` is
empty, so this branch contributes no product source change. **This job is a
duplicate of the earlier fix and needs no code change** — the correct outcome is
to close it against `70f6236`.

## Changes

TASK-1: No product code. Environment facts were captured against the real
  production app (`https://my.solyto.app`, the app host from
  `src/lib/config/platform.ts`; bare `solyto.app` is the marketing landing page).
  After seeding `localStorage.setItem('theme','nord')` and booting the page:

  | fact | value |
  | --- | --- |
  | `localStorage.theme` | `"nord"` |
  | `documentElement.className` | `""` (no `dark` class — by design for single-mode themes) |
  | login card class | `… border-2 border-white/5 bg-c-bg-surface …` |
  | computed card `background-color` | `rgb(59, 66, 82)` = Nord `#3b4252` |
  | computed card `color` | `rgb(216, 222, 233)` = Nord `#d8dee9` |
  | `--color-white` / `--color-c-bg` / `--color-c-bg-surface` | `#eceff4` / `#2e3440` / `#3b4252` |
  | Nord stylesheet present | yes |

  Hypothesis A (different stored theme) is the documented root-cause mechanism,
  now fixed in code; Hypothesis B (stale/skewed production assets) is disproven —
  production already serves the fixed markup (`bg-c-bg-surface`) and renders the
  card as Nord `#3b4252`. The `brief.md` screenshot decodes to a 973x989 Nord page
  with one near-white centred region (≈5.9%), i.e. the pre-fix card, matching the
  `bg-white … dark:bg-s-dark-2` failure mode rather than a FOUC (the surrounding
  page is Nord, not default-light).

TASK-2: No change needed. All nine auth-card blocks already carry
  `bg-c-bg-surface`: `login:110`, `register:92`,
  `forgot-password:72,100`, `reset-password:72,85,105`, `logout:27`,
  `verify/[user_id]/[token]:44`. `--color-c-bg-surface` resolves to `#ffffff` in
  default light (`src/styles/tokens.css:24`), `var(--color-s-dark-2)` in default
  dark (`src/styles/default.css:19`, pixel-identical to the old
  `bg-white dark:bg-s-dark-2`), and `#3b4252` under Nord
  (`static/themes/nord/nord.css:34,73`). The two secondary substitutions named
  in the task were deliberately **not** applied:
  - `dark:text-white` → `text-c-neutral-9 dark:text-white`: auth labels already
    inherit a correctly themed colour from `src/routes/auth/+layout.svelte`
    (`text-c-neutral-8` = Nord `#d8dee9`, ≈7:1 on `#3b4252`). Adding an explicit
    light-mode token would change default-light rendering (`c-neutral-8` →
    `c-neutral-9`), which TASK-2 requires to stay pixel-identical.
  - `border-white/5` → token border: no target token was specified, and
    `--color-c-border` is transparent / not overridden by Nord, so a blind swap
    would remove the decorative card outline. The accepted upstream fix left it
    untouched.

TASK-3: No change (optional item, and already resolved). `TimePicker.svelte`
  already uses `bg-c-bg-modal`, fixed by the same `70f6236` sweep. No
  `bg-white … dark:bg-s-dark*` pair remains anywhere under `src/`.

TASK-4: Verification.
  - Repo: `git merge-base --is-ancestor 70f6236 HEAD` → true **and**
    `git merge-base --is-ancestor 70f6236 origin/main` → true;
    `git diff main...HEAD -- src static tests package.json` is empty. All nine
    auth-card blocks carry `bg-c-bg-surface`; `grep -rn 'bg-white' src/routes/auth/`
    → none; `grep -rn 'bg-white' src/ | grep 'dark:bg-s-dark'` → none. The
    remaining `bg-white` hits under `src/` are decorative (icon dots, toggle knob,
    score bar) plus the known `Progress.svelte:74` follow-up.
  - Production: `curl https://my.solyto.app/auth/login` → HTTP 200, **0**
    occurrences of `bg-white`, **1** of `bg-c-bg-surface`; the login card class is
    exactly `… border-2 border-white/5 bg-c-bg-surface px-8 pt-6 pb-8 shadow-sm
    md:min-w-80`. The white card from `brief.md` is not reproducible.
  - Rendered sweep (production, recorded in `screenshots/render-report.md`): the
    login card is dark under every single-mode dark theme and light only under the
    by-design light themes (default-light, `catppuccin-latte`, `paper`).
  - Limitation: `node_modules` is not installed, and the project hard rule forbids
    installing packages without asking, so `npm run check`/`lint`/`test`/`build`
    could not be run. With no product diff there is nothing new for them to check.
  - Final independent re-verification (2026-10-07, same day as the prod capture
    above): all git/grep checks re-run and pass (`70f6236` ancestor of HEAD and
    `origin/main`; `git diff main...HEAD -- src static tests package.json` empty;
    no `bg-white` in `src/routes/auth/`; no `bg-white … dark:bg-s-dark*` pair in
    `src/`; TimePicker on `bg-c-bg-modal`). Production re-checked live:
    `https://my.solyto.app/auth/login` serves HTTP 200 with `bg-c-bg-surface`
    present and **0** `bg-white` occurrences, and
    `/themes/nord/nord.css` serves `--color-c-bg-surface: #3b4252` /
    `--color-white: #eceff4`. Conclusion unchanged: duplicate of `70f6236`,
    no product change needed.
  - Independent re-verification (2026-10-07, later pass): decoded the
    `brief.md` screenshot itself (973×989) without assuming prior notes. The
    only near-white region is a single 320×280 rectangle at (374,339)–(693,618)
    (`#ebeef4`/`#eceff4`, 6.0% of pixels) — exactly the auth card's
    `md:min-w-80` (320px) width — on an otherwise-Nord (`#353d4a`) page. This
    directly confirms the card (not the page body, not a FOUC) as the white
    surface. `git show 70f6236` performs exactly the `bg-white
    dark:bg-s-dark-2 → bg-c-bg-surface` swap on all six auth cards; the commit
    is an ancestor of both `HEAD` and `origin/main`. Production re-checked:
    `curl https://my.solyto.app/auth/login` → HTTP 200, `bg-c-bg-surface ×1`,
    `bg-white ×0`, `dark:bg-s-dark-2 ×0`. Conclusion unchanged: this branch is a
    docs-only duplicate of `70f6236`; no product change is warranted.

## Known issues / follow-ups

- This job is a duplicate: the defect was already fixed by `70f6236` before this
  branch's `main` merge. Product behaviour needs no change; close against the
  existing fix.
- `docs/jobs/create_theme-on-login/tasks.md` is stale — it was written at rev 4
  before the `70f6236` merge and still describes the pre-fix auth-card classes.
  Left as the analyst's artifact; the corrected picture is here.
- Inherited open items (out of scope): pre-paint theme script / FOUC hardening
  (`theme.load()` runs in `onMount`, so there is still a brief light-default flash
  before a single-mode theme applies), an `html`/`body` background-color rule, an
  account-synced theme setting, and `static/themes/y2k/y2k.css` existing on disk
  but missing from `src/lib/config/themes.ts`.
- Same bug class, outside this job's auth scope: `src/lib/components/todos/props/Progress.svelte:74`
  still uses `not-dark:bg-white`, which renders white under single-mode dark
  themes (`.dark` absent) — candidate for a follow-up identical to TASK-3.
- Cosmetic consistency (not applied): auth labels use bare `dark:text-white`
  while most of the app uses `text-c-neutral-9 dark:text-white`.
