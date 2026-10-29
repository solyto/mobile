# Tasks: 03 Clean up the calendar view components

id: note
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

## Preconditions checked

- Branch: worktree HEAD is `feature/note_03-clean-up-the-calendar-view-components`, which matches `brief.md`.
- "Depends on the helpers entry": **already landed**. `DateHelper` exports
  `getHoursOfDay`, `isOffHour`, `parseDateSlug`, `eachDayBetween`;
  `ColorHelper` exports `getEventBorderColor` / `getEventBackgroundColor`, and
  the calendar views already use them. No helper work is left for this job.
- The brief says `views/dnd/CalendarDragGhost.svelte`. The real path is
  `src/lib/components/calendars/dnd/CalendarDragGhost.svelte` (no `views/`).
- Safety net (brief): `npm run check`, `npm run lint`, `npm test` (existing
  `Calendars` store tests) after every task, plus one manual run of week and
  month view on desktop and of week and day view on mobile at the end. There
  is no unit seam for markup, so no new tests are expected.

## Task breakdown

TASK-1: Render `CalendarDragGhost` once per view: remove the `sourceDateSlug` prop and the dead `data-calendar-drag-ghost` attribute, replace the four-term `{#if}` with a named check and the `style` walk with a `ghostStyle()` helper inside the component, delete the `<CalendarDragGhost …/>` line (and its import) from `week/Day.svelte` and `month/Day.svelte`, and add one `<CalendarDragGhost />` to `WeekView.svelte` and `MonthView.svelte` (rules 1.7, 1.8, 1.9).
  files: src/lib/components/calendars/dnd/CalendarDragGhost.svelte,
         src/lib/components/calendars/views/week/Day.svelte (lines 10, 247 only),
         src/lib/components/calendars/views/month/Day.svelte (lines 8, 75 only),
         src/lib/components/calendars/views/week/WeekView.svelte,
         src/lib/components/calendars/views/month/MonthView.svelte
  depends: none
  risk: medium — the ghost is `position: fixed`, so moving it changes its ancestors and stacking context (`z-[100]`); check manually that it still follows the pointer above all columns in both desktop views. Do not touch `CalendarDragState.svelte.ts`: `calendarDrag.sourceDateSlug` stays, because the drag controller still sets it and the drag state belongs to backlog 06. The visibility check therefore stays a component-local function, not a store getter. `grep -rn 'calendar-drag-ghost' src` should return nothing afterwards. The mobile views never render the ghost (drag is disabled when `isMobile`, and `month/Day` is only used by desktop `MonthView`), so nothing is lost there.

TASK-2: In `week/Day.svelte`, replace the root `class` (two ternaries, one with an opacity modifier) with the array form, and replace the hour-row `{@const offHour = isMobile && isOffHour(hour)}` plus its folded class ternary with a script function (e.g. `isShadedHour(hour)` returning `isMobile && isOffHour(hour)`) and `class:bg-c-neutral` / `class:dark:bg-s-dark-2` directives (rules 1.3, 1.5).
  files: src/lib/components/calendars/views/week/Day.svelte (lines ~151-155, 191-197)
  depends: TASK-1 (same file; avoids merge noise)
  risk: low — mechanical markup change; the `isMobile &&` part must be kept, because desktop rows are not shaded today. Compare the rendered classes on desktop and mobile.

TASK-3: In `week/Day.svelte`, merge the all-day event button and the hourly event button into one `{#snippet}`, with the classes and the `top`/`height` style values that differ passed as parameters, and keep the `style` attribute to one short declaration per line (rules 1.4, 1.6).
  files: src/lib/components/calendars/views/week/Day.svelte (lines ~169-232)
  depends: TASK-2
  risk: medium — the two buttons differ in classes (`w-full` vs `absolute z-40 w-2/3 shadow-sm`, `!border-l-0` vs `left-0`/`right-0`) and only the hourly one has `top`/`height`; the snippet must render exactly what is rendered today, including `in:blur` and all four pointer handlers. Keep the `{#each}`/`{#if isCalendarHidden}` structure and keys unchanged. Do not change the drag handlers (backlog 06), and do not trim the file's `$derived`s (see open questions).

TASK-4: In `MobileWeekView.svelte`, replace `displayedWeek` `$state` + `prevYear`/`prevWeek` + the `$effect` with WeekView's one-line `let week = $derived(getCalendarWeek(calendars.currentYear, calendars.currentWeek));`, label the days with `ts.get.calendar.weekdays_short[day.weekday]` and drop `getWeekdayShort` (and its cast), and put `calc((100vw - 2rem) / 3)` (used three times) into one const (rules 5.5, 2.3, 2.2, 6.1).
  files: src/lib/components/calendars/views/week/MobileWeekView.svelte
  depends: none
  risk: low — the `onMount` loses its `prevYear`/`prevWeek`/`displayedWeek` lines and keeps only the two `calendars.current*` writes, exactly like `WeekView` today; with the `$derived`, those writes re-render the week by themselves. Check the mobile week view on first open and after navigating weeks. The label in the mobile view has no trailing `.` today while `WeekView` has one; keep the mobile text as it is (no layout change).

TASK-5: Replace the remaining `{@const offHour = isOffHour(hour)}` and class-string ternaries in the mobile calendar files with `isOffHour(hour)` read inline and `class:` directives (`class:text-c-neutral-4`, `class:dark:text-s-dark-3`, `class:rotate-180`) (rules 1.3, 1.5).
  files: src/lib/components/calendars/views/week/MobileWeekView.svelte (lines ~86-88),
         src/lib/components/calendars/views/day/MobileDayView.svelte (lines ~42-44),
         src/lib/components/calendars/MobileCalendarHeader.svelte (line ~124)
  depends: TASK-4 (same file)
  risk: low — direct one-to-one replacements. After this, `grep -rn '{@const' src/lib/components/calendars` and `grep -rnE 'class="[^"]*\{[^}]*\?' src/lib/components/calendars` should both return nothing.

TASK-6: In `WeekView.svelte` and `MobileWeekView.svelte`, replace the `onMount` that sets `currentYear`/`currentWeek` from `getISODateInfo(new Date())` with a call to `calendars.goToToday()`. **DROPPED (owner decision 2026-10-13, option a): out of scope, this job does not change behaviour. The current `onMount` stays as it is.**
  files: src/lib/components/calendars/views/week/WeekView.svelte,
         src/lib/components/calendars/views/week/MobileWeekView.svelte
  depends: TASK-4 (same `onMount` in MobileWeekView)
  risk: high — this is not a pure refactor; see open question 1.

## Open questions (for the owner)

1. **`goToToday()` is not equivalent to the current `onMount` (TASK-6).** The
   brief and backlog say the views "re-implement" it, but
   `Calendars.goToToday()` (`state/Calendars.svelte.ts:290`) does more and does it differently:
   - it sets `currentYear = today.getFullYear()`, while the views use the
     **ISO** year from `getISODateInfo`. Around New Year (e.g. 29.12.2025 is
     ISO week 1 of 2026) this gives `year 2025 / week 1`, which is the wrong week;
   - it also resets `currentDate`, `currentMonth`, `mobileSelectedDate`,
     `mobileWeekStart`, and calls `loadMonth()`, `loadEvents()` and
     `loadMarks()`. These API calls come on top of the ones
     `routes/calendar/+page.svelte` already starts in its own `onMount`, so
     every time someone switches into week view the events would load twice.
   This conflicts with the brief's "no behaviour changes" and with "`loadEvents`
   is out of scope". Possible ways forward: (a) drop TASK-6 from this job;
   (b) first fix `goToToday()` to use the ISO year (changes the store, but
   the year bug would then also be fixed for the existing "today" button in
   `MobileCalendarHeader`) and accept the extra loads; (c) something else.
   The developer should not start TASK-6 until this is decided.

   **Decision (owner, 2026-10-13): (a).** TASK-6 is dropped from this job because
   we are not changing behaviour. The `goToToday` backlog item stays open.
2. **`week/Day.svelte` has nine `$derived`s.** `STANDARDS_BACKLOG.md` asks to
   "review against section 3" in the same item, but the brief does not list
   it, and most of them (`dragEnabled`, `dateSlug`, `isDropTargetColumn`,
   `indicatorTop`, `indicatorHeight`) are part of the drag feature, which is
   backlog 06. I have left this out; tell me if you want any of it in this job.
3. **`CalendarMarks.svelte:50,63`** have long `class={cond ? … : …}`
   ternaries and the `INACTIVE` const from rule 3.5. These are filed as a
   separate "Mechanical" item in `STANDARDS_BACKLOG.md`, and rule 3.5 is not in
   the brief's rule list, so I have left them out. They could be added as one
   small low-risk task if "remaining class-string ternaries" was meant to
   cover them.

## Bookkeeping after landing

Tick the matching items in `docs/STANDARDS_BACKLOG.md`: the three "Rewrites"
items (`MobileWeekView`, `week/Day`, `CalendarDragGhost`). Also tick the
`goToToday` item, but only if TASK-6 is done. Leave the `$derived` audit item
for `week/Day` open unless open question 2 adds it to this job.
