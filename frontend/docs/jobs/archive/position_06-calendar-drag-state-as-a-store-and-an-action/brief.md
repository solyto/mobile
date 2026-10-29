# Brief: 06 Calendar drag state as a store and an action

type: feature
id: position
branch: feature/position_06-calendar-drag-state-as-a-store-and-an-action
date: 2026-10-13
author: Leander Muskalla

## What

Replace the module-level `$state` in `calendars/dnd/CalendarDragState.svelte.ts` with a `CalendarDrag` context store in `src/lib/state/`, and the four `onpointer*` attributes on every event button with one Svelte action.

- Store: the reactive fields and begin/update/finish/cancel; reset by assigning one initial object.
- Action: `use:draggableEvent={item}`, holding the pointer-controller closure.
- Pure math stays in `services/CalendarDragService.ts`.

## Why

It is the only module-level reactive singleton in the repo, invisible to the layout bootstrap and untestable; and the feature is spread over three places.

## Out of scope

Changing drag behaviour, thresholds or snapping. Mobile drag (currently disabled).

## Notes

Tests first for the store methods (begin/update/finish/cancel, click suppression). Pointer behaviour is verified manually in week and month view. Depends on the helpers entry (`parseDateSlug`) and the view cleanup entry (ghost rendered once). Rules: 11.1–11.3.
You are allowed to use npm ci for tests.
