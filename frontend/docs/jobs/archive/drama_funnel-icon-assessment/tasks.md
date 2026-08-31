# Tasks: funnel icon assessment

id: drama
status: open
analyst: deepseek-v4-flash
date: 2026-08-16

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Audit and catalog every funnel icon usage in the codebase (direct `IconFunnel` renders, the `FunnelButton` component, and every component that consumes `FunnelButton`), recording file path, usage context, and whether the render is a filter action, a navigation/menu toggle, or decorative.
     files: src/lib/components/ui/buttons/FunnelButton.svelte; src/lib/components/ui/buttons/HamburgerButton.svelte (precedent to note); src/lib/components/libraries/filters/Filter.svelte; src/lib/components/feeds/FeedNavigation.svelte; src/lib/components/contacts/ContactNavigation.svelte; src/lib/components/todos/TodoNavigationMobile.svelte; src/lib/components/time-tracking/TimeTrackingNavigation.svelte; src/lib/components/notes/NoteNavigationMobile.svelte; src/lib/components/settings/SettingsNavigationMobile.svelte (hamburger precedent)
     depends: none
     risk: low — read-only grep audit, no behavior change

TASK-2: Classify each funnel usage by semantic intent (true filter vs. mobile navigation drawer/menu toggle) and decide, per usage, whether the funnel icon is appropriate or should be replaced — with the concrete replacement icon (e.g. `menu`/hamburger via existing `HamburgerButton`, `list-filter`, `sliders-horizontal`) and the rationale. Include the recommendation for the `FunnelButton` component itself (repoint to hamburger icon vs. deprecate in favor of `HamburgerButton`), and note the unused `IconFunnel` imports left behind in FeedNavigation.svelte, ContactNavigation.svelte, TodoNavigationMobile.svelte and TimeTrackingNavigation.svelte.
     files: same list as TASK-1
     depends: TASK-1
     risk: medium — requires design judgment on icon semantics; the only clearly-correct funnel usage today is libraries/filters/Filter.svelte

TASK-3: Verify that all proposed replacement icons exist in the pinned lucide version (`@lucide/svelte` 0.544.0) and record any that do not, so the assessment only recommends available icons.
     files: package.json (version pin), node_modules/@lucide/svelte (icon availability check; no code changes)
     depends: TASK-2
     risk: low — verification only; note that node_modules is not installed in the worktree, so icon names must be confirmed against the lucide 0.544.0 icon set (e.g. via the published package listing) if present

TASK-4: Write `assessment.md` documenting: where the funnel icon is used (with file references), where it makes sense (libraries filter button), where it does not (all mobile navigation/menu toggles), and the recommended replacement per location (with icon names). Do NOT change any source files — this job only produces the assessment document.
     files: docs/jobs/drama_funnel-icon-assessment/assessment.md
     depends: TASK-1, TASK-2, TASK-3
     risk: low — documentation-only deliverable