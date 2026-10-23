# Tasks: 29 Setup health check accepts the envelope

id: garden
analyst: @analyst
date: 2026-10-15

<!-- Produced by @analyst from brief.md. -->

## Context

- Branch verified: worktree HEAD is `feature/garden_29-setup-health-check-accepts-the-envelope`, which matches `brief.md`.
- The only code involved is `saveSelfhosted()` in `src/routes/setup/+page.svelte` (lines 27–47). Line 39 is
  `if (data?.app !== 'solyto' || !data?.version) throw new Error();`, so it reads only the top-level keys.
- No other code in `src/` calls the health endpoint (grep for `health` finds only this one call). The direct
  `fetch` is the one accepted exception to STANDARDS 15.3, so it stays a `fetch` and does not move to `ApiService` or `apiRoutes`.
- No `ApiResponse` envelope type exists in `src/lib/types/`. Do not add one for this (no new abstractions).

## Task breakdown

TASK-1: In `saveSelfhosted()`, read `app` and `version` from the envelope (`data.data.app`, `data.data.version`) first, and fall back to the top-level `data.app` / `data.version` when the envelope is missing. Keep the rest of the check as it is: `app === 'solyto'` and a truthy `version`, otherwise throw.
     files: src/routes/setup/+page.svelte
     depends: none
     risk: low. It is one condition in a single `try` block. Every failure still lands in the existing `catch` (`urlError = true`). Old and new APIs both keep passing because the top-level fallback is still there.
     notes:
       - Keep the change small and inline: for example, a local `const health = data?.data ?? data;` followed by the same check on `health`.
         Do not add a helper, a service, or a type file. No new UI strings, so the i18n files are untouched.
       - There is no unit test. The logic lives in a route component, and `tests/` only covers pure helpers and services
         (docs/TESTING.md). Pulling it out into a helper just to test it would add an abstraction the brief did not ask for.
       - Verification: `npm run check` and `npm run lint`. A manual self-hosted setup against a local API (brief "Safety")
         has to be done by a human. An agent cannot run it here, so it should be listed as pending in implementation.md.

## Open points

- Precedence when the body has both shapes: I assumed the envelope wins and the top-level keys are the fallback, which fits the brief's "new builds should read the envelope". The brief only says "accept either shape". In practice the API returns the same values in both places, so the order should make no difference.
