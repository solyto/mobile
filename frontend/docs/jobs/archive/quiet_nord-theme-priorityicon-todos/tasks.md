# Tasks: Nord theme: PriorityIcon todos

id: quiet
analyst: analyst
date: 2026-11-08

## Findings

- Desktop list view: `ListEntry.svelte` renders `<Priority ... filled />`. With
  `filled`, `Priority.svelte` paints the wrapper with `getPriorityColorClass()`
  (`TodoHelper.ts`: high → `bg-c-danger`, medium → `bg-c-btn`, low → `bg-c-success`)
  and gives the icon `text-white` (`getIconClass()`).
- In Nord (`static/themes/nord/nord.css`) low is `--color-c-success: #a3be8c` (light
  Aurora green) behind `--color-white: #eceff4` (Snow Storm), a contrast of about
  1.9:1. High (`#bf616a`) and medium (`#4c566a`) stay readable with the light icon,
  which matches the brief.
- The brief describes the colours as "grey icon on blue bg". The code gives a
  near-white icon on a muted green background. It is the same element (low
  priority, filled, desktop list), so the scope is unchanged. Nothing in the code
  renders blue there.
- Nord already has the right token: `--color-c-flag-text: #2e3440` (dark Polar Night
  text for light accent backgrounds). Against `#a3be8c` that gives about 7:1.
- Precedent for theme-only fixes: `nord.css` already overrides one contrast issue
  (`.bg-c-action.text-c-heading`), and theme CSS targets semantic hook classes
  (`todo-priority-bar` in `CompactEntry.svelte`, styled in `aero.css`;
  `checkbox-box` in `95.css`/`xp.css`).
- A blanket `.bg-c-success .text-white` rule in nord.css would also change
  SaveButton, Toggle, IconButton etc. That is out of scope, so keep the selector
  limited to the filled priority cell.

## Task breakdown

TASK-1: Add a semantic hook class (e.g. `todo-priority-filled`) to the wrapper `<div>` in `Priority.svelte`, only when `filled` is true, so that theme CSS can target the filled priority cell. Do not change the default styling.
  files: src/lib/components/todos/props/Priority.svelte
  depends: none
  risk: low — it only adds a class with no styles of its own, so no theme changes visually.

TASK-2: In `nord.css`, make the low-priority icon colour in the filled cell come from the Nord token `var(--color-c-flag-text)` (e.g. `.todo-priority-filled.bg-c-success svg { color: var(--color-c-flag-text); }`). Add a short comment like the existing contrast override. Use no new hex values. Leave high and medium as they are.
  files: static/themes/nord/nord.css
  depends: TASK-1
  risk: low — the rule only loads with the Nord theme and only matches the filled low-priority cell. The hover state (`hover:bg-c-neutral`) is not applied with `filled`, so nothing else is affected.

## Verification

- `npm run check` and `npm run lint` pass.
- Manual/visual check (optional, render if available): Nord theme, `/todos` in desktop
  list view with a low-priority todo. The icon should be dark on green. Medium and
  high should look the same as before. In the default theme nothing should change.

## Open points (not blocking)

- Other single-dark themes (dracula, gruvbox, catppuccin-mocha, ...) may have the same
  light-on-light-green problem. That is not checked or fixed here; it could be a
  follow-up if wanted.
