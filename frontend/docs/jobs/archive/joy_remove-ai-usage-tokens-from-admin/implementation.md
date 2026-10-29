# Implementation: remove ai usage tokens from admin

id: joy
developer: @developer
date: 2026-10-14

## Summary

Removed the "AI Tokens" statistic from the admin dashboard and the matching
`ai_tokens` field from the `StatisticsOverview` type, since the API no longer
delivers it.

## Changes

TASK-1: `src/routes/admin/+page.svelte` — removed the "AI Tokens"
`StatisticWidget` from the "Other" section and the now-unused `IconCoins`
import. The "Other" section still contains the "Tags" widget.

TASK-2: `src/lib/types/statistic.ts` — removed `ai_tokens: number;` from the
`StatisticsOverview` interface.

Verification: `grep -rn ai_tokens src/` returns nothing.

## Known issues / follow-ups

- `npm run check` and `npm run lint` could not be run in this session:
  `node_modules` is not installed (`svelte-kit` / `eslint` not found), and
  installing packages needs approval. Please run both before merging.
- `.mcp.json` shows an uncommitted change in the working tree. This session
  did not make that change and it has nothing to do with this job, so it was
  deliberately not committed.
- `src/lib/components/settings/ConfigureAiTokens.svelte` (user settings) was
  not touched, as tasks.md specifies. If the API change also affects that
  feature, it needs its own brief.
