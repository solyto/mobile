# Implementation: quiet-feeds

id: that
developer: beatrix
date: 2026-11-16

## Summary

Selecting a feed no longer walks the whole item history page by page. The store
now asks the API for that feed's items (`GET /feeds/items?feed_id=…`, added by the
backend in the same room) and loads one page per selection. Responses that come
back after the list was reset are ignored. Based on
`docs/reports/2026-11-15-feed-select-serial-page-walk.md`.

## Changes

TASK-1 (from the report, no tasks.md breakdown):
- `src/lib/state/Feeds.svelte.ts`: `loadMore()` appends `feed_id` when a feed is
  active and no longer calls itself. `selectFeed()` resets the list and loads the
  first page. New private `resetItems()` (used by `load()` and `selectFeed()`)
  bumps a generation counter; `loadMore()` drops responses from an older generation.
- `tests/unit/stores/Feeds.test.ts`: replaced the recursion and old selectFeed
  tests with: one request with `feed_id` per selection, selecting null loads
  all feeds, and a late response after `load()` leaves `items`/`offset` untouched.

Verified: Feeds tests pass, `npm run check` clean, eslint clean on changed files.

## Known issues / follow-ups

- Needs the backend `feed_id` filter (UUID, thaddeus, branch `feature/great_quiet-feeds`;
  backend tests and analyse pass) to be merged before this ships.
- Going back to "All feeds" now makes one request instead of showing items already loaded.
- `tests/unit/stores/Contacts.test.ts` ("loads hidden state, books, contacts and photos")
  fails; this job doesn't touch it.
