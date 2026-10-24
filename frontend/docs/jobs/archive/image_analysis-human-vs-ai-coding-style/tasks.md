# Tasks: analysis: human vs ai coding style

id: image
analyst:
date: 2026-10-11

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

This is a documentation/analysis job: the deliverable is a single report file
`docs/coding-style.md` comparing the human-built todos feature against the
AI-built time-tracking feature. No source code may be modified. The two
feature stacks are the "read-only inputs" listed under each task; the only
file that may be created/changed is the report.

Ground truth for the comparison is the repo's own conventions in
`docs/BEST_PRACTICES.md`, `docs/STATE_SERVICES.md`, `docs/COMPONENTS.md`,
`docs/DATA_LAYER.md`, `docs/TESTING.md` — they were written for this
codebase and both features should be measured against them, not against
generic taste. Objectively verifiable metrics (file/line references, LOC,
component/test counts) are essential so every "human does X / AI does Y"
claim is checkable.

TASK-1: Inventory the human-built todos feature end to end (state store, 4 pure services, types, routes, views, nav, props, actions) and collect stylistic observations with concrete file/line references.
     files (read-only): src/lib/state/Todos.svelte.ts, src/lib/services/Todo{Services}/*.ts, src/lib/types/todo.ts, src/routes/todos/{+layout,+page}.svelte, src/lib/components/todos/** (views/, props/, actions/, TodoNavigation*, ListEntry, ScoreBar, Counter, NoTodos, ViewSwitcher)
     depends: none
     risk: low — pure reading; only risk is incompleteness, mitigated by enumerating the full component list.

TASK-2: Inventory the AI-built time-tracking feature end to end (state store, grouping service, types, layout/pages incl. [id], nav, widgets, entry components) and collect stylistic observations with concrete file/line references.
     files (read-only): src/lib/state/TimeTracking.svelte.ts, src/lib/services/TimeTrackingGroupingService.ts, src/lib/types/time_tracking.ts, src/routes/time-tracking/{+layout,+page,[id]/+page}.svelte, src/lib/components/time-tracking/**
     depends: none
     risk: low — pure reading; same completeness caveat as TASK-1.

TASK-3: Compare both features layer by layer (state service shape, layout vs page responsibilities, view/component decomposition, service extraction, types, reactivity patterns, error handling, comments, helpers reuse, i18n usage, tests) and derive the concrete style-difference list — what the human does that the AI doesn't, and vice versa.
     files: none written in this task; findings feed TASK-5 (docs/coding-style.md)
     depends: TASK-1, TASK-2
     risk: medium — subjective claims need to be grounded in file/line refs and objective metrics (counts, LOC) to be credible and avoid rework.

TASK-4: Cross-check both codebases against the repo's documented conventions (docs/BEST_PRACTICES, STATE_SERVICES, COMPONENTS, DATA_LAYER, TESTING) and classify each observation as "matches repo idiom" vs "deviates", separating human-vs-AI differences from idiomatic-vs-non-idiomatic ones (note: the docs themselves are human-authored, so human deviations from them are noteworthy too).
     files (read-only): docs/BEST_PRACTICES.md, docs/STATE_SERVICES.md, docs/COMPONENTS.md, docs/DATA_LAYER.md, docs/TESTING.md
     depends: TASK-1, TASK-2
     risk: low — no code touched; risk is misquoting the policy docs, mitigated by quoting section headers/paraphrasing carefully.

TASK-5: Write the full report to docs/coding-style.md — methodology, per-layer comparison, a style-characteristics table, "what the human does that the AI doesn't" and the reverse, concrete examples with file/line references, notes on test coverage (tests/unit/stores/{Todos,TimeTracking}.test.ts, tests/unit/services/*), and a summary of how the styles differ.
     files: docs/coding-style.md (new file, the only file created; must not modify any src/** or tests/** file)
     depends: TASK-3, TASK-4
     risk: medium — the report is the whole deliverable; length and quality determine whether review passes, so keep claims verifiable and reference real file paths.

TASK-6: Verify the report — re-read docs/coding-style.md, confirm every referenced file path and line range exists, confirm no source/test/i18n file was changed (report is purely additive), and run `npm run check` as a sanity pass to show the repo still type-checks.
     files: docs/coding-style.md
     depends: TASK-5
     risk: low — no code changes expected; catches stale references and accidental modifications.