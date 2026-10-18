# Tasks: theme on login

id: create
status: open
analyst: architect
date: 2026-08-22 (rev 4 — local-vs-prod difference unresolved; two hypotheses,
discriminating facts required from both environments before choosing)

<!-- Produced by @analyst from brief.md. -->

## Findings (analysis)

**Correction (rev 2):** the screenshot shows most of the Nord theme applied with a
white surface on the login page. That rules out late/failed theme-CSS loading
(FOUC would show the all-default light page, not a mostly-Nord one). The real
mechanism:

The app colors surfaces two ways:

1. **Semantic tokens** (`bg-c-neutral`, `text-c-btn`, `bg-c-bg-elevated`, …).
   These compile to `--color-c-*` CSS variables, which every theme CSS overrides
   in `:root`. Nord sets them all → these surfaces are correctly Nord.
2. **Literal Tailwind colors** (`bg-white`, `text-white`, `border-white/5`) plus a
   `dark:` fallback (`dark:bg-s-dark-2`). `bg-white` compiles to
   `var(--color-white)` — and Nord **deliberately keeps that near-white**
   (`--color-white: #eceff4` "Snow Storm", see comment in
   `static/themes/nord/nord.css:47-48`, chosen so `text-white` stays legible).
   The `dark:bg-s-dark-2` escape hatch never fires for Nord, because single-mode
   themes (`supportsDarkMode: false`) cause `ThemeState.apply()` to explicitly
   `document.documentElement.classList.remove('dark')`
   (`src/lib/state/Theme.svelte.ts:81`).

So every auth page card (`routes/auth/*/…: class="… bg-white … dark:bg-s-dark-2"`)
renders as a near-white card on an otherwise-Nord page — a stable state, not a
flash. Confirmed pattern in all six auth pages: login (110), register (92),
forgot-password (72, 100), reset-password (72, 85, 105), logout (27),
verify (44). Label text `dark:text-white` has the same problem (falls back to
washed-out inherited `text-c-neutral-7` on the light card).

**Local vs prod — unresolved, two hypotheses, do not assume.** The code
mechanism above is verified from the repo; which variant applies depends on
browser state the analyst cannot see. Discriminating facts to capture on BOTH
localhost (looks correct) and prod (white card): `localStorage.getItem('theme')`,
`document.documentElement.className`, computed card background, and whether prod
runs the same frontend version as local.
- Hypothesis A — different stored theme: local `theme=default` → `.dark`
  present → `dark:bg-s-dark-2` fires → correct. Prod `theme=nord` → `.dark`
  stripped → literal `bg-white`. Predicts: setting `theme=nord` on localhost
  reproduces the white card.
- Hypothesis B — version skew: local `theme=nord` and still correct → local and
  prod deliver different CSS (older deploy on prod, or SW-cached old
  `nord.css` that handled `--color-white` differently) → bug is stale assets,
  not class logic. Predicts: localhost with `theme=nord` does NOT show the
  white card.

Previously suspected mechanisms, now demoted:
- FOUC / theme applied too late — would show all-default light page, not
  mostly-Nord. Optional hardening, not this bug.
- Theme not synced to account — the user's Nord **did** apply (LocalStorage had
  it), so not the cause. Follow-up, out of scope.
- Service worker stale CSS — would break all Nord colors, not one surface. Dropped.

## Task breakdown

TASK-1: Capture environment facts, then pick the hypothesis — on localhost
    (where it looks correct) and on prod (where it doesn't), record:
    `localStorage.getItem('theme')`, `document.documentElement.className`,
    computed background-color of the login card, and the deployed frontend
    version vs. this checkout. If Hypothesis A holds, additionally confirm the
    one-line repro (`localStorage.setItem('theme','nord'); location.reload();`
    on localhost /auth/login → white card). Record all of it in job notes.
    No product code changes.
    files: docs/jobs/create_theme-on-login/* (notes only)
    depends: none
    risk: low — read-only analysis and local reproduction.

TASK-2: Replace literal white utilities with semantic tokens on the auth pages —
    swap `bg-white dark:bg-s-dark-2` → `bg-c-bg-surface` (existing utility, used
    in InputAutocomplete; maps to #ffffff light-default, s-dark-2 dark-default,
    and #3b4252 under Nord — same as intended), `dark:text-white` →
    `text-c-neutral-9 dark:text-white`, `border-white/5` → token-based border,
    across all six auth page cards.
    files: src/routes/auth/login/+page.svelte,
    src/routes/auth/register/+page.svelte,
    src/routes/auth/forgot-password/+page.svelte,
    src/routes/auth/reset-password/+page.svelte,
    src/routes/auth/logout/+page.svelte,
    src/routes/auth/verify/[user_id]/[token]/+page.svelte
    depends: TASK-1
    risk: medium — visual change on high-traffic pages across all 10 themes;
    must keep default light/dark rendering pixel-identical.

TASK-3 (optional, needs owner go-ahead): Same literal-white pattern exists in
    `TimePicker.svelte` (popup `bg-white dark:bg-s-dark-3`) — same bug class,
    visible in single-mode themes app-wide. Fix or file as follow-up.
    files: src/lib/components/forms/TimePicker.svelte
    depends: TASK-2
    risk: low — one-line class swap, but outside the auth scope of this job.

TASK-4: Verify — `npm run check`, `npm run lint`, `npm test`, then build +
    preview and eyeball /auth/login (and register) under: default light, default
    dark, and each single-mode theme (nord, skyrim, catppuccin-mocha/-latte,
    gruvbox, dracula, terminal, paper, atari). No white cards, no regressions
    in default light/dark.
    files: none (findings go into implementation.md)
    depends: TASK-2 (and TASK-3 if undertaken)
    risk: low — verification only.

## Open questions

- TASK-3 in or out of scope?
- Follow-ups tracked outside this job: pre-paint theme script (FOUC hardening),
  `html` background-color rule, account-synced theme setting,
  `static/themes/y2k/y2k.css` missing from `themes.ts`.
