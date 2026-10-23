# Tasks: 02 Extract the duplicated calendar helpers

id: share
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

Branch verified: worktree HEAD is `feature/share_02-extract-the-duplicated-calendar-helpers`, the same as the brief.

Rules: STANDARDS 2.1 (CSS value → `ColorHelper`), 2.2 (`isOffHour`, `getHoursOfDay` in `DateHelper`), 2.4 (`viewPoint.keyboardHeight`), 12.4 (`eachDayBetween` in `DateHelper`).
Order from the brief: for each helper, write the unit test first, then add the helper, then replace call sites **one file at a time**. Run `npm test && npm run check && npm run lint` between files.
Nothing should change visually. Every replacement must give exactly the same output as the code it replaces.

## Inventory (as found today; the brief and STANDARDS counts are slightly stale)

- **Event colour `color-mix(in srgb, ${c} 25%, var(--color-c-bg-elevated))`**: 9 copies in 6 files:
  `views/week/Day.svelte:179,219`, `views/month/Entry.svelte:74`, `views/list/Day.svelte:26,43`,
  `views/month/MobileMonthView.svelte:155,170`, `dnd/CalendarDragGhost.svelte:15`, `NavigationEntry.svelte:20`.
  The border fallback `calendar_color ?? 'var(--color-c-neutral-2)'` appears next to every event copy (8×).
  Some sites add a condition (`&& item.is_all_day` in `month/Entry` and `list/Day`, and `hidden` in `NavigationEntry`). These conditions stay at the call site.
- **Off-hour `parseInt(hour) < 6 || parseInt(hour) >= 22`**: 5 copies in `day/MobileDayView.svelte:12,43`, `week/MobileWeekView.svelte:15,88`, `week/Day.svelte:194` (`week/Day` also requires `isMobile &&`, which stays).
- **`hours` array** (`Array.from({ length: 24 }…padStart(2,'0')`): 6 copies in `day/DayView`, `day/MobileDayView`, `week/WeekView`, `week/MobileWeekView`, `week/Day`, `forms/TimePicker` (named `hourOptions`). All 6 are identical.
- **Multi-day walk**: `state/Calendars.svelte.ts:160-170` in `loadEvents()`.
- **`parseDateSlug`**: defined at `calendars/dnd/CalendarDragState.svelte.ts:103`, imported by `views/month/Entry.svelte` and `views/week/Day.svelte`.
- **Keyboard height**: `ui/BottomSheetModal.svelte:22-45`, `ui/BottomSheetConfirmationModal.svelte:26-49`, `notes/editor/TipTapEditor.svelte:130-145`. TipTap also requires `viewPoint.isMobile` and cleans up in `onDestroy`. The two modals register in `onMount`. All three use `diff > 60 ? \`${diff}px\` : ''`.

## Task breakdown

TASK-1: Add a unit test, then the `ColorHelper` function(s) for the event colour: the background `color-mix(… 25%, var(--color-c-bg-elevated))` and the border fallback to `var(--color-c-neutral-2)` (see open question Q1).
  files: tests/unit/helpers/ColorHelper.test.ts, src/lib/helpers/ColorHelper.ts
  depends: none
  risk: low — this only adds a new pure string function and its test.

TASK-2: Replace the event-colour copies in the calendar event renderers with the TASK-1 helper, one file at a time, and keep each site's extra condition (`is_all_day`) as it is.
  files: src/lib/components/calendars/views/week/Day.svelte, src/lib/components/calendars/views/month/Entry.svelte, src/lib/components/calendars/views/list/Day.svelte, src/lib/components/calendars/views/month/MobileMonthView.svelte, src/lib/components/calendars/dnd/CalendarDragGhost.svelte
  depends: TASK-1
  risk: medium — these are five markup files with slightly different conditions, and if a condition is dropped by mistake the all-day/timed colours change visually.

TASK-3: Replace the `color-mix` in `NavigationEntry.getBgColor()` (and the border fallback, if Q1 includes it) with the TASK-1 helper, and keep the `hidden → 'transparent'` / neutral border branches.
  files: src/lib/components/calendars/NavigationEntry.svelte
  depends: TASK-1
  risk: low — the change is one line inside an existing function, and the hidden branch stays the same.

TASK-4: Add unit tests, then `getHoursOfDay()` (returns `'00'…'23'`) and `isOffHour(hour)` (`< 6 || >= 22`) to `DateHelper`.
  files: tests/unit/helpers/DateHelper.test.ts, src/lib/helpers/DateHelper.ts
  depends: none
  risk: low — these are new pure functions. The parameter type of `isOffHour` should take what the callers have (the string from the hours array, or a number), so that no new casts are needed at the call sites.

TASK-5: Replace the `hours` array and the off-hour expressions in the calendar views with `getHoursOfDay()` / `isOffHour()`, one file at a time, and keep the `isMobile &&` gate in `week/Day`.
  files: src/lib/components/calendars/views/day/DayView.svelte, src/lib/components/calendars/views/day/MobileDayView.svelte, src/lib/components/calendars/views/week/WeekView.svelte, src/lib/components/calendars/views/week/MobileWeekView.svelte, src/lib/components/calendars/views/week/Day.svelte
  depends: TASK-4
  risk: medium — these are the most-used views, and `hours` is used as an `{#each}` key and in `parseInt(hour)` lookups, so the values must stay exactly as they are (zero-padded strings).

TASK-6: Replace `hourOptions` in `forms/TimePicker.svelte` with `getHoursOfDay()`.
  files: src/lib/components/forms/TimePicker.svelte
  depends: TASK-4
  risk: low — the array is identical, but TimePicker is a shared form component (used by EventEdit and possibly others), so check it with `npm run check` and the forms component tests.

TASK-7: Add a unit test, then `eachDayBetween(start, end)` to `DateHelper`. The test must pin the **current** loop semantics: days after `start`, stepping one day at a time, **including** the first day that reaches `>= end` (with end-exclusive all-day events this means the end day itself is included today; see Q3).
  files: tests/unit/helpers/DateHelper.test.ts, src/lib/helpers/DateHelper.ts
  depends: none
  risk: medium — the existing loop's boundary behaviour is subtle (it increments before the comparison is used for the push), and getting it wrong by one day changes how multi-day events show up in the calendar.

TASK-8: Rewrite the multi-day walk in `Calendars.loadEvents()` to use `eachDayBetween`, and keep the `is_all_day && > 1440 min` guard and the start-day push unchanged.
  files: src/lib/state/Calendars.svelte.ts (regression guard: tests/unit/stores/Calendars.test.ts; add a multi-day all-day case there if none exists)
  depends: TASK-7
  risk: medium — this changes store logic that every calendar view reads through `sortedEvents`. The other 12.4 cleanups (`??=` bucket, a named "spans more than one day") are not in this brief and should be left alone.

TASK-9: Move `parseDateSlug` unchanged from `CalendarDragState.svelte.ts` to `DateHelper` (next to `formatDate`), add a round-trip/invalid-input unit test, and update the two imports.
  files: src/lib/components/calendars/dnd/CalendarDragState.svelte.ts, src/lib/helpers/DateHelper.ts, tests/unit/helpers/DateHelper.test.ts, src/lib/components/calendars/views/month/Entry.svelte, src/lib/components/calendars/views/week/Day.svelte
  depends: none (if TASK-2/TASK-5 run first, this touches the same two view files, so do it after them to avoid conflicts)
  risk: low — this is a pure function move with two importers. `SvelteDate` is also removed from `CalendarDragState` only if nothing else there uses it (today nothing else does).

TASK-10: Add a `keyboardHeight` getter to `ViewPoint`, backed by one `visualViewport` resize+scroll listener registered in `initialize()` and removed in `destroy()`. It applies the existing `> 60px` threshold (returns 0 at or below it). Add a unit test.
  files: src/lib/state/Viewpoint.svelte.ts, a new test (e.g. tests/unit/stores/Viewpoint.test.ts, following the existing store-test setup)
  depends: none
  risk: medium — `ViewPoint` is created for the whole app in the root layout. The listener must be guarded for a missing `window.visualViewport` (jsdom and older browsers), and the component test harness also creates a `ViewPoint`.

TASK-11: Replace the keyboard blocks in `BottomSheetModal` and `BottomSheetConfirmationModal` with `getViewPoint().keyboardHeight`, removing their `onMount`/`keyboardPadding` state, one file at a time.
  files: src/lib/components/ui/BottomSheetModal.svelte, src/lib/components/ui/BottomSheetConfirmationModal.svelte
  depends: TASK-10
  risk: medium — the modals do not use `ViewPoint` yet, and they are rendered in many places. `tests/components/translation-only.test.ts` renders `BottomSheetConfirmationModal` through `renderWithContext` (which seeds a ViewPoint) and must stay green.

TASK-12: Replace the keyboard block in `TipTapEditor` with `viewPoint.keyboardHeight`, keep the `viewPoint.isMobile` gate at the call site, and remove the now-unused `removeViewportListeners` cleanup.
  files: src/lib/components/notes/editor/TipTapEditor.svelte
  depends: TASK-10
  risk: medium — the editor's mount/destroy lifecycle also manages the TipTap instance, so only the viewport part may be removed. Mobile notes editing is the place where a regression would show.

TASK-13: Final gate: `npm test`, `npm run check`, `npm run lint`, and a grep that confirms no copies remain (`25%, var(--color-c-bg-elevated)`, `< 6 ||`, `length: 24`, `visualViewport` outside `Viewpoint`, `parseDateSlug` outside `DateHelper`).
  files: none (verification only)
  depends: TASK-1 … TASK-12
  risk: low — this task only verifies.

## Open questions / unclear scope

- **Q1 — border colour:** The brief says "event border/background colour", but only names the `color-mix` expression. The plan includes the `?? 'var(--color-c-neutral-2)'` border fallback in TASK-1 because it sits next to every copy. If only the background was meant, drop the border part of TASK-1/2/3.
- **Q2 — page background:** The four `color-mix(in srgb, var(--color-c-primary) 12%, var(--color-c-bg))` view backgrounds (`DayView`, `WeekView`, `MonthView`, `ListView`) are a different expression from the event colour and are **not** in this plan. They also fall under STANDARDS 2.1, so they could be a follow-up.
- **Q3 — `eachDayBetween` boundary:** Today the walk also adds the day on which `end_date` falls. This may be a latent off-by-one for end-exclusive all-day events, but "no visual change" means the helper keeps this behaviour. Any fix should be a separate job.
- **Q4 — `SvelteDate` in moved/new helpers:** STANDARDS 14.1 lists `parseDateSlug` as a helper that should return a plain `Date`. The brief only asks to move it, so TASK-9 moves it unchanged. For the **new** `eachDayBetween`, return plain `Date`, so no new 14.1 violation is added. This has no effect on behaviour, because the walked dates are only used to build `formatDate` slugs.
- Other 12.4 items (`??=` bucket push, a named "spans more than one day") and restructuring the views are out of scope.
