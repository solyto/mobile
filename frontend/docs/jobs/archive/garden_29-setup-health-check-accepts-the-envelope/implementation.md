# Implementation: 29 Setup health check accepts the envelope

id: garden
developer: @developer
date: 2026-10-15

## Summary

The self-hosted health check in setup now reads `app`/`version` from the `ApiResponse` envelope (`data.app`, `data.version`) and falls back to the legacy top-level keys when there is no envelope. It is still a direct `fetch` (STANDARDS 15.3 exception).

## Changes

TASK-1: `src/routes/setup/+page.svelte` (`saveSelfhosted`): added `const health = data?.data ?? data;` and ran the existing check (`app === 'solyto'` and a truthy `version`) against `health`. The envelope wins when both shapes are present. Failures still go to the existing `catch` (`urlError = true`). No new types, helpers, or UI strings.

## Known issues / follow-ups

- `npm run check` / `npm run lint` could not be run in this session: `node_modules` is not installed (`svelte-kit: not found`, `@eslint/compat` missing), and installing packages requires approval. They are pending and should be run before merge.
- Manual self-hosted setup against a local API (brief "Safety") is pending: it needs a human.
- Edge case: if `data.data` is present but is not the health object, the check fails instead of falling back to the top-level keys. This is acceptable because the API returns either the envelope or the legacy shape.
