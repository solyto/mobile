# Verdict: 02 Extract the duplicated calendar helpers

id: share
reviewer: @reviewer
date: 2026-10-13

Reviewed on branch `feature/share_02-extract-the-duplicated-calendar-helpers` against `main...HEAD` (base from `.manigot/manigot.json`).
Gates re-run by the reviewer: `npm test` 57 files / 807 tests passing, `npm run check` 0 errors / 0 warnings, `npm run lint` clean.
Leftover-copy grep over `src/`: no `25%, var(--color-c-bg-elevated)`, `< 6 ||` or `length: 24` remains outside the helpers. `visualViewport` appears only in `Viewpoint.svelte.ts`. `parseDateSlug` is defined only in `DateHelper` and is imported from there at its two call sites. The `?? 'var(--color-c-neutral-2)'` fallbacks that are left belong to contacts/tags and are outside this job.

## Review

TASK-1: PASS
notes: `ColorHelper.getEventBorderColor` / `getEventBackgroundColor` return exactly what the old expressions returned (`??` for the border, truthy check for the background). The tests cover null, undefined and `''`.

TASK-2: PASS
notes: The five renderers are switched over. The `item.is_all_day` gate stays at the call site in `month/Entry` and `list/Day` (`is_all_day ? getEventBackgroundColor(c) : ''` is equivalent to the old `c && is_all_day ? mix : ''`). Some `style` attributes were reflowed onto several lines. This is formatting only, and the CSS values are unchanged.

TASK-3: PASS
notes: The `hidden`/no-colour branches in `NavigationEntry` are unchanged, and only the last return line in each function now calls a helper.

TASK-4: PASS
notes: `getHoursOfDay()` is tested against the old array expression. `isOffHour` is typed `(hour: string)`, while implementation.md says `string | number`. Every caller passes the string from the hours array, so no casts are needed and this still fits the task.

TASK-5: PASS
notes: The five views are switched over, and the `isMobile &&` gate in `week/Day` is kept.

TASK-6: PASS
notes: `TimePicker.hourOptions = getHoursOfDay()`.

TASK-7: PASS
notes: `eachDayBetween` matches the old loop (increment, then push, while `current < end`), returns plain `Date`s and does not mutate `start`. The tests pin the inclusive end-day boundary, a non-midnight end, month/year crossing and empty ranges.

TASK-8: PASS
notes: The `is_all_day && > 1440` guard and the start-day push are unchanged. `Calendars.test.ts` now also asserts that the day after the end stays empty. `SvelteDate` is still imported, because the rest of the store uses it.

TASK-9: PASS
notes: The function body was moved unchanged, the docblock is next to `formatDate`, and the now-unused `SvelteDate` import was removed from `CalendarDragState`. The round-trip and invalid-input tests are present.

TASK-10: PASS
notes: There is one `visualViewport` resize+scroll listener in `initialize()`. It only runs in the browser, is guarded for a missing `visualViewport`, is cleaned up via `cleanup` in `destroy()`, and uses `> 60` as the threshold. The tests cover the threshold edge (60 → 0, 61 → 61), scroll, the keyboard closing, destroy and a missing viewport.

TASK-11: PASS
notes: Both modals now read `getViewPoint().keyboardHeight`, and their `onMount`/`keyboardPadding` state is gone. The output string is the same as before (`${n}px` or `''`).

TASK-12: PASS
notes: The `viewPoint.isMobile` gate is kept, and only the viewport part of `onMount`/`onDestroy` is removed. The editor lifecycle is unchanged. The `isMobile` gate is now reactive instead of being read once at mount. implementation.md mentions this, and it does not change the visual output.

TASK-13: PASS
notes: The reviewer independently confirmed all three gates and the grep (see above).

## Security

none (not run)

## Overall

APPROVED

Nothing blocks the merge. The diff only touches the files listed in tasks.md and the job docs. `/workspace/.mcp.json` is modified locally but not committed, and it is not part of the branch diff.
