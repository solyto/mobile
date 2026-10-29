# Tasks: dev requests: new request in normal modal

id: screen
analyst: analyst
date: 2026-10-29

<!-- Produced by @analyst from brief.md. -->

## Context (what the code looks like today)

- The "New Request" button lives in `src/routes/dev-requests/[[id]]/+page.svelte`
  (`TextButton`, `onclick={() => (createOpen = !createOpen)}`), which renders
  `<DevRequestEdit onClose=… />` inline at the top of the page when `createOpen` is true.
- `src/lib/components/dev-requests/DevRequestEdit.svelte` is the "slides in from the top"
  panel: a plain `<div class="mx-auto … w-120 rounded-b-lg bg-c-bg-modal p-4 drop-shadow-lg" transition:slide>`.
  It has no title and no close button. The only way to close it is to save or to click "New Request" again.
- The usual modal for creating things is `src/lib/components/ui/ContentModal.svelte`. It shows
  `PopupContentModal` on desktop and `BottomSheetModal` on mobile, and takes `title`, `onClose`,
  `rounded`, `p`. Plain create forms use it like this (the pattern to follow):
  `src/lib/components/time-tracking/ProjectCreate.svelte`, `time-tracking/EntryCreate.svelte`
  → `<ContentModal title={…} rounded="2xl" p="8" {onClose}>`, fields in `flex flex-col gap-3`,
  save as `<div class="mt-4 flex w-full justify-end"><TextButton title={ts.get.layout.save} …/></div>`.
  (`libraries/shared/CreateModal.svelte` is for libraries only and depends on the `Library` type, so it doesn't fit here.)
- The i18n keys the modal title and field labels need already exist: `ts.get.dev.requests.new`
  ('New Request'), `.title`, `.description`, `.screenshot`, `.url`, `.bug`, `.feature`.
  **No new strings should be needed.**
- `src/lib/components/dev-requests/DevRequests.svelte` is a near-copy of the route page that nothing
  imports (dead code). It also renders `DevRequestEdit`, so it picks up the change on its own. Do **not**
  edit or delete it in this job (it's unrelated cleanup; see follow-ups).

## Task breakdown

TASK-1: Wrap the `DevRequestEdit` form in `ContentModal` (title `ts.get.dev.requests.new`, `rounded="2xl"`, `p="8"`, `onClose` passed through) in place of the sliding `<div transition:slide>`, and drop the `slide` import.
  files: src/lib/components/dev-requests/DevRequestEdit.svelte
  depends: none
  risk: low — the change only touches markup in one component; the form fields, validation and `onSave` logic stay the same.
  notes:
    - Follow the layout of `time-tracking/ProjectCreate.svelte`: fields in `flex flex-col gap-3`, Save
      button right-aligned in `mt-4 flex w-full justify-end`. Keep the existing form controls
      (`TextInput`, `Select`, `FileUpload`, `TextButton`). Do not add new primitives (STANDARDS §7).
    - Keep the fixed width (`w-120`) only if the modal looks too narrow without it. `PopupContentModal`
      already sets `md:min-w-120`, so the wrapper width is probably not needed.
    - Do not change the save/validation behaviour, the redundant `onMount` reload, or the hardcoded
      'Bug'/'Feature' option labels. All of these are outside this brief (see follow-ups).
    - Field labels: by default keep today's placeholder-only inputs. Adding visible
      `<label><span>` rows like ProjectCreate is optional and must reuse existing keys only. If the
      developer adds them, they need to say so in implementation.md.

TASK-2: In the route page, make the "New Request" button only open the modal (`createOpen = true` instead of toggling) and move the `{#if createOpen}<DevRequestEdit …/>{/if}` block out of the top of the list column (e.g. to the end of the page markup), since it now renders as an overlay.
  files: src/routes/dev-requests/[[id]]/+page.svelte
  depends: TASK-1
  risk: low — it's a one-line handler change plus moving a block. Closing goes through `onClose`, which the modal's close button now calls.

TASK-3: Verify: `npm run check`, `npm run lint`, `npm test` pass. Then check by hand or with a render that on desktop the modal pops up centred with the title "New Request" and a close button, that on mobile it shows as a bottom sheet, and that saving still creates the request and closes the modal.
  files: none (verification only)
  depends: TASK-1, TASK-2
  risk: low — verification only. The one thing to look at closely is the mobile bottom sheet, because `FileUpload` and the 150px multi-line `TextInput` haven't been inside a bottom sheet before.

## Open points / follow-ups (not in scope, do not fix here)

- `src/lib/components/dev-requests/DevRequests.svelte` looks like dead code: nothing imports it, and it duplicates the route page.
  It's a candidate for removal in a separate job.
- `DevRequestEdit.svelte` hardcodes the type option labels `'Bug'` / `'Feature'` even though
  `ts.get.dev.requests.bug` / `.feature` exist (STANDARDS §8.1 violation). This is a separate small fix.
- `DevRequestEdit.svelte` calls `devRequests.load()` in `onMount`, even though the page has already loaded it.
  This is redundant, but harmless.
