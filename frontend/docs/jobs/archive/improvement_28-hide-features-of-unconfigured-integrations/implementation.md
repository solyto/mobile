# Implementation: 28 Hide features of unconfigured integrations

id: improvement
developer: @developer
date: 2026-10-15

## Summary

The frontend now reads `GET /api/v1/integrations` through a new app-wide `Integrations` store. It hides UI that depends on Telegram, Hardcover, TMDB or BGG when the instance reports that integration as unconfigured. "Unknown means visible": before the flags arrive, or when the request fails (for example on an older API without the endpoint), `isConfigured()` returns `true`, so the app behaves as it did before. Music (Discogs/Spotify) needed no change, because `libraries/music/integrations` already filters on the server (see tasks.md).

## Changes

TASK-1: Added `src/lib/types/integration.ts` (`InstanceIntegrations`, `IntegrationName = keyof InstanceIntegrations`) and a top-level `apiRoutes.integrations` entry in `src/lib/config/apiRoutes.ts`.

TASK-2: Added `src/lib/state/Integrations.svelte.ts`, which follows the `Plugins` shape (constructor collaborators with defaults, `loaded`, and `load()` as fetch → assign). `load()` returns early once `loaded` is set, and a failed request leaves `loaded=false`, so the next layout mount tries again. `isConfigured(name)` returns `this.integrations?.[name] !== false`. The store is registered with `setIntegrations()` in `src/routes/+layout.svelte`. Added `tests/unit/stores/Integrations.test.ts`, which covers: the flags load, there is no second fetch once loaded, everything counts as configured before load and after a failed load, and a load is retried after a failure.

TASK-3: `integrations.load()` is called in `onMount` of `src/routes/settings/+layout.svelte` (fire-and-forget; this layout had no `onMount` before) and inside the existing `Promise.all` of the `libraries/{books,movies,games}/+layout.svelte` files.

TASK-4: In `NotificationSettings.svelte`, the Telegram Bot `SettingsSection` is wrapped in `{#if integrations.isConfigured('telegram')}`, and the flag is passed down as a `showTelegram` prop. Following STANDARDS 3.3, the inner `ManageNotificationTypes.svelte` does not read the store. It renders `visibleChannels()`, a plain function that drops the `telegram` column when `showTelegram` is false, and it shows the "bot not connected" hint only when `showTelegram` is true. The static `channels` array and the settings keys are unchanged. The existing hardcoded English strings were left alone (out of scope).

TASK-5: In `BookCreate.svelte`, the import options are split into `hardcoverImport` / `goodreadsImport`, and `importOptions` leaves out Hardcover when it is unconfigured. `CreateModalSearchButton` (Hardcover is the only search source) only renders when `hardcover` is configured.

TASK-6: The same in `MovieCreate.svelte` for TMDB: `importOptions` leaves out TMDB (IMDb stays), and the search button is hidden.

TASK-7: The same in `GameCreate.svelte` for BGG: `importOptions` leaves out BGG (Steam stays). `GameSearch.svelte` gets a `showBgg` prop from `GameCreate`, and its sources are split into `steamSource` / `bggSource`, with BGG left out when the prop is false.

TASK-8: **Not run.** `node_modules` is missing from this worktree, and installing dependencies needs approval (hard rule), so `npm run check`, `npm run lint` and `npm test` were not executed. An accidental `npx vitest` attempt failed to load the config and changed nothing in the repo. The manual run against a local API with Telegram/Hardcover/TMDB/BGG keys unset, and against an API without the endpoint, still needs to be done by a human.
Follow-up (owner review): `Integrations` now caches the flags in localStorage (`LS_CACHE_KEY = 'integrations'`) with a 1-day TTL, keyed to `getApiUrl()` so switching servers on desktop/mobile refetches. The cache is read in the constructor, so `isConfigured()` is correct from the first render and `load()` makes no request while the cache is fresh. Tests added in `tests/unit/stores/Integrations.test.ts`.

## Known issues / follow-ups

- Verification is still outstanding (see TASK-8): run `npm ci && npm run check && npm run lint && npm test`, then do the manual API runs.
- `importOptions` / `searchSources` in the create modals and `GameSearch` are plain `const`s evaluated when the component mounts (STANDARDS 3.1). The modals open after the library layout has awaited `integrations.load()`, so in practice the flags are known by then. If a modal were opened before the flags arrived, it would keep showing the entries until it is reopened.
- `ManageNotificationTypes.svelte` still fetches the Telegram connection when Telegram is unconfigured. The result is simply not shown.
- Follow-ups from tasks.md still apply: delete the dead `HardcoverImportButton`, `BggImportButton` and `ManageBotNotifications` components, and check whether server-driven release, recommendation and trailer views depend on these keys.
