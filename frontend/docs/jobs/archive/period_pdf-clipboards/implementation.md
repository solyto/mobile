# Implementation: pdf-clipboards

id: period
developer: marmaduke
date: 2026-11-16

## Summary

The clipboard now accepts documents (pdf, txt, md, csv, doc, docx, ppt, pptx, xls, xlsx, max 10 MB), and clipboard images load through the authenticated API instead of public storage. This follows the contract agreed in the room `pdf-clipboards` with the API (ebenezer, branch `feature/maintain_pdf-clipboards`). The tasks were agreed in the room, not in `tasks.md`.

## Changes

TASK-1 (files): `types/clipboard.ts` adds type `file`, `file_name`/`file_size`/`mime_type` and `ClipboardUploadResult`. `config/apiRoutes.ts`: list sends `include_files=1` (old builds never see file entries); adds `createFile`, `getFile`. `state/Clipboard.svelte.ts`: `createFile()` checks size and extension before uploading (rejected uploads count toward the daily quota) and maps 413/422. A 429 (`RateLimitedError`) propagates to the component; a `NetworkError` propagates to the root layout's network-error handler (after review: it was reported as "too large" before). It also adds `getFile()` and `getImage()`. `ClipboardCreate.svelte` adds a paperclip picker, a selected-file preview, save, and messages for each outcome; the 429 message includes the hours until reset (`clipboardFileLimitMessage`). `ClipboardList.svelte` renders file cards with a download button (no copy, never rendered inline); text and file cards now share a `card` snippet. `ClipboardFileInfo.svelte`: name + size, used by both.
TASK-2 (images behind auth): `ClipboardImage.svelte` fetches the image blob via `GET /clipboard/{id}/image` and shows it as an object URL, revoked on destroy. `ClipboardList` no longer reads `API_USER_STORAGE_URL`.
TASK-3 (helpers): `FormatHelper` adds `formatFileSize` (Intl unit format, localised) and `getFileExtension`. `DownloadHelper.downloadBlob` was extracted from `ExportSettings` (second copy, STANDARDS 2.4). `NetworkErrorHelper` shares the hours-wait message between export and clipboard.
TASK-4 (i18n): 8 new `clipboard.file_*` keys in en, de, es, fr, it, ru. No translator agent tool was available in this session, so I translated them following `docs/I18N.md`. Owner review of de recommended.
TASK-5 (tests): store tests for `load`/`createFile`/`getFile`, helper tests for `formatFileSize`, `getFileExtension`, `clipboardFileLimitMessage`; `download` added to the store API mock.

## Verification

`npm run check` and `npm run lint` are clean. `npm test`: 1526 passed, 1 failed. The failure is `Contacts.test.ts > load > loads hidden state, books, contacts and photos`, and it was already failing on this branch: it comes from commit 68c6b8c, which touched no clipboard code. `npm run build` was killed by the container running out of memory (OOM, even at 6 GB heap), so it needs a run elsewhere. Not rendered with `shot`: there's no local API to serve clipboard data.

## Known issues / follow-ups

- Deploy order: API first, web frontend right after (new frontend against old API gets 404 on the file routes).
- Deployment repo: PHP `upload_max_filesize` ≥ 10M, `post_max_size` above it, nginx `client_max_body_size` ≥ 10M.
- `downloadBlob` uses an `<a download>` click on a blob URL (revoke deferred one tick for Safari). Untested in the desktop (Electron) and mobile (Capacitor/F-Droid) shells; Android WebView typically ignores blob downloads, so file download (and the existing export download) may need a native bridge there.
- Other features still serve user files from public `/storage/user` (library covers, avatars, calendar share): separate job.
- Released builds 1.0.0–1.1.3 show broken clipboard thumbnails after the image move (accepted by the owner).
