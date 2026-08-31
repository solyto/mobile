# Verdict: continue testing

id: white
status: open
reviewer: deepseek-v4-flash (opencode-go)
date: 2026-08-14

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

Note: the session's git shim blocks every non-git command, so `npm test`, `npm run check`, `npm run lint` and `npm run test:coverage` could NOT be executed here. This review is a full static cross-referencing of every new/changed test file against the actual sources (`src/lib/state/*.svelte.ts`, `LibraryFilterService`, `DateHelper`/`NumberHelper`/`navigation.ts`/`urls.ts`/`apiRoutes.ts`/`themes.ts`, the tested components, and the four i18n files). The claimed "678 tests / 53 files passing" is plausible (53 test files counted on the branch) and the previous verdict's blockers are statically confirmed fixed, but runtime execution was not verified in this session.

**Previous verdict's blockers — confirmed resolved** (fix commit `9750573`):
- `tests/components/helpers/context.ts` now types the harness component as `AnyComponent = Component<any, any, any>` (with a targeted eslint-disable); the earlier `typeof import('svelte').SvelteComponent` incompatibility is gone.
- `tests/unit/stores/Calendars.test.ts` builds event factories with `SvelteDate` values (CalendarEvent declares `Date`) and no longer imports the unused `formatDate`.
- `tests/unit/stores/LibraryStores.test.ts` no longer has the unused `vi` import (line 1 is `{ describe, it, expect, beforeEach }`).
- `tests/components/dashboard-widgets.test.ts` casts the null-priority case to `TodoPriority` (the widget's runtime `=== null` fallback branch) and imports the type.
- `tests/components/logic-leaves.test.ts` builds full `BookGenre` objects (with `created_at`/`updated_at`).

TASK-1: PASS
notes: tests/unit/stores/Calendars.test.ts verified line-by-line against Calendars.svelte.ts + DateHelper (formatDate/getCalendarMonth/getWeekNumber/getCalendarWeek) + apiRoutes (`/calendars/events/%s`). 42-day Monday-first grid for Aug 2026 (starts Mon 27 Jul, ends Sun 6 Sep, ISO weeks 31–36), January year-boundary grid, `loadEvents` sortedEvents keys (`DD.MM.YYYY` slugs), all-day multi-day expansion loop incl. end-date inclusion and single-day non-expansion, `getEventsForDate`/`getAllDayEventsForDate`/`getNonAllDayEventsForDate` (time-sorted), `getTodosForDate`, next/last month year wraps, week-53/1 and month-13/0 wrap edges, day nav, goToToday, loadView/saveView/changeView, derived owned/pending/accepted groupings, hidden-calendar toggle, loadCalendars. All match the implementation exactly.

TASK-2: PASS
notes: tests/unit/auth/Auth.test.ts (unit project, Auth module NOT mocked — only ApiService/LocalStorageService) verified against Auth.svelte.ts: load-from-localStorage valid/expired/missing-token branches, 5-day `shouldRefresh` threshold (IS_NATIVE false under empty env), login/register/refresh/passkey flows incl. failure paths and the postRaw throw branches, isAdmin, logout/clear, getPublicProfile SvelteMap cache (failed lookups not cached), preferred-format + temperature helpers. `platform: 'web'` holds (env empty in node). Microtask flush helper is adequate for the constructor's fire-and-forget `load()` chain.

TASK-3: PASS
notes: tests/unit/stores/Notes.test.ts verified against Notes.svelte.ts: getNewestNotes/getLastUpdatedNotes (top-5 sort), getFavorites, getNotesForCategory (incl. null), getCategoryTitle incl. children and '-' fallback, collapsed-category load/persist/toggle, selectNote, checkUrlForActiveNote via the storeMocks `page.params` getter, create/createCategory empty-guards, parent-id + collapse-parent logic, edit-mode update, `goto(resolve(urls.note, {id}))`. `$app/navigation`/`$app/paths` mocked via hoisted stubs matching how the store calls them.

TASK-4: PASS
notes: tests/unit/stores/LibraryStores.test.ts verified for all 8 stores against the store sources and the real (pure) LibraryFilterService: per-store search fields (books title/author/series, music title/artist, movies title, games title/developer/publisher, plants name/latin_name, quotes author/quote, recipes title/ingredients, links title/url), genre/rating/type/location filters, wishlist/lent/unidentified flags incl. the filter cross-resets, clearFilters, view-pref persistence (BookLibrary `books_view`, MusicLibrary `music_view`; Movie/Game/Plant/Recipe switchView without persistence — persistence only exists where the store implements it), LinkLibrary categoriesCount, getCategoryCount(1/0/null/undefined), filterByCategory/filterByFavorite/reapplyFilter. Factory shapes match the type interfaces.

TASK-5: PASS
notes: tests/unit/stores/CheckInData.test.ts verified against CheckInData.svelte.ts: historyMonth init under fake timers (Aug 2026), prevMonth/nextMonth year wraps (0-based months), isCurrentMonth, getDayData explicit-day + page-params fallback + no-params null path, scored-trackers persistence (non-array guard), load settings merge incl. default-sports fallback and both-requests-fail path, saveSettings request body. `$app/state` covered by storeMocks.

TASK-6: PASS
notes: tests/components/helpers/context.ts + ContextHarness.svelte seed setAuth (first — field-init ordering), setTranslation, setKeyManager, setTodos, setLoadingIndicator, setUiNotifications, setViewPoint, setCookieConsent before rendering; real store instances with per-test overrides and `prepare`/`onReady` hooks; smoke test (context-harness.test.ts) renders Counter and exposes the instances. Constructor side effects of the seeded stores are inert in jsdom (Auth reads empty localStorage; Todos/KeyManager have no DOM side effects; ViewPoint guarded by `browser`/matchMedia stub). `tests/setup/component.ts` now also provides `matchMedia` and the `FakeAnimation` (onfinish-completing) animate stub needed by Svelte transitions.

TASK-7: PASS
notes: tests/components/dashboard-widgets.test.ts verified against all ten widgets: heading strings match en.ts (`Due Today`, `Relevant`, `Coming Up`, `Recent Notes`, `Newest Links`, `New Books`, `New Music`), priority dot colors (bg-c-danger/medium+null bg-c-btn/low bg-c-success), line-through + opacity-50, Checkbox handler wiring `(e, todo)` via user-event, `withDecimals` '12.35', `formatTime` '9:30'/'14:00' + all-day 'all day' + time omission, event-bar inline color, href/target/src attributes. Minor quality note (not a blocker): the MovieReleasesWidget factories omit `release_date`, so the "Movie · …" line renders `formatDate(undefined)` → 'NaN.NaN.NaN' and the `/^Movie/` assertion only checks the prefix; it passes but is weaker than it looks.

TASK-8: PASS
notes: forms-advanced.test.ts + logic-leaves.test.ts verified against the components: InputAutocomplete suggestion filtering/Enter/ArrowDown/Escape/click-accept, InlineAutocomplete trigger detection ('Hi @al' → 'Hi @alice' token replacement), Slider `--slider-percent` custom-property style + oninput/onchange, NoTodos via harness, DailyCheckInIcon/CheckInIcon (colors green-500/green-300/c-primary, highlight classes, sports id mapping), GenreFlexList, TagFlexList (`#name`, color pills, onRemove only when provided), CoverImage with the synchronous-onload FakeImage stub (preview+full and full-only branches). All match the implementations.

TASK-9: PASS (work) / noted (commit discipline)
notes: translation-only.test.ts + nav-legal-entry.test.ts verified against the components and en.ts strings ('Show/Hide password', 'At least 12 characters', 'Passwords match', CookieBanner 'Storage Notice'/'Got it'/'Privacy Policy' via the CookieConsent seeding in the harness, PopupConfirmationModal Confirm/Cancel + setTimeout fade-in, BottomSheetConfirmationModal danger variant via TextButton bg-c-danger, ImportButton title/onClick, all 8 provider import labels, NavLegalEntry empty-env hidden branch and the legal-URL branch in its own file with a file-level `$env/dynamic/public` mock). Work is complete and committed — but inside the chore commit `60ea7d1`, not a dedicated `[white] TASK-9` commit (documented in implementation.md; swept in by a mandated `git add -A`).

TASK-10: PASS
notes: docs/TESTING.md §0 implementation-status (678 tests / 53 files, coverage ~22.8%/~29.2%/~22.2%, covered/not-yet-covered lists incl. the TASK-11 stores) and §8 execution-order checkboxes (all [x] through the TASK-11 item) were updated and are internally consistent with the work. Coverage deltas could not be re-measured here. Minor doc inconsistency (pre-existing, carried over): TESTING.md §0 says "up from 8.7% / 12.4%" while implementation.md says "was 19.4%/25.1%/18.6%" — different baselines, ambiguous but not contradictory.

TASK-11: PASS
notes: All 8 secondary-store test files verified against their sources: Feeds (view validation incl. invalid-value ignore, loadMore offset/meta/recursion-guard/recursive-window-fill, filter/selectFeed, load reset + library flags, saveToLibrary/unsaveToLibrary CSV, subscribe 409-duplicate, testFeed/available/search-encode/friends), Contacts (contactsAZ grouping/sorting/hidden/active-book/search-source preference, contactTotal, search/clearSearch, hidden-address-book persistence, color/count helpers, photo batching incl. cached-skip, load, selection), Navigation (usage, promoteMobileItem least-used swap with home pinned — matches mobileDefaultOrder/mobileVisibleCount/navItems, mobile order persistence, feature merge + JSON-parse-null early-save branch) + NavigationEnv.test.ts for PUBLIC_DISABLE_DEV_REQUESTS, QuickAdd (isUrl, modal reset, detect error/needs-confirmation/auto-commit branches, confirm success/error, reject/back/selectType — with Translation/UiNotifications module mocks), UserNotifications (getUnread, markRead/%s route, markAllRead preserving existing read_at, load + visibility handler + 5-min polling with fake timers and stubbed document, destroy), WelcomeTour (16-step all-enabled / 5-step always-only, selectors, nav/finish), Theme (load/apply/persist, unknown-id fallback, theme-link create/remove, patchAnimate zero-duration — verified against themes.ts supportsDarkMode flags, dark-mode listener lifecycle with document/window/Element stubs), PwaInstall (window-less inert, iOS UA detection, capture/install accepted/dismissed/no-op, standalone + __pwaPrompt constructor branches).

## Security

none — test-only and docs changes; `git diff main...HEAD` confirms zero `src/` changes (no production logic touched), no new dependencies on this branch, no secrets.

## Scope notes (non-blocking, documented in implementation.md)

- Out-of-scope changes swept into the chore commit `60ea7d1`: AGENTS.md (empty file at main → populated with the project context, mirroring docs/AGENTS.md) and deletions of `.opencode/jobs/highlight_rename-category/*` (stale mirrors; the originals are preserved in docs/jobs/archive/highlight_rename-category/). Infra housekeeping, unrelated to the task but harmless and disclosed.
- Commit discipline: TASK-1..TASK-8, TASK-10, TASK-11 all have `[white] TASK-N: …` commits; TASK-9's files were swept into the chore commit (disclosed above); `implementation.md` has its own commits (`fa44d36`, `2516164`).

## Overall

APPROVED

All 11 tasks are implemented and every test file was statically cross-verified against the actual sources; the previous verdict's svelte-check/lint blockers are fixed in the current tree; no production code was changed. The only caveat is that `npm test` / `npm run check` / `npm run lint` could not be re-executed in this session (git-only shell), so the claimed 678/678 green run rests on static verification plus the fix commit — no blockers found that would require follow-up work.
