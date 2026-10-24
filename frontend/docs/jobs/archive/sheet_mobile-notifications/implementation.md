## Summary

Brought the desktop in-app notification workflow to mobile. Added a new
`/notifications` route page (the mobile notification center, reusing the
existing `Entry` component), a "Notifications" bell row in the mobile ⋯
overflow menu with an unread-count badge, a red awareness dot on the ⋯ button
when there are unread notifications, the 5-min polling + visibilitychange
lifecycle in `MobileNavbar` (mirroring the desktop bell), mark-all-read-on-open
parity, a scroll fix for the overflowing ⋯ menu on short phones, and a small
`Entry` polish (optional `onClose`, plain row for link-less notifications).

## Changes

- TASK-1 (`/notifications` route + i18n): New `src/routes/notifications/+page.svelte`
  — on mount `await load()` (guarded with `if (!userNotifications.loaded)` to
  avoid a duplicate fetch / orphaned `visibilitychange` listener, since
  `MobileNavbar` also starts the lifecycle), then `await markAllRead()` so the
  list renders before read-state is wiped (desktop flash-of-dots parity). Renders
  `Entry` rows with a no-op `onClose`, headers via `SubHeading`
  (`ts.get.nav.notifications`), and an empty-state hint
  (`ts.get.nav.notifications_empty`) shown once loaded — never silently dead.
  Added `notifications_empty` to `NavigationRecords` and the `nav` section of all
  four i18n files (en/de/es/fr), keeping `npm run check` sync.
- TASK-2 (`MobileNavbar` bell row, dot, polling): Added a hardcoded
  "Notifications" row (`NavEntry` + `NavEntryIcon`) next to settings in the ⋯
  menu — NOT added to `navItems`/`desktopOrder`, so `getPageFeature()` and the
  desktop sidebar stay untouched. Extended `overflowOnlyItems` with
  `notifications` so the overflow active-state mechanism lights up the ⋯ button
  on `/notifications`. Added `'notifications'` → lucide `bell` to
  `NavEntryIcon`, `notifications: '/notifications'` to `urls.ts`. Red dot
  (`size-2 rounded-full bg-c-btn-hover`, Entry's dot style) on the ⋯ icon when
  `getUnread().length > 0`; unread-count `Badge` (desktop precedent colors,
  `top/right -2px`) on the bell row inside a `relative` wrapper. Polling
  lifecycle: `onMount(() => userNotifications.load())`,
  `onDestroy(() => userNotifications.destroy())` — same as the desktop bell.
- TASK-3 (⋯ menu scroll fix): Added `max-h-[calc(100dvh-8rem)] overflow-y-auto`
  to the absolute `w-16` overflow-menu container in `MobileNavbar.svelte`; the
  11-row menu now scrolls instead of clipping/overflowing ~568px phones
  (verified: menu height 440px = 568 - 128px on a 568px viewport).
- TASK-4 (`Entry.svelte` polish): `onClose` is now optional (defaults to a
  no-op) and link-less notifications render as a plain non-anchor `<div>` row
  instead of a dead `<a href="#">` that would scroll the page on mobile; rows
  with a link keep the `<a>`. Clicking still fires `goTo()` → `onClose`, so the
  desktop tray's click-to-close is preserved. Content shared via a `{#snippet}`.

## Verification

- `npm run check`: 0 errors, 0 warnings (also enforces the 4-language i18n sync).
- `npm run build`: production build succeeds.
- `npm test`: 712/713 pass; the 1 failure (`tests/components/logic-leaves.test.ts`
  — StatisticWidget color classes) is pre-existing and unrelated (0 diff against
  the base commit; it predates this job).
- `npm run lint`: pre-existing failures only. The repo is prettier-red at the
  base commit (397 files, e.g. `src/routes/+layout.svelte`, `src/styles/base.css`),
  and the remaining eslint errors on touched files (`require-each-key` on the two
  pre-existing `{#each}` blocks in `MobileNavbar`, unused `userNotifications` +
  `no-navigation-without-resolve` in `Entry`) exist identically at the base
  commit — no new lint errors were introduced.
- Rendered verification via a local mock API + Playwright (mobile viewport,
  auth pre-seeded): the /notifications page renders the heading and all entries
  (2 linked, 1 plain), markAllRead clears the unread dots and the badge, the
  empty state shows "You're all caught up" with an empty list, the red dot
  appears on ⋯ with unread > 0, the bell row shows a "2" badge in the menu, and
  the menu scrolls on a 568px viewport. No console errors on the touched pages.

## Known issues / follow-ups

- The `svelte/no-navigation-without-resolve` eslint error on `Entry.svelte` is
  pre-existing (the `href` is API-provided data, not a statically resolvable
  route); left as-is to keep the change minimal.
- `Entry.svelte` still imports `getUserNotifications()` unused — pre-existing,
  left untouched.
- Out of scope per brief (not done): service-worker `notificationclick` no-link
  fallback pointing at `/notifications`; per-item read tracking, swipe-dismiss,
  pull-to-refresh; bottom-sheet notification center; any desktop behavior change.
- `npm ci` was run to restore the pinned dependency tree for verification; no
  package.json / lockfile changes.