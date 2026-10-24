# Report: Smart Score (todo relevance)
read: true

Date: 2026-10-17
Job: `flash_smart-score`
Scope: the todo "Smart Score" (`ts.todos.sort_by_score`): the algorithm, the
store and UI that use it, the dashboard "Relevant" widget, and the tests. What
works, what doesn't, and what could be improved.
Method: read the code (file:line references as of `8d3943e`), measured it against
`docs/STANDARDS.md` and `docs/TESTING.md`, and computed the score table from the
constants in `TodoRelevanceService.ts` with a script. No code was changed.
Each finding is marked **verified** (follows directly from the code) or
**inferred** (depends on runtime/API behaviour that this workspace can't
observe). `npm test` could not be run: `node_modules` is not installed in this
worktree, and installing packages needs approval. The test findings below come
from reading the tests.

> Not covered here: the check-in "scored trackers" (`CheckInData`,
> `CheckInSettings`, `Averages`) and the dev-request `score`
> (`types/dev_request.ts`, `dev-requests/Score.svelte`). They are separate
> features and don't share code with the Smart Score.

---

## 1. Summary

The Smart Score is a small, readable, pure scoring function. Its result is
normalised to 0..1, and the constants are named. That is a good base. The problems
are in how the score is wired up and in how the weights interact:

1. **The dashboard "Relevant" widget can only ever show high-priority todos
   older than 30 days.** Of the 72 input combinations, only 3 pass the widget's
   `> 0.6` threshold once due/overdue todos are excluded (section 2.3). A fresh,
   high-priority, low-effort todo never appears. This is the most important
   finding.
2. **Score sorting is silently lost when the user changes a filter.** Clicking a
   workspace, category, tag or "Hide it" calls `useFilters()`, which re-sorts by
   the default order. The toggle and the score bars stay on (section 4.2).
3. **The score is coarse and has blind spots.** Only 13 distinct values exist.
   Completion, status, progress and any due date two or more days ahead are
   ignored. "Due today", "due tomorrow" and "overdue" are measured in rolling
   24-hour windows, not calendar days, so a todo due at 18:00 today counts as
   "tomorrow" in the morning (section 2.4).
4. **`getScoredTodos()` mutates its input** while its shape suggests it
   doesn't, and the only test for that is vacuous (sections 4.1, 5).
5. Several standards violations in the surrounding UI code (leaf reading the
   store, copied store state, logic inline in a component, a dead flag, a
   commented-out leftover) (section 4).

None of these is large. Most proposals in section 7 are S-sized jobs.

---

## 2. How it works today

### 2.1 Formula (verified, `src/lib/services/TodoRelevanceService.ts:4-41`)

```
score     = priority + effort + due + age
relevance = score / 300
```

| Component | Rule | Points |
|---|---|---|
| priority | high / medium / low | 100 / 50 / 0 |
| effort | low / medium / high / **null** | 50 / 25 / 0 / **0** |
| due (`daysSince(due_at)`) | `> 0` overdue · `=== 0` today · `=== -1` tomorrow · otherwise or `due_at === null` | 100 · 50 · 25 · 0 |
| age (`daysSince(created_at)`) | `> 30` | 50 |

`maxScore` (`:10`) = 100 + 50 + 100 + 50 = 300, derived from the constants, so
a top-scored todo gets exactly 1.0.

`daysSince` (`src/lib/helpers/DateHelper.ts:281-285`) is
`Math.floor((now − date) / 24h)`. It counts elapsed 24-hour periods. It does
**not** compare calendar days.

### 2.2 Score table (computed, not estimated)

Relevance for every combination. Bold means the value can appear in the
dashboard widget (section 2.3).

| priority | effort | no due / ≥2d, new | no due / ≥2d, old | tomorrow, new | tomorrow, old | today, new | today, old | overdue, new | overdue, old |
|---|---|---|---|---|---|---|---|---|---|
| high | low | 0.50 | **0.67** | 0.58 | **0.75** | 0.67 | 0.83 | 0.83 | 1.00 |
| high | medium | 0.42 | 0.58 | 0.50 | **0.67** | 0.58 | 0.75 | 0.75 | 0.92 |
| high | high / null | 0.33 | 0.50 | 0.42 | 0.58 | 0.50 | 0.67 | 0.67 | 0.83 |
| medium | low | 0.33 | 0.50 | 0.42 | 0.58 | 0.50 | 0.67 | 0.67 | 0.83 |
| medium | medium | 0.25 | 0.42 | 0.33 | 0.50 | 0.42 | 0.58 | 0.58 | 0.75 |
| medium | high / null | 0.17 | 0.33 | 0.25 | 0.42 | 0.33 | 0.50 | 0.50 | 0.67 |
| low | low | 0.17 | 0.33 | 0.25 | 0.42 | 0.33 | 0.50 | 0.50 | 0.67 |
| low | medium | 0.08 | 0.25 | 0.17 | 0.33 | 0.25 | 0.42 | 0.42 | 0.58 |
| low | high / null | 0.00 | 0.17 | 0.08 | 0.25 | 0.17 | 0.33 | 0.33 | 0.50 |

"new" = created ≤ 30 days ago, "old" = > 30 days.

Observations:

- All scores are multiples of 25, so only **13 distinct values** exist across
  72 combinations. Ties are common: rows "high / high-null" and
  "medium / low" are identical in every column. `Array.sort` is stable and the
  input is already in the default order (`Todos.svelte.ts:217`), so ties fall
  back to the default sort. That is acceptable, but it means the "smart" order
  often equals the normal order within a score band.
- One priority step (50) = two effort steps = "due today" = "older than a
  month". Overdue (100) = high vs. low priority. A low-priority, low-effort,
  overdue, old todo (0.67) ranks level with a high-priority overdue todo that is
  high effort (0.67).

### 2.3 Dashboard reachability (verified)

`YourDay.svelte:59-71` keeps todos with `relevance > 0.6` that are **not** in
`dueTodos` (`filterByDueDate('today-overdue')`, `:58`), then takes the top 5.

- `180 / 300 > 0.6` is `false` in IEEE-754 (checked), and scores move in steps
  of 25, so the real bar is **score ≥ 200**.
- Due-today and overdue todos are excluded, so the due component is 0 or 25
  ("tomorrow").
- Without those, the maximum is high (100) + low effort (50) + tomorrow (25) +
  old (50) = 225. Medium priority tops out at 50 + 50 + 25 + 50 = 175, so it
  **can never qualify**. Low priority can't either.
- The only qualifying cells are the three bold ones: high + low effort + old
  (any due), and high + medium effort + tomorrow + old. Every one needs
  **age > 30 days**.

The "Relevant" widget is therefore really "high-priority todos you've been
ignoring for a month". That may or may not be the intent (section 8). The
threshold, the exclusion and the weights were probably not tuned together.

### 2.4 Ignored inputs and edge cases (verified unless marked)

- **Completion** (`is_completed`, `completed_at`): ignored. A completed todo
  scores the same as an open one. Whether completed todos reach the client in
  `todos.filteredTodos` depends on the API (**inferred**). The widget has
  `class:line-through={todo.is_completed}` (`ScoredTodosWidget.svelte:36`),
  which suggests they can.
- **Status** (`in-progress`, `waiting`, `almost-done`), **progress**,
  **subtasks**, **recurrence**, **category/tags**: ignored. Backlog todos are
  filtered out before scoring (`Todos.svelte.ts:197-199`), so they never get a
  score.
- **Due ≥ 2 days ahead** scores the same as no due date. "Due in 2 days" = "no
  deadline".
- **Overdue is binary**: 1 day overdue = 1 year overdue.
- **Age is one step** at 30 days: day 30 → 0, day 31 → +50.
- **`effort: null` = high effort.** An un-estimated todo is treated as hard
  (this is covered by a test, so it looks intentional, but nothing documents it).
- **Rolling windows instead of calendar days** (`daysSince` uses `Math.floor`
  on 24-hour periods):
  - Datetime `due_at` later today, e.g. 18:00 with now 10:00: `floor(-8h/24h) = -1`
    → scored as **tomorrow** (+25 instead of +50).
  - Due yesterday 23:00, now 10:00 → `floor(11h/24h) = 0` → **today**, not overdue.
  - Date-only `due_at` (`"2026-10-17"`) is parsed as **UTC midnight**. In
    UTC−5 that is 19:00 the previous evening, so the todo is "today" from the
    evening before and **overdue on the evening of its own due day**. In UTC+2
    it is "tomorrow" between 00:00 and 02:00 on the due day.
    Which format the API sends is **inferred** to vary. The tests use date-only
    values with `TZ=UTC`, which hides this.
  - The dashboard computes "due" with calendar-day helpers (`isDateToday`,
    `isDateInThePast`, `TodoFilterService.ts:76-81`), but the score uses
    `daysSince`. So the two "today" definitions on the same screen disagree.
- **`due_at` is typed `string`** (`types/todo.ts:33`), but the code checks
  `!== null` (`TodoRelevanceService.ts:23`), and the test factory uses `''`.
  `new Date('')` is `Invalid Date`, so `daysSince` returns `NaN`, and every
  comparison is false. The "no due date" tests pass by accident of `NaN`, not
  through the null branch.
- **`relevance` sits on the API type** (`types/todo.ts:37`) although it is
  computed only on the client (STANDARDS 12.3, 15.9: API shape and domain shape
  are separate types when they differ). Whether the API still sends the field
  is unknown (section 8).

---

## 3. What's good

- **Pure service, no I/O, no context reads** (`TodoRelevanceService.ts`), as
  STANDARDS 15.8 asks ("scoring" is named there explicitly). It is unit-tested
  under `tests/unit/services/`.
- **Named constants and a derived `maxScore`** (`:4-10`). Changing a weight
  keeps the 0..1 range correct automatically.
- **Normalised output** (0..1). The bar width and the threshold don't depend
  on the raw scale.
- **Sorting is a separate, tested, non-mutating function**
  (`TodoSortingService.sortByScore`, `:19-23`, test "does not mutate the
  original array"), and it handles `null` relevance.
- **Recomputed on every reload.** Every CRUD method reloads (`Todos.svelte.ts`
  `if (res) await this.load()`), and `load()` re-scores while score mode is on
  (`:89-90`). So editing a todo's priority/effort/due date updates its score
  and position (verified).
- **The dashboard doesn't write into the store.** `YourDay` clones before
  scoring (`:60`). Without that, the mutation (4.1) would write `$state` inside
  a `$derived`, which Svelte 5 rejects (`state_unsafe_mutation`, **inferred**
  from Svelte semantics).
- A store-level test covers the toggle (`tests/unit/stores/Todos.test.ts:223-236`),
  and the widget's rendering is covered (`tests/components/dashboard-widgets.test.ts:155-190`).

---

## 4. What's not good

Severity: **high** = wrong result the user sees, **medium** = misleading
behaviour or a trap for the next change, **low** = standards/style.

### 4.1 `getScoredTodos()` mutates its input — medium (verified)

`TodoRelevanceService.ts:14` copies only the array; `:41` writes
`scored_todos[i].relevance` into the **original todo objects**. The return
value suggests a new result, but the caller's objects change too.

- In `Todos.loadScores()` (`Todos.svelte.ts:161`), it writes through the
  `$state` proxies in `this.todos`. That works, but only by accident.
- `YourDay` has to clone first (`:60`) to work around it.
- The test that is meant to guard this is vacuous (5).

### 4.2 Score sorting is lost on filter changes — high (verified)

`useFilters()` always ends with the default sort (`Todos.svelte.ts:217`). It is
called directly by navigation (`TodoNavigationDesktop.svelte:27,42,75,102,135`,
`TodoNavigationMobile.svelte:55,57,121,147,181`) and by `toggleHideIt()` (`:258`).
None of these re-applies `sortByScore`. After any of these clicks:
`sortByScore` is still `true`, the toggle shows "on", and the score bars still
render (`ScoreBar.svelte:10`), but the list is in the default order. The user sees
score bars on a list that isn't sorted by score.

Related: `load()` calls `checkUrlForFilter()` → `useFilters()` and then
`loadScores()` → `useFilters()` again (`:86`, `:163`), so it filters twice per
load. The result is correct, but the work is redundant.

### 4.3 Dashboard threshold makes the widget near-empty by design — high (verified)

See 2.3. Medium and low priority can never appear, and every candidate needs to
be more than 30 days old. A user with a well-kept list sees nothing in
"Relevant". The magic numbers `0.6` and `5` (`YourDay.svelte:67,70`) aren't
named anywhere (STANDARDS 2.2).

### 4.4 Day boundaries disagree with the rest of the app — medium (verified for logic, inferred for API format)

See the "Rolling windows" item in 2.4. Due-today todos due later in the day are
under-weighted, and date-only due dates shift by the UTC offset. The dashboard
uses a different "today" from the score on the same screen.

### 4.5 Two scoring call sites — medium (verified)

`Todos.loadScores()` and `YourDay.svelte:59-71` each run
`getScoredTodos` + `sortByScore`, with different pre-filtering (the dashboard
also excludes due todos and applies the threshold). The "what is relevant"
logic (threshold, exclusion, top-N) lives inline in a component, which is
recurring theme 6 / STANDARDS 15.8. It isn't unit-testable today.

### 4.6 `ScoreBar` is a leaf that reads the store to decide whether it renders — low (verified)

`ScoreBar.svelte:4,8,10` calls `getTodos()` and derives
`show = todos.sortByScore && todos.todosScored`. STANDARDS 3.3 says a leaf
"never reads a store to decide *whether* or *how* it renders". The `$derived`
is read once in markup (3.2). It is rendered once per list/compact entry, so
every row does its own store lookup.

### 4.7 `todosScored` is a dead flag — low (verified)

It is set to `true` in `loadScores()` (`Todos.svelte.ts:162`) and never reset.
`loadScores()` always runs before `sortByScore` becomes `true` (`:148-157`,
`:89-90`), so `sortByScore && todosScored` is always `sortByScore`.

### 4.8 `SortByScore` copies store state into local state — low (verified)

`let toggled = $state(todos.sortByScore)` with `bind:checked`
(`SortByScore.svelte:9,14`) is a second source of truth (STANDARDS 3.7). It
can't drift today, because the store only changes through this toggle. But it
would drift if anything else ever set `sortByScore` (for example persistence, 7.6).

### 4.9 The score bar's visual — low (inferred, not rendered)

`ScoreBar.svelte:14-23` draws a full green→red gradient and covers the
right-hand `1 − relevance` part with a `bg-white` bar. So the visible length
equals the relevance. Two issues:

- `bg-white` has no `dark:` variant, so in dark mode the "empty" part is
  probably a bright white stripe instead of being invisible. This was inferred
  from the classes. It was not rendered, because rendering needs a running API
  with data.
- The colour runs green (low) → red (high), so a high score "looks" bad. Whether
  red means "urgent" or "bad" is a product choice.

`ScoreBar.svelte:26` has a leftover `<!-- left[-56px] left-2px -->`
(STANDARDS 10.1: commented-out code).

### 4.10 No explanation for the user — low (verified)

The toggle says "Smart Score" (`en.ts:321`) with no hint about what it weighs.
The dashboard shows a raw `0.67` (`ScoredTodosWidget.svelte:41-43`) with no
unit or tooltip.

### 4.11 Minor code issues — low (verified)

- `ScoredTodosWidget.svelte:29-30`: `class:bg-c-btn={todo.priority === 'medium' ||`
  is split across two lines (STANDARDS 1.1), and `todo.priority === null` can't
  happen per the type.
- `scored_todos` uses snake_case for a local variable. The rest of the
  service code is camelCase.
- `load()` runs `loadScores()`/`sort()` even when the request failed
  (`Todos.svelte.ts:89-93` sits outside `if (res)`). That is harmless, but it
  re-scores stale data.

---

## 5. Tests

| Test | Finding |
|---|---|
| `TodoRelevanceService.test.ts:91-95` "returns a new array" | **Vacuous.** `expect(result).not.toBe([t])` compares against a fresh literal and can never fail. It also misses the real problem: input objects are mutated (4.1). |
| "no due date" cases (`:32`, `:72`, `:79-85`) | Use `due_at: ''` (factory default `tests/unit/helpers/factories.ts:15`), so they exercise `NaN` comparisons, not the `due_at === null` branch. |
| Boundaries | None for age (30 vs. 31 days), due (−2/−1/0/1), or a datetime `due_at` later today (2.4). |
| Time zones | All cases run with `TZ=UTC` and date-only strings, which hides the UTC-midnight shift. |
| Dashboard selection | Threshold, due-exclusion and top-5 live in `YourDay.svelte` and are untested (4.5). The widget test (`dashboard-widgets.test.ts:156-163`) uses `relevance: 12.345`, outside the 0..1 range. That's fine for a formatting test, but it doesn't reflect real data. |
| Store | `Todos.test.ts:223-236` covers toggling on. Nothing covers toggling off, the filter-change regression (4.2), or `load()` with score mode on. |
| Sorting | `TodoSortingService.test.ts:80-102` is adequate. |

Not run: `npm test` (no `node_modules` in this worktree).

---

## 6. Standards cross-reference

| Rule | Where |
|---|---|
| 1.1 one-line attribute expressions | `ScoredTodosWidget.svelte:29-30` |
| 2.2 domain constants in one place | `YourDay.svelte:67,70` (`0.6`, `5`) |
| 3.2 value read once is inlined | `ScoreBar.svelte:10` |
| 3.3 leaf components are dumb | `ScoreBar.svelte:4-10` |
| 3.7 don't copy store data into local state | `SortByScore.svelte:9` |
| 10.1 no commented-out code | `ScoreBar.svelte:26` |
| 12.3 / 15.9 API vs. domain shape | `types/todo.ts:37` (`relevance`), `:33` (`due_at` non-null type, nullable use) |
| 15.8 pure logic in services | `YourDay.svelte:59-71` |

No existing `docs/backlog/*` entry touches this feature.

---

## 7. Improvement proposals

Ordered by value ÷ risk. Each is sized to be its own job. Effort: S < ½ day,
M ≈ 1 day. Items that change *what* the score means are marked **(owner
decision)** and offered as options, not decisions.

### 7.1 Keep score order across filter changes — S, high value

At the end of `useFilters()`, sort by score when `sortByScore` is on, instead of
always using the default sort. `loadScores()` then becomes "score, then
`useFilters()`", and `toggleSortByScore()` stops sorting by hand. Add a store
test: toggle on → `useFilters([...])` → still score order. This fixes 4.2 and
removes the double filtering.

### 7.2 Make `getScoredTodos` non-mutating (or honest) — S

Either return new objects (`todos.map((t) => ({ ...t, relevance: score(t) }))`)
and drop the clone in `YourDay.svelte:60`, or split out a pure
`score(todo): number` and let callers decide where to put it. Replace the
vacuous test with "does not mutate input todos" (`expect(input.relevance).toBeNull()`).
Fixes 4.1 and the test in 5.

### 7.3 Move dashboard selection into the service — S

Add `TodoRelevanceService.getMostRelevant(todos, excludeIds, limit)` (or similar)
with the threshold and limit as named constants next to the weights. `YourDay`
calls it. Unit-test reachability: at least one fresh high-priority todo should
qualify if that's the intent (see 7.5). Fixes 4.5 and 2.2. A precondition for
tuning 7.5 safely.

### 7.4 Calendar-day due logic — S/M

Score "today/tomorrow/overdue" with the same calendar-day helpers the dashboard
uses (`isDateToday`, `isDateTomorrow`, start-of-day comparison), not
`daysSince`. Add tests with a datetime `due_at` later today and with a non-UTC
`TZ`. Fixes 4.4. Needs a decision on how date-only `due_at` should be parsed
(local vs. UTC). The same issue likely affects other date-only fields, so check
with the backend format first (section 8).

### 7.5 Re-tune weights and threshold — S code, **(owner decision)**

Options, not recommendations:

- **a)** Lower the dashboard threshold (e.g. `≥ 0.5`), so fresh high-priority
  low-effort todos (0.50) and old medium/low-effort ones qualify.
- **b)** Replace the fixed threshold with "top N of open, non-due todos", with
  no threshold at all.
- **c)** Graduate the steps: overdue scales with days overdue (capped), due
  in 2–7 days adds a small bonus, age ramps instead of jumping at day 30.
  This also reduces ties.
- **d)** Treat `effort: null` as medium instead of high.
- **e)** Add inputs: exclude/zero completed todos; boost `in-progress`/
  `almost-done`; use `progress`.

Do 7.3 first, so the effect of any option can be pinned down with a
reachability test before anything ships.

### 7.6 Remember the toggle — S, **(owner decision)**

Persist `sortByScore` via `LocalStorageService` with a `static readonly
LS_SORT_BY_SCORE_KEY`, the same as `LS_HIDE_IT_KEY` (`Todos.svelte.ts:37,76`)
(STANDARDS 15.6). It resets today because `Todos` is a feature store
recreated per route (`routes/todos/+layout.svelte:6`). If this is done,
`SortByScore` should read `todos.sortByScore` directly instead of copying it
(4.8).

### 7.7 UI clean-up — S

- `ScoreBar`: take `relevance` and `show` (or render it only when the parent
  passes a value) as props, so it no longer imports the store (3.3). Drop
  `todosScored` (4.7). Remove the comment on line 26. Replace the `bg-white`
  overlay with a width-limited gradient (e.g. clip the gradient element itself
  to `relevance * 100%`), which also removes the dark-mode stripe. Confirm with
  `shot` in both themes.
- `SortByScore`: drop the local `toggled` copy (3.7).
- `ScoredTodosWidget`: one-line class expression, remove the impossible
  `null` check (1.1).

### 7.8 Explain the score to the user — S, **(owner decision)**

A short tooltip or help text on the toggle ("ranks by priority, effort, due
date and age"), and either a percentage or no number at all in the dashboard
widget instead of a raw `0.67`. New strings need all four locales.

### 7.9 Separate `relevance` from the API type — S

Remove `relevance` from `Todo` and use a `ScoredTodo = Todo & { relevance: number }`
(or a `Map<id, number>`) produced by the service. Make `due_at` `string | null`
if the API sends `null`. This is a typing change that touches the sorting
service, the views and the factory. Do it together with 7.2 if 7.2 picks "return
new objects".

Suggested order: 7.1 → 7.2 → 7.3 → 7.7 → then the owner decides on 7.4/7.5/7.6/7.8 → 7.9.

---

## 8. Out of scope / open questions for the owner

1. **What is "Relevant" on the dashboard supposed to mean?** Today it can only
   show high-priority todos older than 30 days (2.3). Is that intended?
2. **Is "low effort ranks higher" (quick wins) the intent?** And should an
   unset effort count as high?
3. **Should completed / `waiting` todos get a score at all?** Does the todo
   list endpoint return completed todos?
4. **What format does the API send for `due_at`** (date-only vs. datetime, with
   or without zone), and can it be `null`? This decides 7.4 and 7.9.
5. **Does the API send a `relevance` field** (a leftover from a backend score),
   or is it purely client-side?
6. Should score mode persist across visits (7.6)?
7. Should the proposals be filed as `docs/backlog/*.md` entries? This report
   doesn't create any.
