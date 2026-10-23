# Verdict: 29 Setup health check accepts the envelope

id: garden
reviewer: @reviewer
date: 2026-10-15

## Review

TASK-1: PASS
notes: `src/routes/setup/+page.svelte:39-40` adds `const health = data?.data ?? data;` and runs the unchanged check
(`app === 'solyto'` and a truthy `version`) against `health`. The envelope (`data.data.app` / `data.data.version`) wins,
and the legacy top-level keys are the fallback, as tasks.md specified. If `data.data` is missing or `null`, `??` falls
back to the top level, so legacy servers keep passing. Every failure (bad status, JSON parse error, wrong shape) still
lands in the existing `catch` → `urlError = true`. It stays a direct `fetch` (STANDARDS 15.3 exception). No new
types, helpers, or i18n strings were added.

Scope: `git diff main...HEAD` touches only `src/routes/setup/+page.svelte` (1 line changed, 1 added) and the
job docs. Nothing outside the task changed.

Verification: `npm run check` / `npm run lint` could not be run because `node_modules` is not installed in this
worktree (the developer reports the same). Reading the code: `res.json()` is typed `any`, so the new expression adds
no type errors, and it uses no lint-sensitive constructs. Running both, plus the manual self-hosted setup against a
local API from the brief's "Safety" note, is left to a human before merge.

## Security

none (not run). The change only reads the shape of an already-fetched response. No new input or sink.

## Overall

APPROVED

No blockers. Before merge, a human should run `npm run check`, `npm run lint`, and a manual self-hosted setup against a local API.
