# Brief: 28 Hide features of unconfigured integrations

type: feature
id: improvement
branch: feature/improvement_28-hide-features-of-unconfigured-integrations
date: 2026-10-15
author: Leander Muskalla

## What

The API (`solyto/api` `c1db0c9`) adds `GET integrations`, which returns whether each instance integration is configured:

`{"hardcover": bool, "tmdb": bool, "discogs": bool, "bgg": bool, "spotify": bool, "telegram": bool, "ntfy": bool}`

Load it once and hide the UI that depends on an unconfigured integration, for example:

- Telegram: `settings/TelegramBotConnection.svelte`, `settings/notifications/ManageBotNotifications.svelte`, `ManageNotificationTypes.svelte`
- Hardcover: `ui/buttons/HardcoverImportButton.svelte`, `HardcoverButton.svelte`, book search/create
- BGG: `ui/buttons/BggImportButton.svelte`, game search
- TMDB: movie search/create
- Discogs/Spotify: music search/create (today via `MusicLibrary.integrations` from `libraries/music/integrations`)

`ntfy` is admin-only on the API side; probably nothing to hide.

## Why

On self-hosted servers without these keys, the features show up but fail. Until now the frontend had no way to know.

## Out of scope

Server-side behaviour when an integration is missing. Replacing the existing music integrations endpoint unless it turns out to duplicate this one.

## Notes

Additive endpoint, no deploy order. Decide which store holds the result and confirm the list of affected components when the job is picked up. Safety: `check`, tests, plus a manual run against a local API with some integrations unset.
