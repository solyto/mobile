# Verdict: check-in widget

id: cup
reviewer: @reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD` on `feature/cup_check-in-widget`. Every changed
file is covered by a task. Nothing under `frontend/` changed, and no signing,
version or F-Droid files changed. All new XML resources are well-formed, and
there are 21 option drawables.

TASK-1: PASS
notes: `WidgetPayload.ROW_ID` is `[A-Za-z0-9_-]{1,64}`. The length limit is kept.

TASK-2: PASS
notes: `options()` skips options with an unknown icon, a non-`#RRGGBB` color or a
non-int value, keeps at most 6, and drops the action when none is left.
`integer()` rejects doubles and out-of-range longs. A `null` or missing `value`
becomes `actionValue = null`. Existing `Item` callers were updated.

TASK-3: PASS
notes: The no-body path is unchanged (fixed length 0, no Content-Type). The body
path sets `Content-Type: application/json` and a fixed length, and sends
`{"value":N}` or `{"value":null}`. Status mapping is shared, so 422 maps to
`TEMPORARY_FAILURE`.

TASK-4: PASS
notes: A missing `has_value` (old enqueued work) means no body. A present
`has_value` without `value` sends an explicit null. Outcome handling is unchanged.

TASK-5: PASS
notes: The value is read as a strict `Integer` and must be one of the cached row's
options. The target is `null` when it equals `row.actionValue`, otherwise the
value. Check and button paths are unchanged.

TASK-6: PASS
notes: The 21 drawables exist and match the `iconRes` switch, which covers all 21
of `OPTION_ICONS`. The fill-level icons use the outline shape, as tasks.md
proposed. Shapes have not been checked visually (no render report exists).

TASK-7: PASS
notes: Root, row and preview layouts, the selected-highlight shape, the
`widget_selected` color for light and dark, and the provider info (4×3,
resizable, preview, description) are all present.

TASK-8: PASS
notes: The strings are in all 5 locales. `widget_check_in_option_selected` is an
addition beyond the plan, documented in implementation.md and justified for
accessibility. The translator table is provided.

TASK-9: PASS
notes: `CheckInWidgetProvider` follows `TimeTrackingWidgetProvider` for states,
header and "updated"/error line. Each recycled option view sets icon, tint,
background (0 when not selected), content description, alpha, enabled, fill-in
and visibility, and unused slots are `GONE`. The title's route fill-in is always
set (empty when there is no route). Request codes 7 and 8 don't clash with the
other widgets. The kind and manifest receiver are registered.

TASK-10: PASS (handed to human)
notes: The brief now says "Ignore testing. Human will test.", so the build and the
step 7 device checks are out of the agent's scope. implementation.md says plainly
that the code has not been compiled and lists the checks the human must run. It
does not claim a pass. Since the first verdict (b3d4888), only brief.md and
implementation.md changed; no code changed. A re-read of the Java diff found no
compile-level or logic problems. All RemoteViews reflection calls (`setColorFilter`,
`setImageAlpha`, `setBackgroundResource`, `setEnabled`) target remotable methods.

## Security

Not run. One note from this review: fill-in values from the launcher are checked
against the cached options before use (TASK-5), so untrusted extras are never
sent to the server as-is.

## Overall

APPROVED

No blockers. Per the brief, a human builds the app (`cd android && ./gradlew
assembleDebug`) and runs the step 7 manual checks before release.
