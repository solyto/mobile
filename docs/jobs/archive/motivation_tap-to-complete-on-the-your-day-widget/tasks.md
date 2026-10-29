# Tasks: tap-to-complete on the "Your Day" widget

id: motivation
analyst: @analyst
date: 2026-10-29

<!-- Produced by @analyst from brief.md. -->

## Context

The read-only foundation (job 5) is already on this branch under
`android/app/src/main/java/app/solyto/widget/`: `YourDayWidgetProvider`
(render), `YourDayPayload` (parse), `WidgetApi` (HTTP), `WidgetFetchWorker`
+ `WidgetWork` (WorkManager, `work-runtime` 2.11.2), `WidgetCache`,
`WidgetTokenStore`. All work here is Android-native. Nothing in `frontend/`
or `patch/` changes, and no new dependencies are needed.

## Open questions / risks to resolve first

1. **One click template per collection (affects TASK-4).** The list has a
   single `setPendingIntentTemplate`. Today it is an **activity**
   `PendingIntent` to `MainActivity` (row tap → route). Every fill-in in a
   row, the checkbox included, merges into that same template. That holds for
   `RemoteResponse.fromFillInIntent` on API 31+ as well. So a checkbox tap
   cannot reach a broadcast receiver unless the template changes. The obvious
   fix is a **broadcast** template to a new non-exported receiver that
   handles checks itself and forwards route taps to `MainActivity`. But
   starting an activity from a receiver is a background activity launch, and
   this app targets SDK 36, where a `PendingIntent` creator no longer grants
   BAL implicitly. Row taps that open the app could then break on API 34/35+.
   The developer must verify this on API 24, 31 and 35+ before building on it.
   If the trampoline is blocked, stop and report back rather than invent a
   different design.
2. **Expedited work below API 31.** On API < 31, WorkManager runs expedited
   work as a foreground service. The worker must then provide
   `getForegroundInfo()`, which needs a notification, a channel and a string.
   Otherwise it fails at runtime. The brief asks for "expedited". If that would
   mean adding a notification and its strings, flag it in implementation.md as
   an addition beyond the brief's string list.
3. **Id format.** The brief says to "validate the id" but gives no format, and
   the contract example is a todo UUID. The assumption is
   `[A-Za-z0-9-]{1,64}`, path-segment safe and covering UUIDs. Write it down in
   implementation.md.

## Task breakdown

TASK-1: Parse the optional row `action: { type, key, checked? }` and the row `id` in `YourDayPayload`. Keep the action only when `type` is a known UI type (`check`), `key` matches `[a-z][a-z0-9_.-]*` (length-capped like `MainActivity.ROUTE_KEY`) and the row id is valid; otherwise the row has no action.
  files: android/app/src/main/java/app/solyto/widget/YourDayPayload.java
  depends: none
  risk: low. The parse is additive, and unknown types already fall through to "no control".

TASK-2: Add `WidgetApi.postAction(context, apiUrl, token, key, id)`. It sends `POST /api/v1/widgets/actions/{key}/{id}` with the same headers, redirects off and no body. It re-validates key/id and maps 200→OK, 401→UNAUTHORIZED, 403/404→NOT_FOUND, 426→UPGRADE_REQUIRED, and everything else or an exception→TEMPORARY_FAILURE. Share the connection setup with `fetchYourDay` instead of duplicating it.
  files: android/app/src/main/java/app/solyto/widget/WidgetApi.java
  depends: none
  risk: low. The pattern already exists. Path segments must come only from validated values and never be logged.

TASK-3: Add per-row interaction state to `WidgetCache`: the set of row ids with a call in flight (shown as done), a row-error state (reverted row + a short error flag, cleared by the next successful fetch or tap), and clear both in `clear()`/`saveData()`.
  files: android/app/src/main/java/app/solyto/widget/WidgetCache.java
  depends: none
  risk: medium. Stale "pending" entries (process death mid-call) must not stick forever. Tie them to the next fetch or to a timestamp.

TASK-4: Add an explicit, non-exported `WidgetActionReceiver` (manifest entry) and switch the list's click template to it. Validate the fill-in extras (type/key/id format, plus `id` present in the current cached payload with that action). Ignore the tap if the row is already pending. Otherwise mark it pending, re-render, and enqueue the action work. Forward route taps to `MainActivity` with the existing extras. See open question 1.
  files: android/app/src/main/java/app/solyto/widget/WidgetActionReceiver.java (new), android/app/src/main/java/app/solyto/widget/YourDayWidgetProvider.java, android/app/src/main/AndroidManifest.xml
  depends: TASK-1, TASK-3, TASK-5
  risk: high. Changing the template can break the existing row-tap → open-route path (BAL restrictions at targetSdk 36). It is also a manifest change, which needs a reviewer flag.

TASK-5: Add `WidgetActionWorker` plus a `WidgetWork.runAction(context, key, id)`. Run it as unique work per row id (`KEEP`, so repeated taps are no-ops) and expedited with `RUN_AS_NON_EXPEDITED_WORK_REQUEST`, with only key and id as input data. The worker reads the token and URL from `WidgetTokenStore` and calls `postAction`. It applies the brief's table: OK/404 → clear pending + `fetchNow`; 401 → `clearIfCurrent` + `WidgetCache.clear`; 426 → revert + `UPDATE_APP`; temporary → revert + error state, no retry. It then re-renders. Cancel action work in `cancelAll`. See open question 2.
  files: android/app/src/main/java/app/solyto/widget/WidgetActionWorker.java (new), android/app/src/main/java/app/solyto/widget/WidgetWork.java
  depends: TASK-2, TASK-3
  risk: medium. Expedited work below API 31 needs foreground info, and a token swap during the call must be handled like `WidgetFetchWorker` does.

TASK-6: Add the checkbox to the row. Use a `layout-v31` row with a `CheckBox` set via `setCompoundButtonChecked` + `setOnCheckedChangeResponse(RemoteResponse.fromFillInIntent(...))`, and keep an `ImageView` checkbox icon (new unchecked/checked vector drawables) with a click fill-in on 24–30. Render checked when the server says `checked` or the row is pending, and keep pending rows non-interactive. Show the control only for rows with a known action, and set the content description.
  files: android/app/src/main/res/layout/widget_your_day_row.xml, android/app/src/main/res/layout-v31/widget_your_day_row.xml (new), android/app/src/main/res/drawable/ic_widget_check*.xml (new), android/app/src/main/java/app/solyto/widget/YourDayWidgetProvider.java
  depends: TASK-1, TASK-3, TASK-4
  risk: medium. The launcher toggles a `CheckBox` locally on API 31+, so a reverted row must be re-rendered explicitly to undo it. Behaviour must match on both API ranges.

TASK-7: Render the short action error state on the widget (for example, reuse `widget_updated` or add a small line). Clear it on the next successful fetch.
  files: android/app/src/main/java/app/solyto/widget/YourDayWidgetProvider.java, android/app/src/main/res/layout/widget_your_day.xml
  depends: TASK-3, TASK-5
  risk: low. Display only, following the "less text" policy.

TASK-8: Add strings for the action error text and the checkbox content description (plus the notification text if open question 2 requires it) in `values`, `values-de`, `values-fr`, `values-es` and `values-it`.
  files: android/app/src/main/res/values/strings.xml, android/app/src/main/res/values-{de,fr,es,it}/strings.xml
  depends: none
  risk: low. Only the translation quality needs care.

TASK-9: Build (`cd android && ./gradlew assembleDebug`) and record the brief's manual checks (step 6) in implementation.md as done or not done. Include the row-tap → open-route regression on API 24, 31 and 35+.
  files: docs/jobs/motivation_tap-to-complete-on-the-your-day-widget/implementation.md
  depends: TASK-1 to TASK-8
  risk: medium. There is no Android test tooling in CI, so correctness rests on the manual checks.

## Out of scope (from brief)

Uncomplete, an offline retry queue, actions on other rows or widgets.
