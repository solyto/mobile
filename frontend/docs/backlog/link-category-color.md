# Backlog: links library: edit a category's title and colour

created: 2026-10-31

## What

A link category's colour can only be chosen when the category is created
(colour picker in `src/lib/components/libraries/links/CategoryCreate.svelte`).
Afterwards a category can only be deleted. Let the user change an existing
category's colour, and its title along with it.

- An edit action on each category tab in
  `libraries/links/CategoryHeader.svelte`, next to the delete button that
  appears on hover.
- It opens a small form with the title and the colour picker, prefilled with
  the current values, the same picker as in `CategoryCreate`.
- Saving updates the tab, its count badge, its active indicator and the
  colour dots in the link list.

## Why

Users pick a colour once and later want to change it, or fix a typo in the
title. Today the only way is deleting the category, which leaves all its links
uncategorized.

## Steps

1. **Store:** add `updateCategory(category, request)` to
   `src/lib/state/LinkLibrary.svelte.ts`, using the existing route
   `apiRoutes.libraries.links.updateCategory` and the existing type
   `UpdateLinkCategoryRequest` (`types/library_link.ts`), then reload the
   categories like `createCategory` does. Links show `entry.category`, so check
   whether the entries need reloading too for their dots to update.
2. **UI:** the edit action and form as described above.

## Out of scope

- Reordering categories.
- Editing categories on mobile (see `links-mobile-category-menu.md`).

## Notes

- Look at how other features edit categories before building the form:
  `Todos.updateCategory`, `TimeTracking.updateCategory` and the inline edit with
  colour picker in `time-tracking/TimeTrackingNavigation.svelte`. Reuse rather
  than invent (STANDARDS section 7).
- Check the API's update endpoint accepts `color` before relying on it.
- All new strings in `en`, the other locales through the translator agent.
