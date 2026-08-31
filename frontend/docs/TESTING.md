# Test coverage plan

How to build the best possible automated test coverage for the solyto frontend.

Status of this document: proposal. Nothing here is implemented yet. The phases
at the bottom describe the order of work; every phase that requires new
dev-dependencies needs explicit approval before `npm install` (dependencies are
pinned, `engine-strict=true`).

---

## 0. Implementation status

Most of the plan below is now implemented. Current state (run `npm test`):

- **678 tests** (53 files) across 3 Vitest projects: `unit` (node), `stores`
  (node + store-mock setup), `components` (jsdom).
- Coverage: `src/lib` at **~22.8% statements / ~29.2% functions / ~22.2%
  lines** (up from 8.7% / 12.4%), against the whole of `src/lib` including
  the 357 untested components and 37 stores. The remaining uncovered lines
  cluster in the documented out-of-scope list (§8) — heavy/skip components
  (echarts, TipTap, DnD, WebAuthn, electronAPI, …) and the boilerplate CRUD
  stores — which is the intended "complete enough" state.
- New devDeps (pinned): `@vitest/coverage-v8`, `jsdom`, `@testing-library/svelte`,
  `@testing-library/jest-dom`, `@testing-library/user-event`, `@testing-library/dom`.
- `vitest.config.ts` now uses `sveltekit()` + three projects; `tests/unit/setup/storeMocks.ts`
  registers module mocks (ApiService/Auth/LocalStorageService/`$app/state`) for the
  `stores` project only, so service-boundary tests keep the real implementations.
- `Todos` and `Finances` state classes received a constructor-injection refactor
  (auth/apiService/localStorage), defaulting to current behaviour. Other stores
  are tested without source changes via the store mocks.
- Component tests run in jsdom with `resolve.conditions: ['browser']` (needed so
  `svelte` resolves to the client build, not SSR) and an `Element.prototype.animate`
  stub in `tests/setup/component.ts` for Svelte transitions.

### Covered so far

- **Pure logic (Phase 1):** `TodoGroupingService`, `TodoRelevanceService`,
  `LibraryFilterService`, `WealthStatisticsService`, `TodoFilterService` gaps
  (`filterCategoriesByHideIt`, `due: 'week'`), `CheckInHelper`,
  `CheckInSummaryHelper`, `ColorHelper`, `FormatHelper`, `NameHelper`, full
  `DateHelper` gap coverage, `NumberHelper.europeanFormat`, all `MusicTheory/*`,
  `themes.ts`, `confetti.ts`.
- **Service boundary (Phase 2):** `ApiService` (fetch seam — headers, `%s`/`%d`
  replacement, method/body semantics, error paths), `LocalStorageService`,
  `NavHelper`, `platform.ts`, `urls.ts`, `features.ts`.
- **Stores (Phase 3):** `Todos`, `Finances`, `Tags`, `UserManagement`,
  `TimeTracking`, `LoadingIndicator`, `CookieConsent`, `UiNotifications`,
  `Calendars` (42-day grid, per-date lookups, month/week/day navigation,
  view-state persistence), `Auth` (login/register/refresh/passkey,
  load-from-localStorage, `isAdmin`, `shouldRefresh` threshold, public-profile
  cache — in `tests/unit/auth/` because the stores project's storeMocks
  replaces the Auth module), `Notes` (newest/updated/favorites, category
  lookup/titles, collapsed persistence, `selectNote`, url-active check,
  create guards), all 8 library stores' **filtering** (search,
  genre/rating/type/location, wishlist/lent/unidentified flags,
  view-pref persistence, LinkLibrary category counts), `CheckInData`
  (month navigation with year wrap, `isCurrentMonth`, date-derived
  `selectedDate`, scored-trackers persistence, settings merge).
- **Auth-token workflow regression:** `tests/unit/auth/AuthTokenFlow.test.ts`
  pins the token snapshot semantics — `new Todos()`/`new Finances()` capture
  `auth.getToken()` into their `ApiService` at construction (and send it as a
  Bearer header), guarding the store-construction ordering workflow described
  in §0's Docker note's sibling docs.
- **Components (Phase 4a):** forms (`Checkbox`, `TextInput`, `Toggle`, `Select`),
  ui primitives (`Heading`, `Badge`, `CloseButton`, `DeleteButton`, `AddButton`,
  `ViewSwitcher`), `todos/Counter`, and logic leaves (`AverageNumber`, `Rating`,
  `StatisticWidget`).
- **Context harness (§4.3):** `tests/components/helpers/context.ts` +
  `ContextHarness.svelte` seed `setTranslation`, `setKeyManager`, `setTodos`,
  `setAuth`, `setLoadingIndicator`, `setUiNotifications`, `setViewPoint`,
  `setCookieConsent` before rendering — unlocks the context-coupled component
  tests below. `tests/setup/component.ts` additionally stubs
  `Element.prototype.animate` (completing `onfinish`), `matchMedia` and the
  `$env/dynamic/public` virtual module.
- **Components (Phase 4b/4c):** dashboard widgets (`DueTodosWidget`,
  `ScoredTodosWidget`, `EventsTodayWidget`, `UpcomingEventsWidget`,
  `NewestNotesWidget`, `NewestLinksWidget`, `BookReleasesWidget`,
  `MovieReleasesWidget`, `MusicReleasesWidget`, `QuoteWidget`), logic-bearing
  leaves (`forms/InputAutocomplete`, `forms/InlineAutocomplete`, `forms/Slider`,
  `todos/NoTodos`, `check-in/DailyCheckInIcon` + `check-in/overview/CheckInIcon`,
  `libraries/shared/GenreFlexList`, `tags/TagFlexList`,
  `libraries/shared/CoverImage`), and translation-only components
  (  `PasswordInput`, `PasswordStrengthIndicator`, `PasswordMatchIndicator`,
  `ui/CookieBanner`, `NavLegalEntry`, `PopupConfirmationModal`,
  `BottomSheetConfirmationModal`, `ImportButton` + 8 provider variants:
  Goodreads/Hardcover/Bgg/Steam/Deezer/Discogs/Imdb/Chefkoch).
- **Secondary stores (TASK-11):** `Feeds` (loadMore pagination/recursion,
  filter, library flags, subscribe duplicates), `Contacts` (`contactsAZ`
  grouping/sorting/hidden books, search, photo batching), `Navigation`
  (usage tracking, `promoteMobileItem` least-used swap), `QuickAdd`
  (detect/auto-confirm/error branches, `isUrl`), `UserNotifications`
  (unread, mark-all-read, polling with fake timers), `WelcomeTour` (step
  building, navigation), `Theme` (load/apply/persist, dark-mode listener,
  `patchAnimate` — with document/window/Element stubs), `PwaInstall`
  (capture/install flow, iOS detection).

### Not yet covered

The refined next-steps roadmap (§8, Priority 1–3 and the execution order) is
now implemented: state stores with real business logic (including the
secondary stores `Feeds`, `Contacts`, `Navigation`, `QuickAdd`,
`UserNotifications`, `WelcomeTour`, `Theme`, `PwaInstall`), the context
harness, dashboard widgets, logic-bearing leaves and the translation-only
components. What remains untested is deliberately out of scope (see §8): the
heavy/skip component list (§4d — echarts, TipTap/ProseMirror, DnD,
svelte-gestures, WebAuthn, electronAPI, clipboard API, canvas), render-only
components, and the remaining boilerplate CRUD store wrappers (`Clipboard`,
`DevRequests`, `Friends`, `LibraryNavigation`, `Shortcuts`, `Statistics`,
`Weather`). E2E (Phase 5) is deliberately out of scope for now — see §8.

### Docker decision

The frontend does **not** get an API-style test image. The backend's one-shot
`test` container exists because PHP needs `pcov` and only ever runs in Docker;
the frontend test suite is 100% in-process (mocked fetch), so a test container
would add orchestration with zero isolation — and the compose bind-mount of
`../app/:/app` means a test container runs the host's `node_modules` anyway.
Frontend tests run on the host via Vitest. Docker only enters at the future
integration/E2E layer, which needs the full stack up (api/nginx at `:8000`).

---

## 1. Current state

- Vitest 4.1.8 with `environment: 'node'`, `env: { TZ: 'UTC' }`, `$lib` alias,
  `include: ['tests/**/*.test.ts']`.
- 74 passing tests in 4 files, all **pure functions**:
    - `tests/helpers/DateHelper.test.ts`, `tests/helpers/NumberHelper.test.ts`
    - `tests/services/TodoFilterService.test.ts`, `tests/services/TodoSortingService.test.ts`
- No component tests, no state-store tests, no E2E tests. `@testing-library/svelte`,
  `jsdom`/`happy-dom`, Playwright, and coverage tooling are not installed.

### Two blockers that gate everything (empirically verified)

1. **`.svelte.ts` files cannot be imported in the current Vitest config.**
   Importing any `src/lib/state/*.svelte.ts` throws `ReferenceError: $state is
not defined`, because the Svelte compiler plugin is not active in Vitest.
   Verified with a throwaway test against `LoadingIndicator.svelte.ts`.
2. **`$app/*` and `$env/*` modules are unresolvable** (no SvelteKit aliases),
   unless each test `vi.mock`s them. `$env/dynamic/public` is imported at
   module load by `src/lib/config/platform.ts`, so it blocks everything
   transitively (e.g. `apiRoutes.ts`).

Verified working recipe: adding `@sveltejs/vite-plugin-svelte` to the Vitest
config compiles runes in `.svelte.ts`, and `vi.mock`ing `$app/state`,
`$app/environment`, `$env/dynamic/public`, `$lib/state/Auth.svelte`,
`$lib/services/ApiService`, and `$lib/services/LocalStorageService` lets the
state classes be instantiated and tested in node. (Confirmed: `new Todos()`
works under that recipe.)

### Architecture facts that shape the strategy

- **Pure client-side-rendered SPA.** There are zero `load` functions, no
  `+server.ts`, no `+page.ts`/`+layout.ts`, no `hooks.server.ts`, no
  `*.server.*` files anywhere in `src/routes`. All data is fetched in
  `onMount` handlers that call `.load()` on state stores.
- **Data flow:** component → state store (`src/lib/state/*.svelte.ts`) →
  `ApiService` (`src/lib/services/ApiService.ts`) → REST API at
  `${getApiUrl()}/api/v1` (`http://localhost:8000` in dev). `ApiService` is a
  single fetch choke point — one seam to stub for the entire app.
- **Stores are Svelte-context singletons:** 37 runes classes, created in
  `src/routes/+layout.svelte` via `setX()`, read back via `getX()`.
    - 29 of 37 call `getAuth()` at **class-field initialisation** (so even
      `new X()` fails without a mocked Auth module or injected auth).
    - 28 construct `new ApiService(...)` internally; 12 construct
      `new LocalStorageService()`; 8 construct `new LibraryFilterService()`.
    - 5 use `page` from `$app/state` (CheckInData, Finances, LibraryNavigation,
      Notes, Todos); 3 use `browser` from `$app/environment`.
    - `QuickAdd` additionally reads `getTranslation()` and `getUiNotifications()`.
- **No DI anywhere:** stores build their own services in the constructor.
  Field initializers run _before_ the constructor body, so adding constructor
  parameters alone is not enough — the initializer must move into the
  constructor (see §4).
- **Service worker** (`src/service-worker.ts`) precaches the app shell and
  uses stale-while-revalidate, but explicitly skips `/api` GETs. It does not
  affect API mocking; it can serve stale shell during E2E runs and should be
  blocked/cleared there.
- The only type modules with runtime values are `src/lib/types/check_in.ts`
  and `src/lib/types/quick_add.ts`; all other type files are erased at compile
  time.

---

## 2. Strategy: a four-layer test pyramid

The most coverage per effort, in order:

```
               ┌─────────────┐
               │  E2E (later)│  Playwright, mocked API — a few happy paths
               └─────────────┘
            ┌─────────────────────┐
            │ Component (jsdom)   │  @testing-library/svelte — pure leaves,
            │  + integration      │  then context-harnessed feature tests
            └─────────────────────┘
         ┌────────────────────────────┐
         │  Unit: state stores        │  node + module mocks (+ small DI refactor)
         └────────────────────────────┘
      ┌───────────────────────────────────┐
      │  Unit: pure logic (helpers,       │  node — biggest cheap win
      │  services, config, ApiService)    │
      └───────────────────────────────────┘
```

Layer 1 and the pure part of layer 2 require **no new dependencies** (except a
coverage reporter). Layers 2–4 require the infrastructure changes in §3.

---

## 3. Required infrastructure changes (enable first)

### 3.1 Fix the Vitest config (`vitest.config.ts`)

Add the Svelte compiler plugin so `.svelte.ts` and `.svelte` files compile:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: { alias: { $lib: resolve('./src/lib') } },
	test: {
		include: ['tests/**/*.test.ts'],
		environment: 'node',
		env: { TZ: 'UTC' }
	}
});
```

- `sveltekit()` is the documented SvelteKit approach: it activates the Svelte
  plugin (fixes `$state` in `.svelte.ts`) **and** makes `$app/*`/`$env/*`
  resolvable, so most tests won't need to mock those.
- Alternative if `sveltekit()` proves problematic in Vitest: use
  `svelte({ compilerOptions: { runes: true } })` and `vi.mock` each `$app/*`
  / `$env/*` module per test (verified working).
- `$app/environment`'s `browser` flag may report `false` under node/jsdom
  depending on the SvelteKit version — tests that need `browser === true`
  (e.g. `LocalStorageService`) should force it:
  `vi.mock('$app/environment', () => ({ browser: true, dev: true }))`.

### 3.2 Add a jsdom project for component tests

Vitest 4 supports `projects`. Add a second project so the existing node tests
stay untouched:

```ts
test: {
	projects: [
		{ test: { include: ['tests/**/*.test.ts'], environment: 'node' } },
		{
			plugins: [sveltekit()],
			test: {
				include: ['tests/components/**/*.test.ts'],
				environment: 'jsdom',
				setupFiles: ['tests/setup/component.ts']
			}
		}
	];
}
```

Component tests live under `tests/components/` and run in jsdom.

### 3.3 New dev-dependencies (all require approval before install)

| Package                       | Purpose                                  | Version notes         |
| ----------------------------- | ---------------------------------------- | --------------------- |
| `@vitest/coverage-v8`         | `--coverage` reporting to drive the plan | match vitest 4.x      |
| `jsdom`                       | DOM for component tests                  | latest                |
| `@testing-library/svelte`     | render Svelte 5 components               | v5+ supports Svelte 5 |
| `@testing-library/jest-dom`   | DOM matchers (`toBeInTheDocument`, ...)  | v6                    |
| `@testing-library/user-event` | realistic clicks/typing                  | v14                   |
| _(later)_ `@playwright/test`  | E2E layer                                | optional, phase 5     |

### 3.4 Test support code (`tests/` layout)

```
tests/
  setup/component.ts        # jest-dom import, localStorage/global stubs, cleanup
  helpers/
    factories.ts            # todo(), category(), tag(), checkIn() builders
    context.ts              # renderWithContext(component, { stores }) — see §4.3
    fetchMock.ts            # mockFetch(routes) + ApiService fake
    localStorageMock.ts     # in-memory localStorage
  unit/                     # node env: helpers, services, config, stores
  components/               # jsdom env: component tests
```

---

## 4. Making the state layer testable (small refactor, big payoff)

The stores hold most of the app's real logic (`Todos.useFilters`,
`Todos.groupByStatus`, `Finances.getWealthSum`, library search/filter, ...) and
are currently untestable because services are constructed internally and `auth`
is a context read at field-init. The minimal, mechanical refactor:

```ts
// before — field initializer runs before the constructor body
export class Todos {
	auth = getAuth();
	apiService: ApiService;
	localStorage = new LocalStorageService();
	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}
}

// after — everything injectable, defaults preserve current behaviour
export class Todos {
	auth: Auth;
	apiService: ApiService;
	localStorage: LocalStorageService;
	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = new ApiService(auth.getToken()),
		localStorage: LocalStorageService = new LocalStorageService()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.localStorage = localStorage;
	}
}
```

This applies to:

- **28 stores** constructing `ApiService`: pass it in (Auth, Todos, Notes,
  Calendars, Finances, Feeds, all 8 libraries, Contacts, CheckInData,
  Clipboard, DevRequests, Friends, Shortcuts, Statistics, Tags, TimeTracking,
  UserManagement, UserNotifications, Weather, Navigation, QuickAdd).
- **12 stores** constructing `LocalStorageService` (incl. Auth, Theme,
  CookieConsent).
- **8 library stores** constructing `LibraryFilterService`.
- **QuickAdd**: inject `ts`/`notifications` as well.
- **Stores using `page` from `$app/state`**: keep reading `page` for now and
  `vi.mock('$app/state')` in tests; or inject a `getPathname`/`page` for the
  cleanest seams (only 5 stores; the constructor only reads path params, not a
  live value).

Scope guard: this refactor is mechanical and does not change behaviour. Do it
only as far as tests need it (one store at a time), not as a bulk rewrite.

### 4.1 Standard unit-test recipe for a store

```ts
vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/todos') } }));
vi.mock('$lib/state/Auth.svelte', () => ({
  getAuth: () => ({ getToken: () => 'test-token', /* …used methods */ })
}));
vi.mock('$lib/services/ApiService', () => ({
  default: class FakeApi {
    list = vi.fn(); get = vi.fn(); create = vi.fn();
    update = vi.fn(); delete = vi.fn(); post = vi.fn(); put = vi.fn();
  }
}));

const api = new (await import('$lib/services/ApiService')).default();
const store = new Todos(/* mocked auth */, api as any, /* fake storage */);

// test pure logic: set store.todos, call useFilters(), assert store.filteredTodos
// test CRUD: api.list.mockResolvedValue({ data: [...] }); await store.load();
```

Mock only the methods a given test exercises; `ApiService` methods return
`null` by default (safe no-ops) unless stubbed.

### 4.2 Priority stores to test first (highest logic density)

| Store                                                                                                                         | What to cover                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Todos.svelte.ts`                                                                                                             | `useFilters` (backlog/hide-it/category/tag/auto-generated visibility), `groupByStatus`, `checkUrlForFilter`, `quickCreate` recurrence-ignore logic, `toggleSortByScore`, `loadHideIt` |
| `Finances.svelte.ts`                                                                                                          | `getWealthSum`, `getBudgetTotal`, `getBudgetIncomeTotal`, `getBudgetExpenseTotal`, `getActivePage`, `loadIncome` income/expense split                                                 |
| `Auth.svelte.ts`                                                                                                              | token refresh flow, `isAdmin`, login/register request bodies, persistence keys                                                                                                        |
| `Calendars.svelte.ts`                                                                                                         | `loadMonth` date math, `getEventsForDate`, view state (skip the 3 direct `fetch` methods or stub global fetch)                                                                        |
| Library stores (BookLibrary, MusicLibrary, MovieLibrary, GameLibrary, PlantLibrary, QuoteLibrary, RecipeLibrary, LinkLibrary) | search/filter by genre/rating/type/location, wishlist/lent/unidentified flags, per-type `*View` prefs from localStorage                                                               |
| `Notes.svelte.ts`                                                                                                             | `getNewestNotes`, `getCategoryTitle`, create/delete (mock `$app/navigation`/`$app/paths`)                                                                                             |
| `CheckInData.svelte.ts`, `TimeTracking.svelte.ts`, `UserManagement.svelte.ts`, `Tags.svelte.ts`                               | pure helpers (`formatDuration`, `filterUsers`, `sort`)                                                                                                                                |

### 4.3 Component test harness (context wrapper)

Because components pull stores via `getX()`, provide a render helper that
seeds context before rendering:

```ts
import { render } from '@testing-library/svelte';

export function renderWithContext(Component, props, stores = {}) {
	// wrapper component:
	//   setTranslation(mockTs); setKeyManager(mock); setTodos(mockTodos);
	//   setAuth(mockAuth); setLoadingIndicator(mock); setUiNotifications(mock);
	//   <Component {...props} />
	// store mocks = real store instances with apiService stubbed, or `vi.mock`ed modules
}
```

Build the wrapper once with the six most common stores (`Translation`,
`KeyManager`, `Todos`, `Auth`, `LoadingIndicator`, `UiNotifications`) —
unlocks ~250 context-coupled components.

---

## 5. Coverage roadmap (layered, in order)

### Phase 1 — Complete pure-logic unit tests (node, no new deps) ✅ high ROI

Finish the untested pure modules. Current gaps:

**Services**

- `TodoGroupingService` — `groupByStatus` (untested, pure).
- `TodoRelevanceService` — `getScoredTodos` (pure, uses `daysSince`; use fake timers/fixed date).
- `LibraryFilterService` — `search`, `byRating`, `byGenre`, `byGenreAndRating`, `byType`, `byLocation`, `byUnidentified`, `byWishlist`, `byLent` (pure, type-only imports).
- `WealthStatisticsService` — `getGraphValues` (pure; `SvelteDate` + `getUrlFormat`; fix the "current date" with fake timers).
- `TodoFilterService` gaps — `filterCategoriesByHideIt`, `due: 'week'` case.

**Helpers**

- `CheckInHelper` — `getMeanValue`, `getTotalMeanValue`.
- `CheckInSummaryHelper` — `buildDaySummary`, `buildPeriodSummary`, `getDayLabel`.
- `ColorHelper` — `lightenColor`.
- `FormatHelper` — `nl2br`, `markdownToHtml` (uses `marked`, node-safe).
- `NameHelper` — `getInitials`.
- `MusicTheoryHelper` + all 4 `MusicTheory/*` modules (ChordGenerator, NoteOperations, ScaleGenerator, TheoryConstants) — large pure surface, snapshot the constants.
- `DateHelper` gaps (~14 functions): `formatDateWithWeekday`, `formatFloatingDate`, `getUrlFormat`, `getDaysInMonth`, `getLast30Days`, `getNextXDays`, `isDateThisWeek`, `isDateLast7Days`, `getCurrentTimestamp`, `getCurrentYearMonthString`, `getISODateInfo`, `getCalendarMonth`, `getCalendarWeek`, `dateFromTimestamp`.
- `NumberHelper` gap — `europeanFormat`.

**Config / effects**

- `themes.ts` — pure data.
- `effects/confetti.ts` — `createConfettiOptions` merges options (type-only import, pure).

### Phase 2 — Service boundary tests (node, tiny mocks)

- `ApiService` — stub `globalThis.fetch` (`vi.stubGlobal`): assert `list/get/create/delete/update/post/put/postFormData/uploadFile` send the right method, URL (`%s`/`%d` replacement), headers (Bearer token present/absent, Content-Type for bodies), and return semantics on `ok`/error. This is the single most valuable test target — it is the only network seam.
- `LocalStorageService` — `vi.mock('$app/environment', () => ({ browser: true }))` + in-memory `localStorage` stub; assert get/set/getJson/getNumber/getBool/destroy round-trips and JSON parse-failure → null.
- `NavHelper` — `vi.mock('$app/state')`; cover `getPageSlug`, `getPageFeature`, `showNavbar`, `isDashboard`, `isAdminRoute`, `isAuthRoute`, `isSetupRoute`.
- `platform.ts` / `urls.ts` / `features.ts` / `navigation.ts` / `apiRoutes.ts` — `vi.mock('$env/dynamic/public')` + `$app/*` + `localStorage`; assert `getApiUrl` resolution order (env → hostname map → fallback), custom-API URL persistence, `PLATFORM`/`IS_NATIVE` flags. Use `vi.resetModules()` + fresh `$env` mocks for isolation.

### Phase 3 — State stores (node + module mocks, after §4 refactor)

Apply the §4.1 recipe. Full inventory by group (37 files):

| Group            | Stores                                                                                                                                                                                                                                                                                                                                   | Extra mocks needed                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Root             | `Auth`                                                                                                                                                                                                                                                                                                                                   | `$env/dynamic/public`, ApiService, LocalStorageService                                                                                         |
| No-auth (8)      | `LoadingIndicator`, `UiNotifications`, `WelcomeTour`, `PwaInstall`, `Viewpoint`, `CookieConsent`, `Theme`, `LibraryNavigation`                                                                                                                                                                                                           | `LoadingIndicator` testable as-is; `WelcomeTour`/`LibraryNavigation` need `urls`/`$app/state` mocks; `Theme` DOM methods need jsdom or adapter |
| Auth+CRUD (21)   | `Todos`, `Notes`, `Calendars`, `Finances`, `Feeds`, `Contacts`, `BookLibrary`, `MusicLibrary`, `MovieLibrary`, `GameLibrary`, `PlantLibrary`, `QuoteLibrary`, `RecipeLibrary`, `LinkLibrary`, `Clipboard`, `DevRequests`, `Friends`, `Shortcuts`, `Statistics`, `Tags`, `TimeTracking`, `UserManagement`, `UserNotifications`, `Weather` | Auth + ApiService (+ LocalStorageService for the 12 that use it)                                                                               |
| `page` users (5) | CheckInData, Finances, LibraryNavigation, Notes, Todos                                                                                                                                                                                                                                                                                   | `$app/state`                                                                                                                                   |
| Special          | `QuickAdd` (3 contexts), `Navigation` (`$env/dynamic/public` + `auth.user.settings`), `Translation` (`browser` + `navigator.language`)                                                                                                                                                                                                   | per-file                                                                                                                                       |

### Phase 4 — Component tests (jsdom, after §3.2/§3.3)

**4a. Pure/presentational leaves (~70, low effort).** No context, no `$app`:

- `forms/` (11): Checkbox, DateInput, DateTimeInput, NumberInput, TextInput, Select, Slider, Toggle, SvelteDateInput, InputAutocomplete, InlineAutocomplete.
- `ui/buttons/` (17): AcceptButton, AddButton, CloseButton, CloudButton, DeleteButton, EditButton, FunnelButton, HamburgerButton, IconButton, ImportButton, InlineDeleteButton, InlineEditButton, InlineExpandButton, RefreshButton, SaveButton, StarButton, TextButton.
- `ui/icons/` (12), `ui/menus/` (2: MenuIcon, RightClickMenu), `ui/` primitives (~18): Badge, Card, Divider, File, Flag, Heading, SubHeading, ModalFormRow, Tabs, ViewSwitcher, NavEntry, NavEntryIcon, MovableHoverBox, HelpTooltip, LoadingLogo, StaggeredLogo, QuickSelectOverlay, PopupContentModal, BottomSheetModal, SlidingSideBar.
- Feature leaves: `todos/Counter`, `check-in/` (DailyCheckInIcon, CheckInIcon, AverageNumber), `libraries/shared/` (Rating, CoverImage, MissingCover, GenreFlexList, ExternalSearchLink, BookRelease), `tags/TagFlexList`, `dev-requests/Author`, `guitar/GuitarTheoryNavigation`, `admin/StatisticWidget`, `notes/AddFolderButton`/`AddNoteButton`/`editor/ToolbarDivider`, `settings/SettingsSection` + SettingsNavigation*, `dashboard/widgets/*` (the props-driven ones: DueTodosWidget, ScoredTodosWidget, EventsTodayWidget, UpcomingEventsWidget, NewestNotesWidget, NewestLinksWidget, BookReleasesWidget, MovieReleasesWidget, MusicReleasesWidget, QuoteWidget).

**4b. Translation-only components (~20).** Presentational but call `getTranslation()`; become trivial once the §4.3 harness exists: the `*ImportButton`/`*Button` icons, `NoTodos`, `PasswordInput`, `PasswordStrengthIndicator`, `PasswordMatchIndicator`, `ui/CookieBanner`, `PopupConfirmationModal`, `BottomSheetConfirmationModal`, `NavLegalEntry`.

**4c. KeyManager + domain integration.** With `setKeyManager()`/`setTodos()`/`setAuth()`/`setLoadingIndicator()`/`setUiNotifications()`/`setViewPoint()` in the harness:

- Todos feature: `views/{CardView,ListView,OverviewView}`, `props/*` (Category, DueDate, Effort, Flags, Link, Priority, Progress, Recurrence, Status, Subtasks, Tags, Title), `actions/{TodoCreate,TodoDelete,HideIt,SortByScore}`, `TodoNavigation*`, `ListAndAdd`.
- Calendars: `views/{day,week,month,list}/*`, `NavigationEntry`, `MobileCalendarHeader`.
- Dashboard: `YourDay`, `QuickGlance`, plus context widgets.
- Libraries: shared `Entries/Header/Search/ShelfView/SpineView/CreateModal/DetailModal`.
- Feeds, time-tracking, notes, check-in, settings, finances as capacity allows.

**4d. Heavy/skip (~15 components).** Do not attempt in jsdom without heavy stubbing — exclude from automated coverage or stub their leaf dependencies:
`charts/*` (echarts), `notes/editor/*` (TipTap/ProseMirror), `todos/views/KanbanView` (svelte-dnd-action), `ui/Notifications` (svelte-gestures), `settings/SecuritySettings` (simplewebauthn), `forms/{DatePicker,MultiSelect}` (datepicker/svelte-multiselect), `settings/{TagEdit,LocalizationSettings}`, `contacts/AddressBook*` (color picker, tzdb), dompurify/marked-rich components, `desktop/TitleBar` + `settings/UpdateChecker` (electronAPI), `clipboard/ClipboardList` (clipboard API), `tour/WelcomeTour`, `quick-add/QuickAddModal`. `ImageService.resizeImage` (canvas) is likewise skipped or reduced to pure resize-math.

### Phase 5 — E2E (optional, later)

If desired, Playwright against the real dev server with API responses mocked at
`http://localhost:8000/api/v1/**` (or via a stub server). High-value flows:
auth (email/password + WebAuthn virtual authenticator), todos CRUD, calendar
month navigation, a library search. Must block/clear the service-worker cache
(`serviceWorkers: 'block'` or `caches.delete()`) for deterministic runs.

---

## 6. Expected coverage & measurement

- Use `@vitest/coverage-v8` with `npm run test:coverage`.
- Treat coverage as a **signal, not a target**: after the §8 roadmap, the
  remaining uncovered code should be the explicit out-of-scope list — third-party
  wrappers, canvas/DOM-heavy leaves, and render-only components.
- Keep the out-of-scope paths excluded (`exclude` in the coverage config) so
  the number stays honest and comparable over time.
- Re-measure after each priority and watch _where_ the uncovered lines are,
  not the headline percentage. The number will stay modest while the 357
  components and 37 stores exist, because most of them are intentionally not
  tested (see §8).

## 7. Risks & caveats

- **SvelteKit `$app/state` `page` object** in tests is a static mock; code that
  reacts to `page` changes won't be exercised at unit level (fine — component
  tests cover rendering paths).
- **Run/effect timing:** stores use `setTimeout`/`tick`/`setInterval`
  (`quickCreate`, `recentlyCreated`, `UserNotifications`, `Calendars`,
  `Notes`). Use `vi.useFakeTimers()` and `flushSync`/`await tick()`.
- **`SvelteDate` ignores `vi.setSystemTime`:** `svelte/reactivity`'s `SvelteDate`
  captures the native `Date` at module load (in both the client and server
  builds), so the fake-timer clock never reaches `new SvelteDate()` — it always
  returns the real current time. Tests that exercise store code reading "now"
  via `SvelteDate` (`Calendars` constructor/`goToToday`, `CheckInData`
  initialisation/`isCurrentMonth`) must therefore assert against the real
  `new Date()` on real timers, never against a hardcoded date — a hardcoded
  "today" only passes on the day it was written.
- **jsdom gaps:** `matchMedia`, `ResizeObserver`, `IntersectionObserver`,
  `navigator.clipboard`, canvas 2D context need small stubs in
  `tests/setup/component.ts`.
- **i18n invariant:** when adding/verifying UI strings in component tests,
  keep all four locales (`en/de/es/fr`) in sync — `npm run check` enforces it.
- **Pinned deps:** all additions must be pinned and installed only with
  approval (AGENTS.md hard rule).
- **Do not over-test third-party wrappers:** ECharts/TipTap/DnD behavior is the
  library's responsibility; assert our props/logic, not their internals.

## 8. Next steps — where to invest next (current roadmap)

Guiding rule: **test what has logic or a contract worth pinning; nothing else.**
The 8.7% figure is low because the denominator is the whole of `src/lib` (357
components, 37 stores), most of which is boilerplate or third-party wrappers.
Raise it by testing the real logic — not by chasing a number.

### Priority 1 — State stores with real business logic (highest value)

| Store                  | What is genuinely testable                                                                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Calendars`            | `loadMonth` (42-day grid math), `getEventsForDate`, month/week/day navigation, view state                                                                                                          |
| `Auth`                 | login/register/refresh/passkey flows, load-from-localStorage, token-expiry branch, `isAdmin` — the security surface; the token-capture recipe is proven in `tests/unit/auth/AuthTokenFlow.test.ts` |
| `Notes`                | `getNewestNotes`, `getCategoryTitle`, create/delete (mock `$app/navigation`/`$app/paths`)                                                                                                          |
| Library stores (all 8) | the **non-CRUD** parts: search/filter by genre/rating/type/location, wishlist/lent/unidentified flags, view-pref persistence                                                                       |
| `CheckInData`          | month navigation, date-derived `selectedDate`, scoring                                                                                                                                             |

Do **not** test the ~20 boilerplate CRUD wrappers (`createX`/`updateX`/`deleteX`
= call the API + reload). Prove the pattern once per store, then move on.

### Priority 2 — Presentational components _with logic_

Most of the ~70 "pure" leaves (icons, logos, dividers) are render-only and not
worth tests. Real value is in:

- Keyboard/selection logic: `forms/InputAutocomplete`, `forms/InlineAutocomplete`,
  `forms/Slider`.
- State-driven leaves: `todos/NoTodos`, `check-in/DailyCheckInIcon`/`CheckInIcon`,
  `libraries/shared/GenreFlexList`, `tags/TagFlexList`, `libraries/shared/CoverImage`.
- Props-driven dashboard widgets (`DueTodosWidget`, `ScoredTodosWidget`,
  `UpcomingEventsWidget`, …) — data + handlers come in as props, making them the
  cleanest integration targets in the app.
- Translation-only components (~20 `*ImportButton`s, `NoTodos`, password
  indicators) — only after Priority 3's harness exists.

### Priority 3 — Context harness (enabling investment)

One `renderWithContext` helper that seeds `setTranslation()`, `setKeyManager()`,
`setTodos()`, `setAuth()`, `setLoadingIndicator()`, `setUiNotifications()`,
`setViewPoint()` before rendering (pattern in §4.3). This unlocks the ~250
context-coupled components (todos views/props/actions, calendar views, dashboard)
and the translation-only leaves. Without it, the mock boilerplate per component
test is not worth the effort.

### Explicitly out of scope

- Heavy/skip list (§4d): echarts, TipTap/ProseMirror, DnD (`KanbanView`),
  svelte-gestures (`ui/Notifications`), WebAuthn (`SecuritySettings`),
  `DatePicker`/`MultiSelect`, dompurify/marked-rich components, electronAPI
  (`TitleBar`/`UpdateChecker`), clipboard API (`ClipboardList`).
- `ImageService.resizeImage` (canvas + `Image`).
- Icons, logos, and other render-only components.
- Third-party behavior — assert our props/logic, not ECharts/ProseMirror internals.
- E2E/Playwright for now — a client-side SPA with a mocked API at the unit level
  is already covered by store + component tests; E2E adds infrastructure for
  marginal value.

### Execution order

1. [x] `Calendars` + `Auth` store tests (biggest logic; recipe proven) — TASK-1/TASK-2.
2. [x] `Notes` + library-store filtering tests — TASK-3/TASK-4 (+ `CheckInData`, TASK-5).
3. [x] §4.3 context harness — TASK-6.
4. [x] Dashboard widgets + logic-bearing leaves — TASK-7/TASK-8.
5. [x] Translation-only components — TASK-9.
6. [x] Re-run `npm run test:coverage` and inspect the remaining uncovered lines —
   they cluster in the "explicitly out of scope" list above (plus the secondary
   stores named in §0). The suite is "complete enough" rather than "maximised",
   which is the goal.
7. [x] Optional follow-up: secondary stores with real non-CRUD logic — `Feeds`,
   `Contacts`, `Navigation` (+ `PUBLIC_DISABLE_DEV_REQUESTS` env branch),
   `QuickAdd`, `UserNotifications`, `WelcomeTour`, `Theme` (DOM-stubbed),
   `PwaInstall`. All landed in `tests/unit/stores/` and brought `lib/state`
   statement coverage to ~56%.
