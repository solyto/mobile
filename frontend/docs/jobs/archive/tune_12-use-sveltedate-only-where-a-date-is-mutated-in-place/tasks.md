# Tasks: 12 Use SvelteDate only where a date is mutated in place

id: tune
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

## Ground rules for every task

- Rule: `docs/STANDARDS.md` 14.1. Keep `SvelteDate` only where a setter is
  called on a value **that is rendered while it is mutated**. A throwaway
  local that is built with `setDate`/`setMonth` and then returned or compared
  is not rendered while mutated, so it becomes plain `Date`.
- Swap the constructor/type only (`new SvelteDate(x)` → `new Date(x)`,
  `SvelteDate` → `Date` in types). Do not change any date logic, do not
  restructure loops, and do not touch the `<CalendarEvent>` casts or the
  `loadEvents()` shape. Those belong to backlog `04-calendar-events-loading-service.md`.
- Drop the `svelte/reactivity` import when nothing from it is left
  (`Auth.svelte.ts` keeps `SvelteMap`).
- **Type gotcha:** `SvelteDate`'s constructor accepts anything, but
  `new Date(...)` under strict TS does not accept `null`/`undefined`. Two call
  sites pass a nullable today:
  - `Calendars.showSidebar`: `new SvelteDate(selectedDate)` with
    `selectedDate: Date | null` (callers pass `null` together with an event).
  - `CheckInData` line 97: `new SvelteDate(this.selectedDate)` with
    `selectedDate = $derived(page.params.date)` (`string | undefined`).
  Keep the runtime behaviour exactly as it is (a `null` input currently gives
  the 1970 epoch, not `null`). If keeping that behaviour needs anything more
  than a type-level change, stop and report it instead of "fixing" it. That
  would be a logic change, and logic changes are out of scope.
- Verify each task with `npm run check`, `npm run lint`, `npm test`.

## Inventory (what stays, what goes)

| File | Verdict | Why |
| --- | --- | --- |
| `components/calendars/EventEdit.svelte` | **keep** | form state edited with `setHours`/`setMinutes` |
| `components/forms/SvelteDateInput.svelte` | **keep** | `date.setFullYear(...)` on the bound prop (EventEdit's form date) |
| `types/calendar.ts` `EventForm.start_date/end_date` | **keep** | type of the EventEdit form state above |
| `components/dashboard/widgets/WeatherWidget.svelte` `time` | **keep** | `time.setTime(Date.now())` every second while rendered |
| `WeatherWidget.svelte` `date` | plain `Date` | never mutated |
| `types/calendar.ts` `CalendarDay.date`, `OutOfScopeCalendarDay.date` | plain `Date` | helper return values, read only |
| `helpers/DateHelper.ts` (all) | plain `Date` | helpers, locals mutated only before being returned |
| `components/calendars/dnd/CalendarDragState.svelte.ts` (`parseDateSlug`) | plain `Date` | helper return value (named in 14.1) |
| `components/calendars/CalendarMarks.svelte` prop | plain `Date` | read-only prop (named in 14.1) |
| `components/calendars/ChooseRecurrenceRule.svelte` prop (`import type`) | plain `Date` | read-only prop; EventEdit still passes a `SvelteDate`, which is a `Date` subclass, so reactivity of the passed value is unchanged |
| `state/Calendars.svelte.ts` | plain `Date` | loaded API data plus fields that are only ever reassigned wholesale (see TASK-4) |
| `state/Todos.svelte.ts`, `Notes.svelte.ts`, `Auth.svelte.ts`, `CheckInData.svelte.ts` | plain `Date` | locals / comparisons only |
| `services/WealthStatisticsService.ts` | plain `Date` | pure service, locals only |
| `components/check-in/overview/CheckInSummaries.svelte` | plain `Date` | locals only |
| `routes/check-in/{trends,history,date/[date]}/+page.svelte` | plain `Date` | locals only |

The brief and 14.1 say "16 files". The grep finds 18 under `src/`, counting
the `import type` in `ChooseRecurrenceRule` and the two `SvelteDate` imports
in `EventEdit`/`SvelteDateInput`. This doesn't change the work. After the job, `SvelteDate` should
only remain in `EventEdit.svelte`, `SvelteDateInput.svelte`,
`WeatherWidget.svelte` and `types/calendar.ts` (for `EventForm`). Updating the
"16 files today" count in `STANDARDS.md` 14.1 is **not** in this brief, so it's left alone.

## Task breakdown

TASK-1: Replace `SvelteDate` with `Date` in `DateHelper.ts`, including the
`getDaysInMonth` return type (`SvelteDate[]` → `Date[]`).
  files: src/lib/helpers/DateHelper.ts
  depends: none
  risk: low. Every use is a local that is mutated only before it is
  returned. Callers already type the results as `Date`. `npm run check`
  will catch any caller that relied on `SvelteDate[]`.

TASK-2: Change `CalendarDay.date` and `OutOfScopeCalendarDay.date` to `Date`
in `types/calendar.ts`, keeping `EventForm.start_date/end_date` as `SvelteDate`.
  files: src/lib/types/calendar.ts
  depends: TASK-1 (`getCalendarMonth`/`getCalendarWeek` produce these)
  risk: low. Grep shows no setter on any `day.date`/`.date` value in `src/`.

TASK-3: Change the read-only date props in `CalendarMarks.svelte` and
`ChooseRecurrenceRule.svelte` to `Date`, and return a plain `Date` from
`parseDateSlug` in `CalendarDragState.svelte.ts`.
  files: src/lib/components/calendars/CalendarMarks.svelte,
         src/lib/components/calendars/ChooseRecurrenceRule.svelte,
         src/lib/components/calendars/dnd/CalendarDragState.svelte.ts
  depends: TASK-2
  risk: low. These are only read. `parseDateSlug` already declares `Date | null`.

TASK-4: Replace `SvelteDate` with `Date` throughout `Calendars.svelte.ts`:
the field types of `currentDate`, `selectedDate`, `mobileSelectedDate` and
`mobileWeekStart`, the four dates per event in `loadEvents()`, and all the
locals and reassignments.
  files: src/lib/state/Calendars.svelte.ts
  depends: TASK-1, TASK-2
  risk: medium. `nextDay`/`lastDay` call `this.currentDate.setDate(...)` on
  the rendered field, but they immediately reassign a new object to the
  `$state` field, so the reassignment carries the reactivity. The developer
  should confirm by grep that no component calls a setter on these four
  fields (none found during analysis). Watch the nullable
  `showSidebar(selectedDate)` typing (see ground rules). `EventEdit` already
  copies `selectedDate`/`activeEvent` dates into fresh `SvelteDate`s, so
  form editing is unaffected.

TASK-5: Replace `SvelteDate` with `Date` in the other stores and services,
where it is only used for locals and comparisons.
  files: src/lib/state/Todos.svelte.ts, src/lib/state/Notes.svelte.ts,
         src/lib/state/Auth.svelte.ts (keep `SvelteMap`),
         src/lib/state/CheckInData.svelte.ts,
         src/lib/services/WealthStatisticsService.ts
  depends: none
  risk: low. All the values are locals or sort keys. The one point to watch is the
  `string | undefined` argument in `CheckInData` line 97 (see ground rules).

TASK-6: Replace `SvelteDate` with `Date` in the check-in component, the
check-in routes, and the never-mutated `date` in `WeatherWidget` (keep `time`
as `SvelteDate`).
  files: src/lib/components/check-in/overview/CheckInSummaries.svelte,
         src/routes/check-in/trends/+page.svelte,
         src/routes/check-in/history/+page.svelte,
         src/routes/check-in/date/[date]/+page.svelte,
         src/lib/components/dashboard/widgets/WeatherWidget.svelte
  depends: none
  risk: low. These are locals or values read once. `svelte/prefer-svelte-reactivity`
  is disabled in ESLint, so lint will not complain about `new Date` in `.svelte`.

TASK-7: Add one store test that uses `vi.setSystemTime` to pin "today" and
asserts on a store method that reads "now". This was impossible while the
store used `SvelteDate`. Suggested target: `Calendars.goToToday()` (and/or the
constructor) in `tests/unit/stores/Calendars.test.ts`, asserting fixed
`currentYear`/`currentMonth`/`currentWeek`/`currentDate` and the
`/calendars/events/YYYY-MM` request for the pinned date, instead of the
existing "compare against real `new Date()`" style.
  files: tests/unit/stores/Calendars.test.ts
  depends: TASK-1, TASK-4
  risk: low. Consider `vi.useFakeTimers({ toFake: ['Date'] })` so
  `await tick()` and the awaited mock promises in `goToToday` are not frozen.
  Restore with `vi.useRealTimers()` in `afterEach`. Add the new test and leave
  the existing tests as they are.

## Open points / not in scope

- `tests/unit/stores/Calendars.test.ts` builds fixtures with
  `new SvelteDate(...)` and compares with `toEqual(new SvelteDate(...))`.
  These should keep passing because `SvelteDate` is a `Date` subclass. Rewrite
  them to plain `Date` only if a test actually fails after TASK-4, and don't
  do it as a drive-by cleanup.
- `tests/unit/helpers/DateHelperExtended.test.ts` has fake-timer tests that
  currently fail. Fixing them belongs to backlog `01-green-the-test-gate.md`.
  TASK-1 may change their outcome, but do not edit that file here. Record any
  change in pass/fail state in `implementation.md`.
- `STANDARDS.md` 14.1 ("16 files today"), `TESTING.md` caveats and the
  `STANDARDS_BACKLOG.md` checkbox may be stale after this job. Updating them
  is not in the brief. Mention it in `implementation.md` and leave the edit to the owner.
- `Calendars.loadEvents()` restructuring (`fromApi`, `eachDayBetween`,
  removing the angle-bracket casts) is backlog 04, not this job.
