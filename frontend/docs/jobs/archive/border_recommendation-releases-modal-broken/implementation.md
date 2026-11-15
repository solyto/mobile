# Implementation: recommendation / releases modal broken

id: border
developer: developer
date: 2026-11-10

## Summary

The releases and recommender modals now use the normal solid modal panel (background, border, shadow, `rounded="2xl" p="8"`), the same as the create/search modals. With no callers left, the `transparent` prop was removed from `PopupContentModal`.

## Changes

TASK-1: `src/lib/components/libraries/shared/Releases.svelte` — removed `transparent={true}` and added `rounded="2xl" p="8"`. Left the inner wrapper spacing (`pt-6 pb-4`) as it was.
TASK-2: `src/lib/components/libraries/shared/Recommender.svelte` — same change. The `md:h-92 md:w-112` content size is unchanged.
TASK-3: `src/lib/components/ui/PopupContentModal.svelte` — removed the `transparent` prop. The `!transparent` classes (`top-[-20px] left-12`, `max-md:h-[calc(100dvh-4rem)]`, `bg-c-bg-modal`, `not-dark:border-1`, `shadow-md`, `dark:shadow-s-dark-shadow`) are now always applied, and the `transparent`-only `top-3`/`left-15` were dropped. The output is the same as the old `transparent = false` output.

## Known issues / follow-ups

- Not verified visually or by tooling: `node_modules` is missing in this worktree, so I couldn't run `npm run check`, `eslint` or a `shot` render (and no API is available). Please check both modals on desktop in light and dark themes.
- The "no releases" empty state and the recommender option buttons still use the bordered `bg-c-bg-surface shadow-sm` card style inside the now-solid modal. I left them unchanged because they're out of scope; review them visually.
