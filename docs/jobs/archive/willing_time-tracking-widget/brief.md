# Brief: time tracking widget

type: feature
id: willing
branch: feature/willing_time-tracking-widget
date: 2026-10-29
author: Leander Muskalla

## What

A second home-screen widget: **time tracking**. It shows the running timer
(project, live elapsed time, a stop button) and the user's projects, each
with a start button. Starting a project while another timer runs switches to
it in one tap. Tapping a row (outside its button) opens that project in the
app.

Depends on [[android-widget-foundation-multiple-kinds]] (native support for
several widget kinds) and on the API and app jobs below, which live in other
repos. Their full contract is in this entry.

**Prerequisite, done by a human before this job starts:** `frontend/` is
vendored from `solyto/app` with the job "time tracking widget: refresh on
changes, route keys". Confirm that `frontend/src/lib/state/WidgetBridge.ts`
handles `time_tracking_project`; do not run `scripts/vendor.sh` (`../app` is
not available here). If it is missing, stop and ask.

## Why

A user asked to start and stop time tracking from the home screen.

## Contract with the API and the app

The API and the app are not visible from here. Build against this exactly.

### `GET {apiUrl}/api/v1/widgets/time-tracking`

Same headers, envelope and status codes as Your Day
(`Authorization: Bearer <widget token>`, `Accept: application/json`,
`X-Client-Version`; 200 / 401 / 404 / 426 / 429 / 5xx as in
`android-widget-foundation-your-day.md`). `data`:

```
{
  "kind": "time-tracking", "schema_version": 1, "generated_at": "<ISO 8601>",
  "labels": { "title": "…", "empty": "…" },      // translated
  "sections": [
    { "key": "running", "title": "…", "rows": [{  // only while a timer runs; one row
        "id": "<entry uuid>",
        "title": "<project title>",
        "subtitle": "<entry description>",       // optional
        "at": "<started_at, ISO 8601 with offset>",
        "live": "elapsed",
        "all_day": false,
        "color": "#RRGGBB",                       // optional
        "icon": "timer",
        "route": { "key": "time_tracking_project", "id": "<project uuid>" },
        "action": { "type": "button", "key": "time_tracking.stop", "icon": "stop" }
    }] },
    { "key": "projects", "title": "…", "rows": [{  // up to 20, most recently used first
        "id": "<project uuid>",
        "title": "<project title>",
        "all_day": false,
        "color": "#RRGGBB",                       // optional
        "route": { "key": "time_tracking_project", "id": "<project uuid>" },
        "action": { "type": "button", "key": "time_tracking.start", "icon": "play" }
    }] }
  ]
}
```

- **No `refresh_at`** for this widget: it is optional in the format.
- The running project is not repeated in `projects`.
- `sections: []` means no projects and no timer: show `labels.empty`.
- New in the format, all backwards compatible (`schema_version` stays 1):
  `live: "elapsed"`, `color`, action type `button` with `icon` (`play` |
  `stop`), row icon `timer`. Unknown values stay ignored, as before.

### Actions

`POST {apiUrl}/api/v1/widgets/actions/{key}/{row id}`, no body, same headers:

- `time_tracking.start/<project uuid>`: starts that project. If another timer
  runs, the server stops it first. Already running: success, no change.
- `time_tracking.stop/<entry uuid>`: stops the timer. Already stopped:
  success, no change.

Status codes as for `todo.complete`: 200 done (also for no-ops) → re-fetch
all placed widgets; 401 → signed out; 403/404 → re-fetch; 426 → "update the
app"; 429/5xx/offline → revert, short error state.

### Route keys (handled by the app's widget bridge)

Pass `route` through unchanged with `navigate`: `time_tracking_project` + a
project UUID opens that project; `time_tracking` (no id) opens the time
tracking page.

## Steps

1. **Kind:** register `time-tracking` (path `/api/v1/widgets/time-tracking`)
   in the kind registry from [[android-widget-foundation-multiple-kinds]].
2. **Parser:** read the new fields (`live`, `color`, `button` actions with
   `icon`, icon `timer`) in the generic payload parser. Your Day ignores them.
3. **Widget** (`TimeTrackingWidgetProvider` + `RemoteViews`, list via
   `RemoteCollectionItems` like Your Day):
   - header with `labels.title` and "updated at", tapping it opens the app;
   - section titles; rows with title, optional subtitle, a color dot (from
     `color`, else the accent color), and the action button on the right
     (`play` / `stop` icons, our own vector drawables, not platform widgets);
   - the running row shows the elapsed time with a `Chronometer`
     (`setChronometer`, base computed from `at`), so it counts up without
     fetching; it is visibly highlighted;
   - `labels.empty` when there are no sections;
   - the same states as Your Day (loading, signed out, unsupported server,
     update the app, couldn't load, outdated);
   - light and dark; resizable; `appwidget-provider` XML with a preview and
     description; a sensible default size (for example 3×2).
4. **Buttons:** reuse the action plumbing from tap-to-complete. Tapping a
   button shows that row as busy (button disabled) at once, runs the action in
   the background, then re-fetches all placed widgets. On failure: revert and
   show the short error state. Taps on a busy row are ignored.
5. **Row taps** (outside the button) send `navigate` with the row's `route`,
   as in Your Day.
6. **Strings** in `values` and `values-de/fr/es/it`: picker name and
   description, the buttons' content descriptions. Content text comes from the
   server. New strings go to the translator.
7. **Manual checks:** place it next to Your Day; start a project (the timer
   counts up); start another project (switches); stop; start and stop in the
   app (the widget follows within seconds); tap a row (opens the project, warm
   and cold start); no projects (empty text); airplane mode while tapping
   start (revert + error); logout; API 24 and 34+; light and dark.

## Out of scope

- NFC tags and Samsung Routines (mentioned in the original request).
- Descriptions or categories from the widget.
- Changes to Your Day.
