# Tasks: shared-color-picker-component

id: dream
analyst: analyst
date: 2026-11-24

## Findings that shape the scope

- **8 copies, not 7.** `contacts/import/FileForm.svelte` (lines 73-82) has the same block
  and is not in the brief's list. The brief's goal ("every feature uses it") covers it, so it is
  included as TASK-7.
- **What the call sites vary** (everything else is identical):
  | Call site | Variation |
  | --- | --- |
  | `calendars/CalendarEdit.svelte` | none (`bind:hex`) |
  | `calendars/import/FileForm.svelte` | none (`bind:hex`) |
  | `contacts/import/FileForm.svelte` | none (`bind:hex`) |
  | `contacts/AddressBookEdit.svelte` | none (`bind:hex`) |
  | `libraries/links/CategoryCreate.svelte` | none (`bind:hex`); the `fixed` wrapper div with a no-op `clickOutside` stays at the call site |
  | `settings/TagEdit.svelte` | also `bind:isOpen={pickerOpen}` |
  | `time-tracking/TimeTrackingNavigation.svelte` | one-way `hex={getCategoryHex(...)}` + `onInput` writing into a per-row map, inside `{#each}` |
  | `contacts/AddressBook.svelte` | **no** `components={{ input: ColorPickerInput }}`, plus `isDialog={false}` (always-open inline picker inside its own popover) |
- So the wrapper needs: `hex` (`$bindable`), `isOpen` (`$bindable`, optional), and `isDialog`
  (optional, default `true` = library default). Time tracking can use a Svelte 5 function
  binding (`bind:hex={() => getCategoryHex(...), (v) => setCategoryHex(...)}`, supported by the
  pinned svelte 5.57.2) instead of an extra `onInput` prop — developer's call, but no
  `onInput` passthrough unless the function binding can't reproduce the current behaviour.
- **`node_modules` is not present in this worktree**, so I could not check whether
  svelte-awesome-color-picker 4.1.0 renders the `input` component when `isDialog={false}`.
  If it does, passing `ColorPickerInput` to `AddressBook.svelte` would change what renders there
  (it currently gets the library default input, if any). See TASK-8.
- **"No colour yet" fallback** `var(--color-c-neutral-2)`: repeated as the initial `hex` in
  CalendarEdit, AddressBook, AddressBookEdit, TagEdit, and as `NO_COLOR` in calendar FileForm
  (where it is also compared against to send `null`). The brief only mentions it, it does not ask
  to consolidate it, and it is also used widely outside colour pickers (`ColorHelper`,
  `Contacts.svelte.ts`, `NavigationEntry`). **Not planned as a task** — unclear scope; raise with
  the owner if it should be folded into the wrapper (e.g. a nullable `hex`), which would be a
  behaviour/API change.
- Existing test for `ColorPickerInput` lives in `tests/components/forms.test.ts`; the new wrapper
  gets a test there too (contract only: forwards/binds `hex`, renders the custom input swatch).

## Task breakdown

TASK-1: Create `forms/ColorPicker.svelte` wrapping svelte-awesome-color-picker with the shared
settings (`components={{ input: ColorPickerInput }}`, `isAlpha={false}`, `position="responsive"`,
`nullable={false}`, `label=""`, `isTextInput={false}`, `--cp-border-color="var(--color-c-neutral-2)"`)
and props `hex` (bindable), `isOpen` (bindable, optional), `isDialog` (optional).
  files: src/lib/components/forms/ColorPicker.svelte (new)
  depends: none
  risk: medium — CSS custom property (`--cp-border-color`) must still reach the library component through the wrapper (pass it on the inner element, not the wrapper's call site), and the `isDialog`/input-component interaction is unverified (see TASK-8).

TASK-2: Add a component test for the wrapper (renders the custom swatch with the given `hex`; binding updates propagate).
  files: tests/components/forms.test.ts
  depends: TASK-1
  risk: low — follows the existing `ColorPickerInput` test in the same file.

TASK-3: Replace the inline picker in `calendars/CalendarEdit.svelte` and `calendars/import/FileForm.svelte` with the wrapper and drop the now-unused imports.
  files: src/lib/components/calendars/CalendarEdit.svelte, src/lib/components/calendars/import/FileForm.svelte
  depends: TASK-1
  risk: low — plain `bind:hex`; `tests/components/calendar-import-modal.test.ts` covers FileForm.

TASK-4: Replace the inline picker in `contacts/AddressBookEdit.svelte` with the wrapper.
  files: src/lib/components/contacts/AddressBookEdit.svelte
  depends: TASK-1
  risk: low — plain `bind:hex`.

TASK-5: Replace the inline picker in `libraries/links/CategoryCreate.svelte` with the wrapper, keeping its surrounding `fixed` div unchanged.
  files: src/lib/components/libraries/links/CategoryCreate.svelte
  depends: TASK-1
  risk: low — plain `bind:hex`; layout wrapper stays at the call site.

TASK-6: Replace the inline picker in `settings/TagEdit.svelte` with the wrapper, keeping `bind:isOpen={pickerOpen}`.
  files: src/lib/components/settings/TagEdit.svelte
  depends: TASK-1
  risk: medium — `onColorChange` relies on `pickerOpen` being kept in sync; the bindable `isOpen` must forward both ways or tag colour saves silently stop.

TASK-7: Replace the inline picker in `contacts/import/FileForm.svelte` (not listed in the brief) with the wrapper.
  files: src/lib/components/contacts/import/FileForm.svelte
  depends: TASK-1
  risk: low — plain `bind:hex`; `tests/components/contact-import-modal.test.ts` covers it.

TASK-8: Replace the inline picker in `contacts/AddressBook.svelte` with the wrapper using `isDialog={false}`, after checking in the 4.1.0 library source whether the `input` component renders in non-dialog mode; if it does and the swatch would newly appear, stop and report instead of changing the rendering.
  files: src/lib/components/contacts/AddressBook.svelte (possibly src/lib/components/forms/ColorPicker.svelte)
  depends: TASK-1
  risk: high — this call site differs from the others (no custom input, inline mode) and the "no behaviour change" requirement can't be confirmed without the library source.

TASK-9: Replace the inline picker in `time-tracking/TimeTrackingNavigation.svelte` with the wrapper, moving the one-way `hex` + `onInput` pair to a function binding on `hex` (or an equivalent that keeps the per-category map semantics).
  files: src/lib/components/time-tracking/TimeTrackingNavigation.svelte
  depends: TASK-1
  risk: medium — per-row state inside `{#each}` and the `clickOutside` save handler read `categoryColors`; `onInput` only fires on user input with a truthy hex, which a setter binding must reproduce (ignore null/initial writes) so no spurious updates are saved.

TASK-10: Confirm no remaining direct import of `svelte-awesome-color-picker` outside `forms/ColorPicker.svelte`, then run `npm run check`, `npm run lint`, `npm test`.
  files: none (verification)
  depends: TASK-2..TASK-9
  risk: low — verification only; a visual before/after check of each call site per the brief needs a render, which the read-only analyst can't do.
