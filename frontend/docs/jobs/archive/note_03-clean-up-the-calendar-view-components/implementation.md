# Implementation: 03 Clean up the calendar view components

id: note
developer: @developer
date: 2026-10-13

## Summary

TASK-1 to TASK-5 are done. Each one is a markup or reactivity cleanup in the calendar view components, and none of them is meant to change what is rendered. TASK-6 (`goToToday()`) was dropped from scope by the owner (open question 1, option a: no behaviour changes).

**Not verified with tooling:** `node_modules` is missing in this worktree, so `npm run check`, `npm run lint`, `npm test` and the dev server (and so `shot`) could not run. The project rules forbid installing packages without asking. All changes were reviewed by reading the code only. Before merging, someone needs to run `npm ci && npm run check && npm run lint && npm test` and do the manual desktop/mobile run.

## Changes

TASK-1: `dnd/CalendarDragGhost.svelte` no longer has the `sourceDateSlug` prop or the dead `data-calendar-drag-ghost` attribute. The four-term `{#if}` is now `isGhostVisible()`, and the style walk is now `ghostStyle()`, which builds one declaration per array entry. The ghost is rendered once at the end of `week/WeekView.svelte` and `month/MonthView.svelte`. Its usage and import were removed from `week/Day.svelte` and `month/Day.svelte`. **Rework after review:** `week/Day.svelte` is also used by the desktop `day/DayView.svelte` (with drag on), so that view now renders one `<CalendarDragGhost />` at the end of its root as well. Without this, the desktop day view would have had no drag ghost. `MobileDayView` passes `isMobile`, so drag is off there and it needs no ghost. `CalendarDragState.svelte.ts` is unchanged, so `calendarDrag.sourceDateSlug` stays because the controller still sets it. The new parent is the view's root flex container, which has no transform, so `position: fixed` still positions against the viewport.

TASK-2: In `week/Day.svelte`, the root `class` now uses the array form. The hour-row `@const` and its folded ternary are replaced by a script function `isShadedHour(hour)` (`isMobile && isOffHour(hour)`) plus the `class:bg-c-neutral` and `class:dark:bg-s-dark-2` directives.

TASK-3: In `week/Day.svelte`, the all-day button and the hourly event button are now one `{#snippet eventButton(item, variantClass, top?, height?)}`. The base classes, the `opacity-40` directive, the color `style` lines, all four pointer handlers, `onclick` and `in:blur` are shared. Each caller passes its own classes as a `ClassValue`:
- all-day: `w-full`, plus `!border-l-0` when the event started before this day
- hourly: `absolute z-40 w-2/3 shadow-sm`, plus `left-0`/`right-0` (`i > 0` is the same as `i !== 0`)

`top`/`height` are applied with `style:top` / `style:height`, so the all-day button gets no `top`/`height` at all, the same as before. The `{#each}`/`{#if}` structure and keys are unchanged. One small difference: the class order in the rendered class string is different. This has no effect on the CSS.

TASK-4: In `week/MobileWeekView.svelte`, `displayedWeek` (`$state`), `prevYear`/`prevWeek` and the `$effect` are gone. They are replaced by `let week = $derived(getCalendarWeek(calendars.currentYear, calendars.currentWeek))`, the same as in `WeekView`. `onMount` now only writes `currentYear`/`currentWeek`. Day labels now use `ts.get.calendar.weekdays_short[day.weekday]` (the `getWeekdayShort` function and its cast are gone), with no trailing `.`, as before. There is one `columnWidth` const for `calc((100vw - 2rem) / 3)`, which was used three times. Both `style` attributes now have one declaration per line.

TASK-5: The hour labels in `week/MobileWeekView.svelte` and `day/MobileDayView.svelte` no longer use `@const` and a ternary. They now use `class:text-c-neutral-4` and `class:dark:text-s-dark-3` with `isOffHour(hour)` inline. In `MobileCalendarHeader.svelte`, the chevron uses the array form `class={['size-4 transition-transform', calendarsExpanded && 'rotate-180']}` instead of `class:rotate-180`. This differs from the task text because `class:` directives do not work on components (`IconChevronDown`). I checked `@lucide/svelte@0.544.0`'s `Icon.svelte`, and it passes `props.class` into a clsx array, so the array form works. Both greps from the task (`{@const`, and class-string ternaries in `src/lib/components/calendars`) now return nothing.

TASK-6: dropped (owner decision, option a). `goToToday()` uses the calendar year instead of the ISO year and also triggers extra `load*()` calls, so switching to it would change behaviour. Both week views keep their `getISODateInfo` `onMount`.

## Known issues / follow-ups

- Rework run (2026-10-13, after the DayView fix): `npm run check` reported 0 errors and 0 warnings, `eslint` on `src/lib/components/calendars` was clean, and `npm test` passed 841/841.

- Tooling run on 2026-10-13 after `npm ci` (approved by the owner): `npm run check` reported 0 errors and 0 warnings, `npm run lint` was clean, and `npm test` passed 59 files / 841 tests. The first full test run also reported one unhandled timer error, attributed to `tests/components/forms-advanced.test.ts`. That file passes on its own, and the error did not show up in the next full run, so it looks flaky. This branch does not touch any form code.
- The manual run is **still open**: the API at `localhost:8000` is not reachable in this environment, so the authenticated calendar views cannot be opened (and `shot` cannot render them). The owner needs to check: week, month **and day** view on desktop, including that the drag ghost follows the pointer above all columns in each of them; week view (first open and after moving between weeks) and day view on mobile.
- TASK-6 dropped by the owner (open question 1, option a). The `goToToday` backlog item stays open for a separate job, which would also cover the ISO-year bug in `goToToday()`. Open questions 2 (`$derived` audit in `week/Day`) and 3 (`CalendarMarks` ternaries) were left out of scope, as `tasks.md` says.
- I did not tick the "Bookkeeping after landing" items in `docs/STANDARDS_BACKLOG.md` (the three "Rewrites" items). Leave the `goToToday` item open.
- `.mcp.json` has an uncommitted change that was already there when the session started (the environment's MCP config). I left it alone and did not commit it.
