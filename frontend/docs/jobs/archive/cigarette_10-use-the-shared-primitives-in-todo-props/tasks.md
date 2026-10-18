# Tasks: 10 Use the shared primitives in todo props

id: cigarette
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

Branch checked: the worktree HEAD is `feature/cigarette_10-use-the-shared-primitives-in-todo-props`, which matches `brief.md`.

Rules: 7.1–7.4 and 8.1 in `docs/STANDARDS.md`. Also 1.1, because the backlog entry asks for the `find(…)?.label` expression to move out of markup. There is no unit seam, so every task is verified with `npm run check`, `npm run lint`, i18n key parity and a manual pass.

## Audit result (pre-classification, to be confirmed by @developer)

`grep -rl '<input' src --include='*.svelte' | grep -v /forms/` returns the 19 files, as rule 7 says. Apart from `Recurrence.svelte`, the provisional calls are:

| # | File | Raw input | Provisional call |
|---|---|---|---|
| 1 | `routes/profile/+page.svelte` | hidden `type=file`, opened by the avatar button | **7.4**: no primitive covers a hidden file picker (`FileUpload` is a visible control that returns base64) |
| 2 | `contacts/ContactDetail.svelte` | hidden `type=file`, opened by the avatar | **7.4**, same reason |
| 3 | `clipboard/ClipboardCreate.svelte` | hidden `type=file` | **7.4**, same reason |
| 4 | `libraries/plants/PlantCreate.svelte` | hidden `type=file` | **7.4**, same reason |
| 5 | `routes/notes/import/+page.svelte` | visible `type=file`; its markup is copied from `FileUpload`, plus a raw submit button and literal strings | **fix** (TASK-8) |
| 6 | `dev-requests/DevRequestEntry.svelte` | inline title edit | **fix**: `TextInput` (TASK-4) |
| 7 | `todos/props/Title.svelte` | inline title edit, classes copied from `TextInput` | **fix**: `TextInput` (TASK-4) |
| 8 | `todos/props/Link.svelte` | inline link edit, classes copied from `TextInput` | **fix**: `TextInput` (TASK-4) |
| 9 | `notes/NoteHeader.svelte` | inline title edit (`text-xl font-bold`) | **fix**: `TextInput` (TASK-5) |
| 10 | `notes/NoteTags.svelte` | add-tag input, uses non-existent `surface-*` classes | **fix**: `TextInput` (TASK-5) |
| 11 | `notes/CreateNoteCategory.svelte` | new-folder input, literal placeholder | **fix**: `TextInput` + i18n (TASK-5) |
| 12 | `time-tracking/TimeTrackingNavigation.svelte` | inline category rename | **fix**: `TextInput` (TASK-5) |
| 13 | `settings/SecuritySettings.svelte` (2×) | passkey name inputs with an Enter/Escape `onkeydown` | **fix**: `TextInput`, which needs `onkeydown` (TASK-6) |
| 14 | `contacts/EmailEdit.svelte` | input joined to a type button (`rounded-l-lg`), literal placeholder | **fix**: `TextInput` + i18n (TASK-6) |
| 15 | `contacts/PhoneEdit.svelte` | same as EmailEdit | **fix**: `TextInput` + i18n (TASK-6) |
| 16 | `admin/UserList.svelte` | search field with an icon overlay (`pl-10 pr-10`), literal placeholder | **fix**: `TextInput` + i18n (TASK-7) |
| 17 | `contacts/Search.svelte` | animated overlay search (`in:fade`, width transition, blur) | **unclear**, see open question Q3 (TASK-9) |
| 18 | `libraries/shared/Search.svelte` | same pattern as 17 | **unclear**, see Q3 (TASK-9) |

Rule 7.4 states that "form controls (anything the user types or picks into) … are never raw". So every visible text input above counts as a violation. Only the four hidden file pickers, which are triggered by a custom element, count as 7.4 cases.

## Task breakdown

TASK-1: Add the prop passthroughs Recurrence needs to the existing form primitives (rule 7.2): `class` on `NumberInput` (so it isn't forced to `w-full`), and `id` on `DateInput` (so `<label for="recurrence-ends-at">` keeps working). Follow the existing `class: customClass` pattern from `TextButton`/`Checkbox` and the `id` prop from `Slider`.
     files: src/lib/components/forms/NumberInput.svelte, src/lib/components/forms/DateInput.svelte
     depends: none
     risk: low — the new props are optional with neutral defaults, so existing callers don't change.

TASK-2: Add the i18n keys Recurrence is missing ("Every" and the "occurrence(s)" fallback unit, e.g. `todos.recurrence_every` and `todos.recurrence_occurrences`) to the type and all four locales. Reuse the existing `layout.modal_cancel` and `layout.save` for the buttons.
     files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
     depends: none
     risk: low — additive keys only; `npm run check` enforces parity.

TASK-3: Rebuild `todos/props/Recurrence.svelte` from the primitives without changing its behaviour. The interval becomes `NumberInput`, the end date `DateInput`, Cancel/Save become `TextButton` (`plain`/`primary`) with `ts.get` titles, and the remove button becomes `InlineDeleteButton` (with `label={ts.get.todos.remove_recurrence}`). The popover gets `use:portalToBody` anchored to the trigger with `closeOnScroll`, following `DueDate.svelte`. The `find(…)?.label?.toLowerCase() ?? …` markup expression moves into a named function (1.1).
     files: src/lib/components/todos/props/Recurrence.svelte, possibly src/lib/components/todos/TodoEditModal.svelte (see Q2)
     depends: TASK-1, TASK-2
     risk: medium — a portalled popover changes positioning and stacking (z-60 vs the modal), `InlineDeleteButton` is larger (34px trash) than the current 16px X in the compact todo row, and `NumberInput` binds `number | null` where the component holds `number`. All of this needs a manual check in ListEntry and TodoEditModal.

TASK-4: Replace the raw inline-edit inputs in `todos/props/Title.svelte`, `todos/props/Link.svelte` and `dev-requests/DevRequestEntry.svelte` with `TextInput` (`bind:input`, `bind:value`, `onblur`). If width classes are needed (Title's `w-9/10`/`w-3/4`), add a `class` passthrough to `TextInput` the same way as TASK-1, or put the width on a wrapper.
     files: src/lib/components/todos/props/Title.svelte, src/lib/components/todos/props/Link.svelte, src/lib/components/dev-requests/DevRequestEntry.svelte, possibly src/lib/components/forms/TextInput.svelte
     depends: none (if TextInput gets `class`, do it once here and reuse it in TASK-5–7)
     risk: low — Title and Link already copy TextInput's classes almost verbatim, and focus-on-edit relies on `bind:input`, which TextInput already exposes.

TASK-5: Replace the raw inputs in `notes/NoteHeader.svelte`, `notes/NoteTags.svelte`, `notes/CreateNoteCategory.svelte` and `time-tracking/TimeTrackingNavigation.svelte` with `TextInput`. Move CreateNoteCategory's literal placeholder `"Enter folder title"` into `ts.get` (new key in all four locales).
     files: the four components above, src/lib/types/translation.ts, src/lib/i18n/{en,de,es,fr}.ts
     depends: TASK-4 (TextInput `class` passthrough, if added)
     risk: medium — the look changes on purpose. NoteHeader's title input goes from `text-xl font-bold` to TextInput's `text-sm` unless a class override is accepted (see Q4), and CreateNoteCategory loses its underline style.

TASK-6: Replace the raw inputs in `settings/SecuritySettings.svelte` (2×), `contacts/EmailEdit.svelte` and `contacts/PhoneEdit.svelte` with `TextInput`. This requires an optional `onkeydown` prop on `TextInput` (7.2) for the passkey Enter/Escape handling, and a way to keep the `rounded-l-lg` join with the adjacent type button in Email/PhoneEdit (the `class` passthrough). Move the literal placeholders `"Email"` and `"Phone number"` into `ts.get`. Check first whether matching contact keys already exist.
     files: src/lib/components/settings/SecuritySettings.svelte, src/lib/components/contacts/EmailEdit.svelte, src/lib/components/contacts/PhoneEdit.svelte, src/lib/components/forms/TextInput.svelte, i18n files + translation.ts
     depends: TASK-4
     risk: medium — a `class` override that changes the radius conflicts with TextInput's own `rounded-lg` (Tailwind order is not guaranteed), so the joined input+button look needs a manual check.

TASK-7: Replace the raw search input in `admin/UserList.svelte` with `TextInput`, keeping the icon overlay padding via the `class` passthrough, and move the literal placeholder `"Search by name or email..."` into `ts.get`.
     files: src/lib/components/admin/UserList.svelte, i18n files + translation.ts
     depends: TASK-4
     risk: low — admin-only screen, single input.

TASK-8: Fix `routes/notes/import/+page.svelte`. It uses a copy of `FileUpload`'s markup, which doesn't fit as-is because `FileUpload` produces base64 while the page needs the `File` for `notes.importFile`. It also has a raw submit button and about 8 literal strings. See Q1 before starting.
     files: src/routes/notes/import/+page.svelte, possibly src/lib/components/forms/FileUpload.svelte, i18n files + translation.ts
     depends: none
     risk: high — it needs either a new bindable prop on `FileUpload` (which also runs a base64 conversion the page doesn't need) or a decision to leave the input raw. The page also has a lot of untranslated text beyond the input.

TASK-9: Decide on and, if confirmed, fix the two animated overlay search fields `contacts/Search.svelte` and `libraries/shared/Search.svelte` (see Q3).
     files: src/lib/components/contacts/Search.svelte, src/lib/components/libraries/shared/Search.svelte, possibly src/lib/components/forms/TextInput.svelte
     depends: TASK-4
     risk: high — these are styled overlays (width transition, `!bg` blur, `in:fade`, `text-xl`) that `TextInput` can't reproduce without large class overrides, and a transition directive can't be put on a component.

TASK-10: Write the per-file audit record (7.4 case vs. fix, with the reason) into `implementation.md`, and run `npm run check`, `npm run lint` and the grep check from rule 7.
     files: docs/jobs/cigarette_10-use-the-shared-primitives-in-todo-props/implementation.md
     depends: TASK-1 … TASK-9
     risk: low — documentation and verification only.

## Open questions (scope is unclear, so these are not guessed)

- **Q1 (TASK-8):** Should `notes/import` get an optional bindable `file` prop on `FileUpload` (rule 7.2), or should it be recorded as a violation and left for a separate job? Its many literal strings (`File Upload`, `Select File`, `Uploading...`, `Upload File`, `Please select a file`, `Import was successful!`, …) are 8.1 violations. The brief only covers the input, though.
- **Q2 (TASK-3):** Should Recurrence portal unconditionally, or take a `portal` prop like `DueDate` (passed only from `TodoEditModal`)? Mirroring DueDate is the conservative choice and touches `TodoEditModal.svelte`.
- **Q3 (TASK-9):** Strictly read, 7.4 makes the two overlay search fields violations. But fixing them with `TextInput` either changes their look or needs heavy class overrides, and a dedicated search primitive is out of scope ("no new primitives"). Should they be fixed, recorded as justified, or deferred?
- **Q4 (TASK-5/6):** Is a `class` passthrough on `TextInput` that overrides typography and radius (`text-xl`, `rounded-l-lg`) acceptable, or should those inputs take TextInput's standard look?
- **Q5 (TASK-3):** The frequency picker is four raw toggle buttons, and rule 7.4 says "anything the user … picks into" is never raw. No chip/segmented primitive exists, and the brief doesn't name one. The conservative option is `TextButton` with `type={selected ? 'primary' : 'slight'}`. The alternative is `Select`, which changes the interaction. Please confirm which one you want.
- `Link.svelte`'s placeholder `https://...` is a URL example rather than a word. Leaving it untranslated is assumed acceptable unless the reviewer disagrees.

## Decisions (owner, 2026-10-13)

- **Q1:** `notes/import` is recorded as a violation and moved to its own job. No business-logic changes here. TASK-8 is dropped.
- **Q2:** Copy the existing `DueDate` pattern: a `portal` prop, passed only from `TodoEditModal`.
- **Q3:** The two animated search overlays are justified (7.4) and are not extracted. TASK-9 becomes documentation only.
- **Q4:** NoteHeader keeps its exact styling and is recorded as justified. `TextInput` gets no typography or radius overrides.
- **Q5:** Developer's judgement, and a new primitive is explicitly allowed. The same segmented "pick one of N" button group is hand-written in `ui/Tabs.svelte`, `routes/check-in/trends/+page.svelte` and `admin/UserGrowthChart.svelte`. So a `forms/SegmentedControl.svelte` is added, styled like the Tabs header, and used in Recurrence only. The other call sites are follow-ups.
- TASK-1 is narrowed: `NumberInput` gets its width from a wrapper element (no `class` prop is needed), and only `DateInput` gains `id`.
