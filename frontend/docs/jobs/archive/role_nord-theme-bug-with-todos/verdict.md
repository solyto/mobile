# Verdict: nord theme bug with todos

id: role
status: open
reviewer: deepseek-v4-flash
date: 2026-08-25

## Review

Root cause is correctly identified and the fix is correct. The `dark:` Tailwind
variant only applies when `<html>` has the `dark` class; single-mode themes
(Nord, Dracula, Gruvbox, Skyrim, Catppuccin, Terminal, Paper, Atari) never add
it, so `bg-white dark:bg-s-dark-*` surfaces fell back to light `bg-white`.
Verified: Nord overrides `--color-c-bg-modal` at `:root` (static/themes/nord/nord.css
line 36 = `#3b4252`), so the semantic-token swap themes correctly under Nord.

The swap to `bg-c-bg-*` tokens is regression-free in the default themes:
- `bg-c-bg-surface` = `#ffffff` (light) / `--color-s-dark-2` `#222222` (dark) — identical to old `bg-white dark:bg-s-dark-2`.
- `bg-c-bg-modal` = `#ffffff` / `#222222` — identical.
- `bg-c-bg` = `#ffffff` / `--color-s-dark` `#121212` — identical to old `bg-white dark:bg-s-dark`.

All tokens are defined in `src/styles/tokens.css` `@theme` and overridden per
theme at `:root`, so the utilities `bg-c-bg`, `bg-c-bg-surface`,
`bg-c-bg-modal`, `bg-c-bg-elevated` are generated and themed everywhere.

TASK-1: PASS
notes: src/lib/components/ui/QuickSelectOverlay.svelte line 21. `bg-white dark:bg-s-dark-2` -> `bg-c-bg-modal`. Directly fixes the reported Todo status menu plus all other overlay consumers. Correct.

TASK-2: PASS
notes: src/lib/components/todos/props/Recurrence.svelte line 97. Token swap, correctly kept `dark:border-s-dark`. Correct.

TASK-3: PASS
notes: src/lib/components/todos/FindCategoryMenu.svelte line 26. Token swap, correctly kept `dark:border-s-dark`. Correct.

TASK-4: PASS
notes: Broad sweep across admin/calendars/contacts/dev-requests/forms/notes/time-tracking/auth/setup/check-in routes. Every change is an exact token-equivalent swap with no default-theme regression (verified values above). No unrelated refactoring, no behavior change. Note on scope: this reaches page backgrounds and in-flow cards (e.g. auth/setup/admin routes), not just popup/menu surfaces, which is broader than the literal "menu modal" ask — but these files were explicitly enumerated in tasks.md TASK-4 and it is the "check if it affects other themes/components" portion of the brief. Acceptable.

Commit discipline: PASS — one commit per task in `[role] TASK-N:` format
(fe0dcf2 TASK-1, bc543b2 TASK-2, 363263e TASK-3, 04feae5 TASK-4) plus a separate
`[role] implementation: add summary` commit (923b603).

Not verified (environment constraint, flagged in implementation.md): no
`node_modules`, so `npm run check` / `npm run build` / visual verification under
Nord could not be run. All edits are exact string replacements of established
utility classes; no syntax/schema risk expected, but recommend a type-check and
visual pass under Nord + default light/dark before merge.

## Security

None. Pure CSS class swaps; no data, auth, or logic touched.

## Overall

APPROVED

The fix correctly resolves the reported bug (Todo status menu white under Nord)
with the established semantic-token pattern, with no regression in default
themes. TASK-4 is broad but was pre-planned and is safe. The only residual item
is the inability to run `npm run check`/build and a visual pass due to missing
node_modules in this environment — recommended (not blocking) before merge.
