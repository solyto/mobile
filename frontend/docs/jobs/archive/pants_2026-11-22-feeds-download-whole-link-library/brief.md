# Brief: 2026-11-22-feeds-download-whole-link-library

type: feature
id: pants
branch: feature/pants_2026-11-22-feeds-download-whole-link-library
date: 2026-11-22
author: Leander Muskalla

## What

Implement report `docs/reports/2026-11-22-feeds-download-whole-link-library.md`, frontend side, as agreed in the room (decision 01M82JQ47AT2AS2XJX9B6Q2GW8):

- B: `/feeds` no longer loads `LinkLibrary`. Bookmark = `POST /libraries/links`, keep the returned id on the item's `saved_link_id`. Un-bookmark = `DELETE /libraries/links/{saved_link_id}`; 404/403 count as already gone. No reloads. Remove the `feeds_in_library` localStorage state and clear the stale key.
- C: `Feeds.load()` requests subscriptions and items in parallel; `Feeds.delete()` no longer fires a wasted items request.

## Why

Every `/feeds` visit and every bookmark click downloads the whole (unpaginated) link library just to look up a link id by URL. The saved state lives in a non-per-user localStorage CSV that drifts from the real library and leaks across users on a shared browser.

## Out of scope

- The API change (A: `saved_link_id` on `GET /feeds/items`), done by winifred in the api repo. Deploy the API first.
- Dedupe on `POST /libraries/links`, URL normalization.

## Notes

Field contract: `saved_link_id: string | null` (link UUID), exact URL match, newest link wins on duplicates.
