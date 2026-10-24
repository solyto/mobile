# Brief: mobile notifications

status: done
type: feature
id: sheet
branch: feature/sheet_mobile-notifications
date: 2026-09-12
author: Leander Muskalla

## What

Bring the desktop in-app notification workflow to mobile. Desktop has a bell in
the sidebar (unread-count badge, polling, mark-all-read on open, entries link
to their targets); mobile has none. The `UserNotifications` store, API routes,
and entry/read components already exist and are context-globally available —
only the mobile UI is missing.

Notable changes:

- New route page `/notifications` — the mobile notification center, reusing the
  existing `Entry` component for rows.
- A "Notifications" bell row in the mobile overflow (⋯) menu, next to
  settings/profile — the mobile equivalent of the desktop bell's sidebar
  placement (system cluster, not a main nav item).
- **Red dot on the ⋯ button** when unread > 0 (awareness at zero taps) and
  **unread-count badge on the bell row** in the menu.
- Polling parity: `MobileNavbar` starts the same 5-min poll + visibilitychange
  fetch lifecycle that the desktop bell uses.
- Read parity: opening the page marks all notifications as read, exactly like
  opening the desktop tray.
- Fix: the ⋯ overflow menu has no max-height and already overflows small
  phones (568px); adding a row makes it worse. Needs `max-h` + scroll.

## Why

Mobile users currently have no in-app surface for server notifications
(friend requests, shared calendars, releases, dev-request comments, daily
reminders) even though the data is fetched and the read/entry logic exists.
They should see the same bell/badge/read workflow as desktop users.

Design grounding (Material Design 3 + prevailing mobile patterns):

- Bottom navigation supports at most **5 destinations** — more must go behind a
  menu icon. The current 5-features + ⋯ layout is the sanctioned pattern; a 6th
  visible tab (bell) would violate it and shrink touch targets.
- Notification lists are **browsable destinations, not quick peeks** — every
  major app (Instagram, GitHub, LinkedIn, Reddit, Slack) uses a full-screen
  list, because the real flow is batch: open list → tap → content → back →
  next. A modal bottom sheet must close on navigation, losing the list; a page
  keeps the place and gives back-to-list for free. (A bottom sheet was
  evaluated and rejected for exactly this reason; modal sheets are for
  action/menu lists over a scrim, capped at 50% height — wrong semantics for
  content you read.)
- Badges on nav items are standard; but the ⋯ button already carries the
  active-page indicator (top-right), so two labeled badges on one icon is
  noise → dot on ⋯, count on the bell row.

## Out of scope

- No changes to desktop behavior (DesktopNavbar, desktop UserNotifications
  component untouched).
- No bottom-sheet or toast-based notification center.
- No per-item read tracking / swipe-to-dismiss / pull-to-refresh.
- No new push-notification wiring. (Nice-to-have, not in scope: point the
  service worker's no-link `notificationclick` fallback at `/notifications`.)
- No restructuring of the mobile tab bar (5 visible items stay).

## Notes

- Store: `src/lib/state/UserNotifications.svelte.ts` — already
  `setContext`'d in `+layout.svelte`. `load()` = fetch + start polling +
  visibilitychange handler; `destroy()` stops it. `getUnread()` drives badges;
  `markAllRead()` clears client-side state.
- `MobileNavbar.svelte` must mirror the desktop bell lifecycle: `onMount(() =>
  userNotifications.load())`, `onDestroy(() => userNotifications.destroy())`.
- Bell row: render like the existing hardcoded settings row in the ⋯ menu
  (NavEntry + NavEntryIcon). Add `'notifications'` to `NavEntryIcon` mapping
  (lucide `bell`). Treat like settings/profile (overflow-only item) — do NOT
  add to `navItems` or `desktopOrder`; that keeps `getPageFeature()` and the
  desktop sidebar untouched. Active state on `/notifications` via the same
  overflow-only mechanism.
- Page `src/routes/notifications/+page.svelte`: on mount `await load()` then
  `await markAllRead()` (load first so the list renders before read-state is
  wiped — same flash-of-dots as desktop). Reuse `Entry` with a no-op `onClose`.
  Header via existing `SubHeading`, title = `ts.get.nav.notifications` (already
  translated in all 4 languages).
- **i18n rule**: add the empty-state string (e.g. `nav.notifications_empty`,
  "You're all caught up") to ALL FOUR files (`en`, `de`, `es`, `fr`) —
  `npm run check` enforces sync.
- Empty state: always reachable — unlike desktop, the bell must NOT silently
  do nothing when the list is empty (dead taps feel broken on mobile); show the
  empty hint instead.
- Latent bug to fix while in here: the ⋯ menu container
  (`MobileNavbar.svelte`, absolute w-16 column) has no
  `max-h-[calc(100dvh-8rem)] overflow-y-auto`; it already overflows ~568px
  phones at 10 rows and will be worse at 11.
- Optional polish (small, safe): `Entry.svelte` renders `<a href="#">` when
  `notification.link` is null — on mobile a dead `#` link scrolls the page;
  consider rendering a plain row instead. Make `onClose` optional.
- Open question for the developer: mark-all-read-on-open (recommended —
  desktop parity, clears the dot) vs. per-item read. Either is a small change.

## Priority order

1. `/notifications` route + page (+ i18n empty-state key)
2. `MobileNavbar`: bell row, dot on ⋯, polling lifecycle
3. ⋯ menu `max-h` + scroll fix (required once the row count grows)
4. `Entry` null-link polish%

