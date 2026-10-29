# Brief: 09 Session monitor and ApiService follow-ups

type: feature
id: relative
branch: feature/relative_09-session-monitor-and-apiservice-follow-ups
date: 2026-10-13
author: Leander Muskalla

## What

Finish what commit 2df74d2 left open in `Auth`, `ApiService` and the root layout.

- `Auth`: a `destroy()` that removes the `visibilitychange`/`online` listeners and the interval; move the session monitor into its own class; strip the narrating comments (keep the two named in `STANDARDS.md` 10.1).
- Root layout: replace the `wasLoggedIn` effect with an event the store exposes when the session expires; drop the `if (!browser)` guard inside the effect.
- `ApiService`: rebuild headers through the existing header functions instead of the cast in `fetchWithRecovery`; fix the `res.data?.data` unwrap.
- Route the five remaining direct `fetch` calls (`Calendars` ×3, `ManageWeatherCity`, `ExportSettings`) and the ~8 components still doing `new ApiService(auth.getToken())` through the shared instance.

## Why

The recovery logic is right; the code around it leaks listeners, watches state it could be told about, and bypasses its own network seam in a handful of places.

## Out of scope

Changing recovery semantics (retry-once, transient vs rejected).

## Notes

Tests first: extend the existing `Auth` and `ApiService` tests to cover `destroy()`, the expired-session event and the newly routed calls before touching the implementation. Rules: 5.6, 11.4, 11.5, 15.3, 10.1.
