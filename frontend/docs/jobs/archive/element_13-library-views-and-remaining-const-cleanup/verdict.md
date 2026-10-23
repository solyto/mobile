# Verdict: 13 Library views and remaining @const cleanup

id: element
reviewer: @reviewer
date: 2026-10-13

## Review

Branch `feature/element_13-library-views-and-remaining-const-cleanup` confirmed. I reviewed the full `git diff main...HEAD` (35 files) against tasks.md. Every changed source file is accounted for in implementation.md. Nothing outside the planned files changed. `.mcp.json` is modified in the worktree but was not committed, so it is not part of the diff.

`grep -rn '{@const' src` now returns only `TodoEditModal.svelte:61` (the allowed narrowing form) and the three calendar `offHour` sites, which Open question 1 deliberately excludes. That matches the expected end state in tasks.md.

TASK-1: PASS
notes: `Spine.svelte` receives plain values and callbacks. `hoveredId` and `coverWidths` stay in `SpineView` (rule 3.3). I checked the logic against the old code:
- `coverSide()` returns `'left'` exactly when the old `flipRight` was true (`xOffset < coverWidth + 16`).
- `coverTransform()` gives the same rotateY sign (left → -35, right → 35) and the same hovered transform.
- `coverUrl()` now returns `null` when there is no cover. The `{#if coverUrl}` checks therefore match the old `{#if entry.cover}`.
- `onHover(false)` sets `hoveredId = null`, as the old `onmouseleave` did.
- `titleHash()` gives the same hue for both colours.

The style declarations are unchanged and the four narrating comments are gone.

TASK-2: PASS
notes: `resultId()` is used by both `select()` and the markup. `LibrarySearchResult` renders the snippet or the default button exactly as before, and `disabled` is still `importingId !== null`. `<source.icon class="size-4" />` sits in the `{:else}` branch of the `typeof === 'string'` check. `resultRow` is kept (Open question 3 default).

TASK-3: PASS
notes: Mechanical swaps to `<entry.icon />` and `<section.component />`.

TASK-4: PASS
notes: All six sites now use script functions, with no `$derived`. In `OverviewDesktop`, dropping `new Date(date)` is safe because `getUrlFormat` (`DateHelper.ts:135`) only reads its argument. In `StaggeredLogo`, `path || './'` behaves the same as `path ? path : './'`, and the style is now one declaration per line (rule 1.4). In `TodoNavigationMobile`, `{#each currentSection()?.items ?? []}` behaves the same as the old `{#if section}` wrapper.

TASK-5: PASS
notes: `Navigation.enabledItems()` holds the filter once, so it is shared, not copied (rule 6.2). `MobileNavbar` still slices at `mobileVisibleCount` before filtering, and the keys moved from the slug to `item.slug`, which is the same value. The `navItems` import is still used in `MobileNavbar.svelte:45`, so it is not dead. One behaviour is unchanged rather than fixed: an unknown slug in a saved `mobileOrder` would throw, but the old code threw too.

TASK-6: PASS
notes: Two row components, not one, which is justified by the real markup differences (rule 7.1). `position={index + 1}` is the same as the old `entries.indexOf(entry) + 1`, because the `{#each}` is keyed by the unique entry. In trends, the `>= 2` guard moved with the chart into `TrendChart`. `{#key selectedRange}` now wraps the whole card instead of only the chart box. The header is static text and an icon, so nothing visible changes.

TASK-7: PASS
notes: `SelectedSportButton` plus `sportLabel()` in the parent. The class ternaries moved unchanged, as tasks.md instructed. `Record<SportId, Component>` can be assigned to the `Component<{ class?: string }>` prop.

TASK-8: PASS
notes: `isOnStage(index)` gives the same result as `abs <= 3`, and `index === activeIndex` the same as `offset === 0`. The section-separator comments were left alone and are noted as a follow-up, as the brief asks.

TASK-9: PASS
notes: Implemented with option (a). The three child components take `icon: Icon`, and `TYPE_ICONS` and `sportIcons` are unchanged. The logged developer session ended with TASK-9 still blocked. The commits `b31a420` and `7180a5d` came later and are authored by the owner, so I am treating the "owner chose (a)" statement as the owner's decision.

TASK-10: PASS
notes: In `Notes.svelte.ts`, the cross-reference comment (old line 319) is removed. The journal-draft comment is shortened to two lines and keeps the API-contract reason. The comment at lines 271-272 is kept. In `ManagePushNotifications`, all six narrating comments are removed, and none of them stated a backend constraint the code cannot express. No code changed in either file.

TASK-11: PASS
notes: The SpineView/LibrarySearchModal item and the `x.icon` item are ticked. The audit entry is marked as partly done, with the remaining files assigned to backlog 09 and 06.

## Security

none (not run). The changes only move markup and remove comments, with no new data flows.

## Overall

APPROVED

No blockers. Static review found no correctness problems, and the scope matches tasks.md.

Not yet verified: `npm run check`, `npm run lint` and `npm test` have not been run, by either the developer or me (the worktree has no `node_modules`), and neither has the manual browser pass from tasks.md. I checked the type-sensitive points by reading the code (the `$props<…>()` form is the repo convention, and the icon prop types are assignable). Run those commands before `mg done`.
