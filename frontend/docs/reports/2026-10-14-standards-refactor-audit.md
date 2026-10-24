read: true
# Code quality audit: the standards refactor series

Date: 2026-10-14
Scope: every commit after `a401ee8` ("Coding Standards merged into one doc") up to
`b62434d` on `main` — the ESLint/Prettier cleanup and the thirteen numbered backlog
jobs (01–13). 261 files changed in `src/` and `tests/`, +4008 / −2458 lines.
Method: the "Check:" greps from `docs/STANDARDS.md` run against both the baseline
and `HEAD` (`git grep <ref>`), all three gates run on `HEAD`, the full diff of the
behaviour-sensitive jobs (04, 05, 06, 09, 11, 12 and the lint pass) read, the new
files read in full, and every job's `implementation.md` / `verdict.md` checked for
recorded deviations.

**Overall: GOOD.** The refactors did what the standard asked, the gates are green,
nothing I found is a blocker. The measurable debt the standard named is mostly
gone. What is left is (a) a short list of rules that never got a backlog item,
(b) a handful of small smells the jobs introduced while fixing bigger ones, and
(c) documentation that no longer describes the code.

---

## 1. Did the changes improve things?

Every number below is the standard's own check, run at the baseline commit and at
`HEAD`. `MusicTheory/` is excluded from the comment count as the standard allows.

| Check (rule) | Baseline `a401ee8` | `HEAD` | Verdict |
| --- | ---: | ---: | --- |
| `{@const}` uses (1.5) | 40 | 1 | done — the one left is the sanctioned `TodoEditModal` case |
| `{@const}` with a call/operator on the RHS (1.5) | 23 | 0 | done |
| files with `$effect` (5.2) | 29 | 10 | done; each of the 10 reviewed below |
| `$derived(() => …)` (backlog) | 7 | 0 | done |
| most `$derived` in one component (3.2) | 9 (`week/Day`) | 5 | done |
| module-level `export const = $state` (11.1) | 1 | 0 | done |
| `keyHandlers = $state` (3.6) | 35 | 0 | done |
| private key listeners (9.1) | 6 | 5 | the 5 are the two layout forwarders + three 9.3 input cases |
| stores with field-initialiser `getAuth()` (15.2) | 25 | 0 | done |
| `new ApiService(` outside `Auth` (15.3) | 9 | 1 (Auth itself) | done |
| direct `fetch(` outside `ApiService` (15.3) | 10 | 2 | `setup` health check (accepted) + `ManageWeatherCity` (owner question open) |
| `SvelteDate` importing files (14.1) | 17 | 4 | done; all four call a setter |
| angle-bracket casts `<T>x` (12.3) | 3 | 0 | done |
| `: any` / `as any` | 42 | 0 | done (lint pass) |
| `console.log` in `src/lib`, `src/routes` | 1 | 0 | done (3 remain in `service-worker.ts`, pre-existing) |
| `color-mix(…)` literal copies (2.1) | 14 | 6 | event tint is one helper; 4 identical view backgrounds + 1 slider remain |
| 24-hour array copies (2.2) | 6 | 1 | done |
| `visualViewport` listeners (2.4) | 3 files | 1 (`Viewpoint`) | done |
| raw `<input>` outside `forms/` (7.4) | 19 files | 8 files | reviewed per hit in job 10; 8 are 7.4 cases or deferred |
| comment lines outside `MusicTheory` (10.1) | 211 | 151 | `Auth` 36→1, `ApiService` 13→6; rest is pre-existing |
| `class="…{cond ? … : …}"` folded over lines (1.3) | 16 | 14 | **not done** — backlog "mechanical" item never got a job |
| `style="…{…}"` folded over lines (1.1) | 6 | 2 | two `ImportModal`s left |
| `<span role="button">` (4.1) | 19 | 19 | **not touched** — rule has no backlog item |
| `{@render icon(` (backlog) | 3 | 3 | **not touched** |
| `as keyof typeof` (2.3) | 12 | 11 | not in scope of any job |
| test files / test LOC | 56 / 9 759 | 62 / 10 927 | six new suites, all for extracted logic |
| ESLint errors | 233 | 0 | |
| `svelte-check` | errors | 0 errors, 2 warnings | warnings new, see §3.2 |
| `npm test` | 6 failing | 907 / 907 passing | |

Reading: the six "recurring themes" at the top of `STANDARDS.md` are now
measurably rare. Theme 2 (`$effect` to sync state) went from 30 effects to 10,
and the remaining ones are overwhelmingly 5.2 cases. Theme 4 (reinventing) is
where the biggest wins are: one `KeyManager`, one `Viewpoint.keyboardHeight`,
one `isOffHour`, one `getHoursOfDay`, one event-tint helper. Theme 6 (logic in
components) produced three services with tests. Source LOC grew by ~380 lines
net while removing duplication, which is the cost of the new services and the
constructor boilerplate; that is a fair trade.

What did not move: the markup folding rules (1.1/1.3) and `role="button"` (4.1).
Both are mechanical, both were listed, neither got a job.

## 2. The three gates at `HEAD`

- `npm run lint`: clean.
- `npm run check`: 0 errors, 2 warnings, both `state_referenced_locally` at
  `calendars/EventEdit.svelte:67` (`recurrenceRuleService.parse(form.recurrence_rule, form.start_date)`
  inside a `$state(...)` initialiser). Introduced by job 05; harmless (the
  initial value is exactly what is wanted) but the gate was "0 warnings" before.
- `npm test`: 62 files, 907 tests, all passing. The six pre-existing failures
  are gone.

## 3. Quality of what was written

### 3.1 Good

- `services/RecurrenceRuleService.ts` is the best new file. Field-based parse
  (13.3), one switch on `FREQ`, `preserved` keeps unknown parts verbatim so
  `INTERVAL`/`UNTIL` are no longer dropped (the data bug the standard named),
  round-trip tests, a type guard instead of a cast. `ChooseRecurrenceRule.svelte`
  went from 10 `$state` + 2 broken effects to one bindable value and zero
  reactive declarations.
- `services/CalendarEventService.ts` is `fromApi` + `groupByDay` in 40 lines,
  `(byDay[k] ??= []).push(e)` exactly as 12.4 asked, with a test that pins the
  multi-day expansion against the old loop's semantics.
- `state/CalendarDrag.svelte.ts` + `helpers/CalendarDragHelper.ts` is the shape
  11.2 described: fields and four mutators in the store, `Object.assign(this,
  INITIAL, …)` for every reset, pointer wiring as an action. The pointer state
  machine is now per-button closures, which is simpler than the old module.
- `state/SessionMonitor.ts` is a clean lift-out with a `destroy()`, cleanup
  closures collected the `Viewpoint` way, 8 tests. `Auth` lost ~60 lines and all
  36 narrating comments; the two "why" comments the standard said to keep are
  the two that remain.
- `ApiService.fetchWithRecovery(endpoint, init, buildHeaders)` removes the
  `init.headers as Record<string,string>` cast by rebuilding headers from the
  same function on retry. `postWithStatus` now returns a discriminated union.
- Job 07's constructor injection is uniform across 26 stores and a sample diff
  (`BookLibrary`, `Translation`) matches the 15.2 reference exactly.
- `forms/SegmentedControl.svelte` is a correct new primitive: `class:` for
  every conditional, `aria-pressed`, bindable value, nothing else.
- Job 11 fixed a real bug while removing an effect
  (`FeedBrowserModal`: clearing the search never restored the browse list
  because the effect's guard was always false).
- Test names read as behaviour ("expands a multi-day all-day event onto every
  day, end day included"), not as implementation.

### 3.2 Smells introduced by the refactors

None of these block anything; they are the places where a job fixed the named
problem and left a smaller one.

`[helpers/DateHelper.ts:415-426] Naming: eachDayBetween(start, end) excludes start and includes end`
The JSDoc above it ("The days after `start` … up to and including the first one
that reaches `end`") exists precisely because the name does not say that.
Job 02 preserved the old loop byte-for-byte (correct for "no visual change"),
but a helper with a misleading name now sits in the shared module. Either
rename (`daysFollowing(start, until)`) or have `groupByDay` compute the range
it actually means and drop the comment.
blocker: no

`[helpers/DateHelper.ts:28,405,410,415; helpers/ColorHelper.ts:14,30,35,40] Comments: eight JSDoc one-liners added by jobs 02/03/06`
Rule 10.1 says no JSDoc on internal functions and no comment that restates the
signature. `/** The 24 hours of a day as zero-padded strings, '00' to '23'. */`
above `getHoursOfDay()` is exactly that. The jobs that stripped 40 comments from
`Auth` added these in the same series.
blocker: no

`[routes/check-in/date/[date]/+page.svelte:21-25; libraries/shared/ShelfView.svelte:31-34] Readability: the "void dep; return initial" writable-$derived idiom`
```ts
let save = $derived.by((): CreateCheckInRequest | null => {
	void page.params.date;
	void checkInData.data;
	return null;
});
```
This is a `$derived` whose only job is "reset to null when either of these
changes", then assigned to from a handler. It is valid Svelte 5, it removed an
effect, and the verdict accepted it. But a reader has to know the trick, and
the repo's own policy (`docs/policies/limited-use-of-derived-and-effect.md`)
calls both `$derived` and `$effect` smells. A `{#key page.params.date}` around
the editor, or resetting in the navigation handler, says the same thing in
plain code. Two sites; worth a short decision in `STANDARDS.md` either way so
the next author does not have to guess whether this is the house idiom.
blocker: no

`[calendars/views/week/Day.svelte] Still the busiest component after three jobs`
Jobs 03, 06 and 11 each improved it (9 `$derived` → 4, snippet for the two
buttons, `class:` instead of folded ternaries, action instead of four
`onpointer*`). What is left:
- `:172` and `:196` — two identical `onclick={async () => { await calendars.showSidebar(date); }}`; rule 4.1 says a named handler.
- `:183`, `:205` — the event key `item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime()` is written out in markup while `getCalendarEventKey()` exists (`state/CalendarDrag.svelte.ts:27`). Nine copies across the calendar views.
- `:204` — `{#if entriesByHour[…].entries.length > 0}` around an `{#each}` of the same list is redundant.
- `:88-123` `computeTarget()` — geometry with the magic fractions `3/30` and `1/27` that also appear in `getIndicatorTop()` and in the `desktopRows` string. Job 06 recorded this as open question Q3; it belongs next to `snapToMinutes` in `CalendarDragService` with the fractions as named constants.
blocker: no

`[state/CalendarDrag.svelte.ts:27] Placement: a pure function exported from a store file`
`getCalendarEventKey` is a helper (15.8 → `helpers/`), not store state. It is
also what the nine inline key expressions above should call.
blocker: no

`[helpers/CalendarDragHelper.ts:132] Encapsulation: the action pokes a store field`
`setTimeout(() => (drag.suppressClick = false), 0)` bypasses the store's
mutators; every other write goes through `begin/update/finish/cancel/consumeClick`.
A `drag.clearSuppressedClick()` keeps the rule "state is written by its owner".
Also `:29-30`: `(el as HTMLElement).closest(…)` — `Element` already has `closest`,
only the return needs the cast.
blocker: no

`[services/CalendarDragService.ts:4; state/CalendarDrag.svelte.ts:11] Duplicate type`
`CalendarDropTarget` and `CalendarDragTarget` are the same three fields.
`Calendars.moveEvent` takes one, the action produces the other. Job 06 Q4, still open.
blocker: no

`[state/SessionMonitor.ts] Placement: not a store, lives in state/`
No `$state`, no `setX/getX`. By 11.1 a helper class with no context belongs in
`helpers/`; 15.2 says `state/` is context singletons. Its test is in
`tests/unit/auth/`, a directory that exists only for this file. Pick one home.
blocker: no

`[charts/*.svelte] Consistency: four effects that are really onMount`
Job 11 turned `chartContainer`/`isInitialized` into plain `let`s, so the
`$effect(() => { if (!isInitialized && chartContainer) createChart(); })` in
all four chart wrappers now has no reactive dependency and runs once. The same
job converted the identical pattern in `MobileDayView`/`MobileMonthView` to
`onMount(…)`. The charts should match.
blocker: no

`[state/Auth.svelte.ts ×3; state/CheckInData.svelte.ts; state/Calendars.svelte.ts; routes/check-in/date/[date]/+page.svelte ×2] Casts added to keep behaviour`
Job 12 replaced `new SvelteDate(x)` (whose constructor accepted `null`) with
`new Date(x as string)`. Each cast marks a place where `null` silently becomes
epoch 1970 (`expires_at`, `selectedDate`). The job documented this as a latent
bug it chose not to fix. The casts are the right short-term marker; they should
not survive a second pass.
blocker: no

`[state/Calendars.svelte.ts:240-244] Rule 12.4 left as is`
`this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 1))`
— mutate-and-rewrap, the exact shape 12.4 calls out, now with `Date` instead of
`SvelteDate`. `addDays(date, 1)` exists in `DateHelper`.
blocker: no

`[state/Calendars.svelte.ts:146-149] getWidgetEvents still casts strings as Dates`
`res.data as CalendarEvent[]` on the same payload `fromApi()` was written for.
Recorded as a follow-up by job 04; it is the one place `CalendarEvent.start_date`
is still a lie.
blocker: no

## 4. Functional and behavioural changes

The series was sold as "no behaviour change". That is almost true. Every
deviation below was recorded by the job that made it; I list them so they are
in one place. "Risk" is my estimate of whether a user could notice.

| # | Change | Job | Kind | Risk |
| --- | --- | --- | --- | --- |
| 1 | `INTERVAL=`, `UNTIL=`, any non-modelled RRULE part now survives opening and saving an event. Previously dropped. | 05 | bug fix | none — strictly better |
| 2 | Rules are rewritten to canonical form on save even if untouched (`BYDAY=WE,MO` → `MO,WE`; `INTERVAL` moves after `BYDAY`; bare `FREQ=WEEKLY` gains `BYDAY=<start weekday>`). | 05 | wire format | low — semantically identical; CalDAV servers may show a diff |
| 3 | Monthly-weekday defaults are taken from the start date once, when the form opens; they no longer follow later start-date edits. Weekly still does (via the fallback). | 05 | UX | low |
| 4 | A rule the parser rejects (e.g. `FREQ=MONTHLY;BYMONTHDAY=15` on an event starting the 3rd) shows no recurrence editor at all, with no hint. | 05 | UX | medium — silent; the job suggested a hint |
| 5 | Clearing the feed search now restores the browse list. Before, stale results stayed with paging off. | 11 | bug fix | none |
| 6 | Session expiry: `Auth.expireSession()` calls the layout's handler directly instead of the layout diffing `loggedIn`. `auth.destroy()` now runs on root-layout destroy. | 09 | internal | none |
| 7 | Export download sends `Accept: application/json` (via `ApiService.image()`) instead of `application/zip`. | 09 | HTTP | **medium if the backend content-negotiates**; owner question 2 is still open and the method is literally named `image()` for a zip |
| 8 | Keyboard height: one app-wide `visualViewport` listener in `Viewpoint` instead of one per mounted modal; `TipTapEditor`'s `isMobile` gate is now reactive instead of read once. | 02 | internal | none |
| 9 | `CalendarDrag.cancel()` also resets `suppressClick` (full `INITIAL` reset). Old code left it. | 06 | edge | none in practice |
| 10 | Drag gesture state is per event button, not per `Day`. | 06 | internal | none (Playwright-checked by the job) |
| 11 | `ChooseCalendar`/`ChooseAddressBook` no longer auto-select the first entry and write it back to the bound prop; the parents (`EventEdit`, `ContactEdit`) initialise the id themselves. | 11 | internal | none — both pickers have exactly one caller |
| 12 | `ContactEdit` builds its form once from `activeContact` instead of re-syncing in an effect. Safe because it is mounted under `{#if contacts.createModalVisible}`. | 11 | internal | none |
| 13 | `BottomSheetConfirmationModal` now renders its `description` prop (it was accepted and ignored). | lint | UI | low — mobile confirmations gain a line of text they were always meant to have |
| 14 | `MovieReleasesWidget.svelte` and `ManageEmailNotifications.svelte` deleted. Both were unreferenced (the widget was imported in `Inspiration.svelte` but never rendered). | lint | dead code | none |
| 15 | `ApiService` auth-only retry after recovery sends `Bearer null` instead of no header when recovery returned `true` without a token. Cannot happen today. | 09 | edge | none |
| 16 | Arrow keys in `ShelfView` go through `KeyManager` with `preventDefault: false`; same caret behaviour in inputs. | 08 | internal | none |
| 17 | ESLint `svelte/no-navigation-without-resolve`: all `goto('/')` and literal `href`s now go through `resolve(urls.x)`. | lint | internal | none |

Items 4 and 7 are the two the owner should decide on before calling the series
"behaviour-neutral". Item 7 in particular: the old code set `Accept:
application/zip` deliberately, and nothing in the repo shows whether the API
cares.

The manual desktop/mobile pass that jobs 03, 06, 10 and 11 each asked for (no
API was reachable in the agent sessions) is still outstanding as far as the job
records show. Static review found nothing wrong in those areas, but the ghost
position in day/week/month view and the portalled recurrence popover are the
two things static review cannot confirm.

## 5. Remaining issues

### 5.1 Rules in the standard with no backlog item (never addressed)

- **4.1 `<span role="button">`**: 19 uses in 14 files, unchanged.
  `CategoryHeader.svelte` (4), `CreateModal.svelte` (2), `TodoNavigationDesktop.svelte` (2), and one each in `ChooseCalendar`, `AddressBook`, `ChooseAddressBook`, `ContactDetail`, `NoteNavigationCategoryRenderer`, `Description`, `Link`, `Subtask`, `Title`, `CompactEntry`, `HelpTooltip`.
- **1.3 folded class ternaries**: 14 left. Three identical copies in
  `todos/props/Effort.svelte:62,68,74`; two in `ui/Card.svelte:47,60`; the rest
  single (`PasswordMatchIndicator`, `PasswordStrengthIndicator`, `Rating`,
  `CompactEntry`, `NoteNavigationCategoryRenderer`,
  `NoteNavigationFavoriteNoteRenderer`, `UserEntry`, `Score` ×2).
- **1.1 folded style**: `contacts/ImportModal.svelte:181`,
  `calendars/ImportModal.svelte:181` — the same progress-bar expression in two
  files, which is also a 2.1 case.
- **1.10 formatting**: six files have no semicolons at all
  (`notes/editor/{InsertImageModal,InsertLinkModal,TipTapEditor,TableBubbleMenu,EditorToolbar}.svelte`,
  `tour/WelcomeTour.svelte`); five files have space-indented lines
  (`forms/FileUpload`, `ui/LoadingIndicator`, `desktop/TitleBar`,
  `types/notification_settings.ts`, `routes/notes/import/+page.svelte`); and
  "no trailing comma" is violated at roughly 250 sites across `src/` (a Prettier
  legacy). The last one is either enforced by an ESLint `comma-dangle` rule or
  dropped from the standard; a hand rule nobody follows is noise.
- **2.1**: the view background
  `color-mix(in srgb, var(--color-c-primary) 12%, var(--color-c-bg))` is pasted
  into `WeekView`, `MonthView`, `DayView`, `ListView`. Job 02 noted it (Q2).

### 5.2 Backlog items still open (verified against the code)

- `{@render icon({ class })}` in `ui/Card.svelte:34`, `ui/CardButton.svelte:28`, `libraries/LibraryNavigationEntry.svelte:27` → `<Icon class="…" />`.
- i18n key `enable_email_notifications` orphaned in all four tables.
- `ManageWeatherCity.svelte:31` direct `fetch` (owner decision pending).
- `WeekView.svelte:17-21` and `MobileWeekView.svelte:21-25` both set year/week by hand instead of `calendars.goToToday()` (owner dropped it in job 03; the ISO-year bug in `goToToday()` noted there is still there).
- `ShelfView.svelte:110,152,175` section-separator comments (10.1).
- `KeyManager.helperKeyTimeouts` is `$state` bookkeeping (3.6), noted by job 08.
- `NoteNavigationDesktop`/`NoteNavigationMobile` read `auth.user?.settings?.journal_enabled` in the component (3.3), noted by job 11.
- `routes/notes/import/+page.svelte`: raw file input, raw submit, ~8 untranslated strings (own job, per job 10).
- `todos/actions/TodoCreate.svelte:143` literal "Recurrence"; `settings/ExportSettings.svelte:101` literal "Download failed." (8.1).
- `getIcon`/`getBarColor`/`getBarColorFood` duplicated across the check-in views (2.2), noted by job 13.
- `viewPoint.destroy()` is never called from the layout (11.4), noted by job 09.

### 5.3 The remaining `$effect`s, one by one

Ten files. Seven are plain 5.2 cases: `UpdateChecker` (subscription with
cleanup), `FeedView` (IntersectionObserver with cleanup), `CoverImage` (image
preload with cleanup; the two synchronous resets at the top are writes without
reads, so no loop), and the four chart wrappers (echarts; see §3.2 for
`onMount`). Three are not:

- `[routes/notes/journal/[date]/+page.svelte:28-50]` — reads `notes.loaded`,
  `page.params.date`, keeps `openedKey` and guards with `if (openedKey === key)
  return`. Rule 5.3 names that guard as "the tell". It also carries two narrating
  comments and a `goto`. Job 11 left it as open question 1. The shape 5.4/5.6
  wants: the store exposes `openJournalEntryForSlug(slug)` and the page calls it
  from `afterNavigate` (or the `[date]` route's `load`-free `onMount` + a `{#key}`).
- `[routes/time-tracking/[id]/+page.svelte:65-69]` — `if (tt.loaded && !project) goto(…)`.
  A redirect decided by watching store state. Job 11 open question 4.
- `[tour/WelcomeTour.svelte:23-27]` — reads `tour.currentStep`, then
  `untrack(() => handleStep(step))` which writes `targetRect` and
  `transitioning`. Pre-existing (initial commit); it is a 5.1 violation and the
  file is also the one with no semicolons.

### 5.4 Store size (11.5)

`Calendars.svelte.ts` is 621 lines and 55 public methods: month/week/day
navigation, mobile selection, events CRUD, recurrence occurrences, drag moves,
attachments (todos *and* notes, calling `apiRoutes.todos.list` and
`apiRoutes.notes.list`), calendar CRUD, import, sharing and invites. It is now
the largest store, bigger than `Auth` was when 11.5 was written about it. The
sharing/invite block (`shareCalendar` … `declineInvite`, `openShareModal`,
`closeShareModal`) and the import block are each self-contained in the sense
11.5 means. `Auth` at 483 lines is still above the line too.

### 5.5 Documentation drift

The code moved; the documents that describe it did not, and the job notes say
so repeatedly ("left for the owner"). Concretely:

- `docs/STANDARDS.md`: section **1.10 appears twice** (lines 231 and 252,
  identical). §5.2 "lists 29 files" (10). §9 intro `src/lib/KeyManager.svelte.ts`
  (now `state/`). §9.2 `SupportedKey` list and the ShelfView "known violation"
  (fixed). §11.1 "only its path is wrong; backlog" (fixed). §14.1 "16 files
  today" (4). §15.2 "26 stores still use it" (0). §15.3 known violations list
  (`Calendars` and `ExportSettings` fixed; only `ManageWeatherCity` left). §1.5
  "40 uses … one of them valid" (1). §7.1 check "19 files today" (8).
- `docs/STANDARDS_BACKLOG.md`: 34 of 38 boxes are unticked; by my count about
  26 of those are done. Its intro says the entries are grouped in
  `docs/backlog/*.md`; `b62434d` deleted that directory. The file's own rule is
  "tick items off as they land, and delete this file when it is empty".
- `docs/TESTING.md` §7 still says `DateHelperExtended.test.ts` fails.
- `.claude/CLAUDE.md` says "no component or integration tests"; `tests/components/`
  has nine suites and a `ContextHarness.svelte`.

This matters more than it sounds: the standard's value is that a reviewer can
say "line X violates rule Y and here is the grep". Stale counts and paths make
the greps lie, and the next agent that reads "26 stores still use the old
style" will go looking for them.

## 6. Suggestions

1. **Close the loop on the docs first.** Half a day: dedupe 1.10, refresh the
   counts with the greps in §1 of this report, tick or delete the backlog,
   remove the `docs/backlog` reference, fix TESTING.md. Then the standard is
   trustworthy again and the next series starts from truth.
2. **One mechanical job for the untouched rules**: 4.1 (`role="button"` → `<button>`),
   1.3 (14 folded ternaries), the two `ImportModal` style folds, `{@render icon}`,
   the orphan i18n key, the four `color-mix` view backgrounds. All greppable,
   no behaviour, one commit each or one commit total.
3. **Decide the two behaviour questions** (§4 items 4 and 7) and the three
   non-5.2 effects (§5.3). These are the only places where "no behaviour
   change" is not yet demonstrably true.
4. **Lint what can be linted.** Three of the hand rules now have a known gap
   that ESLint could close: `comma-dangle: never` (1.10), `semi: always`
   (1.10), and `no-restricted-syntax` for `role="button"` on a `span` (4.1).
   The standard already says rule 12.1 is "on the author and the reviewer"
   because `noUnusedParameters` would not work; the three above would.
5. **Second pass on `Day.svelte` and `Calendars`**: move `computeTarget` into
   `CalendarDragService` with named constants for the grid fractions, unify
   the two target types, route `getWidgetEvents` through `fromApi`, use
   `getCalendarEventKey` in markup, and split sharing/import out of
   `Calendars` (11.5). That closes job 06's three open questions and job 04's
   follow-up in one brief.
6. **Settle the writable-`$derived` reset idiom** in `STANDARDS.md` (§3.2):
   either it is the house way to say "reset when X changes" and gets a named
   example, or it is not and the two sites get a `{#key}`. Right now the policy
   file and the code disagree.
7. **Keep the job hygiene.** Every job's `implementation.md` recorded its
   deviations honestly, and that is the only reason §4 could be written. The
   one thing to add: a job's definition of done should include ticking its own
   backlog boxes and updating the counts it changed in `STANDARDS.md`, instead
   of "left for the owner" thirteen times.

---

### Appendix: reproducing the numbers

Run against any ref with `git grep -n -E '<pattern>' <ref> -- src`:

| Check | Pattern |
| --- | --- |
| `@const` | `\{@const` |
| `$effect` files | `git grep -l '\$effect\(' <ref> -- src` |
| module `$state` | `^export const .* = \$state` |
| key listeners | `addEventListener\('key\|<svelte:(window\|document\|body) onkey\|onkeydown=` |
| field-initialiser stores | `^\s*auth = getAuth\(\);` in `src/lib/state` |
| folded class | `class="[^"]*\{[^}]*$` |
| folded style | `style="[^"]*\{[^}]*$` |
| `role=button` | `role="button"` |
| comment lines | `^\s*(//\|<!--\|/\*\|\*)` excluding `MusicTheory` |
