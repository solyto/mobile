# Tasks: mobile notifications

id: sheet
status: open
analyst: deepseek-v4-flash (opencode-go)
date: 2026-09-12

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Create the `/notifications` route page — on mount `await load()` then `await markAllRead()` (desktop tray parity, decided: mark-all-read-on-open, not per-item), render `Entry` rows with a no-op `onClose`, header via `SubHeading` with `ts.get.nav.notifications`, and an empty-state hint `ts.get.nav.notifications_empty` shown when the list is empty (never silently dead like the desktop tray); add the new `notifications_empty` key to the `NavigationRecords` type and to the `nav` section of all four i18n files (`en`, `de`, `es`, `fr`).
     files: src/routes/notifications/+page.svelte (new), src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
     depends: none
     risk: medium — new route plus async load→markAllRead sequencing for the dots-flash effect; i18n type change forces all four files to stay in sync (`npm run check` enforces). Note: `MobileNavbar` also calls `load()` on mount, so the page should guard with `if (!userNotifications.loaded)` to avoid a duplicate fetch and an orphaned `visibilitychange` listener (the store keeps only the latest handler reference; `destroy()` removes only that one).

TASK-2: Add the "Notifications" bell row to the mobile ⋯ overflow menu as a hardcoded entry next to settings/profile (same pattern as the settings row: `NavEntry` + `NavEntryIcon`, NOT added to `navItems`/`desktopOrder` so `getPageFeature()` and the desktop sidebar stay untouched), add `'notifications'` → lucide `bell` to the `NavEntryIcon` mapping, add `notifications: '/notifications'` to `urls.ts`, extend `overflowOnlyItems` with `notifications` for the overflow active-state mechanism, add a red dot on the ⋯ button when `getUnread().length > 0` (desktop Badge precedent uses `bg-c-btn-hover`), add an unread-count badge on the bell row (wrap in a `relative` container — `NavEntry`'s anchor is not positioned), and start the polling lifecycle in `MobileNavbar` (`onMount(() => userNotifications.load())`, `onDestroy(() => userNotifications.destroy())`).
     files: src/lib/components/ui/MobileNavbar.svelte, src/lib/components/ui/NavEntryIcon.svelte, src/lib/config/urls.ts
     depends: TASK-1 (the bell row links to the `/notifications` page)
     risk: medium — modifies the overflow-menu active-state logic and adds an app-wide polling lifecycle to a persistent layout component; the badge needs a positioned wrapper inside the `NavEntry` anchor.

TASK-3: Add `max-h-[calc(100dvh-8rem)] overflow-y-auto` to the ⋯ overflow menu container (the absolute `w-16` column in `MobileNavbar.svelte`) so the menu scrolls instead of overflowing/clipping on short phones (~568px); required before the 11th row (bell) lands.
     files: src/lib/components/ui/MobileNavbar.svelte
     depends: none (independent; should land before or with TASK-2)
     risk: low — CSS-only change on the popup container; no menu logic touched.

TASK-4: Polish `Entry.svelte` (optional per brief, small and safe): make `onClose` optional with a no-op default and render a plain non-anchor row when `notification.link` is null so mobile taps don't trigger a dead `#` link that scrolls the page; keep the `<a>` when a link exists. Desktop tray behavior is preserved because clicking still fires `goTo()` → `onClose`.
     files: src/lib/components/ui/user-notifications/Entry.svelte
     depends: TASK-1 (the page passes a no-op `onClose`, which the optional prop supports)
     risk: low — small component change in one file; must not regress the desktop tray's click-to-close.

Out of scope (do not schedule): desktop bell/navbar changes, bottom-sheet/toast notification center, per-item read/swipe-dismiss/pull-to-refresh, push-notification wiring, and the service-worker `notificationclick` no-link fallback at `/notifications` (nice-to-have, not in scope per brief). No store changes needed — `UserNotifications.svelte.ts` already provides `load()`/`destroy()`/`getUnread()`/`markAllRead()` and is context-globally available.
