## Summary

The "New Request" form on the dev-requests page now opens in the shared `ContentModal` (a centred popup on desktop, a bottom sheet on mobile) with the title "New Request" and a close button. It no longer uses the custom panel that slid down from the top of the page. Form fields, validation and save behaviour are unchanged.

## Changes

TASK-1: `src/lib/components/dev-requests/DevRequestEdit.svelte` — replaced the `<div transition:slide>` wrapper with `<ContentModal title={ts.get.dev.requests.new} rounded="2xl" p="8" {onClose}>`, following `time-tracking/ProjectCreate.svelte`. Fields sit in `flex flex-col gap-3`, and the Save button is right-aligned in `mt-4 flex w-full justify-end`. Removed the `slide` import and the fixed `w-120` width (`PopupContentModal` already sets `md:min-w-120`). Inputs stay placeholder-only; I added no visible labels and no new strings.
TASK-2: `src/routes/dev-requests/[[id]]/+page.svelte` — the "New Request" button now sets `createOpen = true` instead of toggling it. The `{#if createOpen}<DevRequestEdit/>{/if}` block moved from the top of the list column to the end of the page markup, because it now renders as an overlay. The modal is closed through its own close button, which calls `onClose`.
TASK-3: Verification was **not run**. `node_modules` is missing from the worktree, so `npm run check`, `npm run lint` and `npm test` fail with "command not found". I did not install dependencies without asking. I also did not render the page with `shot`, because the page needs a logged-in session against the API, which isn't available here. Instead I checked statically that `ContentModal` forwards `title`, `rounded`, `p` and `onClose` to `PopupContentModal` / `BottomSheetModal`, and both accept those props.

## Known issues / follow-ups

- TASK-3 still needs doing in an environment with dependencies installed and an API: run check/lint/test, and check by hand the desktop popup, the mobile bottom sheet (especially `FileUpload` and the 150px multi-line input inside the sheet), and that saving creates the request and closes the modal.
- From tasks.md (out of scope, untouched): `components/dev-requests/DevRequests.svelte` is dead code; `DevRequestEdit.svelte` hardcodes the 'Bug'/'Feature' labels; it also has a redundant `devRequests.load()` in `onMount`.
