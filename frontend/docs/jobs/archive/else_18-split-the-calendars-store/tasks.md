# Tasks: 18 Split the Calendars store

id: else
analyst: @analyst
date: 2026-10-14

<!-- Produced by @analyst from brief.md. -->

Branch verified: `feature/else_18-split-the-calendars-store` (worktree HEAD).

Rules: STANDARDS 11.5 (split the self-contained part), 15.2 (context
singleton, constructor injection, member order, created in the feature
`+layout.svelte`), 15.5 (CRUD shape: copy methods verbatim), 12.1.

## Findings that shape the plan

- `setCalendars()` runs in two places: `src/routes/calendar/+layout.svelte`
  and `src/routes/+page.svelte` (dashboard, `YourDay.svelte`). Sharing and
  import are only used under `/calendar` (`+page.svelte`, `ImportModal`,
  `ShareCalendarModal`, `CalendarEdit`, `PendingCalendarInvite`,
  `CalendarNavigation`, `MobileCalendarHeader`). So the new stores go in
  `src/routes/calendar/+layout.svelte` only, after `setCalendars()`.
- The sharing block (lines 559–610) is `shareCalendar`, `revokeShare`,
  `unsubscribeFromCalendar`, `acceptInvite`, `declineInvite`,
  `openShareModal`, `closeShareModal`, plus the state fields `shareModal`
  and `shareCalendarTarget`. Three of those methods reload
  `calendars.loadCalendars()` / `loadEvents()` afterwards, so the sharing store
  needs the `Calendars` instance as a collaborator. Nothing in the repo
  injects one domain store into another yet, but `Notes`/`QuickAdd` already
  inject `Translation`/`UiNotifications` with `getX()` defaults, so the
  same shape works:
  `constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService, calendars: Calendars = getCalendars())`.
- The import block (lines 535–550) is `startImport`, `selectImportCalendars`,
  `getImportState`, plus the `importModal` field. It only needs
  `apiService`. The reload after a finished import already happens in
  `components/calendars/ImportModal.svelte` (`calendars.loadCalendars()` /
  `loadEvents()`) and can stay there.
- `getWeekNumber`, `getISOWeek` and `getISODateInfo` in `DateHelper.ts` all
  compute the same thing. The brief asks for `getISODateInfo`. There is no
  helper for "weeks in an ISO year" yet.
- The existing tests in `tests/unit/stores/Calendars.test.ts` currently
  check the buggy behaviour: `nextWeek` from 53 expects `currentMonth` 13
  and week 2, and `lastWeek` from 1 expects month 0 and week 52 (lines 362–390).
  These tests have to be rewritten, not just moved.
- `setMobileWeekStart()` also sets `currentWeek` (from `getWeekNumber`) but
  has no callers in `src/`. See open questions.

## Task breakdown

TASK-1: Add a pure `DateHelper` function that returns the number of ISO weeks in a year (the ISO week of 28 December), with unit tests written first: 2020 → 53, 2025 → 52, 2026 → 53, 2027 → 52.
  files: src/lib/helpers/DateHelper.ts, tests/unit/helpers/DateHelper.test.ts
  depends: none
  risk: low — new pure function with no callers yet, covered by tests.

TASK-2: Write the failing week-year tests in `tests/unit/stores/Calendars.test.ts` before changing the store, and rewrite the four existing week-navigation tests that check the current bugs (month 13/0, week 2, week 52 after week 1).
  Cases to cover (use `vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime`, as in the existing `goToToday` test):
  - constructor and `goToToday()` for each date from 2025-12-29 to 2026-01-04: `currentWeekYear` 2026, `currentWeek` 1, `currentYear` 2025 for the December dates and 2026 for the January dates, `currentMonth` the calendar month. Also a date at the end of a 53-week year, e.g. 2027-01-01 (ISO 2026-W53): `currentWeekYear` 2026, `currentWeek` 53, `currentYear` 2027.
  - `nextWeek` from 2025-W52 → 2026-W1, and from 2026-W53 → 2027-W1.
  - `lastWeek` from 2026-W1 → 2025-W52, and from 2027-W1 → 2026-W53.
  - `nextWeek`/`lastWeek` leave `currentYear` and `currentMonth` alone, and `mobileWeekStart` is the Monday of the new week.
  files: tests/unit/stores/Calendars.test.ts
  depends: TASK-1 (the tests may use the helper to state expectations; they can also hard-code them)
  risk: low — test-only; these tests are supposed to fail until TASK-3 is done.

TASK-3: Add `currentWeekYear` `$state` to `Calendars`. Set it together with `currentWeek` from `getISODateInfo` in the constructor and in `goToToday()`. Make `nextWeek`/`lastWeek` wrap using `currentWeekYear` and the TASK-1 helper, so they no longer touch `currentYear`/`currentMonth`. `currentYear` stays the calendar year that `loadMonth`/`loadEvents`/`MonthNavigation` use.
  files: src/lib/state/Calendars.svelte.ts
  depends: TASK-1, TASK-2
  risk: medium — changes shared navigation state that many views read. The month path must stay unchanged; TASK-2 and the existing month tests check that.

TASK-4: Point the week views at the new field. `WeekView.svelte` and `MobileWeekView.svelte` call `getCalendarWeek(calendars.currentWeekYear, calendars.currentWeek)`, and their `onMount` sets `currentWeekYear` (not `currentYear`) and `currentWeek` from `getISODateInfo`. This removes the month-view jump to December 2026.
  files: src/lib/components/calendars/views/week/WeekView.svelte, src/lib/components/calendars/views/week/MobileWeekView.svelte
  depends: TASK-3
  risk: low — the change is limited to which field these two files read and write.

TASK-5 (BLOCKED — only with owner confirmation): Replace the two week-view `onMount` bodies with `calendars.goToToday()`.
  The brief says the owner dropped this in job 03 and asks for confirmation first. `goToToday()` does more than the current `onMount`: it also resets `currentDate`, `currentMonth`/`currentYear` and `mobileSelectedDate`, and reloads events and marks. So every time a week view mounts, month/day navigation and the fetched events would change too. Do not implement this until the owner confirms. TASK-4 already fixes the bug without it.
  files: src/lib/components/calendars/views/week/WeekView.svelte, src/lib/components/calendars/views/week/MobileWeekView.svelte
  depends: TASK-4, owner confirmation
  risk: medium — the extra API reload and navigation reset on view switch are visible to the user, and the owner has removed this before.

TASK-6: Create `src/lib/state/CalendarImport.svelte.ts` (class `CalendarImport`, `setCalendarImport`/`getCalendarImport`, 15.2 shape with `auth`/`apiService` constructor defaults). Move `importModal`, `startImport`, `selectImportCalendars` and `getImportState` into it unchanged, and remove them from `Calendars`. Copy the methods as they are, without improvements (15.5).
  files: src/lib/state/CalendarImport.svelte.ts (new), src/lib/state/Calendars.svelte.ts
  depends: none (independent of TASK-1..5; do it after TASK-3 only to avoid merge noise in the same file)
  risk: low — the methods only use `apiService` and are copied verbatim.

TASK-7: Register `setCalendarImport()` in `src/routes/calendar/+layout.svelte` and switch the import callers to `getCalendarImport()`. `ImportModal.svelte` keeps `getCalendars()` for the `loadCalendars()`/`loadEvents()` reload after a finished import.
  files: src/routes/calendar/+layout.svelte, src/lib/components/calendars/ImportModal.svelte, src/lib/components/calendars/CalendarNavigation.svelte, src/lib/components/calendars/MobileCalendarHeader.svelte
  depends: TASK-6
  risk: low — mechanical rewiring, and `npm run check` catches any reference that was missed.

TASK-8: Create `src/lib/state/CalendarSharing.svelte.ts` (class `CalendarSharing`, `setCalendarSharing`/`getCalendarSharing`) with constructor `(auth = getAuth(), apiService = auth.apiService, calendars = getCalendars())`. Move `shareModal`, `shareCalendarTarget`, `shareCalendar`, `revokeShare`, `unsubscribeFromCalendar`, `acceptInvite`, `declineInvite`, `openShareModal` and `closeShareModal` into it. Reloads become `this.calendars.loadCalendars()` / `this.calendars.loadEvents()`. Remove the moved members and the now-unused `ShareCalendarRequest` import from `Calendars`.
  files: src/lib/state/CalendarSharing.svelte.ts (new), src/lib/state/Calendars.svelte.ts
  depends: none functionally; do it after TASK-6 to keep the `Calendars` diffs separate
  risk: medium — this is the first store that injects another domain store. The sharing store must be constructed after `setCalendars()`, and the reloads have to go to the same `Calendars` instance the views read.

TASK-9: Register `setCalendarSharing()` in `src/routes/calendar/+layout.svelte` (after `setCalendars()`) and switch the sharing callers to `getCalendarSharing()`.
  files: src/routes/calendar/+layout.svelte, src/routes/calendar/+page.svelte, src/lib/components/calendars/ShareCalendarModal.svelte, src/lib/components/calendars/CalendarEdit.svelte, src/lib/components/calendars/PendingCalendarInvite.svelte
  depends: TASK-8
  risk: low — mechanical rewiring, and `check` catches any reference that was missed. Order in the layout matters because of the `getCalendars()` default.

TASK-10: Move the sharing tests (`revokeShare …`, `unsubscribeFromCalendar …` ×2, currently under "calendar deletes go through the shared ApiService") into a new `tests/unit/stores/CalendarSharing.test.ts`. Construct the store with explicit arguments, including a real `new Calendars()` (or a stub with `loadCalendars`/`loadEvents`), so it needs no context. Keep the assertions as they are.
  files: tests/unit/stores/Calendars.test.ts, tests/unit/stores/CalendarSharing.test.ts (new)
  depends: TASK-8
  risk: low — the tests are moved; they are not new behaviour.

TASK-11: Verify: `npm test`, `npm run check`, `npm run lint`. Grep `src/` to confirm that no `calendars.`(share*/import*/invite/unsubscribe/currentYear in week views) references are left. Then list the manual checks for the reviewer/owner: share a calendar, revoke a share, accept and decline an invite (`/calendar?invitations`), unsubscribe, the import flow, and week/month navigation across New Year (system date 2025-12-29 … 2026-01-04 and across 2026-W53).
  files: none (verification), implementation.md
  depends: TASK-1..10 (except TASK-5)
  risk: low — verification only. The manual runs need a live API and are not something the developer can fully do here.

## Open questions (not guessed; developer should not resolve these alone)

1. **TASK-5 / `goToToday()` in `onMount`.** The brief explicitly asks for confirmation from the owner first. The plan fixes the bugs without it (TASK-4). TASK-5 stays blocked until the owner says yes.
2. **`pendingInvites`, `ownedCalendars`, `acceptedSharedCalendars`.** These `$derived` groupings of `calendars` are not in the brief's list. `ownedCalendars`/`acceptedSharedCalendars` are also read by `CalendarNavigation`. The plan keeps all three in `Calendars`, and the "derived calendar groupings" test stays there. Moving `pendingInvites` to the sharing store would be extra scope.
3. **`WeekNavigation` and `currentWeekYear`.** The brief lists `WeekNavigation` among the users of `currentWeekYear`, but the component only calls `nextWeek`/`lastWeek` and shows `currentWeek`, so the store change covers it. Showing the week-year in `WeekNavigation` or in the `MobileCalendarHeader` week label would be a UI change. Neither is planned.
4. **`setMobileWeekStart()`.** It sets `currentWeek` but not `currentWeekYear`, and nothing in `src/` calls it. The plan leaves it unchanged. If the owner wants it consistent, it would also set `currentWeekYear` from `getISODateInfo`, or the dead method could be removed. Both are outside the brief.
5. **Import store tests.** There are no existing import tests to move. The brief only asks to move matching tests, so the plan adds none. Adding a small `CalendarImport.test.ts` would be optional extra scope.
6. **Week view and events at month boundaries.** `nextWeek`/`lastWeek` never reload events (events are fetched per calendar month). A week that crosses into another month therefore shows only the events of the loaded month. This was true before and stays unchanged here, because the brief excludes navigation other than the week-year fix. It should be tracked as a follow-up if wanted.
