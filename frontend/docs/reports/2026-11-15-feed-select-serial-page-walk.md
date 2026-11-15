# Report: selecting a quiet feed pages through every feed's history, one request at a time

Date: 2026-11-15
Scope: `loadMore()` / `selectFeed()` in `src/lib/state/Feeds.svelte.ts`, and the
infinite-scroll sentinel in `src/lib/components/feeds/FeedView.svelte`.
Method: read the store, the view and `tests/unit/stores/Feeds.test.ts` at `6cb72e7`.
No code was changed. Nothing was measured against a real API. The backend is in a
separate repo, so whether `/feeds/items` already accepts a feed filter is **not
verified**.

**Overall: a clear performance win on `/feeds` for anyone who follows a mix of
busy and quiet feeds.** Clicking a feed that posts rarely triggers a chain of
requests, one after another, that can download the user's whole item history.

---

## 1. Finding: per-feed view filters on the client and keeps paging until it has 50 matches (verified in code)

`/feeds/items` is only paged by `offset` and `limit` (`Feeds.svelte.ts:82-84`). It
has no feed filter. A feed is selected like this:

1. `selectFeed(feed)` (line 110) filters the items already loaded by `feed_id`.
   If fewer than 50 match, it calls `loadMore()`.
2. `loadMore()` gets the next 50 items **across all feeds**, filters again, and
   calls itself again if fewer than 50 match (lines 98-100).
3. This only stops when 50 items match **or** `has_more` is false.

So for a feed with fewer than 50 items on the server (a monthly blog, a release
feed), the stop condition is never reached by matching. The loop runs until
**the end of the whole item history**:

- **Number of requests:** about `total items across all subscriptions / 50`.
  All of them run **one after another**, because each `await` waits for the
  previous page. 20 feeds with 100 retained items each means about 40 round
  trips before the list settles. On mobile at roughly 150 ms per request,
  that is 6 seconds or more.
- **Data downloaded:** every item of every feed, including `description`.
  Often that is the article's HTML teaser. Almost all of it is thrown away by
  the filter.
- **Memory:** everything stays in `items`. When the user goes back to "All
  feeds", it is all rendered at once (`filter()` copies the whole array into
  `filteredItems`, and the `{#each}` in `FeedView.svelte` has no windowing).
- **Extra CPU work, smaller:** each page does `this.items = [...this.items,
  ...newItems]` and then `filter()` over all items. Both are O(n) per page, so
  O(n²) over the chain. Each step also reassigns `$state` arrays, so Svelte
  re-renders the list after every page.

The infinite-scroll sentinel (`FeedView.svelte:16-25`, `rootMargin: 1000px`)
makes it worse. While a filtered list is short, the sentinel stays in view. Each
scroll or intersection then starts another all-feeds page.

The client already knows when to stop: `meta.feed_counts` (line 92) gives the
item count per feed and is shown as the badge in `FeedNavigation.svelte:81`. The
loop never checks it.

## 2. Side finding: `load()` during a running chain corrupts the pagination (verified in code, not reproduced)

`create`, `update`, `subscribe` and `delete` all call `load()`. `load()` resets
`items = []` and `offset = 0`, then calls `loadMore()`. If a chain from step 1 is
still running, `loadingMore` is `true`, so this new `loadMore()` returns at once
(line 77). Then the old request comes back:

- its page (from the old offset) is appended to the emptied list,
- `offset` becomes `0 + n` and no longer matches what is shown.

The result: the list starts in the middle of the history, and later pages repeat
or skip items. This is easy to trigger: select a quiet feed, then delete or edit
it from the feed menu while the chain is running.

## 3. Suggestion

**Preferred (needs a backend change): filter on the server.**

- Add `feed_id` as a query parameter to `GET /feeds/items`. Check the backend
  repo first, because it may already be there.
- In `loadMore()`, send `&feed_id=${activeFeed.feed_id}` when a feed is active.
- Keep a separate cursor (`items` / `offset` / `hasMore`) per selection. The
  simplest version resets the list on `selectFeed()`, just like `load()` does.
- Remove the recursive call at lines 98-100 and the `< ITEMS_PER_PAGE` check in
  `selectFeed()`. Each selection then needs **one request of at most 50 items**.

**Client-only fallback, if the backend can't change soon:**

- Stop the chain early using what the client already has: if the number of
  loaded items for `activeFeed` is at least `feedCounts[activeFeed.feed_id]`,
  do not call `loadMore()` again. Apply this both in the recursion and in
  `selectFeed()`. This limits the quiet-feed case to the pages needed to find
  that feed's items, not the whole history. It does depend on `feed_counts`
  meaning "items available on the server". Check that against the API before
  relying on it.
- Fix finding 2 with a request generation counter: `load()` and `selectFeed()`
  increment it, and `loadMore()` throws away a response whose generation is out
  of date.

**Tests** (`tests/unit/stores/Feeds.test.ts`, mocked `ApiService`):

- When a feed is selected, `api.list` is called with `feed_id` and called only
  once. With the fallback: it stops once `feed_counts` is reached, even though
  `has_more: true`.
- If `load()` runs while a `loadMore()` is still waiting, the response that
  comes back late does not change `items` or `offset`.

## 4. Not checked

- Real item volumes and how long the backend keeps items. The impact grows with
  both.
- Whether `feed_counts` counts all items or unread/recent items only.
