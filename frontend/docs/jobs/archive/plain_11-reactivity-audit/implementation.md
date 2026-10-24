# Implementation: 11 Reactivity audit

id: plain
developer: @developer
date: 2026-10-13

## Summary

I read every `$effect` in `src` (23 files, as the analyst counted, not 29), the 7 `$derived(() => …)` and the 6 components with five or more `$derived`, and fixed the violations task by task (TASK-1 … TASK-20). This brings `$effect` down from 23 files to 10. Each of those 10 is a 5.2 case (external side effect); see the table below. No markup was rewritten beyond the read sites of declarations that were inlined or renamed.

**Verification status (updated after the review).** The first pass could not run any tooling because `node_modules` was missing. The brief now allows `npm ci`, so it was run, followed by the automated gates:

- `npm run check`: 0 errors, 2 warnings. Both are `state_referenced_locally` at `EventEdit.svelte:67`, where `recurrence` is seeded from `form`. Those lines are unchanged by this job (only the `calendar_id` default at line 51 changed), so the warnings were already there and are intentional (a one-time seed). They are not fixed here.
- `npm run lint`: clean.
- `npm test`: 62 files, 907 tests, all pass. The 6 failures listed as pre-existing in `STANDARDS_BACKLOG` did not show up in this run.
- Manual run of each touched screen: **still not done.** No solyto API was reachable (`http://localhost:8000` refused the connection), and without it every route redirects to `/auth/login`, so no touched screen can be rendered with data. Before merging, someone with a backend should run the screen list in `tasks.md`.

### Final verdict for every `$effect`

| File | Verdict | Outcome |
|---|---|---|
| `settings/UpdateChecker.svelte` | 5.2: Electron subscription, returns the unsubscribe | kept |
| `feeds/FeedView.svelte` | 5.2: IntersectionObserver with `disconnect` cleanup | kept |
| `tour/WelcomeTour.svelte` | 5.2: navigation + DOM measurement, done in `untrack` | kept (it has no cleanup, but nothing to release) |
| `routes/time-tracking/[id]/+page.svelte` | 5.2: navigation only, writes no state | kept (open question 4) |
| `routes/notes/journal/[date]/+page.svelte` | 3.6 / 5.3: `openedKey` was `$state` read and written by the effect | `openedKey` is now a plain `let`; the effect itself is kept (open question 1) |
| `charts/{Bar,Doughnut,SmoothLine,StackedArea}Chart.svelte` | 5.2 (echarts), but it broke 3.6 / 5.3 (`isInitialized`, `myChart` were `$state` written by the effect) | kept as 5.2; bookkeeping is now plain `let` (TASK-13) |
| `libraries/shared/CoverImage.svelte` | 5.2 (Image preload), had no cleanup | kept; cleanup added (TASK-14) |
| `calendars/views/day/MobileDayView.svelte` | 5.4 | removed, now `onMount` (TASK-12) |
| `calendars/views/month/MobileMonthView.svelte` | 5.4 | removed, now `onMount` (TASK-12) |
| `todos/views/KanbanView.svelte` | 5.1 | removed (TASK-2) |
| `calendars/ChooseCalendar.svelte` | 5.1 | removed (TASK-3) |
| `contacts/ChooseAddressBook.svelte` | 5.1 | removed (TASK-4) |
| `forms/FileUpload.svelte` | 5.1 | removed (TASK-5) |
| `ui/NavProfileEntry.svelte` | 5.1 | removed (TASK-6) |
| `dashboard/YourDay.svelte` | 5.1 | removed (TASK-7) |
| `routes/finances/+page.svelte` | 5.1 | removed (TASK-8) |
| `feeds/FeedBrowserModal.svelte` | 5.1, 5.3 | removed (TASK-9) |
| `contacts/ContactEdit.svelte` | 5.3, 3.6, 5.4 | removed (TASK-10) |
| `libraries/shared/ShelfView.svelte` | 5.1 | removed (TASK-15) |
| `routes/check-in/date/[date]/+page.svelte` | 5.1 | removed (TASK-16) |

### Open questions: answers found during implementation

- **Q2 (FeedBrowserModal):** today, clearing the search does **not** bring the browse list back. `onQueryInput` set `isSearching = false` synchronously, and the effect only ran after that flush, so its `isSearching` guard was always false and it was dead code. The stale search results stayed on screen under the browse layout, with paging off (`hasMore = false`). I restored the intended reset inside `onQueryInput`. This is a behaviour change, and it fixes a bug.
- **Q3 (check-in date):** nobody sets `selectedDate`. `CheckInData.selectedDate` is already `$derived(page.params.date)`. The unsaved `save` must be dropped when the day changes: `save.date` is taken from the day of the first edit, so carrying it over would write the edits to the wrong day. The old effect also reset `save` whenever `checkInData.data` changed (the reload after a successful save). I kept exactly those two triggers (see TASK-16).
- **Q1 and Q4:** left as the analyst described; not changed.

## Changes

TASK-1: `time-tracking/DashboardView.svelte`, `time-tracking/StatisticsView.svelte`, `dashboard/widgets/TimeTrackingWidget.svelte`. The breakdown functions became `$derived.by(...)`. The `*Total` values became plain `$derived(expr)`, which is equivalent to `.by` for a single expression. All `()` read sites were dropped.

TASK-2: `todos/views/KanbanView.svelte`. `groups` is now a writable `$derived(todos.groupedTodos)` and the effect is gone. The dnd handlers still assign to `groups`. The markup already iterated `todos.groupedTodos`, and the handlers mutate the same proxied group objects, so rendering is unchanged.

TASK-3: `calendars/ChooseCalendar.svelte`, `calendars/EventEdit.svelte`. The effect that wrote the bindable `calendar` is removed. The option click already assigned `calendar = c.id`. `selectedCalendar` is now `getSelected(calendar)` only, so the picker never shows a calendar the form does not hold. `EventEdit` now sets its own default: `calendars.calendars[0]?.id ?? 0` for a new event. `EventEdit` is unmounted on `hideSidebar`, so the post-save `emptyForm` reset does not need the default. One difference: if no calendar is loaded when the sidebar opens, the picker shows "choose calendar" instead of silently filling in a calendar later.

TASK-4: `contacts/ChooseAddressBook.svelte`. The effect is removed, and `selectedAddressBook` is now `getSelected(addressBook)`. The click handler already assigned the value, and `ContactEdit`'s `emptyForm` provides the default.

TASK-5: `forms/FileUpload.svelte`. The local `fileInput` and the effect are removed; the `<input>` is bound with `bind:this={input}` directly. Neither caller binds `input`.

TASK-6: `ui/NavProfileEntry.svelte`. `attempts`/`failed` were replaced with `retriedPath`/`failedPath`. A new `imagePath` therefore starts fresh without a reset effect. The why-comment about the retry was kept (10.1 allows it).

TASK-7: `dashboard/YourDay.svelte`. `scoredTodos` is a `$derived.by` with the same clone → score → sort → filter → slice body.

TASK-8: `routes/finances/+page.svelte`. `statistics` is a `$derived.by` that returns `[]` until `finances.wealthLoaded`. I kept the single `WealthStatisticsService` instance: `setData` only assigns a plain field on a non-reactive object, and the derivation still tracks `finances.wealth`. The cast was left as is.

TASK-9: `feeds/FeedBrowserModal.svelte`. The effect is removed. When `onQueryInput` sees a query under 2 characters while a search is active, it calls the new `showBrowseList()`, which holds the effect's former reset + reload body (see Q2).

TASK-10: `contacts/ContactEdit.svelte`. The effect and `loadedContactId` are removed. `form` is built once from `formFromContact(contacts.activeContact)`, or from a clone of `emptyForm`. The component is mounted only while `createModalVisible` is true, and `openCreateModal` sets `activeContact` first.

TASK-11: `routes/notes/journal/[date]/+page.svelte`. `openedKey` is a plain `let`.

TASK-12: `calendars/views/day/MobileDayView.svelte`, `calendars/views/month/MobileMonthView.svelte`. `onMount(() => swipe.setTarget(contentEl))`. Both bound elements are rendered unconditionally, so they are bound at mount.

TASK-13: `charts/{Bar,Doughnut,SmoothLine,StackedArea}Chart.svelte`. `chartContainer`, `myChart` and `isInitialized` are now plain `let`s. `chartContainer` does not need to be reactive: the effect first runs after mount, when `bind:this` is already set. Until the first render, the effect still tracks the data props through `createChart`, so data that arrives late still creates the chart. The misleading "Only update when data actually changes" comment is removed.

TASK-14: `libraries/shared/CoverImage.svelte`. The preload effect returns a cleanup that sets both `onload` handlers to `null`.

TASK-15: `libraries/shared/ShelfView.svelte`. `activeIndex` is a writable `$derived.by` that reads `entries.length` (the same dependencies the effect had) and returns `0`. `navigate`/`handleClick` still assign to it.

TASK-16: `routes/check-in/date/[date]/+page.svelte`. `date = $derived(page.params.date)` and `dayData = $derived(checkInData.getDayData())`. `save` is a writable `$derived.by` keyed on `page.params.date` and `checkInData.data`, returning `null`. `onChange` still assigns and mutates it. The layout and the store were not touched.

TASK-17: `calendars/views/week/Day.svelte`.
- `dragEnabled` is a plain const, since `isMobile` is a literal in all four callers.
- `dateSlug` **stays** `$derived`: `DayView`/`MobileDayView` pass `calendars.currentDate` without a key, so `date` changes during the instance's lifetime.
- `allDayEntries` is inlined into its single `{#each}`.
- `nonAllDayEntries` is folded into `entriesByHour`'s filter.
- `indicatorTop`/`indicatorHeight` are read once each and have multi-line bodies, so they became helper functions (3.2).
- Kept: `entries`, `entriesByHour` (read twice) and `isDropTargetColumn` (read twice).

TASK-18: `calendars/views/month/MobileMonthView.svelte`. All five `$derived` are gone:
- The `selectedDate` alias was inlined as `calendars.mobileSelectedDate`.
- `hasEvents` now uses the existing `hasEventsOnDate(calendars.mobileSelectedDate)` (2.3). All-day plus non-all-day events equal `getEventsForDate`.
- `allDayEvents`, `nonAllDayEvents` and `todos` were then each read once, so they are inlined into their `{#each}`.

TASK-19: `notes/NoteNavigationDesktop.svelte`, `notes/NoteNavigationMobile.svelte` (both changed identically).
- `journalEnabled` and `journalSelectedDate` are inlined.
- `otherActive` became the helper `isOtherActive()`; inlined, it would have been too long for the class ternary (1.1).
- Kept: `favorites` and `activeKey` (several reads), and `current` on mobile (many reads).

TASK-20: `time-tracking/StatisticsView.svelte`, `time-tracking/DashboardView.svelte`.
- Inlined: `filteredTotal`, `categoryChartValues`, `weekTotal`, `todayTotal` (each read once).
- Kept `filteredProjects`: it is not a pure alias (`?? []`) and three other declarations read it.
- Kept `projectDonutData`, `categoryChartLabels`, `recentEntries` and the two breakdowns, since each is read twice.

## Known issues / follow-ups

- **Manual screen runs are still outstanding.** No API was available, so this can't be done in the agent session. check, lint and tests now pass (see Summary). The two points flagged earlier are settled: `const dragEnabled = !isMobile` in `week/Day.svelte` produces no warning, and `svelte-check` accepts the writable `$derived` assignments (TASK-2, 15, 16).
- `.mcp.json`: the accidental hunk from `083c40a` was reverted in `c4a161c`, so the net branch diff no longer contains it. The working copy still shows an uncommitted `.mcp.json` change, which comes from the environment's MCP config and was left uncommitted on purpose.
- `EventEdit.svelte:67` has 2 `state_referenced_locally` warnings that were already there before this job (see Summary). They are not addressed here.
- 3.3: `NoteNavigationDesktop`/`NoteNavigationMobile` read `auth.user.settings.journal_enabled` in the component. The parent should pass it as a prop. Out of scope here.
- Open questions 1 (journal effect: async load + redirect) and 4 (time-tracking `[id]` redirect effect) are still open for the owner.
- `ChooseCalendar`/`ChooseAddressBook` declare an unused `preSelect` prop. `ChooseAddressBook` shows the calendar string `choose_calendar` as its placeholder. Neither was touched.
- `check-in/date` `onSave` shows the success notification even when `save()` fails (it returns `void`). This is existing behaviour and was not touched.
- `CoverImage` still resets `previewLoaded`/`fullLoaded` inside the effect. That is a write, not a read, so there is no loop, but a reviewer may want to see it moved out.
- The chart wrappers never update an initialised chart when their props change. This is existing behaviour, kept as is.
