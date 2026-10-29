# Tasks: 13 Library views and remaining @const cleanup

id: element
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

Branch checked: the worktree HEAD is `feature/element_13-library-views-and-remaining-const-cleanup`, which matches `brief.md`.

## Inventory (taken on 2026-10-13)

`grep -rn '{@const' src` finds 40 hits in 21 files. They fall into these groups:

| Kind | Sites | Handled in |
|---|---|---|
| Allowed narrowing form (rule 1.5) | `todos/TodoEditModal.svelte:61` | stays as it is |
| Stack at the top of an `{#each}` body (2+ consts, so it becomes a child component) | `libraries/shared/SpineView.svelte:133-139`, `libraries/shared/LibrarySearchModal.svelte:112-114`, `check-in/CheckInSettings.svelte:137-139`, `check-in/stats/Averages.svelte:74-75`, `dashboard/widgets/CheckInWidget.svelte:89-90`, `routes/check-in/trends/+page.svelte:105-106`, `libraries/shared/ShelfView.svelte:111-112` | TASK-1, 2, 6, 7, 8 |
| `{@const X = a.b}` icon/component on a member expression, so it becomes `<a.b />` | `LibrarySearchModal.svelte:106`, `libraries/shared/CreateModalImport.svelte:43`, `routes/settings/+page.svelte:114` | TASK-2, 3 |
| Icon from an **indexed** lookup (`TYPE_ICONS[type]`, `sportIcons[id]`), where `<x.icon />` does not apply | `quick-add/QuickAddModal.svelte:124,136`, `CheckInSettings.svelte:172` | TASK-9 (**open question**) |
| A single computed `@const`, which becomes a script function | `routes/time-tracking/[id]/+page.svelte:134`, `ui/StaggeredLogo.svelte:29`, `settings/AppearanceSettings.svelte:22`, `todos/TodoNavigationMobile.svelte:186`, `check-in/overview/OverviewDesktop.svelte:37`, `notes/journal/JournalArchivePicker.svelte:92` | TASK-4 |
| Indexed lookup `item = navItems[slug]` in the navbars | `ui/MobileNavbar.svelte:53,95`, `ui/DesktopNavbar.svelte:32` | TASK-5 |
| Calendar views (`offHour`) | `calendars/views/week/Day.svelte:194`, `week/MobileWeekView.svelte:88`, `day/MobileDayView.svelte:43` | **excluded**, see Open question 1 |

Comment audit list (`STANDARDS_BACKLOG.md`, Audits section): `state/Auth.svelte.ts` (36), `services/ApiService.ts` (13), `state/Notes.svelte.ts` (6), `settings/notifications/ManagePushNotifications.svelte` (6), `calendars/dnd/CalendarDragState.svelte.ts` (6). `MusicTheory/*` is explicitly a separate question and is not part of this job.

## Open questions (please answer before or during implementation)

1. **Overlap with other backlog entries.** "Repo-wide" in the brief would include files that other briefs own, and none of those briefs has landed yet:
   - The calendar `offHour` consts belong to backlog 03 ("helpers instead of `@const`", "remaining … `@const` in calendar files"). That entry depends on backlog 02's `isOffHour` helper, which does not exist yet.
   - The comments in `Auth.svelte.ts` and `ApiService.ts` belong to backlog 09 ("strip the narrating comments (keep the two named in 10.1)").
   - Backlog 06 replaces `CalendarDragState.svelte.ts` completely.

   **Default used in this plan:** leave all five files out and do not touch them. If the owner wants them included, add tasks for them. Before doing so, note that the calendar sites would need `isOffHour` and would clash with 02/03.
2. **Indexed icon lookups (TASK-9).** In Svelte 5, `<TYPE_ICONS[type] />` is not valid tag syntax, so the `<x.icon />` replacement only works for member expressions. Rule 1.5 does not say what to do with a single `{@const Icon = MAP[key]}`. Possible approaches: (a) a small child component that takes the icon as a prop destructured as `icon: Icon` (the same shape as the ESLint-pass backlog item); (b) change the lookup data so that each entry carries its icon as a member, giving `<entry.icon />`; (c) keep these three sites as a documented exception. **TASK-9 is blocked until the owner picks one.** Every other task can go ahead without this answer.
3. **`resultRow` in `LibrarySearchModal` is never passed** by any of its four callers (`BookSearch`, `MovieSearch`, `MusicSearch`, `GameSearch`). Removing it would be a rule 1.8 cleanup, but the brief does not ask for it. **Default:** keep the prop and its behaviour unchanged.

## Task breakdown

TASK-1: Move the `{#each row}` body of `SpineView.svelte` into a new child component (for example `libraries/shared/Spine.svelte`) so that all seven `{@const}`s disappear, and remove the four narrating comments in `SpineView` (lines 57, 157, 205, 246).
  files: `src/lib/components/libraries/shared/SpineView.svelte`, new `src/lib/components/libraries/shared/Spine.svelte`
  depends: none
  risk: medium. The book layout depends on `coverWidths`, which is measured in `onCoverLoad`, and on `hoveredId`. Following rule 3.3, both stay in `SpineView` and reach the child as props and callbacks (`hovered`, `coverWidth`, `onHover`, `onCoverLoad`, `onclick`). If any of that wiring is wrong, the shelf breaks visibly.
  notes: the child receives plain values (`entry`, `xOffset`, `spineWidth`, `coverWidth`, `coverHeight`, `spineHeight`, `gap`, `isSquare`, `coverUrl`, `hovered`) and computes the rest with plain functions, not `$derived` (project rule). The folded cover `transform` at lines 218-220 breaks rule 1.1. Because that code moves anyway, it should land in the child as a short helper function, not be copied as it is. Rendered output must stay pixel-identical (brief: no visual changes). Run the manual pass in the books library (portrait covers, the flip near the left edge) and the music library (square covers).

TASK-2: In `LibrarySearchModal.svelte`, move the result row (lines 111-139) into a new child component (for example `libraries/shared/LibrarySearchResult.svelte`) so that the three-const stack disappears, and replace `{@const Icon = source.icon}` with `<source.icon class="size-4" />`.
  files: `src/lib/components/libraries/shared/LibrarySearchModal.svelte`, new `src/lib/components/libraries/shared/LibrarySearchResult.svelte`
  depends: none
  risk: low. This is a self-contained markup move. The only logic is the import-id comparison, which should become one script function (`resultId(source, result)`) used by both `select()` and the markup.
  notes: the child takes `result`, `importing`, `disabled`, `onSelect` and the optional `resultRow` snippet, and renders either the snippet or the default button, exactly as today (see Open question 3). Check that svelte-check still narrows `source.icon` to `Component` inside the `{:else}` branch. Run the manual pass with one search in books, movies, music and games, including the import spinner.

TASK-3: Replace the remaining member-expression component consts with direct rendering: `CreateModalImport.svelte:43` becomes `<entry.icon class="size-4" />`, and `routes/settings/+page.svelte:114` becomes `<section.component />`.
  files: `src/lib/components/libraries/shared/CreateModalImport.svelte`, `src/routes/settings/+page.svelte`
  depends: none
  risk: low. This is a mechanical swap with no change in behaviour, and `npm run check` confirms the typing.

TASK-4: Replace each single computed `{@const}` with an inline call or a named script function (rule 1.5 "Bad/Good"): time-tracking project page (`categoryColor(cat)`), `StaggeredLogo` (`getTilePosition`), `AppearanceSettings` (`isActive(t)`), `TodoNavigationMobile` (`currentSection()`), `OverviewDesktop` (`getUrlFormat(date)`), `JournalArchivePicker` (`getUrlFormat(day.date)`).
  files: `src/routes/time-tracking/[id]/+page.svelte`, `src/lib/components/ui/StaggeredLogo.svelte`, `src/lib/components/settings/AppearanceSettings.svelte`, `src/lib/components/todos/TodoNavigationMobile.svelte`, `src/lib/components/check-in/overview/OverviewDesktop.svelte`, `src/lib/components/notes/journal/JournalArchivePicker.svelte`
  depends: none
  risk: low. Each change is local to one file. `StaggeredLogo` is the only one that needs care: its `style` attribute is also folded (rule 1.1), so it gets `tileStyle(tile)` / `tileFly(tile)` helpers instead of four inline `getTilePosition` calls.
  notes: this is six small edits, and the developer may commit them one file at a time. Do not use `$derived` for these, because they are per-item values inside `{#each}`.

TASK-5: Remove `{@const item = navItems[slug]}` from both navbars by iterating over the items instead of the slugs, using one script function that maps the order to `NavItem`s and drops items whose feature flag is off, so that the inner `{#if}` goes away as well.
  files: `src/lib/components/ui/MobileNavbar.svelte`, `src/lib/components/ui/DesktopNavbar.svelte`
  depends: none
  risk: medium. The navbar appears on every page, and `MobileNavbar` splits the order at `mobileVisibleCount` *before* filtering. The filtered version must keep exactly the same split and the same `{#each}` keys (`item.slug`), so that hidden features do not change which entries land in the overflow menu.
  notes: if the two navbars need the same function, rule 6.2 asks for one helper, not two copies. Check whether `config/navigation.ts` or the navigation store already has something suitable before adding one. Run the manual pass on mobile (overflow menu) and desktop with a feature flag switched off.

TASK-6: Move the two-const `{#each}` bodies in the check-in stats views into child components that receive the value and the icon as props: `check-in/stats/Averages.svelte:74-75`, `dashboard/widgets/CheckInWidget.svelte:89-90`, `routes/check-in/trends/+page.svelte:105-106`.
  files: `src/lib/components/check-in/stats/Averages.svelte`, `src/lib/components/dashboard/widgets/CheckInWidget.svelte`, `src/routes/check-in/trends/+page.svelte`, plus one new component per site (or a shared one, see notes)
  depends: none
  risk: medium. This adds new components in three places. `Averages` and `CheckInWidget` render a similar "icon + mean value" row, so it is easy to drift into a shared-component refactor.
  notes: before writing anything, compare `Averages` and `CheckInWidget` (rule 7.1). If the rows are genuinely the same markup, one shared component is justified by rule 1.6. If they differ, write two components and do not try to unify the styling. In the child, the icon prop is destructured as `icon: Icon`. In `trends`, the `{#if chartData.categories.length >= 2}` guard moves together with the chart data.

TASK-7: Move the three-const `{#each selectedSports}` body of `CheckInSettings.svelte` (lines 137-139) into a child component that receives `sport`, `replacing` and the icon as props.
  files: `src/lib/components/check-in/CheckInSettings.svelte`, one new component under `src/lib/components/check-in/`
  depends: none. The parent passes `icon={sportIcons[sportId]}` as a prop, so the indexed lookup does not need Open question 2. If the owner's answer to TASK-9 changes the `sportIcons` shape, this call site changes along with it.
  risk: low. A button moves into a child component. The `AVAILABLE_SPORTS.find(...)!` lookup becomes a script function in the parent.
  notes: the class ternary on line 142 breaks rule 1.3 but belongs to the separate mechanical backlog item. Move it as it is unless the owner says otherwise.

TASK-8: In `ShelfView.svelte`, replace `{@const offset}` / `{@const abs}` (lines 111-112) with script functions on `index` (for example `offsetOf(index)`, `isOnStage(index)`), or with a child component if the `{#each}` body still reads more than those two values afterwards.
  files: `src/lib/components/libraries/shared/ShelfView.svelte`
  depends: none
  risk: low. The values only control the `{#if abs <= 3}` guard and `tabindex`, and `itemStyle(index)` already shows the script-function pattern.
  notes: `ShelfView` also has three section-separator comments (`<!-- Stage -->`, and so on). It is not in the audit list, so per the brief these are **not** removed here. Mention them in implementation.md as a follow-up.

TASK-9 (**blocked: Open question 2**): Remove the indexed icon consts in `QuickAddModal.svelte:124,136` and `CheckInSettings.svelte:172` using the approach the owner chooses.
  files: `src/lib/components/quick-add/QuickAddModal.svelte`, `src/lib/components/check-in/CheckInSettings.svelte`, and possibly the `TYPE_ICONS` / `sportIcons` definitions
  depends: owner decision; TASK-7 if a shared sport-icon shape is chosen
  risk: medium. Depending on the option chosen, this could change data structures that other code reads.

TASK-10: Go through the comments in `state/Notes.svelte.ts` and `settings/notifications/ManagePushNotifications.svelte` one by one against rule 10.1. Remove narrating comments and keep one- or two-line *why* comments about an external constraint.
  files: `src/lib/state/Notes.svelte.ts`, `src/lib/components/settings/notifications/ManagePushNotifications.svelte`
  depends: none
  risk: low. Only comments are removed, with no code change.
  notes: my reading, which the developer should confirm: in `Notes`, 342-344 states an API contract ("the create contract does not accept content"), so it **stays**, possibly shortened to two lines. 271-272 is a why and can stay. 319 only points to 271, so it **goes**. In `ManagePushNotifications`, 28, 88, 106 and 113 narrate the code and **go**. 60 and 85 ("matches Laravel expectations") need a look in context: keep them only if they describe a backend contract the code cannot express. If a removed comment was explaining an unclear block, rule 10.1 says to rename or extract rather than re-annotate, but only when the change stays small.

TASK-11: Update `docs/STANDARDS_BACKLOG.md`. Tick the SpineView/LibrarySearchModal item and the `{@const Icon = x.icon}` item (only if TASK-9 has landed or the owner settled it as an exception), and mark the comment audit as partially done, with Auth/ApiService/CalendarDragState left to backlog 09/06.
  files: `docs/STANDARDS_BACKLOG.md`
  depends: TASK-1 to TASK-10 (whichever land)
  risk: low. Only documentation changes.

## Verification (whole job)

- `npm run check` and `npm run lint` are clean. Afterwards, `grep -rn '{@const' src` should list only `TodoEditModal.svelte:61`, the three calendar sites (Open question 1) and any TASK-9 sites that are still waiting for a decision.
- `npm test` is unchanged. There is no unit seam here, so no new tests are needed (brief).
- Manual pass, with no visual differences: the books and music spine view (hover, cover flip near the left edge), the library search modal in all four libraries, the create-modal import buttons, the mobile and desktop navbar (including the overflow menu and a disabled feature), check-in averages/trends/settings, the dashboard check-in widget, appearance settings, the journal archive picker, the check-in overview and the time-tracking project page.
