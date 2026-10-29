# Brief: check-in widget

type: feature
id: cup
branch: feature/cup_check-in-widget
date: 2026-10-29
author: Leander Muskalla

## What

A third home-screen widget: **today's check-in**. One row per enabled tracker
(mood, sleep, water, sports, …), each with its tappable values. Tapping a
value saves it for today; tapping the selected value again clears it, as in
the app. At local midnight the widget resets to the new day. Tapping a
tracker's name opens the check-in page.

It builds on the multi-kind foundation and the action plumbing from the Your
Day and time tracking widgets. It adds one action type, `scale`. The API and
app jobs live in other repos; their full contract is in this entry.

**Prerequisite, done by a human before this job starts:** `frontend/` is
vendored from `solyto/app` with the job "check-in widget: refresh on changes,
route key". Confirm that `frontend/src/lib/state/WidgetBridge.ts` handles
`check_in`; do not run `scripts/vendor.sh`. If it is missing, stop and ask.

## Why

Checking in daily is quicker from the home screen than opening the app.

## Contract with the API and the app

### `GET {apiUrl}/api/v1/widgets/check-in`

Same headers, envelope and status codes as the other widgets. `data`:

```
{
  "kind": "check-in", "schema_version": 1, "generated_at": "<ISO 8601>",
  "refresh_at": "<ISO 8601 with offset>",       // next local midnight
  "labels": { "title": "…", "empty": "…" },
  "sections": [{ "key": "today", "rows": [{     // one row per enabled tracker, at most 12
      "id": "<tracker key>",                      // e.g. "mood", "food_quality" (contains "_")
      "title": "<translated tracker name>",
      "all_day": true,
      "route": { "key": "check_in" },
      "action": {
        "type": "scale", "key": "check_in.set",
        "value": 3,                               // today's value, or null
        "options": [{ "value": 1, "icon": "mood_1", "color": "#EF4444" }, …]  // 5 or 6
      }
  }] }]
}
```

- **Option icons:** `mood_1` … `mood_5` (Lucide angry, frown, meh, smile,
  laugh); `sport_dumbbell`, `sport_bike`, `sport_mountain`,
  `sport_footprints`, `sport_waves_ladder`, `sport_yoga`; and one icon per
  other tracker: `sleep`, `dreams`, `food_quality`, `food_amount`, `water`,
  `work`, `menstruation`, `alcohol`, `smoking`, `social_life`. Use the same
  icons as the app (`frontend/src/lib/components/check-in/daily/DailyCheckInIcon.svelte`)
  as vector drawables. An option with an unknown icon is not shown.
- **Colors** come from the server per option (`#RRGGBB`): tint the icon with
  it. Native has no color logic of its own.
- **No section title**: the widget title is enough.
- The section is left out when no tracker is enabled: show `labels.empty`.
- New in the format, backwards compatible: action type `scale` with `value`
  and `options`; Your Day and time tracking ignore it.

### Action: `POST {apiUrl}/api/v1/widgets/actions/check_in.set/<tracker key>`

Same headers as the other actions **plus** `Content-Type: application/json`
and a body: `{ "value": <option value> }` to set, `{ "value": null }` to clear.
Native decides which: tapping the currently selected value sends `null`,
any other option sends its value. Always send the explicit target, never a
"toggle", so a retry cannot flip it.

| Status | Meaning | Native does |
|---|---|---|
| 200 | Saved (also when the value was already set) | Re-fetch all placed widgets |
| 401 | Widget token invalid or expired | Delete the local token, show the signed-out state |
| 404 | Unknown tracker (or old server) | Re-fetch |
| 422 | Invalid value (should not happen from widget data) | Revert, short error state |
| 426 | App below the server's minimum version | Revert, "Please update the app" |
| 429 / 5xx / no response | Rate-limited, server or network problem | Revert, short error state |

### Route key

`check_in` (no id): the app opens today's check-in.

## Steps

1. **Kind:** register `check-in` (path `/api/v1/widgets/check-in`, section
   key `today`) in the kind registry.
2. **Row ids:** widen the row id check (`WidgetPayload` `ROW_ID`) to allow
   `_`, so tracker keys like `food_quality` are valid. Keep the length limit.
3. **Parser:** read `scale` actions (`value`, `options` with `value`, `icon`,
   `color`); skip options with unknown icons or invalid colors; drop the
   action when no valid option is left.
4. **Actions with a value:** the action fill-in intent carries the tapped
   option's value; the receiver checks it is one of that row's options in the
   cached payload, computes the target (`null` when it equals the current
   `value`), and `WidgetApi.postAction` sends it as the JSON body. Actions
   without a value keep posting no body. Treat 422 like other failures.
5. **Widget** (`CheckInWidgetProvider` + `RemoteViews`, list via
   `RemoteCollectionItems`):
   - header with `labels.title` and "updated at", tapping it opens the app;
   - rows: the tracker name (tap → `navigate` with the row's `route`) and up
     to 6 option buttons, each an icon tinted with its color; the selected
     option gets a highlight background, as in the app;
   - while a row's action runs, that row is dimmed and ignores taps; on
     failure it reverts and shows the short error state;
   - set every view state explicitly (list rows are recycled);
   - the same states as the other widgets; light and dark; resizable;
     `appwidget-provider` XML with preview and description; a default size
     of about 4×3 (the list scrolls when more trackers are enabled).
6. **Strings** in `values` and `values-de/fr/es/it`: picker name and
   description, content descriptions for the option buttons (for example
   "Mood: 3 of 5"). Content text comes from the server. New strings go to the
   translator.
7. **Manual checks:** set mood, change it, tap it again (clears); pick a
   sport; check in in the app (the widget follows); change enabled trackers
   in the app (rows follow); after local midnight (or with the device clock
   moved) the widget shows an empty day; airplane mode while tapping (revert +
   error); logout; API 24 and 34+; light and dark; next to the other two
   widgets.

## Out of scope

- Other days than today; changing settings from the widget.
- Choosing trackers per widget (that would need the first widget setup
  screen).
- Fill-level icons (the app draws water, food amount and menstruation as
  filling icons; the widget uses one icon colored by value).
Ignore testing. Human will test.