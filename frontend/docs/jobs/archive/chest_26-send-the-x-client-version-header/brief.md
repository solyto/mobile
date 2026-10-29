# Brief: 26 Send the X-Client-Version header

type: feature
id: chest
branch: feature/chest_26-send-the-x-client-version-header
date: 2026-10-14
author: Leander Muskalla

## What

The API (`solyto/api` `dd762ca`) accepts `X-Client-Version: major.minor.patch` and records it on the auth token, so the owner can see which builds are still in use. Send it on every request:

- the header builders in `ApiService` (`getApiHeader`, `getApiHeaderWithBody`, `getAuthHeaderOnly` and the `Accept` variant around `:190-225`), with and without a token;
- the health check `fetch` in `src/routes/setup/+page.svelte`.

## Why

API rule 13.4: a field may only be removed once no supported build reads it. The minimum-version check (backlog 27) also only works for builds that send the header, so it has to start now.

## Out of scope

Handling the 426 response (backlog 27).

## Notes

Order matters: the API's CORS change must be deployed before a build that sends the header, or the browser rejects the preflight and every request fails. Open question: where the version comes from. `package.json` says `0.0.1`; `settings/AppSettings.svelte:18` shows `env.PUBLIC_VERSION`. The API ignores a missing or non-`x.y.z` value. Safety: `check`, tests, and a request check in the browser dev tools.
