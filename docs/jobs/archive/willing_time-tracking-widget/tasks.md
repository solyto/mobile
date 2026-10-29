# Tasks: time tracking widget

id: willing
analyst: @analyst
date: 2026-10-29

<!-- Produced by @analyst from brief.md. -->

## Preconditions checked

- `frontend/src/lib/state/WidgetBridge.ts` handles `time_tracking` and
  `time_tracking_project` (lines 148–151). Prerequisite met; do not run `vendor.sh`.
- Branch: the worktree's gitdir is `worktrees/willing_time-tracking-widget`,
  which matches `feature/willing_time-tracking-widget`. I couldn't run
  `git branch --show-current` in this session, so the developer should check it.
- The multi-kind foundation is already in place: `WidgetKind` enum, per-kind
  `WidgetCache`, a `WidgetFetchWorker` that loops over every placed kind, and
  `WidgetActionReceiver`/`WidgetActionWorker`, which carry the kind.
  `MainActivity` passes any well-formed route key through to the bridge, so it
  needs no change for the new route keys.
- No `frontend/` edits are needed. All work is in `android/`.

## Task breakdown

TASK-1: Extend `WidgetPayload` to parse the new optional fields: action type
`button` with `icon` (`play`|`stop`, anything else → no action), row `live`
(`elapsed`), row `at` (via `IsoTime.parse`, epoch millis or -1), row `color`
(strict `#RRGGBB` → ARGB int, else "none"), and row icon `timer`. Keep
`schema_version` 1. Add `ACTION_BUTTON`, and make sure `findAction` works for
button rows.
  files: android/app/src/main/java/app/solyto/widget/WidgetPayload.java
  depends: none
  risk: medium. The parser is shared with Your Day. The `Item` constructor
  grows, so every call site (section headers) must be updated, and malformed
  values must still be dropped silently.

TASK-2: Keep Your Day rendering unchanged once button actions exist. In
`YourDayWidgetProvider.itemView`, bind the checkbox only when
`actionType == ACTION_CHECK`. Otherwise a `button` row would get a checkbox.
Ignore `live`, `color` and the `timer` icon there.
  files: android/app/src/main/java/app/solyto/widget/YourDayWidgetProvider.java
  depends: TASK-1
  risk: low. It is a one-line guard. Flagged because the brief lists "changes
  to Your Day" as out of scope, but this guard is needed to keep Your Day's
  behavior the same.

TASK-3: Let `WidgetActionReceiver.runAction` accept `button` actions as well as
`check`. The `actionChecked` "already done" short-circuit should apply only to
`check`. A busy button row is already rejected by `WidgetCache.startAction`.
`WidgetActionWorker` needs no change: it posts `{key}/{id}` and applies the same
status contract.
  files: android/app/src/main/java/app/solyto/widget/WidgetActionReceiver.java
  depends: TASK-1
  risk: medium. This is the untrusted fill-in path. Keep the existing
  validation (`isValidActionKey`, `isValidRowId`, row must exist in the cached
  payload with this exact type/key/id, state OK).

TASK-4: Register `TIME_TRACKING("time-tracking", TimeTrackingWidgetProvider.class,
TimeTrackingWidgetProvider::updateAll, "running", "projects")` in `WidgetKind`.
  files: android/app/src/main/java/app/solyto/widget/WidgetKind.java
  depends: TASK-6 (the provider class must exist to compile; do them in one commit)
  risk: low. Fetch, cache keys, clear and cancel already iterate over `values()`.

TASK-5: Add drawables and colors: `ic_widget_play`, `ic_widget_stop`,
`ic_widget_timer` (our own vectors), a small round color-dot shape (tinted at
runtime), a highlight background for the running row, and any new light/dark
colors in `values/colors.xml` + `values-night/colors.xml`.
  files: android/app/src/main/res/drawable/ic_widget_play.xml (new),
    ic_widget_stop.xml (new), ic_widget_timer.xml (new),
    widget_color_dot.xml (new), widget_running_background.xml (new),
    android/app/src/main/res/values/colors.xml,
    android/app/src/main/res/values-night/colors.xml
  depends: none
  risk: low. Resources only.

TASK-6: Add `TimeTrackingWidgetProvider` and its layouts, modeled on
`YourDayWidgetProvider`.
- Main layout: header with `labels.title` (fallback: the picker name) and
  "updated at". Tapping the header or the message opens the app.
- List: `RemoteCollectionItems` with section and row view types.
- Row layout: color dot (`color`, else `widget_accent`), title, optional
  subtitle, a `Chronometer` that is visible only for `live == "elapsed"` rows
  with a valid `at`, and a right-hand `ImageView` button (play/stop).
- Chronometer: `setChronometer(id, SystemClock.elapsedRealtime() - (now - at), null, true)`.
- Running row: highlight background.
- Busy row (`WidgetCache.isActionActive`): button disabled/dimmed and still
  given a fill-in (the receiver ignores it).
- Row tap: route fill-in, as in Your Day.
- Same state/message logic as Your Day: loading, signed out, unsupported
  server, update app, load failed, outdated, action error, device unsupported.
  `labels.empty` shows when there are no rows.
- Always set visibility, image and enabled state explicitly, because list
  views are recycled.
- Use distinct PendingIntent request codes from Your Day's (1, 2), so the two
  kinds' templates and header intents don't overwrite each other.
  files: android/app/src/main/java/app/solyto/widget/TimeTrackingWidgetProvider.java (new),
    android/app/src/main/res/layout/widget_time_tracking.xml (new),
    widget_time_tracking_row.xml (new), widget_time_tracking_preview.xml (new);
    the section layout `widget_your_day_section.xml` can be reused as-is
  depends: TASK-1, TASK-3, TASK-5
  risk: high. This is the largest piece. `Chronometer` in collection items and
  `setEnabled`/`setAlpha` on RemoteViews need checking on API 24 and on 34+.
  The chronometer base is computed from `elapsedRealtime` at render time, so
  after a reboot it is only right once the widget re-renders.

TASK-7: Add the `appwidget-provider` XML (`time_tracking_widget_info.xml`): a
description, the preview layout plus a `previewImage` fallback drawable, a
resizable widget, and a default 3×2 size (`targetCellWidth`/`Height`, matching
`minWidth`/`minHeight`). Register the receiver in `AndroidManifest.xml`
(`exported="false"`, `APPWIDGET_UPDATE`, label from strings).
  files: android/app/src/main/res/xml/time_tracking_widget_info.xml (new),
    android/app/src/main/res/drawable/widget_time_tracking_preview.xml (new, or
    reuse widget_preview.xml — developer's call),
    android/app/src/main/AndroidManifest.xml
  depends: TASK-6
  risk: low. It follows the Your Day setup exactly.

TASK-8: Add strings in `values` and `values-de/fr/es/it`:
`widget_time_tracking_name`, `widget_time_tracking_description`,
`widget_action_start` and `widget_action_stop` (button content descriptions).
Reuse the existing state strings. Mark the new strings for the translator, the
same way earlier widget strings were handled.
  files: android/app/src/main/res/values/strings.xml,
    values-de/strings.xml, values-fr/strings.xml, values-es/strings.xml,
    values-it/strings.xml
  depends: none
  risk: low. Note that the existing `widget_action_failed` ("Couldn't
  complete") is worded for todos. Check whether it still reads right for
  start/stop, or whether a separate string is wanted (see open questions).

TASK-9: Build and verify. Run `cd android && ./gradlew assembleDebug` (plus
lint if available), then do the manual checks from brief step 7 and record the
results in implementation.md.
  files: docs/jobs/willing_time-tracking-widget/implementation.md
  depends: TASK-1..TASK-8
  risk: medium. Most of the checks need a device or emulator, which this
  pipeline may not have. Any check that wasn't run must be listed as not
  verified.

## Open questions / notes

- **Error string:** brief step 4 says "short error state", which matches the
  existing `widget_action_failed` "Couldn't complete". Should start/stop reuse
  it, or get its own wording? The default assumption is to reuse it.
- **Unit tests:** the Android module has only the template `ExampleUnitTest`.
  `WidgetPayload` uses `org.json`, which is stubbed in local JVM tests, so
  testing it would need Robolectric or an `org.json` test dependency. That is a
  new dependency and needs approval. It is not planned here.
- **"Widget follows within seconds":** this relies on the existing
  `refresh` → `WidgetWork.fetchNow` path, which re-fetches every placed kind.
  No new code is expected; it just needs verifying.
