# Tasks: 11 Reactivity audit

id: plain
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

## Scope as found (differs from the brief's counts)

- `$effect`: **23 files / 23 effects** today, not 29 (`grep -rn '\$effect' src`).
  Earlier jobs already removed the ones in `ChooseRecurrenceRule`,
  `MobileWeekView`, `routes/+layout.svelte` and `TodoEditModal`. Nothing to do for those.
- `$derived(() => …)`: 7 uses in 3 files (matches the brief).
- Components with 5+ `$derived`: the same 6 files as the backlog
  (`week/Day` 9, `StatisticsView` 6, `NoteNavigationMobile` 6,
  `DashboardView` 5, `NoteNavigationDesktop` 5, `month/MobileMonthView` 5).
- Svelte is 5.39.6, so writable `$derived` (overridable by assignment) is
  available. Some tasks below use it.

### Preliminary triage of every `$effect`

| File | Verdict | Task |
|---|---|---|
| `settings/UpdateChecker.svelte` | 5.2: subscription with cleanup, keep | none |
| `feeds/FeedView.svelte` | 5.2: IntersectionObserver with cleanup, keep | none |
| `tour/WelcomeTour.svelte` | 5.2: navigation + DOM measurement in `untrack`, keep | none |
| `routes/time-tracking/[id]/+page.svelte` | navigation-only redirect, no state write; keep, record as 5.2 (navigation is external) | none |
| `libraries/shared/CoverImage.svelte` | 5.2 (Image preload) but no cleanup | TASK-14 |
| `charts/{Bar,Doughnut,SmoothLine,StackedArea}Chart.svelte` | 5.2 (echarts) but writes `$state` it reads (5.3, 3.6) | TASK-13 |
| `calendars/views/day/MobileDayView.svelte` | element handoff, no cleanup, no reactivity needed (5.4) | TASK-12 |
| `calendars/views/month/MobileMonthView.svelte` | same as above | TASK-12 |
| `routes/notes/journal/[date]/+page.svelte` | `openedKey` guard is a `$state` the effect reads and writes (5.3, 3.6) | TASK-11 |
| `todos/views/KanbanView.svelte` | copies store into local (5.1) | TASK-2 |
| `calendars/ChooseCalendar.svelte` | writes bindable prop (5.1) | TASK-3 |
| `contacts/ChooseAddressBook.svelte` | writes bindable prop (5.1) | TASK-4 |
| `forms/FileUpload.svelte` | writes bindable prop (5.1) | TASK-5 |
| `ui/NavProfileEntry.svelte` | resets state on input change (5.1) | TASK-6 |
| `dashboard/YourDay.svelte` | computes `$state` from other state (5.1) | TASK-7 |
| `routes/finances/+page.svelte` | computes `$state` from store (5.1) | TASK-8 |
| `feeds/FeedBrowserModal.svelte` | resets search state, writes `isSearching` it reads (5.1, 5.3) | TASK-9 |
| `contacts/ContactEdit.svelte` | copies store into form, guarded by `$state` it writes (5.3, 3.6, 5.4) | TASK-10 |
| `libraries/shared/ShelfView.svelte` | resets `activeIndex` on `entries.length` (5.1) | TASK-15 |
| `routes/check-in/date/[date]/+page.svelte` | resets three `$state` on route param (5.1) | TASK-16 |

Per the brief, the developer records each row's final verdict (rule broken
or "5.2 case") in `implementation.md`. That includes the rows marked "none".

## Task breakdown

TASK-1: Replace the 7 `$derived(() => …)` with `$derived.by(…)` and drop the `()` at every read site (`weekBreakdown()`, `weekTotal()`, `todayBreakdown()`, `todayTotal()`, `categoryBreakdown()`).
     files: src/lib/components/time-tracking/DashboardView.svelte, src/lib/components/time-tracking/StatisticsView.svelte, src/lib/components/dashboard/widgets/TimeTrackingWidget.svelte
     depends: none
     risk: low. The change is mechanical, and `npm run check` flags any read site still calling a non-function.

TASK-2: KanbanView: replace `let groups = []` plus the effect `groups = todos.groupedTodos` with a writable `let groups = $derived(todos.groupedTodos)`, so the dndzone consider/finalize handlers can still assign to it (5.1).
     files: src/lib/components/todos/views/KanbanView.svelte
     depends: none
     risk: medium. svelte-dnd-action reassigns the list during a drag, so dragging between columns and the post-drop store update need a manual run.

TASK-3: ChooseCalendar: remove the effect that writes the bindable `calendar`. Assign `calendar = c.id` in the option's click handler, and have `EventEdit` set its own default `calendar_id` (first calendar) when creating a new event, since today the child's effect supplies that default (5.1).
     files: src/lib/components/calendars/ChooseCalendar.svelte, src/lib/components/calendars/EventEdit.svelte
     depends: none
     risk: medium. `EventEdit` initialises `calendar_id: 0` and relies on the effect to fill it, so a missed default would submit calendar 0.

TASK-4: ChooseAddressBook: remove the effect that writes the bindable `addressBook`, and assign it in the option's click handler. The parent's `emptyForm` already defaults `address_book_id` to the first address book (5.1).
     files: src/lib/components/contacts/ChooseAddressBook.svelte
     depends: none
     risk: low. The only caller (`ContactEdit`) already provides a valid default.

TASK-5: FileUpload: remove the effect `input = fileInput`. Bind the element directly to the bindable prop (`bind:this={input}`) and drop the local `fileInput` if nothing else needs it (5.1).
     files: src/lib/components/forms/FileUpload.svelte
     depends: none
     risk: low. Two callers (`DevRequestEdit`, `InsertImageModal`); check whether either binds `input`.

TASK-6: NavProfileEntry: remove the effect that resets `attempts`/`failed` when `imagePath` changes. Make the reset a consequence of the input, for example a writable `$derived` keyed on `imagePath`, or remember which path failed instead of a boolean (5.1).
     files: src/lib/components/ui/NavProfileEntry.svelte
     depends: none
     risk: low. One component; check manually that the image appears after a profile image upload.

TASK-7: YourDay: replace `scoredTodos = $state([])` plus the effect with `let scoredTodos = $derived.by(…)` using the same clone → score → sort → filter → slice body (5.1).
     files: src/lib/components/dashboard/YourDay.svelte
     depends: none
     risk: low. The body already works on clones, so it has no side effects on store data.

TASK-8: Finances page: replace `statistics = $state([])` plus the effect with a `$derived.by` that returns `[]` until `finances.wealthLoaded` and otherwise feeds `finances.wealth` through `WealthStatisticsService` (5.1). Keep the existing cast as is; it is not in scope.
     files: src/routes/finances/+page.svelte
     depends: none
     risk: low. `statisticsService.setData` mutates a non-reactive service instance inside the derivation; acceptable, or use a fresh instance per run. Note the choice.

TASK-9: FeedBrowserModal: remove the effect and move the "query dropped below 2 chars → reset results and reload the browse list" logic into `onQueryInput` (5.1, 5.3).
     files: src/lib/components/feeds/FeedBrowserModal.svelte
     depends: none
     risk: medium. `onQueryInput` already sets `isSearching = false` before the effect runs, so the effect may be dead code today. Before choosing between "restore the reset" and "delete it", check how clearing the search currently behaves (see open question 2).

TASK-10: ContactEdit: remove the effect and the `loadedContactId` `$state`. Build `form` once at script top from `contacts.activeContact` (or `emptyForm`). The component is mounted only while `createModalVisible` is true, and `Contacts.openEdit` sets `activeContact` before it opens the modal (5.3, 3.6, 5.4).
     files: src/lib/components/contacts/ContactEdit.svelte
     depends: TASK-4 (same form, the address-book picker)
     risk: medium. Edit an existing contact, create a new one, then open edit again right after a create, to confirm no stale form leaks between openings.

TASK-11: Journal day page: make `openedKey` a plain `let` instead of `$state` (3.6, 5.3). It is bookkeeping, never rendered, and the effect both reads and writes it. Leave the effect's async load and redirect as they are (see open question 1).
     files: src/routes/notes/journal/[date]/+page.svelte
     depends: none
     risk: low. One declaration changes; check manually that switching days in the journal still loads each day once.

TASK-12: MobileDayView and MobileMonthView: replace `$effect(() => { if (contentEl) swipe.setTarget(contentEl); })` with `onMount(() => swipe.setTarget(contentEl))`. The element is bound by mount and `SwipeNavigate` has no teardown (5.4).
     files: src/lib/components/calendars/views/day/MobileDayView.svelte, src/lib/components/calendars/views/month/MobileMonthView.svelte
     depends: none
     risk: low. Check whether `contentEl` sits inside an `{#if}` that could leave it unbound at mount; if it does, keep the effect and record it as 5.2.

TASK-13: The four echarts wrappers: make `myChart` and `isInitialized` plain `let` (3.6), so the "create once data and container exist" effect no longer writes `$state` it reads (5.3). Keep `chartContainer` reactive only if the effect needs it to track the bind. Remove the "Only update when data actually changes" comment, which does not describe the code (10.1).
     files: src/lib/components/charts/BarChart.svelte, src/lib/components/charts/DoughnutChart.svelte, src/lib/components/charts/SmoothLineChart.svelte, src/lib/components/charts/StackedAreaChart.svelte
     depends: TASK-1, TASK-8 (they change the props feeding Bar/Doughnut/SmoothLine on the time-tracking and finances screens; test those screens once)
     risk: medium. The effect's real job is creating the chart when async data arrives after mount, so each chart must still render on a cold load of the finances, time-tracking statistics and admin screens.

TASK-14: CoverImage: return a cleanup from the preload effect that detaches the `onload` handlers, so a stale image finishing after `src` changes cannot set `previewLoaded`/`fullLoaded` for the new one (5.2: an external effect needs cleanup).
     files: src/lib/components/libraries/shared/CoverImage.svelte
     depends: none
     risk: low. The change is additive; check the library grid and shelf views.

TASK-15: ShelfView: remove the effect that zeroes `activeIndex` when `entries.length` changes. Use a writable `$derived` that recomputes to `0` from `entries.length` and is still assigned by `navigate`/`handleClick` (5.1).
     files: src/lib/components/libraries/shared/ShelfView.svelte
     depends: none
     risk: low. One component; check that filtering or searching a library in shelf view resets to the first item.

TASK-16: Check-in date page: remove the effect that resets `date`, `dayData` and `save` on `page.params.date`. `date` becomes `$derived(page.params.date)`; how `dayData` and `save` get reset depends on open question 3 (5.1).
     files: src/routes/check-in/date/[date]/+page.svelte (possibly src/routes/check-in/+layout.svelte or the `CheckInData` store)
     depends: none
     risk: high. `dayData` comes from `checkInData.getDayData()`, which depends on `selectedDate` being set elsewhere, and resetting the unsaved `save` on navigation is user-data behaviour. Get it wrong and you either lose or leak edits between days.

TASK-17: week/Day.svelte: review the 9 `$derived` against 3.1/3.2, reactive declarations only. `dragEnabled = $derived(!isMobile)` and `dateSlug = $derived(formatDate(date))` become plain `let` if `isMobile`/`date` are fixed per instance (check the parents' keyed `{#each}`). Inline any `$derived` read once in markup.
     files: src/lib/components/calendars/views/week/Day.svelte
     depends: TASK-12 (MobileDayView renders this component)
     risk: medium. Day is reused across week/day/mobile views and drag-and-drop. If `date` is not keyed, a plain `let` goes stale when the user navigates weeks. Do not touch the markup items listed under backlog 03.

TASK-18: month/MobileMonthView.svelte: review the 5 `$derived` against 3.2. `selectedDate` is a pure alias of `calendars.mobileSelectedDate`; inline it, and inline `hasEvents` and friends where they are read once.
     files: src/lib/components/calendars/views/month/MobileMonthView.svelte
     depends: TASK-12 (same file)
     risk: low. Every input is store-backed and stays reactive when inlined.

TASK-19: NoteNavigationDesktop and NoteNavigationMobile: review `journalEnabled`, `favorites`, `activeKey`, `journalSelectedDate`, `otherActive` (and `current` on mobile) against 3.1/3.2, and inline those read once. Keep the two variants identical (6.1).
     files: src/lib/components/notes/NoteNavigationDesktop.svelte, src/lib/components/notes/NoteNavigationMobile.svelte
     depends: none
     risk: low. Inputs are store or page-state reads, so they stay reactive when inlined. The auth/settings read in a navigation component (3.3) is out of scope; record it as a follow-up.

TASK-20: StatisticsView and DashboardView (after TASK-1): review the remaining `$derived` against 3.2. `filteredProjects` is an alias of `tt.statistics?.by_project ?? []`, and `categoryChartLabels`/`Values` and `weekTotal`/`todayTotal` may each be read once. Inline or keep, and record each decision.
     files: src/lib/components/time-tracking/StatisticsView.svelte, src/lib/components/time-tracking/DashboardView.svelte
     depends: TASK-1
     risk: low. The scope is reactive declarations only, on two screens.

## Open questions (not guessed. Resolve before or during the task, and record the answer)

1. Journal day page effect (TASK-11): it calls `goto` and starts an async store load whenever `page.params.date` or the notes load state changes. A full rewrite (load in `afterNavigate`/`onMount`) would go beyond "reactive declarations", so it is left as is. Does the owner want it removed in this job?
2. FeedBrowserModal (TASK-9): when the user clears the search box today, does the browse list come back? If not, the effect is dead code and the fix is "delete it", or "make the reset work", which is a behaviour change.
3. Check-in date page (TASK-16): who sets `checkInData.selectedDate` for the route, and should unsaved changes (`save`) be dropped when moving to another day? The answer decides between `{#key page.params.date}` in a parent, `afterNavigate`, or a store method.
4. `routes/time-tracking/[id]/+page.svelte`: the redirect-when-missing effect is classified as 5.2 (navigation). If the owner reads 5.2 strictly (cleanup required), it needs a different home. Left unchanged here.
5. Overlap: backlog 03 (calendar view markup cleanup) also edits `week/Day.svelte` and `MobileMonthView.svelte`. Whichever job lands second must rebase onto the other.

## Verification (from the brief)

`npm run check`, `npm run lint`, `npm test` (6 known pre-existing failures,
see STANDARDS_BACKLOG), plus a manual run of each touched screen: todos
kanban, calendar event edit + mobile day/month/week, contacts create/edit,
dev-request + note image upload, nav profile image, dashboard, finances
overview, feed browser search, journal, library grid/shelf, check-in date,
time-tracking dashboard/statistics/project, admin charts.
