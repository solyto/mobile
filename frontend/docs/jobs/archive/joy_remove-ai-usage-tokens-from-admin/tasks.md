# Tasks: remove ai usage tokens from admin

id: joy
analyst: @analyst
date: 2026-10-14

<!-- Produced by @analyst from brief.md. -->

## Context

The admin dashboard (`src/routes/admin/+page.svelte`) shows an "AI Tokens"
`StatisticWidget` in the "Other" section, which reads
`statistics.overview?.ai_tokens`. The field is declared on
`StatisticsOverview` in `src/lib/types/statistic.ts`. Since the API no longer
sends it, both need to go.

A repo-wide search for `ai_tokens`, `AI Tokens` and `IconCoins` found
only those two files. The label is a hard-coded English string, not an i18n key, so no
i18n files are affected. There are no tests covering this.

## Task breakdown

TASK-1: Remove the "AI Tokens" `StatisticWidget` (line 154) and the import
that is then unused, `IconCoins` (line 15), from the admin dashboard page.
     files: src/routes/admin/+page.svelte
     depends: none
     risk: low — a single widget is removed; the "Other" section still has the "Tags" widget, so it does not end up empty.

TASK-2: Remove the `ai_tokens: number;` field from the `StatisticsOverview`
interface.
     files: src/lib/types/statistic.ts
     depends: TASK-1 (otherwise `svelte-check` fails on the remaining reference)
     risk: low — the only consumer is the widget removed in TASK-1. The search found no other references.

## Verification

- `npm run check` passes, with no unused-import or missing-property errors.
- `npm run lint` passes.
- A search for `ai_tokens` in `src/` returns nothing.

## Out of scope / unclear

- `src/lib/components/settings/ConfigureAiTokens.svelte` (with its related
  i18n strings and API routes) is part of user **settings**, not admin, and
  seems to be about configuring AI tokens, not admin usage statistics.
  The brief only mentions admin, so it is **not** part of this job. If the API
  change also removes that settings feature, it needs its own brief.
