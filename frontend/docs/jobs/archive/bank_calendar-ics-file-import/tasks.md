# Tasks: calendar-ics-file-import

id: bank
analyst: charmaine
date: 2026-11-24

## Task breakdown

TASK-1: Types, route and pure service for the file import
     files: src/lib/types/calendar.ts, src/lib/config/apiRoutes.ts, src/lib/services/CalendarImportService.ts, tests/unit/services/CalendarImportService.test.ts
     depends: none
     risk: low

TASK-2: CalendarImport store: file upload, state polling with stop conditions, status-based errors
     files: src/lib/state/CalendarImport.svelte.ts, tests/unit/stores/CalendarImport.test.ts
     depends: TASK-1
     risk: medium (polling lifecycle)

TASK-3: Import modal: CalDAV / .ics choice, file form, progress, result and failed views; all strings via ts.get (en), other locales by the translator
     files: src/lib/components/calendars/ImportModal.svelte (+ child components), src/lib/i18n/*.ts, src/lib/types/translation.ts
     depends: TASK-2
     risk: medium

TASK-4: Read-only shared calendars (added by the human on 2026-11-24 15:47, room message `01M873TEBZREFM7QRRR31MZVE0`: "fix it right now"; API side `80317ff`)
     files: src/lib/types/calendar.ts, src/lib/services/CalendarEventService.ts, src/lib/helpers/CalendarEventHelper.ts, src/lib/state/Calendars.svelte.ts, src/lib/components/calendars/EventEdit.svelte, src/lib/components/calendars/views/{week/Day,month/Entry}.svelte, src/lib/i18n/*.ts
     depends: none
     risk: low (additive field, UI only hides actions the API now rejects)
