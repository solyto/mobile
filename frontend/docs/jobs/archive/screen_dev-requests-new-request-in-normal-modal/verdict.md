# Verdict: dev requests: new request in normal modal

id: screen
reviewer: reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD`. The only source changes are the two files named in tasks.md. Everything else is job docs. No changes are out of scope, no new strings were added, and `DevRequests.svelte` was left alone as tasks.md asked.

TASK-1: PASS
notes: `src/lib/components/dev-requests/DevRequestEdit.svelte`: the `<div transition:slide>` is now
`<ContentModal title={ts.get.dev.requests.new} rounded="2xl" p="8" {onClose}>`, and the `slide` import is gone.
The layout matches `time-tracking/ProjectCreate.svelte`: fields in `flex flex-col gap-3`, and Save right-aligned in
`mt-4 flex w-full justify-end`. The form controls, validation, `onSave` and the `onMount` load are unchanged.
Dropping `w-120` is fine because `PopupContentModal` applies `md:min-w-120` when neither `small` nor `width` is set.
`ContentModal` passes all props through. `PopupContentModal` renders the title and a `CloseButton` wired to `onClose`.
`BottomSheetModal` takes `title`/`onClose` and wraps its content in a scrollable `overflow-y-auto` body, so the
taller form (150px textarea plus FileUpload) can scroll on mobile.

TASK-2: PASS
notes: `src/routes/dev-requests/[[id]]/+page.svelte`: the button now sets `createOpen = true`. The
`{#if createOpen}<DevRequestEdit …/>{/if}` block moved to the end of the markup, outside the list column.
Closing still goes through `onClose={() => (createOpen = false)}`. Both the close button and the save path call it.

TASK-3: PARTIAL
notes: `node_modules` is missing from the worktree, so neither the developer nor this review could run
`npm run check` / `npm run lint` / `npm test`. There is also no render report. From reading the code, the change
is markup-only and the types line up: `ContentModal` takes untyped `$props()`, and every prop passed exists on both
`PopupContentModal` and `BottomSheetModal`. The automated checks and a desktop/mobile visual check are still
pending. This is a gap in the environment, not a defect in the code, so it does not block the code review.

## Security

none (not run; markup-only change, no new data flow)

## Overall

APPROVED

No code changes required. Note for whoever merges: run `npm run check`, `npm run lint` and `npm test`,
and look at the mobile bottom sheet once, in an environment that has dependencies installed. Neither agent
session could do this.
