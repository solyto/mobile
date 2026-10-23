# Verdict: 24 Remove the OpenAI API key setting

id: wait
reviewer: @reviewer
date: 2026-10-14

## Review

Reviewed `git diff main...HEAD` on `feature/wait_24-remove-the-openai-api-key-setting`. The diff contains only the planned deletions in `src/` and `tests/`, plus the job docs. Nothing outside the scope of the tasks changed. (`.mcp.json` is modified in the worktree but not committed, so it isn't part of the branch.)

TASK-1: PASS
notes: `src/lib/components/settings/ConfigureAiTokens.svelte` is deleted. Nothing imported it (grep for `ConfigureAiTokens` in `src/` and `tests/` finds no hits).

TASK-2: PASS
notes: `setOpenaiApiKey()` and its trailing blank line are removed from `src/lib/state/Auth.svelte.ts`. The surrounding methods are untouched, and `apiRoutes` is still used elsewhere in the file.

TASK-3: PASS
notes: Only `updateOpenaiApiKey` is removed from `apiRoutes.users.settings`. The other entries are unchanged.

TASK-4: PASS
notes: `ai_enabled` and `openai_api_key` are removed from `UserSettings` (`src/lib/types/auth.ts`) and from the `user()` fixture (`tests/unit/auth/Auth.test.ts`). These are pure removals, so they can't cause missing-property errors. No other object literal sets these fields.

TASK-5: PASS
notes: `openai_token` is removed from `SettingsRecords` and from all four i18n files (en/de/es/fr), so parity holds. Nothing read the key.

TASK-6: PASS (with caveat)
notes: `grep -rniE "openai|ai_enabled|ConfigureAiTokens|setOpenaiApiKey" src tests` finds no hits (I confirmed this). `node_modules` isn't installed in the worktree, so neither the developer nor I could run `npm run check`, `npm run lint` or `npm test`. Every change is a deletion of code with no remaining references, so static review gives no reason to expect a failure. Still, run the three commands once before merging. This is a routine step, not a finding against the code.

## Security

none. The change removes a setting that stored a plain-text secret, which reduces risk.

## Overall

APPROVED

No blockers.
