# Design review: contacts-vcf-and-phone-import

id: steal
designer: artie
date: 2026-11-24

Scope: TASK-4 UI (`contacts/ImportModal.svelte`, `contacts/import/{FileForm,CarddavForm,CarddavSelect}.svelte`, new `en` strings).
No render report exists. This review comes from reading the code and comparing it with the calendar import (`956fae7`).

## Verdict

PASS (re-checked at `0b8f2b7`). The colour fix is in. The progress-label check is resolved: ralphie confirmed `address_books_current` is the target name for file imports. The modal follows the calendar import shell one-to-one, and hierarchy, button types and states are right.

## Findings

**[contacts/import/FileForm.svelte] colour preview does not match the result (fix)**
Problem: The swatch starts as `var(--color-c-neutral-2)` (grey). If the user leaves it alone, `color: null` is sent, and the API then defaults to `#0088CC` (decision `01M8778FWBNM3XY0EQW637ZCJG`). So the user sees grey and gets a blue address book. The calendar copy doesn't have this problem, because a calendar's colour can stay null.
Fix: Start with the colour the API will actually use and always send it:

```ts
const DEFAULT_COLOR = '#0088CC';
let hex = $state<string>(DEFAULT_COLOR);
// target():
return { type: 'new', name, color: hex };
```

Drop `NO_COLOR`. `CategoryCreate.svelte` already uses the same `DEFAULT_COLOR` pattern.

**[ImportModal.svelte] file-import progress label may show an empty book name (check)**
Problem: `import_contacts_running` reads "Importing %dcontacts for Address Book %s..". If the API doesn't set `address_books_current` for a file import, users will see "…for Address Book ..". Confirm with ralphie what the file job puts in `address_books_current`. If it can be null, use a label without the book name for that case.

## Optional (pre-existing, not introduced here)

- In the old `contacts` strings, "Address Book" is title-cased and ellipses are written "..". The new strings use "address book". Align them when someone next touches those strings.
- The CardDAV label "Secret" is unclear to non-technical users. The calendar import uses `connect_password`. Not in scope.

## What is solid (don't touch)

- Every step has exactly one primary button, and it stays disabled until the input is valid. That replaces the old silent no-op.
- The floating spinner badge, `fade` transitions and auto-close toast are gone. The result view lists imported and skipped counts, and skipped only shows when it's above 0.
- The failed view uses `text-c-danger` + `role="alert"` and has a Close button.
- The new/existing segmented control is hidden when the user has no address books.
- Labels are linked with `labelFor`/`id`. The CardDAV inputs disable autocapitalise and autocorrect.
