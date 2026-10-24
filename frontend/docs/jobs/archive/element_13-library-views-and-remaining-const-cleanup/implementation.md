# Implementation: 13 Library views and remaining @const cleanup

id: element
developer: @developer
date: 2026-10-13

## Summary

The `{@const}` stacks in `SpineView` and `LibrarySearchModal` are now child components, and so are the multi-const `{#each}` bodies in the check-in views. Single computed consts became script functions. The member-expression icon/component consts render directly as `<x.icon />`. The two in-scope comment-audit files no longer have narrating comments. The tasks.md defaults were used for the open questions: the calendar `offHour` sites and the `Auth`/`ApiService`/`CalendarDragState` comments were left alone, and the `resultRow` prop was kept. For TASK-9, the owner chose option (a) from Open question 2: indexed icon lookups pass the icon to a child component as a prop.

`grep -rn '{@const' src` now lists only `TodoEditModal.svelte:61` (allowed), and the three calendar `offHour` sites (excluded).

## Changes

TASK-1: New `libraries/shared/Spine.svelte` renders one spine plus its cover. It gets plain values and callbacks (`title`, `coverUrl`, `xOffset`, sizes, `gap`, `isSquare`, `hovered`, `onHover`, `onCoverLoad`, `onClick`). `hoveredId` and `coverWidths` stay in `SpineView`. The folded cover `transform` became `coverTransform()`, and the `flipRight` ternaries became `coverSide()`. `spineColor` and `spineTextColor` moved into the child and now share one `titleHash()`. `coverUrl()` in `SpineView` returns `null` when there is no cover. The four narrating comments were removed. The style declarations are the same as before.

TASK-2: New `libraries/shared/LibrarySearchResult.svelte` (`result`, `importing`, `disabled`, `onSelect`, optional `resultRow`) renders either the snippet or the default button, exactly as before. `LibrarySearchModal` gained `resultId(source, result)`, which both `select()` and the markup use, and it renders `<source.icon class="size-4" />`.

TASK-3: `CreateModalImport.svelte` now uses `<entry.icon class="size-4" />`, and `routes/settings/+page.svelte` uses `<section.component />`.

TASK-4: The single computed consts became script functions:
- time-tracking project page: `categoryColor(cat)` / `categoryTextColor(cat)`, with the style split one declaration per line
- `StaggeredLogo`: `tileBackgroundImage()`, `tileBackgroundPosition(tile)`, `tileFly(tile)`
- `AppearanceSettings`: `isActive(theme)`
- `TodoNavigationMobile`: `currentSection()`; the `{#if section}` wrapper became `{#each currentSection()?.items ?? []}`
- `OverviewDesktop`: inline `getUrlFormat(date)`; I dropped the redundant `new Date(...)` copy because `getUrlFormat` does not mutate its argument
- `JournalArchivePicker`: `isFuture(date)`, `isSelected(date)`, `isMarked(date)`

TASK-5: New `Navigation.enabledItems(slugs)` store method. It maps slugs to `NavItem`s and drops items whose feature flag is off. Both navbars iterate over its result, keyed by `item.slug`. `MobileNavbar` still slices `mobileOrder` at `mobileVisibleCount` *before* filtering, so the overflow split has not changed. I found no existing helper in `config/navigation.ts` or the store that did this.

TASK-6: `Averages` and `CheckInWidget` look alike, but their markup differs (sizes, an icon box versus a bare icon, the `#n` fallback). Following rule 7.1, they got two components: `check-in/stats/AverageRow.svelte` and `dashboard/widgets/CheckInWidgetRow.svelte`. The bar-colour functions, which only the row uses, moved into each row component, and the folded class ternary became `barColor()`. In the trends page, new `check-in/stats/TrendChart.svelte` holds the `categories.length >= 2` guard together with the chart. `{#key selectedRange}` stays in the parent.

TASK-7: New `check-in/SelectedSportButton.svelte` (`title`, `position`, `replacing`, `icon`, `onClick`). `CheckInSettings` gained `sportLabel(sportId)`. I moved the class ternaries unchanged, as tasks.md asked.

TASK-8: `ShelfView` now uses `isOnStage(index)`, and `index === activeIndex` replaces `offset === 0`.

TASK-9: The owner chose option (a). Three new child components take the icon as a prop destructured as `icon: Icon`, the same shape as `SelectedSportButton`:
- `quick-add/QuickAddTypeButton.svelte` (`label`, `icon`, `onClick`) for the type grid
- `quick-add/QuickAddDetectedType.svelte` (`label`, `icon`, `confidencePercent`) for the detected-type card
- `check-in/ReplacementSportButton.svelte` (`title`, `icon`, `onClick`) for the replace-with popup

The parents pass `icon={TYPE_ICONS[type]}` / `icon={sportIcons[sport.id]}`. `TYPE_ICONS` and `sportIcons` are unchanged, and the markup moved as it was.

TASK-10: In `Notes.svelte.ts`, I removed the cross-reference comment in `createCategory`. I shortened the journal-draft comment to two lines and kept its API-contract reason. I kept the `create()` why-comment. In `ManagePushNotifications.svelte`, I removed all six comments. Each one narrated the code; the "Laravel expectations" one only described `sub.toJSON()`, which is the standard serialisation.

TASK-11: `STANDARDS_BACKLOG.md`: I ticked the SpineView/LibrarySearchModal item. After TASK-9 landed, I ticked the `{@const Icon = x.icon}` item. I marked the comment audit as partly done, with `Auth`/`ApiService` left to backlog 09 and `CalendarDragState` to backlog 06.

## Verification

- **`npm run check`, `npm run lint` and `npm test` could not be run.** The worktree has no `node_modules`, and the project rules forbid installing packages without asking. Instead, I checked the type-sensitive points by reading the code:
  - `<x.icon />` keeps the same prop typing as the old `{@const}` alias.
  - The label props come from `CheckInRecords`, whose values are all `string`.
  - `Record<SportId, Component>` is assignable to `Component<{ class?: string }>`.
  - `Navigation.enabledItems` narrows `featureFlag` before indexing.

  A reviewer should run `npm run check && npm run lint && npm test` before approving.
- No manual browser pass or `shot` render: there is no installed toolchain or dev server and no API in this session. The manual pass from tasks.md (spine view hover and flip, search modal in all four libraries, navbars with a disabled feature, check-in views, and so on) is still outstanding.

## Known issues / follow-ups

- `ShelfView` still has the section-separator comments (`<!-- Stage -->`, `<!-- Navigation -->`, `<!-- Info panel -->`) and a folded `style` ternary on the cover (rule 1.1). Both are out of scope here.
- `getIcon`, `getBarColor` and `getBarColorFood` are duplicated across the check-in views. This was true before the job; now the copies sit in `Averages`/`CheckInWidget`/trends and in the two row components. They are candidates for a `CheckInHelper` function (rule 2.2).
- The class ternaries moved into `SelectedSportButton` (rule 1.3) belong to the mechanical backlog item.
- `.mcp.json` shows as modified in the worktree. The session environment changed it, not this job, so I did not commit it.
