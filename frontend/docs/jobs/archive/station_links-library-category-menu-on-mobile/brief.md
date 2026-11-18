# Brief: links library: category menu on mobile

type: feature
id: station
branch: feature/station_links-library-category-menu-on-mobile
date: 2026-11-17
author: Leander Muskalla

updated: 2026-11-17 (pattern decided by the owner, ready for implementation)

## Job (decided, do exactly this)

On mobile, the links library has no way to filter by category: the category
tabs (`src/lib/components/libraries/links/CategoryHeader.svelte:15`) are
hidden below `md` (`max-md:hidden`). Add the app's usual mobile secondary
navigation: a hamburger button top left that opens a slide-in menu.

**Pattern:** follow `src/lib/components/settings/SettingsNavigationMobile.svelte`
(flat list) exactly: `HamburgerButton` top left, a panel with
`secondary-nav-mobile-container fixed inset-x-0 top-0 bottom-16 z-50 …` and
`transition:fly={{ x: -400, duration: 200 }}`, a header row with the title and
`CloseButton`, then one full-width row per entry, the active row highlighted
with `bg-c-neutral-1 dark:bg-s-dark-3` and `aria-current`. Same look as the
todos menu (`todos/TodoNavigationMobile.svelte`), but flat: no sub-levels.

Details:
- **New component** `src/lib/components/libraries/links/CategoryNavigationMobile.svelte`,
  rendered inside `CategoryHeader.svelte` in a wrapper that is visible only
  below `md` (`md:hidden`), i.e. exactly where the tabs are hidden.
  (`HamburgerButton` and the panel are only `lg:hidden` themselves; the
  wrapper prevents a duplicate between `md` and `lg`, where the tabs are
  visible.) The button sits top left in the library header
  (`libraries/shared/Header.svelte`, `relative` container), whose left column
  is empty on mobile.
- **Entries, in the same order as the desktop tabs:** All, Favorites,
  Uncategorized, then every category. Each row shows the label and its count
  with the same `Badge` and colours as the tab (`getCategoryCount()`,
  `getFavoriteCount()`, `getCategoryCount(null)`,
  `getCategoryCount(category.id)`; category colour
  `category.color ?? 'var(--color-c-primary)'`).
- **Active row:** the one matching `library.activeFilter` (`null` = All,
  `'favorite'`, `0` = Uncategorized, a category id).
- **Picking a row** calls the same store method as the tab
  (`library.filterByCategory(null | 0 | id)`, `library.filterByFavorite()`) and
  closes the panel.
- **Strings:** reuse the existing ones, no new keys: `ts.get.libraries.links.all`,
  `.favorites`, `.uncategorized` (as in `CategoryHeader.svelte`), and the
  existing "Links" label from the libraries navigation strings (`en.ts:756`)
  as the panel title. Don't hard-code text (unlike the "Settings" title in
  `SettingsNavigationMobile`).

## Out of scope (do not do)

- Moving links between categories on mobile (desktop uses drag and drop onto
  the tabs).
- Creating, renaming, recolouring or deleting categories on mobile.
- Changes to the desktop tabs, `SettingsNavigationMobile`,
  `TodoNavigationMobile` or `HamburgerButton`.
- Store changes. Everything needed exists in `LinkLibrary.svelte.ts`.

## Tests

- Component test in `tests/components/` (jsdom, Testing Library,
  `renderWithContext()` from `tests/components/helpers/context.ts`, see
  `docs/TESTING.md`): the menu lists All, Favorites, Uncategorized and each
  category with its count; the active row has `aria-current`; clicking a row
  calls the matching store method and closes the panel.

## Checks

- `npm run check`, `npm run lint` (eslint) and `npm test` pass.
- No new packages, no new i18n keys.
- **Manual, by the owner after merge:** look at it on a phone or a narrow
  window (button position next to search and "+", panel, active marker, dark
  mode). An agent can't verify the look.
