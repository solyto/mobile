# Tasks: 24 Remove the OpenAI API key setting

id: wait
analyst: @analyst
date: 2026-10-14

<!-- Produced by @analyst from brief.md. -->

## Pre-checks done

- Branch: worktree HEAD is `refs/heads/feature/wait_24-remove-the-openai-api-key-setting`, which matches `brief.md`.
- A grep for `openai|ai_enabled|ConfigureAiTokens|OpenaiApiKey` (case-insensitive) outside `docs/` finds hits only in these places:
  - `src/lib/config/apiRoutes.ts:35`: `updateOpenaiApiKey`
  - `src/lib/state/Auth.svelte.ts:410-414`: `setOpenaiApiKey()`
  - `src/lib/types/auth.ts:19,21`: `ai_enabled` and `openai_api_key` in `UserSettings`
  - `src/lib/components/settings/ConfigureAiTokens.svelte`: nothing imports this file
  - `src/lib/types/translation.ts:93`, `src/lib/i18n/en.ts:177`, `de.ts:178`, `es.ts:177`, `fr.ts:177`: `openai_token`. These are definitions only, and nothing reads `t.openai_token`.
  - `tests/unit/auth/Auth.test.ts:80,82`: the `user()` fixture sets `ai_enabled` and `openai_api_key`. **The brief doesn't list this file**, but `npm run check` fails with excess-property errors once the type fields are gone, so it has to be in scope.

## Task breakdown

TASK-1: Delete the unused component `src/lib/components/settings/ConfigureAiTokens.svelte`. It is the only caller of `auth.setOpenaiApiKey` and the only reader of `settings.openai_api_key`.
  files: src/lib/components/settings/ConfigureAiTokens.svelte (delete)
  depends: none
  risk: low. Nothing imports it, so no other file changes.

TASK-2: Remove the `setOpenaiApiKey()` method (lines 410-414, including the blank line that separates it) from the `Auth` store.
  files: src/lib/state/Auth.svelte.ts
  depends: TASK-1
  risk: low. Once TASK-1 is done, nothing calls it.

TASK-3: Remove the `updateOpenaiApiKey` entry from `apiRoutes.users.settings`.
  files: src/lib/config/apiRoutes.ts
  depends: TASK-2
  risk: low. Once TASK-2 is done, nothing references it. Leave the other entries in `settings` as they are.

TASK-4: Remove `ai_enabled` and `openai_api_key` from the `UserSettings` interface, and from the `user()` fixture in the Auth unit test.
  files: src/lib/types/auth.ts, tests/unit/auth/Auth.test.ts
  depends: TASK-1
  risk: low. Type-only change. The test fixture has to change in the same task or `check` fails. User objects already saved in LocalStorage may still carry the old fields, but they are ignored at runtime.

TASK-5: Remove the `openai_token` key from the translation type and from all four i18n files.
  files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
  depends: TASK-1
  risk: low. Nothing reads the key. All five files have to change together so the i18n parity check still passes.

TASK-6: Verify the change. Run the grep from the brief (`openai`, `ai_enabled`, `ConfigureAiTokens`) over `src/` and `tests/` and expect no hits. Then run `npm run check`, `npm run lint` and `npm test`.
  files: none
  depends: TASK-1 to TASK-5
  risk: low. Verification only.

## Unclear / for the owner

- The brief says "no hits should remain", but grepping the whole repo still finds hits in `docs/`: `docs/backlog/24-remove-openai-api-key-setting.md` (this job's own backlog entry), `docs/backlog/25-ai-plugin-settings.md` (which mentions the `openai` provider on purpose), and the archived job `joy_remove-ai-usage-tokens-from-admin`. I read the grep as covering source code only (`src/`, `tests/`) and left all `docs/` files alone. Whether to delete the backlog entry `docs/backlog/24-…` when this job closes is the owner's or pipeline's decision. No earlier job has been seen doing it, so it isn't part of these tasks.
