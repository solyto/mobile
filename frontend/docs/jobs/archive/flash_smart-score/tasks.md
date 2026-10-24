# Tasks: Smart score

id: flash
analyst: @analyst
date: 2026-10-17

<!-- Produced by @analyst from brief.md. -->

## Scope understanding

This is a **report job** (`type: report`). The only thing it produces is one new
Markdown file in `docs/reports/`. **No source, test, or i18n file is changed.**
Any fixes the report suggests become follow-up jobs or backlog entries. This job
does not implement them.

"Smart score" is the UI label (`ts.todos.sort_by_score` = "Smart Score") for the
todo relevance score. Analyst pre-read: everything that touches it:

| Area | File | Role |
|---|---|---|
| Algorithm | `src/lib/services/TodoRelevanceService.ts` | `getScoredTodos()`: priority base + effort + due (overdue/today/tomorrow) + age > 30 days, divided by `maxScore` (300), written to `todo.relevance` |
| Sorting | `src/lib/services/TodoSortingService.ts` (`sortByScore`) | sorts descending by `relevance ?? 0` |
| State | `src/lib/state/Todos.svelte.ts` (`sortByScore`, `todosScored`, `toggleSortByScore`, `loadScores`, `load`) | toggles score mode, writes scores into `this.todos`, re-filters and re-sorts |
| Toggle UI | `src/lib/components/todos/actions/SortByScore.svelte`, `src/routes/todos/+page.svelte` | "Smart Score" toggle |
| Bar UI | `src/lib/components/todos/ScoreBar.svelte` (used in `views/ListEntry.svelte`, `views/CompactEntry.svelte`) | shows the bar, with width computed as `(1 - relevance)` |
| Dashboard | `src/lib/components/dashboard/YourDay.svelte`, `dashboard/widgets/ScoredTodosWidget.svelte` | recomputes scores on clones, hard-coded threshold `> 0.6`, top 5, excludes due todos, shows the raw decimal |
| Type | `src/lib/types/todo.ts` (`relevance: number \| null`) | a client-only computed field on an API type |
| Tests | `tests/unit/services/TodoRelevanceService.test.ts`, `tests/unit/services/TodoSortingService.test.ts` | unit coverage of the algorithm |
| Helper | `src/lib/helpers/DateHelper.ts` (`daysSince`) | day math the score depends on (TZ / date-only `due_at` handling) |

Not the Smart Score, and **out of scope** unless the brief says otherwise:
the check-in "scored trackers" (`CheckInData`, `CheckInSettings`, `Averages`) and
the dev-request `score` (`types/dev_request.ts`, `dev-requests/Score.svelte`). The
report should say in one line that these are separate features.

### Leads the developer should verify (not conclusions yet)
- `getScoredTodos` copies only the array (`[...todos]`) and then assigns
  `scored_todos[i].relevance`, so it **mutates the input todo objects**. This
  matters in `Todos.loadScores` (it mutates `$state` proxies). `YourDay` works
  around it by cloning first.
- The test `returns a new array` asserts `expect(result).not.toBe([t])`. That is
  compared against a fresh literal, so it can never fail. No test covers
  input mutation.
- Reachability: with a 0.6 dashboard threshold (score > 180 of 300), some
  priority/effort combinations probably can never appear on the dashboard
  unless they are overdue. This needs to be calculated, not assumed.
- Ignored inputs: `status` / done, `progress`, recurrence, category, and
  `due_at` > 1 day ahead. Overdue is binary (1 day overdue = 1 year overdue).
  Age has one step at 30 days.
- Staleness: are scores recomputed after create/update/check, or only on
  toggle/load? Does `sortByScore` persist across reloads? (It looks like no
  LocalStorage key.)
- Two separate scoring call sites (`Todos.loadScores` and `YourDay`) give two
  sources of truth. Also check `$derived.by` use in `YourDay` and `ScoreBar`
  against the "limited `$derived`" project rule.
- UX: the bar is drawn as `1 - relevance` (inverted?). The dashboard shows a raw
  `0.xx` with no explanation. There is no user-facing explanation or tooltip of
  how the score is made.
- `docs/STANDARDS.md` compliance (snake_case `scored_todos`, magic numbers,
  service shape) and any existing `docs/backlog/*` entries that touch this.

## Task breakdown

TASK-1: Read `docs/STANDARDS.md` (the recurring themes and the sections on services/state/runes/tests) and `docs/TESTING.md`, and note the rules the Smart Score code should be measured against.
  files: docs/STANDARDS.md, docs/TESTING.md, docs/backlog/*.md (read-only)
  depends: none
  risk: low — read-only. The only risk is citing a rule incorrectly, so quote the section numbers.

TASK-2: Analyse the algorithm in `TodoRelevanceService` and `daysSince`. Document the exact formula, build a reachable-score table for the priority × effort × due × age combinations (including which ones can pass the dashboard's 0.6 threshold), and list the ignored inputs and edge cases (null `due_at`, date-only vs. datetime `due_at`, timezone, done todos).
  files: src/lib/services/TodoRelevanceService.ts, src/lib/helpers/DateHelper.ts, src/lib/types/todo.ts (read-only)
  depends: TASK-1
  risk: low — read-only. The table must be computed from the constants, not estimated.

TASK-3: Trace the data flow and lifecycle through `Todos.svelte.ts`, the toggle, `ScoreBar`, the list/compact entries, `YourDay` and `ScoredTodosWidget`. Cover when scores are computed and recomputed, input mutation of `$state` objects, persistence of the toggle, the duplicate call sites, and `$derived`/`$effect` usage.
  files: src/lib/state/Todos.svelte.ts, src/lib/services/TodoSortingService.ts, src/lib/components/todos/actions/SortByScore.svelte, src/lib/components/todos/ScoreBar.svelte, src/lib/components/todos/views/ListEntry.svelte, src/lib/components/todos/views/CompactEntry.svelte, src/routes/todos/+page.svelte, src/lib/components/dashboard/YourDay.svelte, src/lib/components/dashboard/widgets/ScoredTodosWidget.svelte (read-only)
  depends: TASK-1
  risk: medium — the staleness and mutation claims depend on Svelte 5 proxy semantics, so each claim must cite file:line and say whether it was verified or inferred.

TASK-4: Review the test coverage in `TodoRelevanceService.test.ts` and `TodoSortingService.test.ts`. Flag vacuous assertions (for example `not.toBe([t])`), missing cases (mutation, boundary days 30/31, -1/0/1, threshold reachability), and whether running `npm test` confirms the current suite passes.
  files: tests/unit/services/TodoRelevanceService.test.ts, tests/unit/services/TodoSortingService.test.ts, tests/helpers/factories.ts (read-only)
  depends: TASK-2
  risk: low — read-only, apart from optionally running the existing test suite.

TASK-5: Write the report `docs/reports/2026-10-17-smart-score.md`, following the format of the existing reports (title, `read:` flag, Date/Job/Scope/Method header). Include the sections Summary, How it works today (formula + table), What's good, What's not good (each item with file:line and severity), Improvement proposals (what + how + rough effort, ordered by value/risk, each small enough to become its own job), and Out of scope / open questions for the owner. Add a one-line note that the check-in and dev-request "scores" are separate features.
  files: docs/reports/2026-10-17-smart-score.md (new — the only file created)
  depends: TASK-2, TASK-3, TASK-4
  risk: low — documentation only. The main risk is proposals that silently imply product decisions (for example new weights), so these must be framed as options for the owner, not decisions.

## Open points / unclear scope

- The brief's "Why", "Out of scope" and "Notes" sections are empty. The tasks
  assume the report should **evaluate and propose only**, with no code changes
  and no new backlog files. If the owner wants proposals filed as
  `docs/backlog/*.md` entries, that is a separate step.
- The brief says `/docs/reports`. The tasks interpret that as the repo-relative
  `docs/reports/`, where the existing reports live.
- Whether the score weights reflect an intended product design (for example,
  "low effort should rank higher") is unknown. The report should list this as a
  question for the owner, not judge it as a bug.
