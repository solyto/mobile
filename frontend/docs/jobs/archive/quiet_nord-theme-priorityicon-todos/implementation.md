## Summary

Low-priority filled cells in the Nord theme now show a dark Polar Night icon on the Aurora green instead of near-white. This is a theme-only fix that uses the existing `--color-c-flag-text` token.

## Changes

TASK-1: `src/lib/components/todos/props/Priority.svelte` — the wrapper gets the hook class `todo-priority-filled` when `filled` is true. The class has no styles of its own.
TASK-2: `static/themes/nord/nord.css` — added `.todo-priority-filled.bg-c-success svg { color: var(--color-c-flag-text); }` with a short comment. High and medium are unchanged.

## Known issues / follow-ups

- `npm run check` / `npm run lint` could not be run: `node_modules` is not installed in this worktree (`svelte-kit: not found`). Installing was not done without approval. No visual render was made for the same reason.
- Other dark themes (dracula, gruvbox, catppuccin-mocha, ...) may have the same light-on-light-green problem. Not checked.
