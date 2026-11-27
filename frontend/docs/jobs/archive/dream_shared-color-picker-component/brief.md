# Brief: shared-color-picker-component

type: feature
id: dream
branch: feature/dream_shared-color-picker-component
date: 2026-11-24
author: Leander Muskalla

# Shared colour picker component

**Status:** open — not analysed
**Area:** app
**Origin:** review of `bank_calendar-ics-file-import` (janice, 2026-11-24), STANDARDS 1.6 / 7.2

## Goal

One component in `src/lib/components/forms/` wraps the `svelte-awesome-color-picker` setup
(`components={{ input: ColorPickerInput }}`, `isAlpha={false}`, `position="responsive"`,
`nullable={false}`, `label=""`, `isTextInput={false}`, `--cp-border-color`), and every
feature uses it.

## Current state

The same block is pasted in 7 files:

- `calendars/CalendarEdit.svelte`
- `calendars/import/FileForm.svelte`
- `contacts/AddressBook.svelte`
- `contacts/AddressBookEdit.svelte`
- `libraries/links/CategoryCreate.svelte`
- `settings/TagEdit.svelte`
- `time-tracking/TimeTrackingNavigation.svelte`

Some of them also repeat the "no colour yet" fallback `var(--color-c-neutral-2)`.

## Likely work

- `forms/ColorPicker.svelte` with `bind:hex` (plus whatever the call sites vary, if anything),
  replacing the 7 copies.
- No behaviour change. Check that each call site renders the same before and after.
