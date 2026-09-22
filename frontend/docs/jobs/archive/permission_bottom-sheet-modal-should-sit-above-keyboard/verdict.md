# Verdict: bottom sheet modal should sit above keyboard

id: permission
status: open
reviewer:
date: 2026-09-05

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

TASK-1: PASS
notes: `src/lib/components/ui/BottomSheetModal.svelte` (commit f8581e7). Correctly adds an
`onMount` that subscribes to `window.visualViewport` `resize`/`scroll` events with a proper
cleanup function that removes both listeners. Computes `diff = window.innerHeight - vv.height`,
applies `style:padding-bottom={diff}px` on the overlay div only when `diff > 60` (60px threshold
guards against browser-chrome/jitter), else sets the inline padding to `''` so the existing
`pb-16 2xl:pb-0` classes remain the no-keyboard default. Inline style overrides the class when
the keyboard is present (correct). SSR-safe: runs only inside `onMount` (client), and is a no-op
when `window.visualViewport` is null/undefined (`if (!vv) return`). Null guard on `vv` satisfies
the TS DOM typing. `$state<string>('')` + `style:padding-bottom={keyboardPadding}` is valid
Svelte 5 syntax; the change is type-correct and self-contained.

TASK-2: PASS
notes: `src/lib/components/ui/BottomSheetConfirmationModal.svelte` (commit 4148374). Mirrors the
identical logic (same threshold, same guard, same cleanup, same inline `padding-bottom` binding on
the structurally identical `fixed ... h-dvh ... items-end` overlay). Kept as a second small
self-contained implementation per the task's preference over a new shared abstraction. Listener
cleanup present. No drift.

TASK-3: PARTIAL
notes: Verification (`npm run check` / `npm run build`) was NOT executed. The developer's stated
reason is legitimate — `node_modules` is absent from this workspace (confirmed), and installing
dependencies is disallowed without confirmation. The change is minimal, uses only pre-existing
APIs (`window.visualViewport`, Svelte `onMount`/`$state`/`style:` directive) and is correct by
inspection, so no compile issue is anticipated. No new UI strings, so no i18n changes required —
confirmed, none were added. No render report/screenshots exist for this job, so visual
confirmation was not possible in this environment.

## Security

none run — the change is client-only CSS/DOM-observation (no data handling, no API interaction,
no new dependencies, no secrets involved). No security surface introduced.

## Overall

APPROVED

The implementation fully satisfies the brief and both code tasks. TASK-3 is the only
non-passing item and is an environmental limitation (no `node_modules`, no on-device/browser
render available), not a code defect — nothing needs to change in the source before merging.

Non-blocking follow-ups for the maintainers (not merge blockers):
- Run `npm run check` (and `npm run build`) once dependencies are installed.
- Manual on-device validation on iOS Safari and Chrome Android is the definitive confirmation of
  keyboard behavior; the 60px threshold and `visualViewport` interaction may need tuning on
  specific devices/browsers.
