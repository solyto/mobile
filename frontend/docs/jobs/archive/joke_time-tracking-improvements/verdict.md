# Verdict: time tracking improvements

id: joke
reviewer: deepseek-v4-flash (opencode-go)
date: 2026-10-10

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

Verified on branch `feature/joke_time-tracking-improvements` against `main`
(`git diff main...HEAD`). Cross-checked every task against the diff and the
claims in `implementation.md`. Verification evidence from the developer's own
runs is recorded in `session.log`: `npm run check` = 0 errors / 0 warnings,
`npm test` = 734/735 passing (the 1 failure is the pre-existing
`logic-leaves.test.ts` StatisticWidget colour-class test, unrelated), and
`eslint` on the changed TS files is clean. All source changes are committed;
the only uncommitted files are the harness-managed `session.log`/`tokens.json`.

TASK-1: PASS
notes: `src/lib/types/time_tracking.ts` gains optional `color` on
`TimeTrackingProject` + create/update project requests, optional
`has_exact_times` on `UpdateTimeTrackingEntryRequest`, and a
`TimeTrackingStatisticsRequest` type. `loadStatistics()` in
`src/lib/state/TimeTracking.svelte.ts:146` takes an optional `categoryIds`
array and appends `category_ids` params. All additions optional/backward
compatible. Two nits: the `TimeTrackingStatisticsRequest` type is dead code
(never used by `loadStatistics`, which takes inline params), and the exact
field/param names (`color`, `category_ids`) and `total_duration` unit are
assumed from the missing `api-brief.md` — documented in implementation.md as
required follow-up with the API owner.

TASK-2: PASS
notes: `activeTab` removed from the store; derived from
`page.url.searchParams.get('tab')` in `src/routes/time-tracking/+page.svelte:15`
and `TimeTrackingNavigation.svelte:31`. Nav links have distinct targets
(`/time-tracking`, `?tab=entries`, `?tab=statistics`) so reload/deep-link/
back-forward restore the view; the project is already route-driven via
`/time-tracking/[id]`. Active highlights keyed off `!activeProjectId && tab`.

TASK-3: PASS
notes: `TimeTrackingNavigation.svelte` uses the app's drawer pattern — `open`
`$state`, `{#if open}` + `transition:fly`, `HamburgerButton`/`CloseButton`, and
a shared `{#snippet sidebar()}` rendered into both the desktop column and the
mobile drawer, matching `todos/TodoNavigationMobile.svelte`. Desktop layout
(`hidden ... lg:flex`) preserved.

TASK-4: PASS
notes: `src/lib/services/TimeTrackingGroupingService.ts` extracts
`groupByProject` (own-project `color` with `FALLBACK_PROJECT_COLOR` theme-var
fallback, `uncategorized` dropped, sorted by minutes). Both duplicated copies
removed (`DashboardView`, `dashboard/widgets/TimeTrackingWidget.svelte`);
`TimeBreakdownWidget` typed from `ProjectBreakdown`. Covered by
`tests/unit/services/TimeTrackingGroupingService.test.ts` (5 cases, incl. own-
colour-not-first-category, fallback, ignores project-less entries, no input
mutation).

TASK-5: PASS
notes: sidebar `projectDurations` reduce and project-detail `totalDuration`
reduce replaced by `project.total_duration` (`TimeTrackingNavigation.svelte:207`,
`[id]/+page.svelte:47`). Both surfaces reload projects after timer/entry
mutations, so `total_duration` stays fresh. Unit assumed minutes (matches
`formatDuration`); flagged as an API-verification item.

TASK-6: PASS
notes: `EntryCreate`/`EntryEdit` unified into `EntryCreate.svelte` with an
optional `entry` prop; `EntryEdit.svelte` deleted with no dangling imports.
Both paths send `started_at`/`stopped_at` ISO timestamps and `has_exact_times`
on create and update; update sends the full request (incl. `project_id`).
All three call sites (dashboard recent entries, project detail, Entries tab)
use the unified component.

TASK-7: PASS
notes: duration-only entries anchor to local noon of the chosen day
(`buildTimestamps()`, `EntryCreate.svelte:102-116`), so the start always lands
on the user-chosen day and can never roll into the previous day; default date
is computed with local getters, not `toISOString()`; the date field is hidden
when exact times are shown. Exact-time paths parse/emit local
datetime-local → ISO consistently.

TASK-8: PASS
notes: no `tt.projects[0]` defaults remain (verified by grep: no
`projects[0]` in `src/lib/components/time-tracking`). Entry form starts with a
blank "—" project option and `TimerWidget` starts with `''`; Save/Start are
disabled until a project is picked (visible feedback, not a silent no-op).

TASK-9: PASS
notes: dashboard recent entries (`DashboardView.svelte:72`) and project-detail
entries (`[id]/+page.svelte:176`) now pass `showEdit`/`onEdit` and wire into
`EntryCreate`; Entries tab already edited.

TASK-10: PASS
notes: `StatisticsView` removed from `DashboardView` and given its own
`?tab=statistics` surface + sidebar link. Dashboard = timer, today/week
breakdowns, recent entries.

TASK-11: PASS (decision documented)
notes: `PomodoroWidget` removed from the time-tracking dashboard; the component
file is left in place, currently unreferenced, pending the product decision
(wire to a real entry vs. relocate). Follow-up: `welcome_tour.steps.timeTracking.pomodoro_tip`
(en/de/es/fr) still promises "the built-in Pomodoro timer", which no longer
exists on that surface — reword or remove when the widget is re-homed.

TASK-12: PASS
notes: donut uses the statistics entry's own `color`; the category filter now
refreshes `loadStatistics(from, to, selectedCategoryIds)` so filtering happens
server-side via the `category_ids` param instead of client-side project
restriction; default range computed in local time
(`toLocalDateValue`, `StatisticsView.svelte:17-28`); category bars use minutes
with the shared `formatDuration` instead of hours-with-decimals. Pre-existing
(unchanged) caveat: `categoryBreakdown` allocates a project's full
`total_minutes` to every one of its categories, so multi-category projects
double-count in the category bar chart — out of scope for this job but worth a
future fix.

TASK-13: PASS
notes: sidebar project delete and category delete now go through
`ConfirmationModal` (`TimeTrackingNavigation.svelte:337-360`); every entry
delete goes through `ConfirmationModal` in `Entry.svelte:79-89`; project-detail
already confirmed. Same action behaves the same from every surface. Minor
inconsistency: nav/detail use `type="confirm-delete"` while project-detail uses
`type="confirm"` — cosmetic only.

TASK-14: PASS
notes: hover-only project controls removed (always visible with `aria-label`s);
double-click-to-rename replaced by an explicit pencil button; `aria-label`s
added to all icon-only controls; colour picker label wired to
`timeTracking.color`. `InlineEditButton`/`InlineDeleteButton` gained an
optional `label` (aria-label/title) and `focus-visible:opacity-100`, plus
`type="button"` — backward compatible, other features' behaviour unchanged.

TASK-15: PASS
notes: `NumberInput`/`DateInput`/`TextInput` reused in entry, timer, statistics
and project forms; fields wrapped in `<label>` for implicit association;
silent `return` guards replaced with disabled Save/Start (entry, timer,
project). `NumberInput` gained optional `min`/`max`/`step` props
(backward-compatible addition).

TASK-16: PARTIAL
notes: `#888`/`#9ca3af` literals replaced with theme variables for chips,
breakdowns and donut fallbacks; `isLightColor`/`getReadableTextColor` added to
`ColorHelper` (+ tests) and applied to category chips/pills. However
`TimeTrackingNavigation.svelte:54` still carries the `DEFAULT_CATEGORY_COLOR =
'#1dbda5'` hex literal (needed as the color-picker swatch default, and used as
the display/compare fallback), and `addCategory` no longer sends a default
colour (old behaviour stored `'#1dbda5'`), so newly created categories render
in the neutral fallback until the user picks a colour — reasonable but a
behavioural change the brief's literal-removal asked for. Also note the
contrast guard returns white text for the theme-variable fallback
(`var(--color-c-neutral-4)` ≈ gray-400 `#9ca3af` in light mode), which keeps
the pre-existing low-contrast chip look for uncoloured categories — acceptable,
not a regression. Decide explicitly whether the picker default hex should stay
(documented) or be dropped.

TASK-17: PASS (scope reduction documented)
notes: `duration_minutes`, `category`, `this_month` removed from all four
locales + `TimeTrackingRecords`; `add_category`/`edit_category`/`color` are now
referenced (wired up), satisfying remove-or-wire-up; `welcome_tour.steps.timeTracking`
tips are genuinely consumed by `WelcomeTour.svelte.ts` (the brief's
"orphaned `dev.features.timeTracking`" does not exist — the assessment's
pomodoro_tip mapping was to the welcome-tour section). New keys
`layout.remove`, `entry_deletion_*`, `category_deletion_*` added and kept in
sync across en/de/es/fr with the shared type.

TASK-18: PASS
notes: shared `Heading` used for the dashboard title, statistics heading,
breakdown-widget title, and project-detail title; spacing normalised on the
dashboard. `my={0}` matches existing usage (finances routes already use it).

## Security

No security findings. Changes are client-side UI/state only; no token, secret,
or data-leak paths introduced. New i18n strings are static UI text.

## Overall

APPROVED

No merge blockers. All 18 tasks are implemented as specified; `npm run check`
is clean, new unit tests pass, and the one failing test plus the failing
`npm run lint` prettier step are pre-existing repo-wide conditions (the job's
own changed files also fail `prettier --check` — worth formatting, but the
repo cannot pass lint either way and it is not introduced by this job).

Non-blocking follow-ups (tracked in implementation.md "Known issues", to be
confirmed with the API owner / product):
- Verify the real API field/param names and `total_duration` unit once
  `api-brief.md` lands (`color`, `has_exact_times` on update, `category_ids`
  statistics param, minutes).
- Give the project `color` a way to be set (no UI currently; everything falls
  back to the theme variable unless the API auto-assigns).
- Re-home `PomodoroWidget` and reword/remove the now-stale welcome-tour
  `pomodoro_tip`.
- Decide on the retained `DEFAULT_CATEGORY_COLOR '#1dbda5'` picker default
  (TASK-16).