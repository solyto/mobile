# Verdict: calendar drag'n'drop

id: soil
status: open
reviewer:
date: 2026-08-28

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

Re-reviewed `git diff main...HEAD` on branch `feature/soil_calendar-drag-n-drop` (baseBranch `main` per `.manigot/manigot.json`) after the two follow-up commits `cf86337` (fix) and `f07a640` (docs). All changed files were read in full; no changes outside the task list were found. The previous review's single blocker — week/day drops onto adjacent-month days losing the moved event — is verified FIXED: `computeTarget` in `views/week/Day.svelte:96-101` now rejects any target whose year/month differs from `calendars.currentYear`/`currentMonth` (1-based), before the all-day shortcut, so both timed and all-day drops on adjacent-month days return null (no indicator, no drop, no data loss). This mirrors the month view's grayed-out-day rejection and is consistent with the out-of-scope "cross-month navigation while dragging". The `currentMonth` 1-based comparison is correct (`getMonth()+1` vs constructor's `today.getMonth()+1`), and normal same-month week/day drops are unaffected. No new blockers found.

Note on verification: this session's git shim only permits git commands and `node_modules` is absent, so I could not re-run `npm run check` / `npm test` / `npm run build` or the Playwright checks. The developer's reported results (0 check errors, 708 tests passing with 1 pre-existing `logic-leaves.test.ts` failure, build success, 21/21 stub-backend Playwright checks) are plausible and consistent with the code, but unverified here. No `screenshots/render-report.md` in the job dir.

TASK-1: PASS
notes: Decision recorded in implementation.md (custom pointer-events drag; 15-min snapping; ghost follows pointer; all-day date-only; grayed-out-day rejection; recurring via RecurrenceActionModal). Sound choice: svelte-dnd-action is list-reordering oriented and doesn't fit an absolutely-positioned time grid; native HTML5 DnD can't satisfy the "ghost follows pointer + live indicator" requirement. Implementation matches the recorded decision.

TASK-2: PASS
notes: `src/lib/services/CalendarDragService.ts` — `snapToMinutes` (15-min default), `buildMoveRequest` preserves duration/all-day/recurrence semantics and returns null for no-op drops. Request contract matches EventEdit exactly (`formatFloatingDate`, etag, is_all_day, recurrence fields). `tests/unit/services/CalendarDragService.test.ts` (12 tests) covers timed/all-day/no-op/midnight-crossing/no-end-date/recurring cases.

TASK-3: PASS
notes: `Calendars.svelte.ts` — `moveEvent` / `applyEventMove` / `resolvePendingMove` / `cancelPendingMove` / `pendingMove` state mirror the EventEdit etag/`formatFloatingDate`/`original_start_date` contract; recurring occurrences are deferred to the modal, series master (original_start_date null) updates directly — same `isRecurring()` semantics as EventEdit. 8 store tests cover the flow incl. failure, no-op, occurrence and series paths.

TASK-4: PASS
notes: `views/week/Day.svelte` + `views/dnd/CalendarDragState.svelte.ts` + `CalendarDragGhost.svelte` implement pointer-driven drag with 5px threshold, pointer capture, rAF-throttled moves, flush-on-pointerup, click suppression (browser's compatibility click fires synchronously after pointerup, before the `setTimeout(0)` reset), source dimming, drop indicator, and the `!fixedHeight` gate (verified: WeekView/DayView omit `fixedHeight`, MobileWeekView/MobileDayView pass it). Drop mapping is pixel-accurate to the rendered grid: `h-3/30` header + 24 × `h-1/27` rows ⇒ `hourHeight = rect.height * (1/27)` matches the real rows (total ≈ 98.9% of the column, remainder is inert flex space). The previous adjacent-month blocker is fixed as described above.

TASK-5: PASS
notes: `views/month/Entry.svelte` (drag source) + `views/month/Day.svelte` (drop zones) — date-only moves keep the timed event's time of day; grayed-out (adjacent-month) cells rejected via `data-grayed`; hidden-calendar filtering and click-to-edit preserved; desktop-only gating holds because `MobileMonthView` is a separate component that does not use `Entry`.

TASK-6: PASS
notes: `RecurrenceActionModal` gained `'move'` (new `recurring_move_question`); `routes/calendar/+page.svelte` renders it off `calendars.pendingMove`, resolving this-occurrence via `updateOccurrence(original_start_date)` and all-occurrences via `updateEvent` — the same contract EventEdit uses. Escape/cancel clears `pendingMove`. Edge case (edit-sidebar modal and move modal both z-70 overlays could overlap) is minor and hard to hit.

TASK-7: PASS
notes: `calendar.entry_move_error` + `calendar.recurring_move_question` added to en/de/es/fr and `CalendarRecords` in `translation.ts`. All four languages in sync.

TASK-8: PARTIAL
notes: Reported: `npm ci` (no new packages), `npm run check` 0 errors, `npm test` 708 passed (1 pre-existing `logic-leaves.test.ts` failure), `npm run build` success, 21/21 Playwright checks against a throwaway stub backend (real backend unavailable). Could not be independently reproduced in this session (git-only shim; no node_modules). Stub-backend e2e validates PUT payloads and flows but not real backend semantics; the previous review already caught one client-side reload issue that the stub e2e missed, so the same caveat applies to the remainder. No render report/screenshots exist in the job dir.

## Security

none — no tokens/secrets touched; the change is client-side DOM/API logic reusing the existing authed `ApiService` (Bearer token, etag-conflict handling preserved).

## Overall

APPROVED

Non-blocking notes (not required for merge):
- Tablets render the `Mobile*View` components (pre-existing `CalendarView` gating), so tablets get no DnD despite the "desktop/tablet" wording in tasks.md — the fixedHeight/mobile-component gating follows the explicit "mobile views are a follow-up" clause and the TASK-4 gate instruction, but the tasks.md wording is internally inconsistent.
- Timed event dropped on the all-day header area snaps to 00:00 (indicator shows it consistently, but surprising).
- Long late-night timed drops (e.g. 23:00 + 4h) render the indicator past the column bottom (top+height > 100%); pre-existing `getHeight`/`getTop` placement math is untouched (documented out of scope).
- `commitMove`/`resolvePendingMove` don't guard against thrown fetch errors — the loading indicator could stay on with no error toast (matches the pre-existing EventEdit pattern).
- Day view navigated into an unloaded month (currentMonth not updated by nextDay/lastDay — pre-existing) shows only stale/multi-day-span events, and drops there are rejected; niche, consistent with the loaded-month rule.
- All-day event with a missing `end_date` would produce an `end_date` of 01:00 with `is_all_day: true` (EventEdit contract keeps all-day ends at 00:00); niche, only reachable with malformed backend data.
- Multi-day all-day events: dragging the middle/end-day copy to that same visible day moves the whole event (start-shift), not a no-op — arguably intended.
- Verification evidence for TASK-8 could not be reproduced in this review session.
- The uncommitted `M AGENTS.md` in the worktree is the read-only manigot mount artifact, not part of this job.