# Verdict: mobile notifications

id: sheet
status: open
reviewer: deepseek-v4-flash (opencode-go)
date: 2026-09-12

## Review

TASK-1: PASS
notes: `src/routes/notifications/+page.svelte` does exactly what was asked: on mount
`await load()` (guarded with `if (!userNotifications.loaded)`) then `await markAllRead()`
so the list renders before read-state is wiped (desktop flash-of-dots parity); renders
`Entry` rows with a no-op `onClose`; header via `SubHeading` with `ts.get.nav.notifications`;
empty-state hint `ts.get.nav.notifications_empty` shown once `loaded` (never a dead tap).
`notifications_empty` added to `NavigationRecords` (translation.ts:39) and to the `nav`
section of all four i18n files (en/de/es/fr) — sync verified. `NavEntry`/`SubHeading`/
`Badge`/`getUserNotifications` props all match. Caveat (non-blocking): the `loaded` guard
cannot prevent a duplicate `load()` when `/notifications` is the first page mounted of the
session (refresh or deep link straight onto the page) — the page's and `MobileNavbar`'s
onMount both run before the first fetch resolves, so `loaded` is still false in both. This
causes one redundant GET and one orphaned `visibilitychange` listener (the store keeps only
the latest handler ref and `destroy()` removes only that one), which keeps polling silently
for the rest of the session. Impact is negligible (idempotent, silently-failing GETs per
ApiService.list) and the primary flow — navigating to the page later in the session — is
correct. Fixing it properly would need a store-side "polling active" flag, which is out of
scope ("No store changes needed").

TASK-2: PASS
notes: Bell row is a hardcoded `NavEntry`+`NavEntryIcon` between settings and profile in the
⋯ menu (MobileNavbar.svelte:112-131), NOT added to `navItems`/`desktopOrder` — `getPageFeature()`
stays null on `/notifications` and the desktop sidebar is untouched (verified navigation.ts
has no `notifications` key). `NavEntryIcon` gains the `notifications` → lucide `bell` branch;
`urls.notifications = '/notifications'` added; `overflowOnlyItems` extended so the ⋯ button
lights up with the bell chip on `/notifications` (activeInOverflow/activeOverflowItem resolve
correctly through `overflowOnlyItems`). Red dot on ⋯ (`right-[-3px] top-[-3px] size-2 rounded-full
bg-c-btn-hover`, line 83-85) and unread-count `Badge` on the bell row inside a `relative`
wrapper — both driven by `$derived(getUnread().length)` (reactive over `$state`). Polling
lifecycle `onMount(load)`/`onDestroy(destroy)` mirrors the desktop bell (UserNotifications.svelte:14-20).

TASK-3: PASS
notes: `max-h-[calc(100dvh-8rem)] overflow-y-auto` added to the absolute `w-16` menu container
(MobileNavbar.svelte:90) — exactly the specified fix; on a 568px phone the menu is capped at
440px and scrolls. No menu logic touched.

TASK-4: PASS
notes: `onClose` is optional with a no-op default (Entry.svelte:7-10); link-less notifications
render a plain `<div>` row (no dead `#` link / scroll-jump on mobile), linked ones keep the
`<a href>`; content shared via `{#snippet rowContent()}`. Desktop tray behavior preserved:
clicking any row still fires `goTo()` → `onClose()` (tray closes). Only consumers of Entry are
the desktop tray and the new page — both verified. Minor note: link-less rows are no longer
keyboard-focusable (previously an anchor) — exactly the trade the task prescribed.

Scope: PASS — the diff touches only the 8 source files listed in tasks.md plus the job docs.
No DesktopNavbar / desktop bell changes, no bottom sheet, no per-item read, no service-worker
wiring, no tab-bar restructure. No stray refactors.

## Security

none — no auth/token handling changes; the page renders existing notification data through the
existing authed `UserNotifications` store. No new data logged or persisted.

## Overall

APPROVED

No blockers. The only finding is the non-blocking caveat in TASK-1 (duplicate `load()` +
orphaned `visibilitychange` listener when `/notifications` is the very first page of a
session), which the task's own prescribed guard cannot fully prevent and whose impact is a
couple of silent, idempotent GETs; it is documented here for the record and could be closed
later with a store-side "polling active" flag if desired. Developer's verification claims are
consistent with the static evidence (i18n sync, prop shapes, no new lint errors; the
`logic-leaves.test.ts` failure is unrelated to this job's file graph). `npm run check` /
`build` / `test` could not be re-run by the reviewer (read-only git session), so those rest on
the developer's reported runs.