# Brief: widget foundation: support several widget kinds

type: feature
id: eat
branch: feature/eat_widget-foundation-support-several-widget-kinds
date: 2026-10-29
author: Leander Muskalla

## What

Make the native widget foundation serve more than one widget. Today it only
knows Your Day: one cached payload, a hardcoded `your-day` fetch path, and
`YourDayPayload` / `YourDayWidgetProvider` referenced from the fetch worker,
the action receiver and worker, `WidgetWork`, `WidgetCache` and
`WidgetBridgePlugin`. After this job, adding a widget means: a kind entry, a
provider with its layout, and an API endpoint.

**No visible change:** Your Day must look and behave exactly as before. The
time tracking widget ([[android-widget-time-tracking]]) is the first to use
this.

## Why

The decisions (`docs/reports/android-homescreen-widgets-decisions.md`, D2/D8)
promise that a new widget is "mostly a backend endpoint plus a native
layout". The current code does not deliver that yet.

## Steps

1. **A kind registry:** one place listing each widget kind with its `kind`
   string (as in the payload), its API path (`/api/v1/widgets/<kind>`) and its
   provider class. For now only `your-day`.
2. **Generic payload:** rename `YourDayPayload` to a generic name (for
   example `WidgetPayload`); the format is shared by all widgets. The parser
   keeps today's behaviour (unknown fields, section keys, icons and action
   types are ignored).
3. **Cache per kind** (`WidgetCache`): payload, fetch time, the outdated flag
   and action state are stored per kind. The overall state (signed out,
   server without widgets, update the app, device not supported) stays global:
   it is about the token and the server, not a widget. Keep everything in the
   one existing `widget_cache` prefs file with kind-prefixed keys, so the
   backup exclusion rules need no change. On first start after the update,
   drop the old unprefixed payload keys and fetch again; no migration of the
   old cache.
4. **Fetching:** the fetch worker fetches every kind that has at least one
   placed widget, each from its own path. 401, 404 on a widget route and 426
   change the global state as today; a 429/5xx/offline marks only that kind
   as outdated. `refresh_at` is optional per kind (time tracking has none).
5. **Scheduling:** the periodic work runs while any widget of any kind is
   placed, and is cancelled when the last one is removed (instead of Your
   Day's `onEnabled`/`onDisabled` alone). `fetchNow` runs when any kind is
   placed.
6. **Actions:** the action fill-in intent carries the kind. The receiver and
   worker look up the row in that kind's cache, keep action state per kind,
   and after an action re-fetch **all** placed kinds (a change can show on
   more than one widget).
7. **Updating views:** one `updateAll` that re-renders every kind's
   providers; `WidgetBridgePlugin` (`clear`, `unsupported`, `setToken`) and the
   workers use it.
8. **Manual checks:** Your Day as before (data, tap a todo row, tap-to-
   complete, offline, logout, unsupported server); update from the previous
   build with a Your Day widget placed (it refreshes and keeps working).

## Out of scope

- The time tracking widget and the format additions it needs
  ([[android-widget-time-tracking]]).
- Any change to Your Day's look or behaviour.

## Notes

- Keep `WidgetTokenStore` as it is: one token serves all widgets.
- Do not add new dependencies.
