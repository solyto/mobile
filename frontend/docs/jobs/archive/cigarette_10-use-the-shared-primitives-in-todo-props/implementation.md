# Implementation: 10 Use the shared primitives in todo props

id: cigarette
developer: @developer
date: 2026-10-13

## Summary

`todos/props/Recurrence.svelte` is rebuilt from shared primitives and all its strings are translated. The rule-7 audit of the other 18 files with a raw `<input>` outside `forms/` is done. 11 were fixed with `TextInput`, 6 are recorded as justified, and 1 (`notes/import`) is deferred to its own job. Owner decisions on the analyst's open questions are recorded in `tasks.md` under "Decisions".

Verification: `npm run check` reported 0 errors and 0 warnings, which includes i18n key parity. `npm run lint` is clean, and `npm test` passed 841 of 841. The rule-7 grep now lists 8 files, each one accounted for below. There was no visual pass, because the authenticated views need the API at `localhost:8000`, which is not available in this environment. See the follow-ups.

## Changes

TASK-1: `forms/DateInput.svelte` gets an optional `id` prop, so `<label for="recurrence-ends-at">` keeps working. `NumberInput` gets no new prop: its width comes from a wrapper `<div class="w-16">`, which avoids a `w-*` class conflict with its `w-full`.

TASK-2: New `todos.recurrence_every` and `todos.recurrence_unit_{daily,weekly,monthly,yearly,fallback}` keys in `translation.ts` and all four locales. Proper unit words ("week(s)", "Woche(n)", …) replace the old lowercased frequency label, which produced "Every 2 weekly" and the ungrammatical German "Alle 2 wöchentlich". Cancel and Save reuse `layout.modal_cancel` and `layout.save`.

TASK-3: New primitive `forms/SegmentedControl.svelte`, approved by the owner for Q5. It is a "pick one of N" button group, styled after the `ui/Tabs.svelte` header, with `aria-pressed`. `Recurrence.svelte` now uses:
- `SegmentedControl` for the frequency
- `NumberInput` for the interval and `DateInput` for the end date
- `TextButton` with `plain`/`primary` for Cancel/Save
- `InlineDeleteButton` for remove, with `label`, still shown only on hover

The popover is a snippet. With the new `portal` prop it is rendered through `use:portalToBody` (anchored to the trigger, `closeOnScroll`), the same as `DueDate`. Only `TodoEditModal.svelte` passes `portal`, so ListEntry keeps its previous inline positioning. The unit expression moved from the markup into `intervalUnit()` (rule 1.1). Recurrence behaviour is unchanged: same state, same `changeRecurrence` calls.

TASK-4: `todos/props/Title.svelte`, `todos/props/Link.svelte` and `dev-requests/DevRequestEntry.svelte` use `TextInput` (`bind:input` for focus-on-edit, `onblur` to save). Title's view-dependent width sits on a wrapper div. Link keeps `https://...` as a literal placeholder, since it is a URL example rather than a word.

TASK-5: `notes/NoteTags.svelte` (width on a wrapper; this also drops the non-existent `surface-*` input classes), `notes/CreateNoteCategory.svelte` (placeholder now uses the existing `notes.enter_folder_title`; the underline style is replaced by the standard input look) and `time-tracking/TimeTrackingNavigation.svelte` use `TextInput`. `NoteHeader.svelte` is left alone at the owner's request (Q4).

TASK-6: `forms/TextInput.svelte` gets an optional `onkeydown` prop (rule 7.2). `settings/SecuritySettings.svelte` uses `TextInput` for both passkey-name inputs. The Enter/Escape logic moved from inline markup into `onNameKeyDown` / `onEditKeyDown`. `contacts/EmailEdit.svelte` and `contacts/PhoneEdit.svelte` use `TextInput` with the new `contacts.email_placeholder` / `contacts.phone_placeholder` keys. The input and type button are no longer joined (`rounded-l-lg` / `rounded-r-lg border-l-0`): they are now two rounded controls with `gap-1`, so `TextInput`'s radius is not overridden.

TASK-7: `forms/TextInput.svelte` gets a `class` passthrough (`class: customClass`, as in `TextButton`), used only for layout. `admin/UserList.svelte` uses it for the icon-overlay padding (`py-2.5 pr-10 pl-10`; `TextInput` has no padding utility to conflict with). The placeholder is now `admin.search_placeholder`.

TASK-8: Dropped (owner decision Q1). The page is recorded below as a violation for a separate job.

TASK-9: Documentation only (owner decision Q3). See the audit record.

TASK-10: This file.

### Audit record (rule 7, 19 files)

| File | Result | Reason |
|---|---|---|
| `todos/props/Recurrence.svelte` | fix | TASK-3 |
| `todos/props/Title.svelte` | fix | `TextInput` (TASK-4) |
| `todos/props/Link.svelte` | fix | `TextInput` (TASK-4) |
| `dev-requests/DevRequestEntry.svelte` | fix | `TextInput` (TASK-4) |
| `notes/NoteTags.svelte` | fix | `TextInput` (TASK-5) |
| `notes/CreateNoteCategory.svelte` | fix | `TextInput` + i18n (TASK-5) |
| `time-tracking/TimeTrackingNavigation.svelte` | fix | `TextInput` (TASK-5) |
| `settings/SecuritySettings.svelte` (2×) | fix | `TextInput` + `onkeydown` (TASK-6) |
| `contacts/EmailEdit.svelte` | fix | `TextInput` + i18n (TASK-6) |
| `contacts/PhoneEdit.svelte` | fix | `TextInput` + i18n (TASK-6) |
| `admin/UserList.svelte` | fix | `TextInput` + `class` + i18n (TASK-7) |
| `routes/profile/+page.svelte` | 7.4 | hidden `type=file` opened by the avatar button; no primitive covers a hidden picker |
| `contacts/ContactDetail.svelte` | 7.4 | hidden `type=file` opened by the avatar |
| `clipboard/ClipboardCreate.svelte` | 7.4 | hidden `type=file` |
| `libraries/plants/PlantCreate.svelte` | 7.4 | hidden `type=file` |
| `notes/NoteHeader.svelte` | 7.4 (owner) | inline heading rename (`text-xl font-bold`); the owner wants its exact styling kept |
| `contacts/Search.svelte` | 7.4 (owner) | animated overlay search (`in:fade`, width transition, blur); `TextInput` can't carry a transition, and extracting it isn't worth it |
| `libraries/shared/Search.svelte` | 7.4 (owner) | same pattern as `contacts/Search.svelte` |
| `routes/notes/import/+page.svelte` | violation, deferred | visible file input copied from `FileUpload`, but needs the `File` rather than base64; fixing it touches the upload logic, so it gets its own job (Q1) |

## Known issues / follow-ups

- **Manual visual pass still open** (needs a running API). Check these:
  - Recurrence popover position with `mt-6` in TodoEditModal (portalled) and with `mt-1` in ListEntry
  - `InlineDeleteButton` (34px) in the compact recurrence row
  - The now-separated input and type button in contact Email/Phone edit
  - CreateNoteCategory and DevRequestEntry, which now take the standard input look
- `routes/notes/import/+page.svelte`: own job. Raw file input, raw submit button and about 8 untranslated strings (8.1).
- `SegmentedControl` could replace the hand-written button groups in `routes/check-in/trends/+page.svelte` (range picker), `admin/UserGrowthChart.svelte` (group-by filter) and the header of `ui/Tabs.svelte`. Not done here.
- `todos/actions/TodoCreate.svelte:143` has a literal "Recurrence" (8.1).
- `notes/NoteTags.svelte`: the "+ tag" button still uses non-existent `text-surface-*` classes.
- `admin/UserList.svelte`: the clear (×) button depends on a local `searchQuery` that is never set, so it never shows. This existed before this job.
- `.mcp.json` in the worktree has an uncommitted change (it registers the context7 MCP server for agent sessions). It is environment tooling unrelated to this job, so it was deliberately left uncommitted.
