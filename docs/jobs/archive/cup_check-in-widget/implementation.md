# Implementation: check-in widget

id: cup
developer: @developer
date: 2026-10-29

## Summary

Adds a third home-screen widget, `check-in`. It shows one row per enabled tracker,
each with up to 6 option buttons tinted with the server's color. Tapping an option
posts `check_in.set` with an explicit target value. Tapping the selected option
sends `null`, which clears it. Tapping the tracker name opens the `check_in`
route. The midnight reset, 422 handling, row limit and route key were already in
place (see tasks.md).

The prerequisite holds: `frontend/src/lib/state/WidgetBridge.ts` handles
`check_in`. Nothing under `frontend/` was edited, and `vendor.sh` was not run.

## Changes

TASK-1: `WidgetPayload.ROW_ID` now allows `_` (`[A-Za-z0-9_-]{1,64}`).

TASK-2: `WidgetPayload` parses `scale` actions. New `Option` (value, icon, ARGB
color), and `Item.actionValue` (nullable) and `Item.options`. Options are skipped
when they have an unknown icon (21 known), a color that is not `#RRGGBB`, or a
value that is not an integer. At most 6 are kept. The action is dropped when no
option is valid. `Item.hasOption(int)` lets the receiver check a tapped value.

TASK-3: `WidgetApi.postAction` has a new overload with an `Integer` value. It sends
`Content-Type: application/json` and `{"value":N}` or `{"value":null}`. The
no-body path is unchanged (fixed length 0, no Content-Type), and status mapping is
unchanged (422 → `TEMPORARY_FAILURE`).

TASK-4: `WidgetWork.runAction(..., Integer value)` stores `has_value` plus
`value`; an absent `value` means an explicit null. `WidgetActionWorker` sends a
body only when `has_value` is set. Work that older builds enqueued has no flag
and still posts without a body. Outcome handling is unchanged.

TASK-5: `WidgetActionReceiver` accepts `scale` taps. It reads
`EXTRA_ACTION_VALUE` and only accepts an `Integer`. It requires the value to be
one of the cached row's options. The target is `null` when the value equals the
row's current value, otherwise the value itself.

TASK-6: Added 21 single-color vector drawables, `res/drawable/ic_widget_checkin_*.xml`,
converted from lucide-static 1.59.0 (the `@lucide/svelte` version in use). Arc
flags were normalized for Android's path parser. Custom icons:
- yoga: from `IconYoga`.
- water: a cup outline after `IconWater`.
- food amount: Lucide `pizza`, which `IconPlate` draws.
- menstruation: the droplet outline of `IconDropletFill`.

TASK-7: New resources:
- `layout/widget_check_in.xml`: header, list and message.
- `layout/widget_check_in_row.xml`: tracker name above 6 option slots.
- `layout/widget_check_in_preview.xml` and `drawable/widget_check_in_preview.xml`.
- `drawable/widget_check_in_option_selected.xml`, using the new color
  `widget_selected` in `values` and `values-night`.
- `xml/check_in_widget_info.xml`: 4×3 target, min 250×180dp, resizable.

TASK-8: Strings in `values` and `values-de/fr/es/it`. The short error state
reuses `widget_time_tracking_failed` ("Couldn't update"), because the German
`widget_action_failed` says "Abhaken fehlgeschlagen" (checking off failed).

TASK-9: `CheckInWidgetProvider`, modeled on the time tracking provider. It has the
same states and "updated"/error line, and no section titles. Every row view state
is set explicitly: icon, tint, highlight, content description, alpha, enabled,
fill-in and visibility. Unused slots are `GONE`. PendingIntent request codes are 7
and 8. The kind `CHECK_IN("check-in", …, "today")` and the manifest receiver are
registered.

TASK-10: **Handed to the human, as the brief says ("Ignore testing. Human will test.").**
A second developer pass re-read the Java diff for compile-level problems
(imports, overloads, RemoteViews methods, the 21 drawables against the `iconRes`
switch) and found none. It is still not compiled.

Original note: **Not run.** This session has no JDK, Android SDK, device or emulator, so
I could not run `./gradlew assembleDebug` or any of the manual checks. The code is
unverified by a compiler. A human needs to build the app and do the brief's
step 7 checks:
- set, change and clear mood; pick a sport;
- app-side check-in and tracker changes show up in the widget;
- midnight reset;
- airplane mode (revert and error state);
- logout;
- API 24 and 34+; light and dark;
- next to the other two widgets.

## New strings for the translator

| name | en |
|---|---|
| `widget_check_in_name` | Check-in |
| `widget_check_in_description` | Check in for today from your home screen |
| `widget_check_in_option` | %1$s: %2$d of %3$d |
| `widget_check_in_option_selected` | %1$s: %2$d of %3$d, selected |

The de/fr/es/it versions were written by the developer and need review.

## Known issues / follow-ups

- Not compiled and not checked on a device (see TASK-10).
- Option values are assumed to be integers, as in the brief. Confirm this with the
  API job.
- After a successful tap, the row stays dimmed until the re-fetch arrives (the same
  "active" lifecycle as the other kinds). It does not show the new value
  optimistically.
- The option content description uses the option's position ("3 of 5"), not its raw
  value.
- `widget_check_in_option_selected` is a fourth string, beyond the three in the
  tasks, so screen readers announce which option is selected.
