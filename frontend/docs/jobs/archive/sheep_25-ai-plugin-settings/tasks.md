# Tasks: 25 AI plugin settings

id: sheep
analyst: @analyst
date: 2026-10-14

<!-- Produced by @analyst from brief.md. -->

## Context found while reading

- Branch verified: worktree HEAD is `feature/sheep_25-ai-plugin-settings`, which matches `brief.md`.
- The settings page (`src/routes/settings/+page.svelte`) is a list of `{ id, title, component }` sections. Each section component uses `SettingsSection` blocks. `src/routes/settings/+layout.svelte` provides `Tags` and `Todos` only.
- The "NEW" empty state is in `libraries/shared/Recommender.svelte`, not in `Recommendation.svelte`, which the brief names. `Recommendation.svelte` renders only a non-null item. When `library.recommend('new')` returns `null`, `Recommender.svelte` currently shows nothing after the loader (lines 88-105).
- `ApiService.update(endpoint, id, body)` replaces `%s` and returns a `boolean`, so `PUT users/me/plugins/%s` with id `'ai'` fits the existing CRUD shape (15.5). No error body comes back to the caller.
- Store tests already exist (`tests/unit/stores/Tags.test.ts`, `LibraryStores.test.ts`) and pass mocks through the constructor (15.2). That pattern is available for the new store.
- `ConfigureAiTokens.svelte`, `Auth.setOpenaiApiKey`, `updateOpenaiApiKey` and `openai_token` belong to backlog 24 and are **out of scope**. Do not touch or reuse them.
- `Recommender.svelte:60` builds a URL by hand (a 15.3 violation). It is unrelated, so leave it alone.

## Decision: new store

A new `src/lib/state/Plugins.svelte.ts` store, not part of `Auth`. `Auth` is already the 11.5 example of an overloaded store, and plugins are their own API resource (`users/me/plugins`, `plugins/ai/providers`). It is provided in `src/routes/settings/+layout.svelte` as a feature store (15.2).

## Task breakdown

TASK-1: Add `src/lib/types/plugin.ts` with type-only shapes for the plugin API: the plugin name (`'ai'`), AI provider id (`'openai' | 'openrouter' | 'mistral'`), `UserPlugin` (`plugin, enabled, has_api_key, settings: { provider, model } | null, model_available`), the provider list item (`provider, name, models: { id, name }[]`) and the update request (`enabled, provider, model, api_key?`).
     files: src/lib/types/plugin.ts (new)
     depends: none
     risk: low — types only. The open question is whether `model_available`/`provider`/`model` can be `null` when nothing is configured (see Open questions).

TASK-2: Add the endpoints to `apiRoutes`: `users.plugins.list` (`/users/me/plugins`), `users.plugins.get` and `users.plugins.update` (`/users/me/plugins/%s`), and `plugins.ai.providers` (`/plugins/ai/providers`).
     files: src/lib/config/apiRoutes.ts
     depends: none
     risk: low — additive config entries. Leave `updateOpenaiApiKey` in place (backlog 24).

TASK-3: Add a pure `PluginService` (15.8 / 13.1) that (a) builds the `PUT` request from the form value, leaving out `api_key` when the input is blank, and (b) answers whether the form can be saved: a key is required only when `has_api_key` is false, and the model must be in the selected provider's model list. Add unit tests in `tests/unit/services/PluginService.test.ts`. They should cover saving with a stored key and a blank input (no `api_key` sent), the first save without a key (rejected), and a model that is not in the provider's list.
     files: src/lib/services/PluginService.ts (new), tests/unit/services/PluginService.test.ts (new)
     depends: TASK-1
     risk: low — small pure functions. The service must never echo, log or store the key beyond building the request body.

TASK-4: Create the `Plugins` store per 15.2/15.4. Use constructor collaborators (`auth`, `apiService`), the `$state` fields `loaded`, `plugins: UserPlugin[]` and `aiProviders`, `load()` (fetches plugins and providers, then assigns), an `ai` accessor or a lookup on `plugins`, and `updateAi(request): Promise<boolean>` (15.5: PUT, reload on success, return ok). Add `setPlugins`/`getPlugins` and call `setPlugins()` in the settings layout. Add store tests in `tests/unit/stores/Plugins.test.ts` with a mocked `ApiService`. They cover the load assignment, a failed load keeping the previous state, and update reloading on success.
     files: src/lib/state/Plugins.svelte.ts (new), src/routes/settings/+layout.svelte, tests/unit/stores/Plugins.test.ts (new)
     depends: TASK-1, TASK-2
     risk: medium — a new store that follows the context pattern. The response envelope (`res.data`) is assumed to match other endpoints and is not verified against the API.

TASK-5: Add every new UI string to `types/translation.ts` and to `en.ts`, `de.ts`, `es.ts` and `fr.ts`. The strings cover the section title, the enable toggle, the provider and model labels, the API key label/placeholder, "a key is stored" with "replace key", save, success/error notifications, the "model no longer available, pick a new one" warning, the "key required" validation, and (for TASK-7) the hint that AI recommendations need the plugin.
     files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
     depends: none
     risk: low — mechanical. `npm run check` enforces that all four stay in sync.

TASK-6: Build `src/lib/components/settings/AiPluginSettings.svelte` and register it as a new section on the settings page. It has an enabled `Toggle`, a provider `Select`, a model `Select` filled from the chosen provider (changing the provider clears the model in the handler, not in an effect), and a key input via `PasswordInput`/`TextInput`. The key input is always empty and is never prefilled or displayed. When `has_api_key` is true it shows a "key stored" state with a way to replace the key. A Save button is gated by TASK-3. A visible warning appears when `model_available === false`. The component holds the draft until save, which 3.7 allows for the one owning component. It calls `plugins.load()` on mount and `plugins.updateAi()` on save, with the loading indicator stopped on every path (15.7).
     files: src/lib/components/settings/AiPluginSettings.svelte (new), src/routes/settings/+page.svelte
     depends: TASK-3, TASK-4, TASK-5
     risk: medium — the main UI work. It must avoid `$effect`/`$derived` misuse (section 3/5) and must never render or log the key.

TASK-7 (optional per brief, "consider"): In `Recommender.svelte`, when `selection === 'new'` and the loaded recommendation is `null`, show a short hint with a link to `urls.settings` that says AI recommendations need the AI plugin. Currently nothing is shown in that case.
     files: src/lib/components/libraries/shared/Recommender.svelte
     depends: TASK-5
     risk: low — additive markup. Caveat: `null` also covers a failed request, so the hint text must stay neutral, or the component needs plugin state, which would mean providing `Plugins` in the books/music layouts (see Open questions).

TASK-8: Verification. Run `npm run check`, `npm run lint` and `npm test`. Then do a manual run against an API that has the plugin endpoints: first save without a stored key (rejected, then accepted with a key), saving again with a blank key field (stored key kept), replacing the key, toggling off, and the `model_available: false` case (warning shown, a new model must be picked). Confirm that the key never appears in the DOM, the console or the network response.
     files: none (record the results in implementation.md)
     depends: TASK-1 … TASK-7
     risk: medium — needs a running API at a version with `618c1b8`/`fe9c7fe`/`597ce36`, and that may not be available in the agent environment.

## Open questions (not blocking; the developer should take the conservative default)

1. **Section placement:** this plan adds a new top-level settings section ("AI" / "Plugins") after "Features". The alternative is a block inside `FeatureSettings`. Default: a new section.
2. **Deep link from the recommender:** the settings page has no hash/section deep-linking, so the TASK-7 link goes to `/settings` only. Adding `#section` scrolling would expand scope, so it is not planned.
3. **API contract details not in the brief:** whether `model_available`, `settings.provider` and `settings.model` can be `null` for an unconfigured plugin. Whether `enabled: false` still requires `provider`/`model` in the PUT. Whether the API validates the key against the provider and returns an error body; `ApiService.update` only reports success or failure, so the UI shows a generic error. The developer should check `solyto/api` at the named commits if it is reachable, and otherwise type these fields defensively.
4. **TASK-7 accuracy:** distinguishing "not configured" from "request failed" needs the `Plugins` store in `libraries/books` and `libraries/music` layouts. Default: no store there and a neutral hint text.
