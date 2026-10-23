# Brief: 27 Update screen on 426

type: feature
id: middle
branch: feature/middle_27-update-screen-on-426
date: 2026-10-15
author: Leander Muskalla

## What

The API (`solyto/api` `c5f3b99`) answers authenticated requests with 426 when their `X-Client-Version` is below `MIN_CLIENT_VERSION`. The body is the error envelope with message "Please update the app." and `meta.min_client_version`. Health and `auth/*` are never rejected, and the check is off unless the owner sets the minimum.

`ApiService` only special-cases 401 (`fetchWithRecovery`, `src/lib/services/ApiService.ts:42-56`); a 426 turns into an empty `null` result. Detect 426 there and show an update screen instead, with the right instruction per platform (web reload, desktop, mobile store/F-Droid).

## Why

It is the API's safety net for changes that can't be made backwards compatible. It only reaches builds that send the header (backlog 26) and show an update screen.

## Out of scope

Sending the header (backlog 26). Raising the minimum (owner decision on the API side).

## Notes

Depends on 26. A 426 must never trigger the 401 session recovery or a logout. All strings in all four i18n files. Safety: tests for the status handling, `check`, plus a manual run against a local API with `MIN_CLIENT_VERSION` above the build's version.
