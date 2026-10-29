# Implementation: 25 AI plugin settings

id: sheep
developer: @developer
date: 2026-10-14

## Summary

Added a per-user AI plugin settings section. Users can turn AI on and off, pick a provider and model, and enter or replace their API key. The data goes through a new `Plugins` store, and the pure logic (draft, validation, request building) lives in a new `PluginService` with unit tests. When the stored model is no longer offered (`model_available: false`), the section shows a warning and clears the model selection, so the user has to pick a new model before saving. When a "NEW" recommendation comes back as `null`, the recommender now shows a neutral hint and a link to the settings.

## Changes

TASK-1: Added `src/lib/types/plugin.ts`. It holds `PluginName`, `AiProviderId`, `UserPlugin`, `AiProvider`/`AiModel`, `UpdateAiPluginRequest` (`api_key?` optional) and `AiPluginDraft`, the one typed value the component edits (13.2). `settings.provider`/`settings.model` and `model_available` are typed nullable as a defensive choice, because the API repo could not be checked (open question 3).

TASK-2: In `src/lib/config/apiRoutes.ts`, added `users.plugins.{list,get,update}` and `plugins.ai.providers`. `updateOpenaiApiKey` is untouched (backlog 24).

TASK-3: Added `src/lib/services/PluginService.ts`:
- `findPlugin`
- `toDraft`: the key is always `''`, and the model is cleared when `model_available === false`
- `modelsOf`
- `isModelAvailable`
- `needsApiKey`: a key is needed only when `has_api_key` is false and the input is blank or whitespace
- `canSave`
- `buildRequest`: leaves out `api_key` when the input is blank and trims it otherwise

Tests are in `tests/unit/services/PluginService.test.ts`. They cover: saving with a stored key and a blank input (no `api_key` sent), the first save without a key (rejected), a model not in the provider's list or belonging to another provider, and the unavailable-model draft.

TASK-4: Added the `src/lib/state/Plugins.svelte.ts` store:
- constructor collaborators `auth`, `apiService`, `pluginService`
- `loaded`, `plugins` and `aiProviders` state
- an `ai` getter
- `load()`: fetches both endpoints in parallel and assigns only when both succeed
- `updateAi()`: PUT `'ai'`, reload on success, return ok

It is provided in `src/routes/settings/+layout.svelte`. Tests are in `tests/unit/stores/Plugins.test.ts` (load, failed load keeps previous state, failed first load, update reloads, failed update doesn't reload).

TASK-5: Added 15 `settings.ai_plugin_*` keys and `libraries.recommendations.{ai_plugin_hint,open_settings}` to `types/translation.ts` and to `en`/`de`/`es`/`fr`. The section title reuses the existing, previously unused `settings.ai` key. Its German value is `'AI'` (left as is), while the new German strings say "KI".

TASK-6: Added `src/lib/components/settings/AiPluginSettings.svelte` and registered it as a new section ("AI", `id: 10`) after Features in `src/routes/settings/+page.svelte`. It uses:
- `Toggle`, two `Select`s (with a placeholder option) and `PasswordInput`
- a `TextButton` Save, disabled unless `canSave`

The component holds a single `draft` `$state` (3.7) and has no `$effect` or `$derived`. Changing the provider clears the model in the handler. The key input is never prefilled. With a stored key it shows "a key is stored, leave empty to keep it" and a "replace" placeholder. After a successful save the draft is rebuilt from the store, so the key input is cleared. The loading indicator stops on every path. If the load fails, the section shows a load-error hint.

TASK-7: In `src/lib/components/libraries/shared/Recommender.svelte`, when `selection === 'new'` and the loaded recommendation is `null`, it now shows a neutral hint and a `TextButton` link to `resolve(urls.settings)`. The plugin store is not provided in the library layouts (open question 4 default).

TASK-8: Automated checks done after the owner approved `npm ci` (installed from the existing lockfile, no dependency changes):
- `npm run check`: 0 errors, 0 warnings (this includes the i18n table sync)
- `npm run lint`: clean
- `npm test`: 66 files and 960 tests passed, including the new `PluginService.test.ts` and `Plugins.test.ts` (24 tests)

As the owner decided, the manual run against the real API was not done here. The owner will test it later.

## Known issues / follow-ups

- **Manual run still open (owner will test):** test against an API at `618c1b8`/`fe9c7fe`/`597ce36`: first save without a key (Save disabled), then with a key; saving again with a blank key; replacing the key; turning it off; `model_available: false`. Also confirm the key never shows in the DOM, the console or a response.
- **`.mcp.json`:** commit `0f7ef51` added it by accident, and `18b817d` removed it again. The net diff against `main` contains no `.mcp.json` change. The local modification in the working tree comes from the harness and is not committed.
- Running `npx eslint` without `node_modules` let npx fetch `eslint@10.12.0` into the npm cache (outside the repo). The run failed and nothing in the repo changed.
- API contract details not checked against `solyto/api`:
  - whether `enabled: false` still needs `provider`/`model`. The UI always sends both, so turning off an unconfigured plugin isn't possible, but there is nothing to turn off then anyway.
  - whether the API returns a validation error body. `ApiService.update` only reports ok or failed, so the UI shows a generic save error.
- The `de` value of the existing `settings.ai` key is `'AI'`, not `'KI'`. It is left unchanged because it is an existing string.
