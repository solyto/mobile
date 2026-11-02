# Backlog: links library: category menu on mobile

created: 2026-10-31

## What

On mobile the links library has no way to pick a category. The category tabs
(`src/lib/components/libraries/links/CategoryHeader.svelte`) are hidden below
`md` (`max-md:hidden`), so mobile users always see all links and cannot filter
by favorites, uncategorized or a category.

Add a mobile menu that offers the same choices as the tabs:

- All, Favorites, Uncategorized and every category, each with its count.
- The active choice is marked, in the category's colour like the desktop tabs
  (`NavIndicator` with `color`).
- Picking an entry calls the same store methods as the tabs
  (`library.filterByCategory(id)`, `library.filterByFavorite()`) and closes
  the menu.

## Why

Categories are the main way to organise links. Without them, the mobile view
of a large library is one long unfiltered list.

## Out of scope

- Moving links between categories on mobile. On desktop that is drag and drop
  onto the tabs, which does not work on touch; it needs its own solution.
- Creating, renaming or deleting categories on mobile.
- Changing a category's colour (see `link-category-color.md`).

## Notes

- Reuse an existing mobile navigation pattern instead of building a new one.
  Candidates: `todos/TodoNavigationMobile.svelte` (hamburger button with a
  slide-in panel) and the feeds navigation (hamburger on mobile). Read both
  before deciding.
- The trigger has to fit the library header (`libraries/shared/Header.svelte`),
  which on mobile shows the search and the "+" icon button. The header takes
  left-side content as `children`; the links page already passes
  `CategoryHeader` that way.
- All new strings in `en`, the other locales through the translator agent.
