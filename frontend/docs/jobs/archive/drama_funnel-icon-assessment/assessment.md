# Assessment: funnel icon usage

id: drama
status: open
date: 2026-08-16

## Summary

The `funnel` icon (`@lucide/svelte/icons/funnel`) is used in **7 places** across the codebase. Exactly **one** of them is a semantically correct use of a funnel — the library filter button in `src/lib/components/libraries/filters/Filter.svelte`. The remaining **6** are all mobile navigation/drawer toggles, where the funnel icon is inappropriate: users reading a funnel expect "filter this list", but the button actually opens a navigation drawer/menu. This assessment recommends replacing every non-filter usage with a `menu` (hamburger) icon, which the codebase already ships as `HamburgerButton` (used by settings).

## 1. Where the funnel icon is used (full audit)

### 1.1 Direct `IconFunnel` renders (visible funnel icons)

| # | File | Line(s) | Context | Kind |
|---|------|---------|---------|------|
| 1 | `src/lib/components/ui/buttons/FunnelButton.svelte` | 2, 15 | Floating circular button (`absolute`, `lg:hidden` = mobile-only), renders `<IconFunnel class="text-c-neutral-1" />`. This is the icon *source* for every `FunnelButton` consumer. | Icon source for mobile toggles |
| 2 | `src/lib/components/libraries/filters/Filter.svelte` | 2, 60 | `<IconFunnel />` inside the libraries filter button; clicking opens the filter dropdown (genres, rating, wishlist, lent books, recipe/plant filters, clear filters). | **True filter action** ✅ |

### 1.2 `FunnelButton` consumers (all mobile navigation toggles)

| # | File | Line | Usage | Kind |
|---|------|------|-------|------|
| 3 | `src/lib/components/feeds/FeedNavigation.svelte` | 31 | `<FunnelButton onclick={toggleMobile} top={3} />` — reveals the hidden feed list drawer on mobile (display block/none). | Navigation/menu toggle ❌ |
| 4 | `src/lib/components/contacts/ContactNavigation.svelte` | 34 | `<FunnelButton onclick={toggleMobile} />` — reveals the address-book navigation drawer on mobile. | Navigation/menu toggle ❌ |
| 5 | `src/lib/components/todos/TodoNavigationMobile.svelte` | 64 | `<FunnelButton onclick={() => (open = true)} top={6} />` — opens the full-screen mobile todo navigation drawer (workspaces, categories, priority, status, effort, due, tags). | Navigation/menu toggle ❌ |
| 6 | `src/lib/components/time-tracking/TimeTrackingNavigation.svelte` | 141 | `<FunnelButton onclick={toggleMobile} />` — reveals the hidden time-tracking navigation drawer on mobile. | Navigation/menu toggle ❌ |
| 7 | `src/lib/components/notes/NoteNavigationMobile.svelte` | 44 | `<FunnelButton onclick={() => (open = true)} />` — opens the full-screen mobile notes/categories navigation drawer. | Navigation/menu toggle ❌ |

### 1.3 Hamburger precedent (correct pattern already in the codebase)

- `src/lib/components/ui/buttons/HamburgerButton.svelte` — byte-for-byte identical to `FunnelButton` except it renders `IconMenu` (`@lucide/svelte/icons/menu`) instead of `IconFunnel`.
- `src/lib/components/settings/SettingsNavigationMobile.svelte` (lines 4, 24) — the settings mobile drawer already uses `HamburgerButton`. This is the exact scenario the other mobile drawers are in, done right.

### 1.4 Dead code: unused `IconFunnel` imports

These files import `IconFunnel` but never render it (leftover from an earlier version that rendered the icon directly):

- `src/lib/components/feeds/FeedNavigation.svelte` — line 3
- `src/lib/components/contacts/ContactNavigation.svelte` — line 11
- `src/lib/components/todos/TodoNavigationMobile.svelte` — line 7
- `src/lib/components/time-tracking/TimeTrackingNavigation.svelte` — line 5

## 2. Where the funnel icon makes sense

**Only `src/lib/components/libraries/filters/Filter.svelte`.** The button's sole purpose is to open a filter panel that narrows the library list (genre, rating, wishlist, lent books, recipe type, plant location, unidentified). "Funnel = filter" is the canonical association in every major icon set. **Keep it as-is.**

## 3. Where the funnel icon does NOT make sense

All six remaining usages (rows 1, 3–7 above) are mobile **navigation drawer / menu toggles**. The funnel icon semantically promises "filter/sort the current content", but the action actually opens a navigation menu (feeds list, address books, todo sections, time-tracking nav, note categories). A funnel on a menu button is misleading — it reads as "filter" to users who then land on a navigation drawer.

Note on `TodoNavigationMobile.svelte` specifically: although the drawer *contains* filter sections (priority, status, due, tags, …), the button itself is a drawer opener — the same role `HamburgerButton` plays in settings. A funnel there still misleads, and switching only that one to a "filter-like" icon would make the mobile nav affordances inconsistent across modules.

## 4. Recommended replacements

| Location | Current | Recommended | Rationale |
|----------|---------|-------------|-----------|
| `libraries/filters/Filter.svelte` | `funnel` | **keep `funnel`** | Genuine filter action; funnel is the canonical filter glyph. |
| `feeds/FeedNavigation.svelte` | `FunnelButton` | **`HamburgerButton`** (`menu`) | Drawer toggle, not a filter. `top={3}` prop is supported by `HamburgerButton`. |
| `contacts/ContactNavigation.svelte` | `FunnelButton` | **`HamburgerButton`** (`menu`) | Drawer toggle, not a filter. |
| `todos/TodoNavigationMobile.svelte` | `FunnelButton` | **`HamburgerButton`** (`menu`) | Drawer opener; `top={6}` prop is supported. |
| `time-tracking/TimeTrackingNavigation.svelte` | `FunnelButton` | **`HamburgerButton`** (`menu`) | Drawer toggle, not a filter. |
| `notes/NoteNavigationMobile.svelte` | `FunnelButton` | **`HamburgerButton`** (`menu`) | Drawer opener, not a filter. |

**Recommended replacement icon: `menu` (hamburger)** — via the existing `HamburgerButton` component, which is API-compatible with `FunnelButton` (`onclick`, `top`, `left` props) and already the convention for settings.

**Alternatives considered and rejected:**
- `list-filter` / `sliders-horizontal` — appropriate for an *inline filter control* (e.g. a filter toolbar in a list view header), not for a drawer opener. If the app ever adds a dedicated filter control on desktop, these are the better fits there. Both exist in the pinned version (see §5).
- `align-justify` / `panel-left-open` — plausible menu glyphs, but `menu`/hamburger is the established convention in this app (settings) and the least surprising to users.

### Recommendation for `FunnelButton` itself

Once the five consumers are switched to `HamburgerButton`, `FunnelButton` has no consumers left and becomes a pure duplicate of `HamburgerButton` (same markup, same props, different icon). Recommendation: **deprecate and delete `FunnelButton`**, and have consumers use `HamburgerButton`. (Do **not** just repoint `FunnelButton` to the hamburger icon — that would leave two identical components, which is worse than having one.) This is a follow-up implementation job; this assessment only documents the decision.

### Cleanup alongside the replacements

- Remove the four unused `IconFunnel` imports: `FeedNavigation.svelte` (line 3), `ContactNavigation.svelte` (line 11), `TodoNavigationMobile.svelte` (line 7), `TimeTrackingNavigation.svelte` (line 5).

## 5. Icon availability in the pinned lucide version

Pinned dependency: `@lucide/svelte` **0.544.0** (exact, in `package.json` devDependencies). `node_modules` is not installed in the worktree, so availability was verified against the published `@lucide/svelte@0.544.0` package file listing (jsDelivr data API).

| Icon | Exists in 0.544.0 |
|------|-------------------|
| `funnel` (current) | ✅ |
| `menu` (recommended replacement) | ✅ (already imported by `HamburgerButton.svelte`) |
| `list-filter` (alternative) | ✅ |
| `sliders-horizontal` (alternative) | ✅ |
| `filter` / `filter-x` / `funnel-x` / `align-justify` / `sliders` (other candidates) | ✅ |

No recommended icon is missing from the pinned version; no dependency change is required.

## 6. Conclusion

- **Keep** the funnel on the library filter button (`Filter.svelte`).
- **Replace** the funnel on all five mobile navigation toggles with the `menu`/hamburger icon via the existing `HamburgerButton`.
- **Deprecate/delete** `FunnelButton` once it has no consumers.
- **Remove** the four unused `IconFunnel` imports.
- All replacements are available in the pinned `@lucide/svelte` 0.544.0 — no version bump needed.

**Scope note:** per the job brief, this is an assessment only — no source files were changed.