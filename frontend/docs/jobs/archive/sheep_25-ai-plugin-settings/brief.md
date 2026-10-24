# Brief: 25 AI plugin settings

type: feature
id: sheep
branch: feature/sheep_25-ai-plugin-settings
date: 2026-10-14
author: Leander Muskalla

## What

The API (`solyto/api` `618c1b8`, `fe9c7fe`, `597ce36`) adds per-user plugins, with AI as the first one. Each user brings their own provider, key and model. There is no instance AI key anymore.

Endpoints:

- `GET users/me/plugins` returns every plugin with its state: `{plugin, enabled, has_api_key, settings: {provider, model} | null, model_available}`.
- `GET users/me/plugins/{plugin}` returns one (`ai` only for now).
- `PUT users/me/plugins/{plugin}` with `enabled`, `provider`, `model` and `api_key`. `api_key` is required only when none is stored yet; leaving it out keeps the stored key. The key is never returned.
- `GET plugins/ai/providers` returns `[{provider, name, models: [{id, name}]}]` for `openai`, `openrouter`, `mistral`.

Build a settings section to turn AI on and off, pick provider and model, and enter or replace the key. When `model_available` is `false`, the stored model was removed from the API's list: ask the user to pick a new one.

Book and music "NEW" recommendations now return `null` unless the plugin is configured. Consider pointing to the plugin setting from that empty state (`libraries/shared/Recommendation.svelte`).

## Why

AI recommendations stop working for every user after the API deploy until they configure the plugin. The owner announces this outside the app.

## Out of scope

The old OpenAI key setting (backlog 24). New AI features.

## Notes

New types in `src/lib/types/` (one file for plugins), routes in `apiRoutes`, store methods per section 15; decide whether that is a new store or part of an existing one. All strings in all four i18n files. Never log or show the key. Safety: tests for any pure logic, `check`, plus a manual run of saving with and without a key and the `model_available: false` case.
