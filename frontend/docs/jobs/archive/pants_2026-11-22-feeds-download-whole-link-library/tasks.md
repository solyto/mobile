# Tasks: 2026-11-22-feeds-download-whole-link-library

id: pants
analyst:
date:

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Bookmark button talks to the API directly via `Feeds`, state from `saved_link_id`
files: src/lib/types/feed.ts, src/lib/state/Feeds.svelte.ts, src/lib/components/feeds/SaveToLibraryButton.svelte, src/routes/feeds/+layout.svelte, src/lib/state/LinkLibrary.svelte.ts, tests/unit/stores/Feeds.test.ts
depends: none (API field from winifred)
risk: low — old CSV flags are dropped; the server value replaces them

TASK-2: Parallel subscriptions/items load, no wasted request in `delete()`
files: src/lib/state/Feeds.svelte.ts, tests/unit/stores/Feeds.test.ts
depends: TASK-1
risk: low — keeps "no partial update" when the subscriptions request fails
