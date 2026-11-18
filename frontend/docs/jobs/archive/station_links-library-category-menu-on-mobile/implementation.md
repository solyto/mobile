## Summary

The links library now has a mobile category menu. Below `md`, a hamburger button sits top left in the library header and opens a flat slide-in panel, built like `SettingsNavigationMobile`. The panel lists All, Favorites, Uncategorized and every category, each with its count badge. The active row is highlighted and has `aria-current`. Picking a row calls the same store method as the desktop tab and closes the panel. No store changes, no new i18n keys, no new packages.

## Changes

TASK-1: New `src/lib/components/libraries/links/CategoryNavigationMobile.svelte`. It has no props and reads `getLinkLibrary()` / `getTranslation()`. The panel markup and classes are copied from `SettingsNavigationMobile`, and the title is `ts.get.libraries.navigation.links`. One `{#snippet row(...)}` renders every entry. The shared row and active classes are `const`s, and one `select(filter)` function picks `filterByFavorite()` or `filterByCategory(filter)` and then closes the panel. `Badge` sits inside the `relative` row through its existing `top`/`right` props (`14px`/`16px`).

TASK-2: `CategoryHeader.svelte` renders `<CategoryNavigationMobile />` in a `md:hidden` wrapper next to the existing `max-md:hidden` tab container. The tabs are unchanged.

TASK-3: Added `tests/components/helpers/CategoryNavigationMobileHarness.svelte` (calls `setLinkLibrary().load()`) and `tests/components/links-category-navigation-mobile.test.ts`. The data comes from a fake `ApiService` through `renderWithContext`. The tests cover rows and counts in order, `aria-current` for the default (All) and for a picked category, and, for each row kind, the store call (a spy on `LinkLibrary.prototype`) and the panel closing.

TASK-4: `npm run check` (0 errors, 0 warnings), `npm run lint` and `npm test` (99 files, 1601 tests) all pass. There is no diff in `src/lib/i18n`, `package.json` or `package-lock.json`. `node_modules` was missing in the worktree, so it was installed with `npm ci` from the existing lockfile.

## Known issues / follow-ups

- The look still needs the owner's manual check: the hamburger's vertical alignment with search and "+", the badge position inside rows, and dark mode. `HamburgerButton` uses its default `top-4 left-4`, as in `SettingsNavigationMobile`.
