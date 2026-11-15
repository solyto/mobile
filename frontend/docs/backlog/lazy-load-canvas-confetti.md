# Backlog: lazy-load canvas-confetti

created: 2026-11-10

## What

Load `canvas-confetti` only when a todo is completed, instead of importing it
statically. Three call sites import it at the top of the file today:

- `src/lib/components/dashboard/YourDay.svelte:18`
- `src/lib/components/todos/TodoEditModal.svelte:21`
- `src/routes/todos/+page.svelte:9`

At each one, replace the static import with a dynamic
`import('canvas-confetti')` at the point where confetti fires.
`src/lib/effects/confetti.ts` only imports the `Options` type and can stay
as it is.

## Why

`canvas-confetti` is 5.1 KB br and sits on the critical path of the dashboard
and `/todos`, but it only runs when a todo is checked off. Found as a side
note in `docs/reports/2026-11-09-marked-via-formathelper.md` (section 4).

## Out of scope

- The `marked` / FormatHelper split from the same report. That is a separate
  job.
- Changing the confetti effect itself.

## Notes

- The first confetti of a session will appear about one round-trip later,
  while the chunk loads. The SW precache hides this for installed PWAs. The
  owner should confirm this delay is acceptable before the job starts.
- Don't let the import delay completing the todo: all three handlers call
  `todos.changeCompleted(...)` right after the confetti. Fire the import
  without awaiting it before that call (e.g. `import(...).then(...)`), so the
  API request isn't held up by the chunk download.
- Verify: `npm run build`, then check in the Vite manifest that
  `canvas-confetti` is a dynamic import of the dashboard and todos nodes, not
  a static one.
