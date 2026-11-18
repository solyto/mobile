# Tasks: links library: category menu on mobile

id: station
analyst: @analyst
date: 2026-11-17

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Create `CategoryNavigationMobile.svelte`, a flat slide-in category menu for the links library, built like `SettingsNavigationMobile.svelte`.
  files: src/lib/components/libraries/links/CategoryNavigationMobile.svelte (new)
  depends: none
  risk: medium. The markup is copied from an existing pattern, but `Badge` is absolutely positioned, so getting the count to sit inside a full-width row takes care.
  notes:
  - No props. The component reads `getLinkLibrary()` for the data it displays (STANDARDS 3.3 allows this) and `getTranslation()` for strings, like `CategoryHeader.svelte` does.
  - Local `let open = $state(false)`. Use a named `close()` and a named select handler per entry kind, with no inline arrow that only calls a named function (STANDARDS 4.1). No `$derived` and no `$effect`.
  - Copy the structure and classes from `SettingsNavigationMobile.svelte`:
    - `<HamburgerButton onclick=…>`
    - panel `secondary-nav-mobile-container fixed inset-x-0 top-0 bottom-16 z-50 flex flex-col bg-c-bg lg:hidden dark:bg-s-dark-1` with `transition:fly={{ x: -400, duration: 200 }}`
    - header row with the title `ts.get.libraries.navigation.links` and `<CloseButton onClick={close} inModal={false} />`
    - one native `<button>` row per entry
  - Rows, in this order: All (`filterByCategory(null)`, `getCategoryCount()`, `var(--color-c-btn-hover)`), Favorites (`filterByFavorite()`, `getFavoriteCount()`, `var(--color-c-warning)`), Uncategorized (`filterByCategory(0)`, `getCategoryCount(null)`, `var(--color-c-btn)`), then `{#each library.categories as category (category.id)}` (`filterByCategory(category.id)`, `getCategoryCount(category.id)`, `category.color ?? 'var(--color-c-primary)'`). Labels: `ts.get.libraries.links.all` / `.favorites` / `.uncategorized` / `category.title`. Every pick also closes the panel.
  - Active row: compare against `library.activeFilter` (`null`, `'favorite'`, `0`, `category.id`). Add `bg-c-neutral-1 dark:bg-s-dark-3` and `aria-current="true"`; otherwise `aria-current` is `undefined`. There are four rows with the same long class string, so name the shared row and active classes as `const`s (STANDARDS 3.5) and keep each attribute expression on one line (STANDARDS 1.1). Consider a `{#snippet}` for the row (STANDARDS 1.6).
  - Badge placement: `Badge` is `absolute` (default `top:-10px; right:-10px`). Make the row `relative` and use Badge's existing `top`/`right` props to place the count inside the row on the right. Do not change `Badge.svelte`, which is out of scope.
  - No new i18n keys, no hard-coded text.

TASK-2: Render `CategoryNavigationMobile` inside `CategoryHeader.svelte`, in a wrapper that only shows below `md`.
  files: src/lib/components/libraries/links/CategoryHeader.svelte
  depends: TASK-1
  risk: low. This is an additive sibling of the existing tab container and leaves the desktop tabs untouched.
  notes:
  - Add `<div class="md:hidden"><CategoryNavigationMobile /></div>` next to (not inside) the existing `max-md:hidden` tab container. `CategoryHeader` is rendered as `Header.svelte`'s children snippet, so the component now needs one root element or a fragment with two siblings. Either works inside Header's `row-span-2` cell.
  - `HamburgerButton` is `absolute`, so it positions against `Header.svelte`'s `relative` container. Keep its default `top`/`left` as `SettingsNavigationMobile` does. The owner checks the look after merge, as the brief says.
  - Don't change the tabs, `Header.svelte` or `HamburgerButton`.

TASK-3: Add a component test for `CategoryNavigationMobile`, with a small harness that seeds the `LinkLibrary` context.
  files: tests/components/helpers/CategoryNavigationMobileHarness.svelte (new), tests/components/links-category-navigation-mobile.test.ts (new)
  depends: TASK-1
  risk: medium. `renderWithContext()` does not seed `LinkLibrary`, and the fly-out transition can delay removing the panel in jsdom.
  notes:
  - Harness, modelled on `tests/components/helpers/GameCreateHarness.svelte`: call `setLinkLibrary()` and render `<CategoryNavigationMobile />`. Use it through `renderWithContext(Harness, …, { stores: { auth: { apiService: fakeApi } } })`, and load the data through a fake `ApiService` (`list` for `libraries.links.list` / `listCategories`, as in `game-create.test.ts`). Alternatively, have the harness hand the created library back so the test can set `entries`/`categories` directly. Pick one and keep it minimal.
  - Cases:
    1. After opening via the hamburger button, the panel lists All, Favorites, Uncategorized and each category in that order, each with its count.
    2. The row matching `activeFilter` has `aria-current="true"` and the other rows do not. Cover `null` (All) by default, plus one category id.
    3. Clicking a row calls the matching store method and closes the panel: `vi.spyOn` on the library instance or prototype for `filterByCategory` / `filterByFavorite`, and assert the args (`null`, `0`, id). Then wait for the panel to disappear with `waitFor`/`waitForElementToBeRemoved`, because of the transition.
  - Follow `docs/TESTING.md`: test the contract (rows, counts, `aria-current`, store calls, closing), not classes.

TASK-4: Verify the change.
  files: none
  depends: TASK-2, TASK-3
  risk: low. Verification only.
  notes: `npm run check`, `npm run lint`, `npm test` all pass. Confirm there are no new packages and no i18n changes (`git diff --stat src/lib/i18n` is empty). The visual check (button position next to search and "+", panel, active marker, dark mode) is for the owner after merge.

## Open points (non-blocking)

- Exact Badge `top`/`right` values inside a row, and the hamburger button's vertical alignment with the search and "+" buttons, are visual choices the agent can't verify. Use sensible values with existing props and leave the final look to the owner's manual check.
