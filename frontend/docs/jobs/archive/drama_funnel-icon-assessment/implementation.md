# Implementation: funnel icon assessment

id: drama
status: open
developer: deepseek-v4-flash
date: 2026-08-16

<!-- Produced by @developer after implementation. -->

## Summary

Assessment-only job (no source changes). Audited every funnel-icon usage in the codebase, classified each by semantic intent, verified replacement-icon availability in the pinned `@lucide/svelte` 0.544.0, and wrote the findings to `assessment.md`.

Result: the funnel icon is correct in exactly one place (`libraries/filters/Filter.svelte`, a genuine filter action) and wrong in five others — all mobile navigation/drawer toggles that consume `FunnelButton`. The assessment recommends swapping those consumers to the existing `HamburgerButton` (`menu` icon), deprecating `FunnelButton`, and removing four leftover unused `IconFunnel` imports.

## Changes

TASK-1: Audited and cataloged every funnel usage — the `FunnelButton` component itself, all five `FunnelButton` consumers (FeedNavigation, ContactNavigation, TodoNavigationMobile, TimeTrackingNavigation, NoteNavigationMobile), the single direct `IconFunnel` render in libraries/filters/Filter.svelte, the `HamburgerButton` precedent, and the four unused `IconFunnel` imports. Read-only; no files changed.

TASK-2: Classified each usage by semantic intent. Verdict: only `Filter.svelte` is a true filter; the other five are navigation/menu toggles where the funnel is misleading. Recommended replacement per location is the `menu`/hamburger icon via the API-compatible `HamburgerButton`; recommended deprecating `FunnelButton` (repointing it would just create a duplicate of `HamburgerButton`). Considered and rejected `list-filter` / `sliders-horizontal` for these drawer toggles (they'd fit a dedicated desktop filter control instead). Read-only; no files changed.

TASK-3: Verified icon availability against the published `@lucide/svelte@0.544.0` package listing (node_modules not installed in the worktree): `menu`, `list-filter`, `sliders-horizontal`, `filter`, `filter-x`, `funnel-x`, `align-justify`, `sliders` all exist in the pinned version. Nothing missing; no dependency change needed. Read-only; no files changed.

TASK-4: Wrote `docs/jobs/drama_funnel-icon-assessment/assessment.md` documenting where the funnel is used (file + line references), where it makes sense (libraries filter), where it does not (all mobile nav toggles), the recommended replacement per location (with icon names), the `FunnelButton` recommendation, the unused-import cleanup, and the icon-availability verification. No source files were touched.

Also committed the analyst's task breakdown in `docs/jobs/drama_funnel-icon-assessment/tasks.md` (it was an uncommitted working-tree change when the job started).

## Known issues / follow-ups

- The actual replacement work (switching five consumers to `HamburgerButton`, deleting `FunnelButton`, removing the four unused `IconFunnel` imports) is explicitly out of scope for this assessment job and should be its own implementation task. Note that `FeedNavigation.svelte`/`TimeTrackingNavigation.svelte` toggle a hidden drawer via `style.display` while `TodoNavigationMobile`/`NoteNavigationMobile` conditionally mount a full-screen overlay — behavior differences are unrelated to the icon choice and were not touched.
- `FunnelButton` and `HamburgerButton` are currently byte-for-byte identical apart from the icon; once the swap happens, keeping both would be pure duplication.