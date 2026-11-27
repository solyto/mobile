# Implementation: shared-color-picker-component

id: dream
developer: developer
date: 2026-11-24

## Summary

New `forms/ColorPicker.svelte` wraps the `svelte-awesome-color-picker` setup once
(`components={{ input: ColorPickerInput }}`, `isAlpha={false}`, `position="responsive"`,
`nullable={false}`, `label=""`, `isTextInput={false}`, `--cp-border-color`). All 8 call sites
use it now. Props: `hex` (bindable, required), `isDialog` (default `true`), `isOpen`
(bindable, default `!isDialog`, the same as the library default). `forms/ColorPicker.svelte` is
now the only file that imports the library.

The DOM is the same at every call site. The `--cp-border-color` wrapper element used to sit at
the call site and now sits inside the component, and the component adds no element of its own.

## Changes

TASK-1: `src/lib/components/forms/ColorPicker.svelte` (new). `isOpen` defaults to `!isDialog`
because Svelte 5 throws when `bind:` passes `undefined` to a prop that has a fallback.
TASK-2: `tests/components/forms.test.ts`, `tests/components/helpers/ColorPickerHarness.svelte`.
The tests check four things: the swatch shows the bound colour; a hue-slider keyboard change
writes back to the bound `hex`; a mousedown on the swatch writes back to the bound `isOpen`;
with `isDialog={false}` there's no swatch and the picker stays open.
TASK-3: `calendars/CalendarEdit.svelte`, `calendars/import/FileForm.svelte`: use the wrapper with `bind:hex`.
TASK-4: `contacts/AddressBookEdit.svelte`: same.
TASK-5: `libraries/links/CategoryCreate.svelte`: same. The surrounding `fixed` div stays unchanged.
TASK-6: `settings/TagEdit.svelte`: `bind:hex bind:isOpen={pickerOpen}`.
TASK-7: `contacts/import/FileForm.svelte`: `bind:hex`.
TASK-8: `contacts/AddressBook.svelte`: `bind:hex isDialog={false}`. I checked the 4.1.0 source:
it renders the `input` component only `{#if isDialog}`, so passing `ColorPickerInput` changes
nothing in inline mode.
TASK-9: `time-tracking/TimeTrackingNavigation.svelte`: replaced the one-way `hex` + `onInput`
pair with `bind:hex={() => getCategoryHex(...), (hex) => setCategoryHex(...)}`. I checked in a
throwaway test that the setter gets user picks through the wrapper and is not called on mount.
The old `onInput` did fire on mount, but only with the value already shown, which
`handleColorChange` ignored anyway, so the save behaviour is the same.
TASK-10: verification. node_modules is missing from the worktree, so I installed the lockfile
with `npm ci` in a scratch copy outside the repo. `npm test` passes (167 files, 2530 tests) and
`npm run lint` is clean. The full `npm run check` gets OOM-killed in this container (8 GB, no
swap), with or without a bigger heap. `svelte-check` on a tsconfig narrowed to the changed files
(623 files including transitive imports) reports 0 errors and 0 warnings.

## Known issues / follow-ups

- The full `npm run check` should be re-run on a machine with more memory.
- No `shot` render: the call sites sit behind login and need the API. The before/after DOM is
  identical by construction (see Summary).
- The "no colour yet" fallback `var(--color-c-neutral-2)` is still repeated at the call sites
  (out of scope per tasks.md).
