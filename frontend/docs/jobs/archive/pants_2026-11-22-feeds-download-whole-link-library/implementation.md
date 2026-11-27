# Implementation: 2026-11-22-feeds-download-whole-link-library

id: pants
developer: ophelia
date: 2026-11-22

## Summary

`/feeds` no longer downloads the link library. The bookmark button creates/deletes the link directly through the `Feeds` store and reads its state from the new API field `FeedItem.saved_link_id` (winifred, api repo). The localStorage `feeds_in_library` flags are gone. `Feeds.load()` now fetches subscriptions and items in parallel, and `Feeds.delete()` no longer fires a wasted items request.

## Changes

TASK-1: `types/feed.ts` adds `saved_link_id: string | null`. `Feeds.svelte.ts`: `saveToLibrary()` = `POST /libraries/links`, stores the returned id; `unsaveFromLibrary()` = `DELETE /libraries/links/{saved_link_id}`, 404/403 count as already gone; no reloads; the CSV flag state is removed and the stale key is destroyed in the constructor. `SaveToLibraryButton.svelte` uses the store and `item.saved_link_id`. `routes/feeds/+layout.svelte` drops `setLinkLibrary()`/`load()`. `LinkLibrary.deleteByLink()` removed (no callers left). Store tests rewritten for the new flow.
TASK-2: `Feeds.load()` runs both requests with `Promise.all` and assigns only when the subscriptions request succeeds; shared `itemsUrl()`/`appendItems()` with `loadMore()`. `delete()` clears the active feed and items, then `load()`. Tests for the parallel start, failed-subscriptions case and delete.

## Known issues / follow-ups

- Needs the API change (`saved_link_id` on `GET /feeds/items`) deployed first; until then every item shows as not saved.
- Previously saved flags are dropped once (agreed: the server value replaces them).
- `npm run check` (svelte-check) is OOM-killed in this container; verified instead with `tsc --noEmit` (only a pre-existing error in `tests/components/logic-leaves.test.ts`), `npm run lint`, `npm test` (1832 passed) and a Svelte compile of the changed components. Run `npm run check` locally before merging.
- Not in scope: dedupe on `POST /libraries/links`, URL normalization.
