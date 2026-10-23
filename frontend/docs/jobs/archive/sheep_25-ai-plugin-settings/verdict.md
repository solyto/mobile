# Verdict: 25 AI plugin settings

id: sheep
reviewer: @reviewer
date: 2026-10-14

## Review (second pass)

Branch verified: `feature/sheep_25-ai-plugin-settings`. Base: `main` (from `.manigot/manigot.json`). The review surface was `git diff main...HEAD`.

The previous verdict (`acd6d6f`) was NEEDS WORK, only because nothing had been run. Since then, the only change is `implementation.md` (`6ef6089`), which records the results of check, lint and test. No source file changed after the first review, so I read the full source diff again.

TASK-1: PASS
notes: `src/lib/types/plugin.ts` matches the API shapes in the brief. `settings.provider`/`model` and `model_available` are typed nullable as a defensive choice, as open question 3 suggests.

TASK-2: PASS
notes: `apiRoutes.users.plugins.{list,get,update}` and `apiRoutes.plugins.ai.providers` are added. `updateOpenaiApiKey` is untouched (backlog 24).

TASK-3: PASS
notes: `PluginService` is pure and does no I/O.
- `buildRequest` leaves out `api_key` when the input is blank and trims it otherwise.
- `needsApiKey` requires a key only when `has_api_key` is false.
- `canSave` also requires a model from the selected provider's list.
- `toDraft` never fills in the key, and it clears the model when `model_available === false`.

The tests cover every case the task asked for.

TASK-4: PASS
notes: `Plugins.svelte.ts` follows 15.2: constructor collaborators, a Symbol key, and `setPlugins`/`getPlugins`.
- `load()` assigns only when both requests succeed, so a failed load keeps the previous state (15.4).
- `updateAi` sends the PUT with id `'ai'` through `ApiService.update`, which replaces `%s`. It reloads on success and returns `ok` (15.5).

The store is provided in `routes/settings/+layout.svelte`. Its tests pass.

TASK-5: PASS
notes: 17 new keys are in `translation.ts` and in en/de/es/fr. `npm run check` confirms the four tables are in sync. The section title reuses the existing `settings.ai` key.

TASK-6: PASS
notes: `AiPluginSettings.svelte` has no `$effect` and no `$derived`.
- Changing the provider clears the model in `onProvider`.
- The component owns one `draft` (3.7).
- The key is never prefilled, rendered or logged, and the draft is rebuilt after a successful save.
- The loading indicator stops on every path.
- When `model_available === false`, a warning is shown and Save stays disabled until a new model is picked.
- If the load fails, an error hint is shown.

The section is registered after Features.

TASK-7: PASS
notes: In `Recommender.svelte`, when `selection === 'new'` and the result is `null` after loading, a neutral hint and a link to `resolve(urls.settings)` are shown. This follows the default from open question 4.

TASK-8: PARTIAL
notes: I ran the automated checks myself in this review:
- `npm run check`: 0 errors, 0 warnings
- `npm run lint`: clean
- `npm test`: 66 files and 960 tests passed

The manual run against an API with the plugin endpoints was not done. According to `implementation.md`, the owner decided to test it himself later. No API is reachable in the agent environment, so I accept this as the owner's decision and do not treat it as a blocker here. It is still an open item for the owner (listed under "Known issues" in `implementation.md`).

Scope: the source diff matches tasks.md. `.mcp.json` was added in `0f7ef51` and removed in `18b817d`, so the net diff against `main` has no change to it.

## Security

The key exists only in the component draft and in the PUT body. It is never prefilled, rendered, logged or stored. No other findings.

## Overall

APPROVED

No blockers. Before release, the owner still needs to do the manual API run he said he would do himself (see `implementation.md`, "Manual run still open").
