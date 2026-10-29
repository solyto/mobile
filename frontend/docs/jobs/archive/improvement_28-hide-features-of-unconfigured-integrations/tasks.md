# Tasks: 28 Hide features of unconfigured integrations

id: improvement
analyst: @analyst
date: 2026-10-15

<!-- Produced by @analyst from brief.md. -->

## Findings that shape the scope

Branch checked: the worktree HEAD is `feature/improvement_28-hide-features-of-unconfigured-integrations`, which matches the brief.

API side, checked against `solyto/api` at `c1db0c9`:
- `GET /api/v1/integrations` sits in the `auth:sanctum` group, so it needs a logged-in user. The response is the usual envelope, and the flags are under `data`: `{hardcover, tmdb, discogs, bgg, spotify, telegram, ntfy}`, all booleans.
- `GET libraries/music/integrations` already filters on the server: `MusicServiceEnum::isConfigured()` returns `deezer => true`, and checks the same config keys for Discogs and Spotify. Music search and create are therefore **already correct**. The music endpoint also returns `deezer`, which the new endpoint does not cover, so it is not a duplicate. Per the brief's "Out of scope" it stays, and **no music task is needed**.
- IMDb import uses `api.imdbapi.dev`, not TMDB. Goodreads import does not go through Hardcover. Steam is not in the endpoint. All three stay visible.

Frontend, confirmed list of components (corrects the brief's examples):
- `ui/buttons/HardcoverImportButton.svelte`, `ui/buttons/BggImportButton.svelte` and `settings/notifications/ManageBotNotifications.svelte` are **not imported anywhere** (dead code). There is nothing to hide. Deleting them is out of scope (see follow-ups).
- `ui/buttons/HardcoverButton.svelte` is a plain `hardcover.app` link ("Show on / Search on Hardcover"). It needs no API key, so it **stays visible**. It is used in `Recommendation`, `BookRelease` and `ExternalSearchLink`.
- The UI that actually depends on an integration:
  - Telegram: the `TelegramBotConnection` section in `NotificationSettings.svelte`, plus the "Bot" channel column and the "not connected" hint in `ManageNotificationTypes.svelte`.
  - Hardcover: `BookSearch.svelte` has Hardcover as its only source, so the whole search button in `BookCreate.svelte` goes. In the `BookCreate.svelte` import menu, only the Hardcover entry goes.
  - TMDB: `MovieSearch.svelte` has TMDB as its only source, so the whole search button in `MovieCreate.svelte` goes. In the `MovieCreate.svelte` import menu, only the TMDB entry goes.
  - BGG: the BGG source in `GameSearch.svelte` and the BGG entry in the `GameCreate.svelte` import menu. Steam stays.
  - `ntfy`: admin-only, nothing to hide. It is stored but not read.

Design decisions (made here because the brief delegates them; the owner may override):
- **Store.** A new app-wide store, `Integrations` in `src/lib/state/Integrations.svelte.ts`. It is created in the root `src/routes/+layout.svelte` (STANDARDS 15.2), because both `/settings` and four library routes read it. Shape: `Plugins` (constructor collaborators with defaults, `loaded`, `load()` is fetch → assign).
- **Load once, lazily.** The endpoint needs auth, and the root layout mounts before login. So `load()` returns early when `loaded` is set, and the feature layouts that need the flags call it (`settings`, `libraries/{books,movies,games}`). The flags then load once per session.
- **Unknown means visible.** Until the response arrives, or if the request fails (for example an older self-hosted API without the endpoint, since the brief says "no deploy order"), `isConfigured(name)` returns `true`. That keeps today's behaviour. Only an explicit `false` hides a feature. The cost is that a hidden feature can show for a moment before the flags arrive. **Owner: say so if you'd rather hide until loaded.**
- No new UI strings. Hiding only, so no i18n changes are expected.

## Task breakdown

TASK-1: Add the `InstanceIntegrations` type, an `IntegrationName` key type and the `integrations` API route.
     files: `src/lib/types/integration.ts` (new), `src/lib/config/apiRoutes.ts` (add a top-level `integrations: API_URL + '/integrations'`)
     depends: none
     risk: low — additive type and constant, no runtime behaviour change.

TASK-2: Create the `Integrations` store (`$state` flags, `loaded`, an idempotent `load()`, and `isConfigured(name)` that returns `true` while unknown), with `setIntegrations()`/`getIntegrations()`. Register it in the root layout and add a unit test.
     files: `src/lib/state/Integrations.svelte.ts` (new), `src/routes/+layout.svelte` (call `setIntegrations()` next to the other app-wide stores), `tests/unit/stores/Integrations.test.ts` (new, modelled on `tests/unit/stores/Plugins.test.ts` using `tests/unit/setup/storeMocks.ts`)
     depends: TASK-1
     risk: low — new isolated store. The test should cover: loads flags; a second `load()` does not re-fetch; a failed request leaves `loaded=false` and `isConfigured` returns `true`; an explicit `false` is reported as not configured.

TASK-3: Call `integrations.load()` in the `onMount` of each consuming feature layout.
     files: `src/routes/settings/+layout.svelte`, `src/routes/libraries/books/+layout.svelte`, `src/routes/libraries/movies/+layout.svelte`, `src/routes/libraries/games/+layout.svelte`
     depends: TASK-2
     risk: low — one extra GET per session. The early return in `load()` stops repeat fetches across routes.

TASK-4: Telegram. Hide the "Telegram Bot" `SettingsSection` in `NotificationSettings.svelte`, and in `ManageNotificationTypes.svelte` leave out the `telegram` channel column and the `telegram_bot_not_connected` hint when `telegram` is not configured.
     files: `src/lib/components/settings/notifications/NotificationSettings.svelte`, `src/lib/components/settings/notifications/ManageNotificationTypes.svelte`
     depends: TASK-3
     risk: medium — `ManageNotificationTypes` builds its table from a static `channels` array, so the filtering must not drop existing settings keys. Use a plain conditional, not a new `$derived`/`$effect` (STANDARDS 3.1, 5.1). Do not fix the hardcoded English strings already in this file (existing violation, out of scope).

TASK-5: Hardcover. In `BookCreate.svelte`, render `CreateModalSearchButton` only when `hardcover` is configured, and drop the Hardcover entry from `importOptions` (Goodreads stays).
     files: `src/lib/components/libraries/books/BookCreate.svelte`
     depends: TASK-3
     risk: low — local markup/array change. Since `BookSearch` only opens from that button, it needs no change.

TASK-6: TMDB. In `MovieCreate.svelte`, render `CreateModalSearchButton` only when `tmdb` is configured, and drop the TMDB entry from `importOptions` (IMDb stays).
     files: `src/lib/components/libraries/movies/MovieCreate.svelte`
     depends: TASK-3
     risk: low — the same pattern as TASK-5.

TASK-7: BGG. Leave out the BGG source in `GameSearch.svelte` and the BGG entry in `GameCreate.svelte`'s `importOptions` when `bgg` is not configured (Steam stays).
     files: `src/lib/components/libraries/games/GameSearch.svelte`, `src/lib/components/libraries/games/GameCreate.svelte`
     depends: TASK-3
     risk: low — the arrays are static `const`s today. Keep them that way (conditional entry), with no new `$derived` unless the value really has to update while mounted (STANDARDS 3.1).

TASK-8: Verify: `npm run check`, `npm run lint`, `npm test`, plus a manual run against a local API with `TELEGRAM_*`, Hardcover, TMDB and BGG keys unset (Discogs/Spotify are already handled by the music endpoint). Also run against an API without the endpoint, or with it failing, to confirm everything stays visible.
     files: none
     depends: TASK-1 … TASK-7
     risk: low — the manual run needs a human with a local API; record the result in `implementation.md`.

## Unclear / for the owner

- **Server-driven views that may also depend on these keys** were not in the brief, so they are **not** in scope here: book releases and recommendations (Hardcover?), movie releases and trailers (`libraries/movies/%s/trailers`, TMDB?), and music releases. If they fail without the key, that is a follow-up. Without seeing the API services I can't tell whether they fail or just return empty.
- **Fallback while unknown.** See "Unknown means visible" above.

## Follow-ups (not in this job)

- Delete the dead components `HardcoverImportButton.svelte`, `BggImportButton.svelte` and `ManageBotNotifications.svelte`. Also check the other unused `*ImportButton.svelte` files in `ui/buttons/` (no `ImportButton` imports outside contacts and calendars).
- API follow-up already noted in the API job: move `MusicServiceEnum::isConfigured()` onto `IntegrationEnum`. After that, the music endpoint could be retired in favour of `discogs`/`spotify` flags plus an always-on Deezer.
