# Implementation: contacts-vcf-and-phone-import

id: steal
developer: tony
date: 2026-11-24

## Summary

The contacts import modal offers two sources, "CardDAV account" (the existing flow) and
".vcf file". A file goes into a new address book (name prefilled from the filename, empty
means the API picks the name; optional colour) or into one of the user's address books.
Both flows share one progress, result and failure view, driven by the polled import state
in a new `ContactImport` store. This mirrors the calendar import (`956fae7`). The API
contract is room decision `01M8776XF7D9RKG0605X0EP302`, amended by `01M8778FWBNM3XY0EQW637ZCJG`
(optional `color`); scope is decision `01M8778C47SFGVYHR7R648NF3A`.

## Changes

TASK-1: Backlog entries `docs/backlog/contacts-phone-import.md` (Android phone import,
incl. the note that the app's native bridge is `postMessage`, not Capacitor plugins) and
`docs/backlog/contacts-open-vcf-with-solyto.md`. `docs/backlog/` is gitignored, so they
are not part of the branch.

TASK-2: `types/contact.ts` gets `ImportSource` (`carddav` | `file`), `ImportStage`
(+ `failed`), `ImportFileTarget`, and `source` / `contacts_skipped` on `ImportState`;
`address_books` is nullable (null for a file import). The unused `ImportForm` is removed.
`apiRoutes.contacts.startFileImport` added. New pure `ContactImportService`: default name
from the filename (`.vcf` / `.vcard`), multipart request (`color` always sent for a new
book; the picker starts at the API default `#0088CC`, design review), status → error mapping per source (413/422 invalid file, 404 book not
found, 409 running, 429 rate limited), state → view, progress, stall marker. Unit tests.

TASK-3: New `state/ContactImport.svelte.ts`: `open()`/`close()`, `startCarddavImport`,
`selectCarddavAddressBooks`, `importFile`, all through `postWithStatus` returning a typed
error. Polling lives in the store (1 s), stops on `select`, `finished`, `failed` and after
5 minutes without progress; network and rate-limit errors keep it polling. On finish it
reloads address books and contacts; with the modal closed it notifies instead. `destroy()`
is called from `routes/contacts/+layout.svelte`. The `Contacts` store loses `importModal`,
`startImport`, `selectImportAddressBooks`, `getImportState`. Store tests with fake timers.

TASK-4: `contacts/ImportModal.svelte` rewritten as a shell around `contacts/import/CarddavForm`,
`CarddavSelect` and `FileForm`. Errors go through `SaveAction`. `ContactNavigation` calls
`contactImport.open()`. 11 new `contacts.import_*` keys in `en`; `import_success` and
`import_error` reworded (they said "Address Books"). de/es/fr/it/ru by eugene (translator). Component tests in
`tests/components/contact-import-modal.test.ts`; the old import test in
`tests/components/contacts.test.ts` moved there (loading indicator stops when the start throws).

Verification: `vitest run` 167 files / 2526 tests pass, `eslint .` clean, `svelte-check`
0 errors / 0 warnings (run with `NODE_OPTIONS=--max-old-space-size=1800`, the container has
a 2 GB cap).

## Known issues / follow-ups

- Translator note for the owner: es/fr segment labels shortened ('Nueva libreta' / 'Nouveau
  carnet') for length; see eugene's report.
- Design review (`design-review.md`, artie): colour fix applied. The progress label's book
  name is safe: the API sets `address_books_current` to the target name for file imports
  (ralphie). The optional items (title-cased "Address Book", "Secret" label) are pre-existing
  and out of scope.
- Not verified against the running API or with a rendered screenshot (no API here, the
  route needs a login). Covered by component tests.
- The `ColorPicker` block in `FileForm` is another copy (STANDARDS 1.6), allowed by the
  human (`01M8777WX5XQ1GJDAFMMNMWZ82`); tracked in `docs/backlog/shared-color-picker-component.md`.
- `FileForm` reads `targets` once for the initial picker value (same as the calendar
  form); address books are loaded before the modal can be opened.
- Behaviour change: a finished CardDAV import shows the result view with a Close button
  instead of closing itself with a notification, same as the calendar import.
- The contacts store and calendar store each keep a near-identical import store and
  service; a shared base was not introduced (no such abstraction exists, AGENTS.md).
