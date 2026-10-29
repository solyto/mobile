# Brief: tap-to-complete on the "Your Day" widget

type: feature
id: motivation
branch: feature/motivation_tap-to-complete-on-the-your-day-widget
date: 2026-10-29
author: Leander Muskalla

## What

Todo rows on the Your Day widget get a checkbox. Tapping it completes the
todo on the server and updates the widget. This is built as generic action
plumbing that every later interactive widget reuses.

This is job 6 of 6 in `docs/reports/android-homescreen-widgets-decisions.md`
(D3, D8, D11). Read that document first. It depends on
[[android-widget-foundation-your-day]] and on the API's
`POST /widgets/actions/todo.complete/{todo}`.

## Why

Completing a todo is the most common thing users do on Your Day. Building it
now also proves the interaction path (intents, background calls, error and
revert states) before other widgets depend on it.

## Contract with the API

The API lives in another repo and is not visible from here. This section is
the complete contract this job relies on; the widget data format, headers and
general status codes are in [[android-widget-foundation-your-day]].

Rows that can be acted on carry, for example:
`"action": { "type": "check", "key": "todo.complete", "checked": false }`.

Request: `POST {apiUrl}/api/v1/widgets/actions/{key}/{id}`, for example
`POST {apiUrl}/api/v1/widgets/actions/todo.complete/<todo uuid>`, with the same
headers as the widget fetch (`Authorization: Bearer <widget token>`,
`Accept: application/json`, `X-Client-Version`) and no body.

| Status | Meaning | Native does |
|---|---|---|
| 200 | Done (envelope with `data: null`). Also returned when the todo was already completed: the action is idempotent | Re-fetch all placed widgets |
| 401 | Widget token invalid or expired | Delete the local token, show the signed-out state |
| 403 | The todo belongs to someone else (should not happen from widget data) | Treat like 404 |
| 404 | The todo no longer exists, or the server has no such action | Re-fetch |
| 426 | App below the server's minimum version | Revert the row, show "Please update the app" |
| 429 / 5xx / no response | Rate-limited, server or network problem | Revert the row, show a short error state |

Completing a recurring todo creates its next occurrence on the server; the
re-fetch shows it if it is due. There is no "uncomplete" action.

## Steps

1. **Generic action handling:** rows with
   `action: { type, key, checked? }`. Native knows UI **types** only; for now
   `check`. Rows with an unknown type render without the control. The `key`
   is posted as-is to `POST /widgets/actions/{key}/{id}` after validating its
   format (`[a-z][a-z0-9_.-]*`) and the id; native has no per-key code.
2. **Checkbox:** on API 31+ a real checkbox (`setCompoundButtonChecked` +
   `RemoteViews.RemoteResponse`); on 24–30 a tappable checkbox icon. Same
   behaviour on both.
3. **Flow:** tap → explicit, non-exported receiver (fill-in extras are
   untrusted: validate them) → the row shows as done at once → an expedited
   WorkManager job calls the action with the widget token (read from the
   token store, not from input data) → on success re-fetch all placed widgets.
4. **Errors (D11):**
   - 404: the todo is gone, re-fetch;
   - 401: signed-out state, delete the local token;
   - offline, 429, 5xx: revert the row and show a short error state on the
     widget; nothing is queued for later;
   - repeated taps while a call is running are ignored for that row.
   The server action is idempotent, so a retry after a lost response is safe.
5. **Strings** (`values`, `values-de/fr/es/it`): the error text and the
   checkbox's content description.
6. **Manual checks:** complete a todo (API 24 and 34+); complete a recurring
   todo (the next occurrence appears after the re-fetch if it is due);
   airplane mode (revert + error); complete a todo deleted in the app
   meanwhile (row disappears); double tap; complete in the widget, then open
   the app (the todo shows as completed).

## Out of scope

- Uncompleting from the widget (the server has no such action).
- A retry queue for offline taps.
- Actions on other rows or other widgets.
If something needs more privileges the human will test. Don't break the pipeline.
