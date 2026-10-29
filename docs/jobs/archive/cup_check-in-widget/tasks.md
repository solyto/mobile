# Tasks: check-in widget

id: cup
analyst: @analyst
date: 2026-10-29

## Pre-checks (done)

- Branch: worktree HEAD is `feature/cup_check-in-widget`, matching `brief.md`.
- Prerequisite: `frontend/src/lib/state/WidgetBridge.ts` handles `check_in`
  (line 148). Do not run `scripts/vendor.sh`, and do not edit `frontend/`.
- Already in place, no task needed:
  - Midnight reset: `WidgetFetchWorker` schedules a fetch per kind at
    `refresh_at` through `WidgetWork.fetchAt`.
  - 422 handling: `WidgetApi.outcome()` maps any status other than 401/426 to
    `TEMPORARY_FAILURE`, and the worker reverts that with the error state.
    Keep it that way, and check that the new body path goes through the same
    mapping.
  - Row limit: `MAX_ROWS_PER_SECTION = 20` is at least 12.
  - Route validation: `MainActivity.ROUTE_KEY` accepts `check_in`.

## Task breakdown

TASK-1: Widen `WidgetPayload.ROW_ID` to `[A-Za-z0-9_-]{1,64}` so tracker keys like `food_quality` are valid row ids.
  files: android/app/src/main/java/app/solyto/widget/WidgetPayload.java
  depends: none
  risk: low. `_` is safe in a URL path segment, and the same check guards `WidgetApi.postAction`, the receiver and the worker, so all three widen together.

TASK-2: Parse `scale` actions in `WidgetPayload`. Add `ACTION_SCALE = "scale"`. Add Item fields for the current value (nullable) and a list of options (`value`, `icon`, color as ARGB). Accept only the 21 known option icons (`mood_1`…`mood_5`, the six `sport_*`, and `sleep`, `dreams`, `food_quality`, `food_amount`, `water`, `work`, `menstruation`, `alcohol`, `smoking`, `social_life`). Skip options with an unknown icon, an invalid `#RRGGBB` color or a non-integer value. Keep at most 6 options. Drop the action when none is valid. Add a lookup helper the receiver can use to check that a value is one of a row's options.
  files: android/app/src/main/java/app/solyto/widget/WidgetPayload.java
  depends: TASK-1
  risk: medium. The `Item` constructor grows and has existing callers (`addSection` header, `parseRow`), and the brief only shows integer option values, so the integer-only assumption should be confirmed against the API job.

TASK-3: Add an overload of `WidgetApi.postAction` that takes an optional target value. When it gets one, it sends `Content-Type: application/json` and the body `{"value": <int>}` or `{"value": null}` (explicit null for clear, never a toggle). The existing no-body path stays byte-for-byte the same (fixed length 0, no Content-Type). Status mapping stays the same (200 OK, 403/404 NOT_FOUND, 401, 426, everything else including 422 TEMPORARY_FAILURE).
  files: android/app/src/main/java/app/solyto/widget/WidgetApi.java
  depends: none
  risk: low. A small, self-contained HTTP change, as long as the no-body path keeps behaving exactly as before.

TASK-4: Carry the target value through `WidgetWork.runAction` into `WidgetActionWorker` input data. `Data` can't hold a null int, so use an explicit "has body" flag plus "value or null". The worker calls the TASK-3 overload when the flag is set and keeps today's no-body call otherwise, including for work enqueued by older builds. Outcome handling stays the same: 200/404 finish and re-fetch; 401 clears; 426 reverts and shows "update app"; everything else reverts with the error state.
  files: android/app/src/main/java/app/solyto/widget/WidgetWork.java, android/app/src/main/java/app/solyto/widget/WidgetActionWorker.java
  depends: TASK-3
  risk: medium. WorkManager input persists across app updates, so a missing flag must mean "no body". The unique-work KEEP per row means a second tap during a running call is dropped, which is the intended "ignores taps".

TASK-5: Accept `scale` taps in `WidgetActionReceiver`. Read a new int extra, `EXTRA_ACTION_VALUE`; reject the tap when it is missing. Find the row in the cached payload with `findAction("scale", key, id)` and check that the value is one of its options. Compute the target: `null` when it equals the row's current `value`, else the value. Then call `startAction`, render and `WidgetWork.runAction` with the target. Check and button actions stay unchanged and still send no value.
  files: android/app/src/main/java/app/solyto/widget/WidgetActionReceiver.java
  depends: TASK-2, TASK-4
  risk: medium. Fill-in extras come from the launcher and are untrusted, so the value must be checked against the cached options and never passed through as-is.

TASK-6: Add vector drawables for the 21 option icons, matching the icons in `frontend/src/lib/components/check-in/daily/DailyCheckInIcon.svelte`. Lucide: angry, frown, meh, smile, laugh, dumbbell, bike, mountain, footprints, waves-ladder, bed-single, sparkles, apple, briefcase-business, wine, cigarette, users-round. Custom: `IconYoga`, `IconWater`, `IconPlate`, `IconDropletFill` in `frontend/src/lib/components/ui/icons/`. Each drawable is a single color, tinted at runtime. Follow the style of the existing `ic_widget_*.xml`.
  files: android/app/src/main/res/drawable/ic_widget_checkin_*.xml (new, 21 files)
  depends: none
  risk: medium. Lucide is not installed in `frontend/node_modules`, so the path data has to come from Lucide's published SVGs (no new dependency). Water, food amount and menstruation are fill-level icons in the app, and the brief excludes fill levels without saying which single shape to use. Proposed: the outline or unfilled shape.

TASK-7: Add the check-in layouts and resources: the widget root (header with title and "updated at", a list, and a message, like `widget_time_tracking.xml`); a row layout with the tracker name and 6 option `ImageView` slots; a highlight background drawable for the selected option; colors in `values` and `values-night` where needed; a preview layout and preview drawable; and `xml/check_in_widget_info.xml` (about 4×3: `targetCellWidth=4`, `targetCellHeight=3`, resizable, description, previews).
  files: android/app/src/main/res/layout/widget_check_in.xml, widget_check_in_row.xml, widget_check_in_preview.xml; res/drawable/widget_check_in_option_selected.xml, widget_check_in_preview.xml; res/xml/check_in_widget_info.xml; res/values/colors.xml, res/values-night/colors.xml (only if new colors are needed)
  depends: TASK-6 (the preview uses the icons)
  risk: low. Resource-only, and it follows the existing time-tracking layouts.

TASK-8: Add the strings in `values` and `values-de/fr/es/it`: `widget_check_in_name`, `widget_check_in_description`, and an option content description such as `widget_check_in_option` = "%1$s: %2$d of %3$d". Reuse `widget_action_failed` (or `widget_time_tracking_failed`) for the short error state instead of adding a new string. List the new strings for the translator in `implementation.md`.
  files: android/app/src/main/res/values/strings.xml, values-de/strings.xml, values-fr/strings.xml, values-es/strings.xml, values-it/strings.xml
  depends: none
  risk: low. Additive strings only.

TASK-9: Implement `CheckInWidgetProvider`, modeled on `TimeTrackingWidgetProvider`, and register the `CHECK_IN("check-in", CheckInWidgetProvider.class, CheckInWidgetProvider::updateAll, "today")` kind and the manifest `<receiver>`.
  - The header opens the app. Same states as the other widgets: signed out, unsupported server, update app, not supported, loading, load failed, and `labels.empty`. No section header row.
  - Each list row: the name with a route fill-in (`check_in`), and up to 6 option buttons. Each button shows its icon tinted with the option color (`setColorFilter`), the highlight background when `option.value == row.value`, a content description, and a fill-in carrying kind/type/key/id/value. Unused slots are `GONE`.
  - A row with an active action is dimmed and its buttons disabled. The error state shows in the "updated" line, like time tracking.
  - Every view state is set explicitly on every row, because rows are recycled.
  - Use new PendingIntent request codes (e.g. 7 for the header, 8 for the row template) so they don't clash with Your Day (1–2) or time tracking (3–6).
  files: android/app/src/main/java/app/solyto/widget/CheckInWidgetProvider.java (new), android/app/src/main/java/app/solyto/widget/WidgetKind.java, android/app/src/main/AndroidManifest.xml
  depends: TASK-2, TASK-5, TASK-7, TASK-8
  risk: medium. This is the largest piece of UI code. Recycled list rows with 6 tappable sub-views each, and per-option fill-ins, are easy to get subtly wrong (stale highlight or tint, wrong value on a recycled row). Registering the kind also makes `WidgetFetchWorker` fetch the new endpoint, so on a server without it the widget gets 404, which is a global `UNSUPPORTED_SERVER` (same as the existing kinds' behavior, only while a check-in widget is placed).

TASK-10: Build and run the manual checks from brief step 7. Run `cd android && ./gradlew assembleDebug` (no signing material). Then: set mood, change it, tap it again (clears); pick a sport; check in in the app (the widget follows); change enabled trackers in the app (rows follow); move the clock past midnight (empty day); airplane mode while tapping (revert + error); logout; API 24 and 34+; light and dark; next to the other two widgets. Record the results in `implementation.md`.
  files: docs/jobs/cup_check-in-widget/implementation.md
  depends: TASK-9
  risk: medium. There are no real Android unit tests (only the Capacitor example tests, and `org.json` is stubbed on the plain JVM), so device or emulator checks are the only verification. If no emulator is available, say so in `implementation.md` rather than claiming a pass.

## Open points (not blocking; decide during implementation or confirm with the API job)

- Option `value` type: the brief only shows integers. The plan assumes integers (TASK-2/4/5).
- Icon shape for fill-level trackers (water, food amount, menstruation): TASK-6 proposes the outline shape.
- Error string: TASK-8 proposes reusing an existing string instead of adding a new one.
- The first `WidgetActionReceiver` comment ("On API 31+ the launcher already toggled the CheckBox…") triggers `updateAll` whenever `runAction` returns false. That is harmless for scale taps, so leave it.
