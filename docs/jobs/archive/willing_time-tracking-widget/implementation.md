## Summary

A second home-screen widget, **time tracking**. It is registered as the
`time-tracking` kind. It shows the running timer (highlighted row, a live
`Chronometer`, a stop button) and the projects, each with a start button. It
reuses the existing fetch, cache, action and route plumbing. Prerequisite
confirmed: `frontend/src/lib/state/WidgetBridge.ts` handles `time_tracking` and
`time_tracking_project`. No `frontend/` edits were made, and `vendor.sh` was not
run.

**Not built or device-tested.** This environment has no JDK and no Android SDK,
so neither `./gradlew assembleDebug` nor lint could run. The XML files were
checked only for well-formedness. Someone needs to build and run the manual
checks from brief step 7 before merging.

## Changes

TASK-1: `WidgetPayload.java` now reads row `live` (`elapsed`), `at` (via
`IsoTime.parse`, -1 if invalid), `color` (strict `#RRGGBB` → opaque ARGB,
otherwise `NO_COLOR`), row icon `timer`, and action type `button` with `icon`
`play`|`stop`. Any other icon means the row gets no action. The `Item`
constructor and the section-header call site were updated. `findAction` works
for button rows unchanged.

TASK-2: In `YourDayWidgetProvider.java`, the checkbox is bound only for `check`
actions, so a `button` row never gets a checkbox. Nothing else in Your Day
changed.

TASK-3: `WidgetActionReceiver.java` accepts `button` actions. The
"already checked" short-circuit now applies only to `check`. The existing
validation (key/id format, row present in the cached payload with the same
type/key/id, state OK, busy rows rejected by `startAction`) is unchanged.
`WidgetActionWorker` is unchanged: 200/403/404 → re-fetch all kinds, 401 →
signed out, 426 → update app, everything else → revert + error.

TASK-4: `WidgetKind.java` has a new `TIME_TRACKING("time-tracking", …, "running", "projects")`.

TASK-5: New drawables `ic_widget_play`, `ic_widget_stop` (filled accent
circles, our own Lucide-based vectors), `ic_widget_timer`, `widget_color_dot`
(white oval, tinted at runtime) and `widget_running_background`. A new color
`widget_running` (accent at low alpha) has light and dark values.

TASK-6: New `TimeTrackingWidgetProvider.java`, modeled on Your Day, with the
same state/message logic. New layouts `widget_time_tracking.xml`,
`widget_time_tracking_row.xml`, `widget_time_tracking_section.xml` and
`widget_time_tracking_preview.xml`. I gave this widget its own section layout
instead of reusing Your Day's. It has the same 6dp horizontal inset as the rows,
so titles line up with the highlighted running row.
- Every row explicitly sets its subtitle, dot tint (`color`, else
  `widget_accent`), background (highlight only when `live == elapsed` with a
  valid `at`), timer icon, chronometer (running or stopped + GONE), button
  image/content description/alpha/enabled, and route fill-in. This prevents
  stale state in recycled views.
- Chronometer base: `elapsedRealtime() - max(0, now - at)`.
- PendingIntent request codes are 3 and 4 (Your Day uses 1 and 2).

TASK-7: New `xml/time_tracking_widget_info.xml` (description, preview layout
plus `drawable/widget_time_tracking_preview.xml` fallback, resizable, default
3×2: `minWidth` 180dp / `minHeight` 110dp). Receiver registered in
`AndroidManifest.xml` with `exported="false"`.

TASK-8: New strings `widget_time_tracking_name`,
`widget_time_tracking_description`, `widget_action_start`, `widget_action_stop`
and `widget_time_tracking_failed` in `values`, `values-de`, `values-fr`,
`values-es` and `values-it`.

TASK-9: Build and manual checks were **not run** (no JDK/SDK here). None of the
checks from brief step 7 are verified.

## Known issues / follow-ups

- **Needs a build and a device run.** Points to watch:
  - `Chronometer` inside `RemoteCollectionItems` on API 24 and 34+.
  - `setImageAlpha`/`setEnabled`/`setColorFilter`/`setBackgroundResource` via
    RemoteViews.
  - The preview layout on Android 12+.
  - All of the brief step 7 checks.
- **Error string:** the open question in tasks.md defaulted to reusing
  `widget_action_failed`. I added `widget_time_tracking_failed` ("Couldn't
  update") instead, because the existing German string ("Abhaken
  fehlgeschlagen") means "checking off failed", which is wrong for start/stop.
  Revert to reuse if that's preferred.
- **For the translator:** all new de/fr/es/it strings are my own translations
  and need a native-speaker check.
- After a reboot, the chronometer base (from `elapsedRealtime`) is only correct
  once the widget re-renders. A fetch on boot/update normally triggers that.
- No unit tests: `org.json` is stubbed in local JVM tests, and testing would
  need a new test dependency (not approved).
