# Verdict: theme on login

id: create
status: approved
reviewer: reviewer
date: 2026-10-08

<!-- Produced by @reviewer after implementation. -->

## Review

Branch `feature/create_theme-on-login` is **docs-only**: `git diff
main...HEAD` touches only `docs/jobs/create_theme-on-login/*` (no `src/`,
`static/`, `tests/`, or `package.json` change). The implementation's central
claim — that the reported defect was already fixed on `main` by commit
`70f6236` before this job — is independently confirmed.

TASK-1: PASS
notes: The environment-fact capture was done on production
  (`https://my.solyto.app/auth/login`), where the bug actually reproduces;
  facts recorded in `implementation.md`/`notes.md` and
  `screenshots/render-report.md`. Hypothesis A (different stored theme) is
  confirmed as the documented mechanism; Hypothesis B (stale prod assets) is
  correctly disproven because prod already serves the fixed markup. The
  localhost half of the capture was not performed, but it is genuinely moot
  once prod is verified to serve the fixed code. No product code required, as
  the task itself specified.

TASK-2: PASS
notes: The required swap is already present. `grep -rn 'bg-c-bg-surface'
  src/routes/auth/` returns all nine expected blocks (login:110, register:92,
  forgot-password:72,100, reset-password:72,85,105, logout:27,
  verify/[user_id]/[token]:44); `grep -rn 'bg-white' src/routes/auth/` returns
  nothing and no `bg-white … dark:bg-s-dark*` pair remains under `src/`. Token
  resolution was verified directly: `--color-c-bg-surface: #ffffff`
  (`src/styles/tokens.css:24`), `var(--color-s-dark-2)` under `html.dark`
  (`src/styles/default.css:19`), `#3b4252` under Nord
  (`static/themes/nord/nord.css:34`). The two secondary substitutions named in
  the task (`dark:text-white` → `text-c-neutral-9 dark:text-white`, and the
  `border-white/5` swap) were deliberately skipped with sound, verified
  reasoning: labels inherit themed `text-c-neutral-8` (Nord `#d8dee9` on
  `#3b4252`) via `src/routes/auth/+layout.svelte`, adding a light token would
  change default-light rendering that TASK-2 requires stay pixel-identical, and
  `--color-c-border` is transparent/not overridden so the border swap has no
  safe target. Neither omission is a blocker.

TASK-3: PASS
notes: No change needed. `src/lib/components/forms/TimePicker.svelte:63`
  already uses `bg-c-bg-modal` (fixed by the same `70f6236` sweep). No
  `bg-white … dark:bg-s-dark*` pair remains anywhere under `src/`.

TASK-4: PASS
notes: `npm run check/lint/test/build/preview` were not run because
  `node_modules` is absent and the project hard rule forbids installing
  packages without asking — with zero product diff there is nothing new for
  those checks to cover, so this is not a blocker. The rendered verification
  was instead performed against production via Playwright with
  `localStorage.theme` seeded, documented in
  `screenshots/render-report.md` (login card dark under every single-mode dark
  theme, light only under the by-design light themes). I could not view the
  PNGs directly (review model has no image input), but the report's pixel
  table is internally consistent with the CSS-token values verified above.

Ancestry claims independently verified: `git log HEAD..70f6236` and
`git log origin/main..70f6236` are both empty, so `70f6236` is an ancestor of
both HEAD and `origin/main`; `git show 70f6236` performs exactly the
`bg-white dark:bg-s-dark-2 → bg-c-bg-surface` swap on the auth cards (and the
TimePicker swap). `git diff main...HEAD -- src static tests package.json` is
empty.

## Security

none — no source change; the diff is documentation and job artifacts only.

## Overall

APPROVED

This branch is a documentation-only duplicate of the earlier fix `70f6236`
already on `main`; the reported white auth card is no longer reproducible and
needs no product change. Nothing must change before merge. The
`Progress.svelte:74` (`not-dark:bg-white`) item noted in `implementation.md` is
the same bug class but explicitly outside this job's auth scope and correctly
left as a follow-up.
