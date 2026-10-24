# Implementation: continue testing

id: white
status: open
developer: deepseek-v4-flash (opencode-go)
date: 2026-08-14

<!-- Produced by @developer after implementation. -->

## Summary

Continued the TESTING.md roadmap for the solyto frontend to completion:

- TASK-1..TASK-8 (Calendars/Auth/Notes/library-stores/CheckInData store tests,
  §4.3 context harness, dashboard-widget tests, logic-bearing leaf tests) were
  already committed in prior sessions on this branch.
- **TASK-9** (translation-only component tests: `translation-only.test.ts`,
  `nav-legal-entry.test.ts`, plus CookieConsent seeding in the harness and a
  proper `FakeAnimation` stub in `tests/setup/component.ts`) was found
  uncommitted in the working tree; it was verified passing and committed.
- **TASK-10**: re-ran `npm run test:coverage`, confirmed the remaining
  uncovered lines cluster in the §8 out-of-scope list, and updated
  `docs/TESTING.md` §0 status + §8 roadmap checkboxes.
- **TASK-11** (optional follow-up): added unit tests for all 8 secondary
  stores — `Feeds`, `Contacts`, `Navigation`, `QuickAdd`,
  `UserNotifications`, `WelcomeTour`, `Theme`, `PwaInstall` — plus a
  `NavigationEnv.test.ts` for the `PUBLIC_DISABLE_DEV_REQUESTS` branch.

Final state: **678 tests / 53 files passing** (was 565/44 at session start);
`src/lib` coverage **~22.8% statements / ~29.2% functions / ~22.2% lines**
(was 19.4%/25.1%/18.6%); `lib/state` statement coverage went from ~40% to
**~56%** (each TASK-11 store went from 0% to 62–97%).

## Changes

- TASK-9 (committed via the chore commit `60ea7d1` — see Known issues):
  - `tests/components/translation-only.test.ts` (new) — PasswordInput,
    PasswordStrengthIndicator, PasswordMatchIndicator, CookieBanner,
    PopupConfirmationModal, BottomSheetConfirmationModal, ImportButton,
    NavLegalEntry, 8 provider import buttons.
  - `tests/components/nav-legal-entry.test.ts` (new) — NavLegalEntry with its
    own `$env/dynamic/public` mock for the legal-URLs branch.
  - `tests/components/helpers/ContextHarness.svelte` — seed
    `setCookieConsent` so CookieBanner tests work.
  - `tests/setup/component.ts` — replace the inert `Element.prototype.animate`
    stub with a `FakeAnimation` that completes via `onfinish` (needed for
    modal intro/outro transitions).
- TASK-10:
  - `docs/TESTING.md` — §0 implementation status (numbers, covered /
    not-yet-covered lists) and §8 execution order converted to checkboxes.
- TASK-11 (all in `tests/unit/stores/`, stores project):
  - `Feeds.test.ts` — view persistence, loadMore pagination (offset/meta/
    recursion guard), filter/selectFeed, load, library flags, subscribe
    duplicate detection, feeds API helpers.
  - `Contacts.test.ts` — `contactsAZ` grouping/sorting/hidden/active-book/
    search-source, `contactTotal`, search/clearSearch, hidden-address-book
    persistence, color/count helpers, photo batching, load, selection.
  - `Navigation.test.ts` + `NavigationEnv.test.ts` — usage tracking,
    `promoteMobileItem` least-used swap (home never leaves the bar), mobile
    order persistence, `loadActiveFeatures` merge/save branches, and the
    `PUBLIC_DISABLE_DEV_REQUESTS` env branch in a separate file.
  - `QuickAdd.test.ts` — `isUrl`, modal state, detect (empty/error/
    needs-confirmation/auto-commit), confirm (success/error), reject/back/
    selectType; mocks `Translation`/`UiNotifications` modules.
  - `UserNotifications.test.ts` — getUnread, markRead, markAllRead, load +
    polling with fake timers + stubbed `document`.
  - `WelcomeTour.test.ts` — step building (always vs enabled features),
    navigation, finish, getters.
  - `Theme.test.ts` — load/apply/persist, theme-link creation/removal,
    animations toggle + `patchAnimate` zero-duration, dark-mode listener
    lifecycle; stubs document/window/Element (Element kept callable).
  - `PwaInstall.test.ts` — inert without window, capture/install flows,
    iOS detection, constructor standalone/`__pwaPrompt` branches.
- `docs/TESTING.md` — §0 numbers and covered lists updated for TASK-11;
  §8 execution order gains the TASK-11 item.

## Known issues / follow-ups

- **Verdict blockers resolved** (commit `9750573`): the `npm run check` /
  `npm run lint` failures flagged by the reviewer were fixed in a follow-up
  session:
  - `tests/components/helpers/context.ts` + `ContextHarness.svelte` — the
    harness `component` prop is now typed as `AnyComponent`
    (`Component<any, any, any>`, with a targeted eslint-disable for the
    unavoidable `any`; the verdict's suggested `Component<Record<string, any>,
    any, any>` does not actually type-check due to props contravariance, and
    `Record<string, never>`/derived-from-render alternatives fail either
    svelte-check or the dynamic-tag render). The local `Component` const was
    renamed to `ComponentToRender` to avoid shadowing the imported type.
    This cleared the ~42 `renderWithContext` call-site type errors.
  - `tests/unit/stores/Calendars.test.ts` — event factories now build
    `SvelteDate` values (the `CalendarEvent` type declares `Date`); removed
    the unused `formatDate` import.
  - `tests/unit/stores/LibraryStores.test.ts` — removed the unused `vi`
    import.
  - `tests/components/dashboard-widgets.test.ts` — the null-priority todo
    case is cast to `TodoPriority` (the widget treats `null` as the fallback
    color); added the `TodoPriority` type import.
  - `tests/components/logic-leaves.test.ts` — `GenreFlexList` tests build
    full `BookGenre` objects (the type requires `created_at`/`updated_at`).
  - Removed unused `render`/`afterEach` imports in `context-harness.test.ts`
    and `translation-only.test.ts`.
  - All of the branch's test files were prettier-reflowed, so `tests/` is
    eslint- and prettier-clean.
  - Verified after the fixes: `npm run check` 0 errors/0 warnings, `npm test`
    678/678 passing, coverage unchanged (~22.8% / ~29.2% / ~22.2%).
  - Note: `npm run lint` still reports pre-existing src/ noise (269 prettier
    files + 284 eslint errors in `src/lib`/`src/routes`) — confirmed
    present at the base commit with the current prettier/eslint versions
    (formatting-version drift), not introduced by this branch.
- **TASK-9's commit message**: the TASK-9 files were swept into the opening
  chore commit (`60ea7d1`) because the mandated `git add -A` staged the whole
  pre-existing working tree (which also included the `AGENTS.md` mount-file
  sync, the analyst's `tasks.md` update and the `.opencode/jobs`
  highlight_rename-category mirror deletions). No `[white] TASK-9` commit
  exists; the work itself is complete and verified.
- The remaining 0% stores (`Clipboard`, `DevRequests`, `Friends`,
  `LibraryNavigation`, `Shortcuts`, `Statistics`, `Weather`) are boilerplate
  CRUD wrappers — deliberately untested per §8 ("Do not test the ~20
  boilerplate CRUD wrappers").
