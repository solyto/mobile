# Tasks: todos overview: checkboxes not centered

id: wave
status: open
analyst: opencode (deepseek-v4-flash)
date: 2026-08-16

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Reproduce the misaligned checkbox in the todos overview view and pinpoint the exact cause (browser dev server, light/dark, desktop + mobile breakpoints).
     files: src/lib/components/todos/views/CompactCard.svelte, src/lib/components/todos/views/OverviewView.svelte, src/lib/components/forms/Checkbox.svelte
     depends: none
     risk: low — read-only investigation in devtools; no production change

TASK-2: Fix vertical centering of the checkbox in CompactCard.svelte (the overview card row), e.g. make the checkbox wrapper a flex container with items-center and/or add self-center so the checkbox centers within the row regardless of sibling heights.
     files: src/lib/components/todos/views/CompactCard.svelte
     depends: TASK-1
     risk: low/medium — isolated CSS-only change to a component only used by OverviewView, but the exact failing style is not confirmed until TASK-1

TASK-3: If TASK-1 shows the root cause is in the shared Checkbox component, fix it there and re-verify all other usages (list/card/kanban views, dashboard widgets, subtasks, form rows).
     files: src/lib/components/forms/Checkbox.svelte
     depends: TASK-1 (only if TASK-1 identifies the shared component as the cause)
     risk: medium — shared by ~22 call sites; an over-broad change could shift checkboxes in other views

TASK-4: Verify the fix across breakpoints and views and run the quality gates (npm run check, npm run lint, npm run test, npm run format).
     files: none (verification)
     depends: TASK-2 (and TASK-3 if applicable)
     risk: low

## Notes

Static inspection of the current markup (CompactCard row uses `flex items-center`, the Checkbox wrapper is `div.shrink-0`) suggests the checkbox *should* already be centered, so the actual failing style is not obvious from reading the code alone — TASK-1 must confirm it at runtime before TASK-2 is scoped precisely. Do not change the shared Checkbox component (TASK-3) unless TASK-1 proves the cause lives there.