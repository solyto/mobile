# Tasks: continue testing

id: white
status: open
analyst: deepseek-v4-flash (opencode-go)
date: 2026-08-14

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Calendars store unit tests — `loadMonth` 42-day grid math, `getEventsForDate`/`getAllDayEventsForDate`/`getNonAllDayEventsForDate`, `getTodosForDate`, month/week/day navigation (incl. year wrap), `loadEvents` sortedEvents/all-day multi-day expansion, view state persistence (`loadView`/`saveView`/`changeView`), derived calendar groupings, hidden-calendar toggle.
     files: tests/unit/stores/Calendars.test.ts (new)
     depends: none
     risk: medium — constructor has side effects (`loadMonth`/`loadView`), date math via SvelteDate + getCalendarMonth; use fake timers / fixed dates.

TASK-2: Auth store unit tests — login/register/refresh/passkey flows, load-from-localStorage (valid + expired token branches), `isAdmin`, logout/clear, token-expiry `shouldRefresh` threshold, `getPublicProfile` cache. Must live in tests/unit/auth/ (unit project) because the stores project's storeMocks replaces the Auth module.
     files: tests/unit/auth/Auth.test.ts (new)
     depends: none
     risk: high — security surface; constructor fires async `load()`; needs per-test mocks for ApiService/LocalStorageService (Auth module must NOT be mocked).

TASK-3: Notes store unit tests — `getNewestNotes`/`getLastUpdatedNotes`/`getFavorites`, `getNotesForCategory`, `getCategoryTitle` (incl. children), collapsed-category persistence, `selectNote`, `checkUrlForActiveNote`, `create`/`createCategory` (guards + parent/collapse logic).
     files: tests/unit/stores/Notes.test.ts (new)
     depends: none
     risk: medium — Notes imports `$app/navigation` (goto) and `$app/paths` (resolve); mock both in the test file (storeMocks only covers `$app/state`).

TASK-4: Library-store filtering tests for all 8 stores (Book, Music, Movie, Game, Plant, Quote, Recipe, Link) — the non-CRUD parts: search, genre/rating/type/location filters, wishlist/lent/unidentified flags, `clearFilters`, view-pref persistence from localStorage, LinkLibrary category counts + `filterByCategory`/`filterByFavorite`/`reapplyFilter`.
     files: tests/unit/stores/LibraryStores.test.ts (new) or one file per store group
     depends: none
     risk: medium — 8 similar stores but mechanical; LibraryFilterService is real (pure); only stub ApiService/LocalStorageService/Auth.

TASK-5: CheckInData store unit tests — `prevMonth`/`nextMonth` navigation (year wrap), `isCurrentMonth`, `getDayData` with/without explicit day (selectedDate derived from page.params.date), scored-trackers persistence, `load` settings merge.
     files: tests/unit/stores/CheckInData.test.ts (new)
     depends: none
     risk: low — small store; `$app/state` already mocked by storeMocks.

TASK-6: §4.3 context harness — build `renderWithContext(Component, props, stores)` that seeds `setTranslation`, `setKeyManager`, `setTodos`, `setAuth`, `setLoadingIndicator`, `setUiNotifications`, `setViewPoint` before rendering; unlocks the context-coupled component tasks.
     files: tests/components/helpers/context.ts (new), tests/components/helpers/ContextHarness.svelte (new)
     depends: none (enables TASK-7, TASK-9)
     risk: medium — Svelte context + jsdom wiring must not break the existing pure component tests; store stubs need to be lightweight.

TASK-7: Dashboard widget component tests — props-driven widgets: DueTodosWidget, ScoredTodosWidget, EventsTodayWidget, UpcomingEventsWidget, NewestNotesWidget, NewestLinksWidget, BookReleasesWidget, MovieReleasesWidget, MusicReleasesWidget, QuoteWidget (render data, priority colors, completed line-through, handler wiring).
     files: tests/components/dashboard-widgets.test.ts (new)
     depends: TASK-6 (ts/auth props need a Translation/Auth stub or the harness)
     risk: low — pure props in; use the harness or minimal `ts`/`auth` stubs.

TASK-8: Logic-bearing leaf component tests — `forms/InputAutocomplete`, `forms/InlineAutocomplete` (keyboard/selection logic, suggestion filtering), `forms/Slider` (oninput/onchange), `todos/NoTodos`, `check-in/DailyCheckInIcon` + `check-in/overview/CheckInIcon`, `libraries/shared/GenreFlexList`, `tags/TagFlexList`, `libraries/shared/CoverImage`.
     files: tests/components/logic-leaves.test.ts (extend) or tests/components/forms-advanced.test.ts (new)
     depends: TASK-6 only for NoTodos (getTranslation); the rest are props-only
     risk: medium — bindable props need small harness components; requestAnimationFrame/Image onload stubs in jsdom.

TASK-9: Translation-only component tests — PasswordInput, PasswordStrengthIndicator, PasswordMatchIndicator, ui/CookieBanner, NavLegalEntry, PopupConfirmationModal, BottomSheetConfirmationModal, ImportButton (+ other *ImportButton variants).
     files: tests/components/translation-only.test.ts (new)
     depends: TASK-6 (all call getTranslation())
     risk: low — render + assert strings; trivial once the harness exists.

TASK-10: Coverage re-run + status update — run `npm run test:coverage`, inspect remaining uncovered lines (should cluster in the §8 out-of-scope list), update TESTING.md §0 implementation-status section and §8 roadmap checkboxes.
     files: docs/TESTING.md (status section), possibly vitest.config.ts coverage excludes
     depends: TASK-1..TASK-9
     risk: low — no production code touched.

TASK-11: (Optional follow-up, only if capacity remains) secondary stores with real non-CRUD logic — Feeds (`loadMore` pagination/filter/in-library), Contacts (`contactsAZ`, search, hidden books), Navigation (`promoteMobileItem`/usage), QuickAdd (detect/confirm/isUrl), UserNotifications (getUnread/markAllRead), WelcomeTour (step building), Theme (localStorage + DOM), PwaInstall.
     files: tests/unit/stores/Feeds.test.ts, Contacts.test.ts, Navigation.test.ts, QuickAdd.test.ts, UserNotifications.test.ts, WelcomeTour.test.ts, Theme.test.ts, PwaInstall.test.ts (all new)
     depends: TASK-1..TASK-5 patterns
     risk: medium — per-store extra mocks (Feeds needs meta, Navigation needs $env/dynamic/public, Theme needs DOM methods).
