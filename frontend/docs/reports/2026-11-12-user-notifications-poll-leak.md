# Report: the notifications poller can leak and keep fetching
read: true

Date: 2026-11-12
Scope: `load()` / `destroy()` in `src/lib/state/UserNotifications.svelte.ts` and its
three callers.
Method: read the store and its callers at `1d05257`, then reproduced both cases with
a throwaway Vitest store test (mocked `ApiService`, fake `document`, fake timers).
The test was not committed. No code was changed.

**Overall: a small performance fix.** `load()` is not idempotent, and it attaches
its listener only *after* the first fetch resolves. In two realistic cases a
`visibilitychange` listener (and its polling) survives `destroy()` and keeps
calling `GET /notifications` until the tab is reloaded.

---

## 1. Findings (verified)

`load()` (`UserNotifications.svelte.ts:22-36`) does this:

```ts
await this.fetch();
this.startPolling();
this.visibilityHandler = () => { ... this.fetch(); this.startPolling(); };
document.addEventListener('visibilitychange', this.visibilityHandler);
```

Callers:

- `MobileNavbar.svelte:26-32` and `user-notifications/UserNotifications.svelte:14-20`
  (desktop navbar): `load()` on mount, `destroy()` on unmount.
- `routes/notifications/+page.svelte:11-15`: `if (!loaded) await load()`.

### a) Two overlapping `load()` calls leak one listener

`loaded` only turns true after the first response arrives. On a cold start at
`/notifications` (a reload there, or opening the link from a push notification or
bookmark), the navbar and the page both mount, both see `loaded === false`, and
both call `load()`. Each call adds its own listener. `this.visibilityHandler` only
keeps the second one, so `destroy()` can only remove that one.

Probe result:

| Step | `GET /notifications` | listeners |
|---|---:|---:|
| two overlapping `load()` | 2 | 2 |
| `destroy()` | | **1** |
| one tab focus after `destroy()` | +1 | |
| 5 min later | +1 (polling restarted by the orphan) | |

While both are active, every tab focus also sends two requests instead of one.

### b) `destroy()` during the first fetch is undone

If the navbar unmounts before the first response arrives, `destroy()` has nothing
to clean up yet. When the response arrives, `load()` carries on, starts the
interval and adds the listener, and nothing will ever remove them. Probe: one
listener left after `destroy()`, and **3 extra requests in the next 15 minutes**.
The navbar unmounts on logout (`/auth/*`), when entering `/admin`, and when the
window crosses the 96rem breakpoint (`Viewpoint.svelte.ts`, desktop ↔ mobile
navbar). That's unlikely in a single session, but slow mobile networks make it more
likely. After a logout, the orphan keeps polling without a token.

## 2. Suggested fix

Do the synchronous setup first and share the in-flight promise:

```ts
private loading: Promise<void> | null = null;

load(): Promise<void> {
	if (this.loading) return this.loading;

	this.visibilityHandler = () => { ... };
	document.addEventListener('visibilitychange', this.visibilityHandler);
	if (!document.hidden) this.startPolling();

	this.loading = this.fetch();
	return this.loading;
}

destroy(): void {
	this.stopPolling();
	// remove listener as today
	this.loading = null;
}
```

- The listener is registered before the `await`, so `destroy()` always finds it (b).
- A second `load()` returns the same promise and sends no second request (a). The
  `/notifications` page can keep `await userNotifications.load()` and drop the
  `loaded` check.
- `if (!document.hidden)` also stops a tab that was opened in the background from
  polling before anyone has looked at it. Today `load()` starts the interval no
  matter what.

The page's `onMount` calls `load()` but never `destroy()`. With the shared promise
that's fine, because the navbar owns the lifecycle.

Tests to add to `tests/unit/stores/UserNotifications.test.ts` (the pattern already
exists there, with a fake `document` and fake timers):

- two `load()` calls → `api.list` called once, one listener added;
- `load()` then `destroy()` before the fetch resolves → no listener left, and no
  `api.list` calls after `advanceTimersByTime(POLL_INTERVAL_MS)`.

## 3. Side finding (not chased further)

`SessionMonitor.ts` uses the same visibility and interval pattern but sets up
synchronously in its constructor, so it doesn't have this problem. It's a good
reference for the fix.
