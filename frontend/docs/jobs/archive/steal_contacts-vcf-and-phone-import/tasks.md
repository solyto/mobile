# Tasks: contacts-vcf-and-phone-import

id: steal
analyst: tony
date: 2026-11-24

## Task breakdown

TASK-1: Backlog entries for the phone import and for opening .vcf files from outside the app
     files: docs/backlog/contacts-phone-import.md, docs/backlog/contacts-open-vcf-with-solyto.md
     depends: none
     risk: low

TASK-2: Types, route and pure ContactImportService for the import
     files: src/lib/types/contact.ts, src/lib/config/apiRoutes.ts, src/lib/services/ContactImportService.ts, tests/unit/services/ContactImportService.test.ts
     depends: none
     risk: low

TASK-3: ContactImport store: CardDAV start/select, file upload, state polling with stop conditions, status-based errors; Contacts store loses its import members
     files: src/lib/state/ContactImport.svelte.ts, src/lib/state/Contacts.svelte.ts, src/routes/contacts/+layout.svelte, tests/unit/stores/ContactImport.test.ts
     depends: TASK-2
     risk: medium (polling lifecycle)

TASK-4: Import modal: CardDAV / .vcf choice, file form (new book with name + colour, or existing book), progress, result and failed views; strings in en, other locales by the translator
     files: src/lib/components/contacts/ImportModal.svelte (+ contacts/import/*), src/lib/components/contacts/ContactNavigation.svelte, src/lib/i18n/*.ts, src/lib/types/translation.ts, tests/components/contact-import-modal.test.ts
     depends: TASK-3
     risk: medium
