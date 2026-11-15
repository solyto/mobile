# Report: calendar month navigation waits for two requests in a row
read: true

Date: 2026-11-11
Scope: `nextMonth`, `lastMonth` and `goToToday` in `src/lib/state/Calendars.svelte.ts`.
Method: read the store, its callers and `tests/unit/stores/Calendars.test.ts` at
`d94d519`. No code was changed and nothing was measured against a live API.

**Overall: a small, safe performance win.** Every month change costs two round
trips where one would do. The same spot also has a stale-response race.

---

## 1. Finding: events and marks load one after the other (verified)

All three methods end the same way (`Calendars.svelte.ts:200-202`, `212-214`,
`257-258`):

```ts
this.loadMonth();
await this.loadEvents();
await this.loadMarks();
```

`loadMarks()` does not use anything `loadEvents()` sets. It only reads
`this.month` (set by `loadMonth()`, which is synchronous) and the marks
settings. So the marks request waits for the events response for no reason.

When journal or check-in marks are on, each month change takes
`events RTT + marks RTT` instead of `max(events, marks)`. On mobile this runs on
every swipe (`MobileMonthView.svelte:21-22`) and every header arrow
(`MobileCalendarHeader.svelte:53,59`). The first page load already does this
right: `routes/calendar/+page.svelte:34-40` uses `Promise.all`.

### Suggestion

```ts
this.loadMonth();
await Promise.all([this.loadEvents(), this.loadMarks()]);
```

Put it in a small private helper (for example `reloadMonth()`) so the three
callers can't drift apart again. The existing tests (`Calendars.test.ts:358-397`,
`554-562`) only check which month is requested after `await`, so they should still
pass. A test that resolves the marks mock before the events mock would cover the
new behaviour.

## 2. Finding: an older month's response can overwrite a newer one (inferred)

The month arrows and swipe handlers don't wait for the previous call to finish.
If you go Jan → Feb → Mar quickly, `loadEvents()` for February and for March are
both in flight. Each one writes `this.events` / `this.sortedEvents` when its
response arrives (`Calendars.svelte.ts:126-140`). If February's response arrives
last, the March grid shows February's events until the next reload. The code
shows this can happen. How often it does depends on the network, which I can't
observe here.

No store in `src/lib/state/` guards against this yet (no `AbortController` and no
request counter), so a fix would add a new pattern. Keep it local:

```ts
async loadEvents(): Promise<void> {
	const year = this.currentYear;
	const month = this.currentMonth;
	const res = await this.apiService.list(
		apiRoutes.calendars.listEvents.replace('%s', `${year}-${String(month).padStart(2, '0')}`)
	);
	if (!res || year !== this.currentYear || month !== this.currentMonth) return;
	...
}
```

Do the same in `loadMarks()`, which writes `journalMarks` / `checkInMarks`.
Section 1 is the cheap win. This section is optional and is worth a separate
decision, because it adds the first stale-response check in the codebase.

## Not in scope

- `nextWeek` / `lastWeek` / `nextDay` don't reload events at all. Whether the
  week and day views spanning a month boundary show the right events was not
  checked.
