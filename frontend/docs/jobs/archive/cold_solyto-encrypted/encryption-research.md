# Encryption feasibility — frontend view

Author: ophelia (frontend). Date: 2026-11-18. Scope: this repo only; the API side is gwendolyn's.

## Short answer

Yes, it is feasible, and **per-feature end-to-end encryption (E2EE) is the realistic first step**. Full encryption of everything is possible too, but it switches off a lot of server features (content in reminders, Telegram, feeds, external calendars, recommendations, widgets, sharing). Quick add, import and export keep working if their save step moves into the app (see below).

The frontend is in a good position for it:

- Nearly every feature loads **whole lists** and does search, filter, sort, grouping and relevance **client-side** (`NoteSearchService`, `TodoFilterService`, `TodoSortingService`, `TodoRelevanceService`, `LibraryFilterService`, `WealthStatisticsService`, ...). Encrypted fields don't break any of that, as long as decryption happens before the stores hold the data.
- All traffic goes through one `ApiService` and one store per domain, so there is a clear place to encrypt on write and decrypt on read.
- The service worker never caches `/api` responses (`src/service-worker.ts:65`), so no plaintext ends up in the SW cache.
- WebCrypto (`crypto.subtle`: AES-GCM, PBKDF2/HKDF, ECDH/X25519) covers everything we need. **No new dependency.** One exception: Argon2id for password key derivation is not in WebCrypto. PBKDF2-SHA256 with ≥600k iterations works without a dependency. Argon2 (WASM) would need your approval.
- Note images are stored inline as base64 inside the note HTML (`TipTapEditor.svelte:75`), so they get encrypted along with the content.

There is no crypto code in the repo yet. `KeyManager.svelte.ts` handles keyboard shortcuts and has nothing to do with encryption.

## Recommended model

1. **Data key (DEK)** per user, or per encrypted "scope" (e.g. per calendar, needed later for sharing). Random AES-256-GCM key.
2. **Key-encryption key (KEK)** derived from a separate **encryption passphrase**. This is *required*, not optional: the server sees the login password (REST login, and DAV Basic auth), so a key derived from it isn't secret from the server. The derived key must never be sent to the server. The server stores only the wrapped DEK plus salt and KDF parameters.
3. **Recovery key** shown once at setup, which can also unwrap the DEK. Without it, a forgotten passphrase or an email password reset means the data is **permanently lost**. This is the main UX cost and must be stated plainly in the UI.
4. **Passkey users**: unwrapping with a passkey needs the WebAuthn **PRF extension** (`@simplewebauthn/browser` 14 passes extensions through). Support depends on the browser and authenticator, so passkey-only users need the passphrase as a fallback.
5. **Field-level** encryption: only content fields become ciphertext (`title`, `description`, `content`, `notes`, amounts, ...). Structure (ids, timestamps, `due_at`, status, relations) stays plaintext so the server can keep doing sync, recurrence and ordering. A versioned envelope such as `enc:v1:<iv>:<ciphertext>` lets encrypted and plaintext rows coexist during migration.
6. Unlocked keys live **in memory only** (non-extractable `CryptoKey`), optionally in IndexedDB as a non-extractable key for "remember this device". Never in LocalStorage next to the auth token.

## Feature-by-feature

Ease = how well the feature survives encrypting its content fields.

| Feature | Ease | What breaks / needs work |
|---|---|---|
| **Notes** (incl. journal) | Easy | Search is already client-side. Server sorts by title, so the client must sort. Server-side **import/export** (`notes/import`, `notes/export`) must move to the client. `journalMarks` only needs dates, so it keeps working. Best first candidate. |
| **Todos** | Medium | Filtering, sorting and relevance are client-side. But the inline syntax (`#tag`, `/category`, `due:`, `repeat:`) is parsed **server-side** (`TodoService::parse`, with tag/category lookup by name). `TodoCreate.svelte` only autocompletes it, so encrypted users need a client-side parser. `todos.title` is varchar(255), and ciphertext is ~1.4x longer, so the column needs a migration. `due_at`, status and recurrence stay plaintext. Server-generated recurring copies (`auto_generated`) must copy the ciphertext as-is, which works if all todos use the same key. **Daily "your day" reminders** (push, email, Telegram) can no longer include titles; they could only say "you have 3 todos today". **Quick add** stays: `QuickAddService::detect` is plain keyword/URL matching (no AI), so the app copies it and detects locally, then creates encrypted todos and notes through the normal endpoints. Library and link URLs aren't encrypted, so those still go through the server. |
| **Calendar** | Hard | Data lives as iCal blobs in SabreDAV and is served over **CalDAV to third-party clients** (Apple, DAVx5, Thunderbird). Those clients would show ciphertext, so an encrypted calendar must be excluded from DAV (or DAV switched off for the user). Recurrence is expanded **server-side** (`listEvents` per range, `occurrence` endpoints), so start/end/rrule must stay plaintext. Only title, description and location can be encrypted. **Sharing with friends** needs per-calendar keys and user key pairs (big). **External CalDAV accounts and ICS import** are synced by the server and can't be encrypted. Todo/note attachments are fine (ids only). |
| **Contacts** | Hard | vCards in SabreDAV, served over **CardDAV**: same problem as calendars, so it must be excluded from DAV. Photos are uploaded as files, so encrypted blob storage is needed. **CardDAV import** happens server-side. |
| **Finances** (wealth, budget) | Medium | Statistics are computed client-side (`WealthStatisticsService`, `BudgetIntervalService`). Value columns are float, so they need a migration to text, and the API types change. `WealthService::listFields` sorts by latest value on the server, so that sort moves to the client. High value, since this is the most sensitive data. |
| **Check-in** | Easy | `marks` only need dates. Daily check-in reminders don't need content. |
| **Time tracking** | Medium | `entries/statistics` is aggregated **server-side** by category, so it would have to move to the client. Descriptions can be encrypted; durations should stay plaintext. |
| **Clipboard** | Medium | Text is easy. Images and files are uploaded as files (`clipboard/image`, `clipboard/file`), so they would need client-side blob encryption before upload and decryption on download. |
| **Libraries** (books, movies, music, games) | Hard / low value | The server enriches entries from external providers (covers, metadata), computes **recommendations** and **release notifications**, and runs imports. Encryption kills all of that. Personal fields such as notes and ratings could be encrypted, but the titles are what the server needs. Recommend leaving these out. |
| Links / quotes / recipes / plants | Medium | Mostly plain CRUD. Recipe import from URL and plant cover upload are server-side. `quotes/random` still works (it returns ciphertext and the client decrypts). |
| **Feeds** | Not feasible | The server has to know the URLs to fetch them, and friend feeds are shared. |
| Tags, categories, workspaces | Hard | Names are shared across features, and the server looks them up by `LOWER(name)`. With random IVs, equal names don't produce equal ciphertext, so the lookup breaks. Either keep names plaintext or move every name lookup to the client. |
| Dev requests, friends, profile, settings, admin | Out of scope | Public or social by nature, or needed by the server. |
| Admin statistics | Unaffected | Counts only. |

## Cross-cutting issues

- **Password reset by email** permanently destroys access to encrypted data unless the user has the recovery key. The reset flow needs a clear warning, and the encryption must use its own passphrase or KEK path.
- **Change password**: if the KEK is derived from the login password, every password change has to re-wrap the DEK client-side. Another reason to prefer a separate passphrase.
- **Native widgets** (`WidgetBridge.ts`): the native side fetches data itself with a widget token, so it would only get ciphertext. Either it gets the key (needs secure native storage, out of this repo) or widgets are disabled for encrypted features.
- **Push, email and Telegram** notifications are built server-side, so they can't include encrypted content (counts only).
- **Server-written content**: the Telegram bot and `quick-add/commit` insert rows server-side, which would put plaintext into an encrypted feature. Block those writes for encrypted features. Quick add then detects and saves in the app, as described above. The Telegram bot can't show or create entries in encrypted parts, which makes it a real downside for users.
- **Import / export**: file imports (notes, ICS, vCard) keep working if the app parses the file, encrypts it and uploads. Imports the server pulls itself (remote CalDAV accounts, feed sync) can't produce encrypted data. A ciphertext export is only useful if the app also offers a way to decrypt it.
- **Column migrations**: ciphertext doesn't fit varchar(255) or float columns; the affected columns become text.
- **Data export** (`/export`) is built server-side and would contain ciphertext. The client would need its own export, or the server export plus a client-side decrypt step.
- **Multi-device**: every device has to unlock once (passphrase or passkey PRF). Logout must wipe in-memory and IndexedDB keys.
- **Threat model honesty**: in a web app, the server that delivers the JS could ship code that steals keys. E2EE here protects against database or backup leaks and API-side compromise, **not** against a malicious or compromised frontend host. The Electron and mobile shells bundle the code, so they are stronger. Also: **there is no CSP** (`svelte.config.js`). One XSS = stolen keys. All 8 `{@html}` uses go through DOMPurify, which is good, but a strict CSP should come before E2EE.
- **Platforms**: `crypto.subtle` needs a secure context. Web, localhost dev and Electron are fine. The mobile WebView origin should be checked (https or a custom scheme). That lives in the shell repo, not here.
- **Performance**: decrypting full lists on load is fast (AES-GCM is hardware-accelerated). Thousands of notes means a short delay on first load, not a blocker.
- **Migration**: turning encryption on means "download → encrypt → upload" for every row, client-side (batch endpoint needed). Turning it off is the reverse. Both must survive interruption, which is why the per-field `enc:v1:` envelope matters.
- **Tests**: crypto helpers are pure, so they fit `tests/unit/` (WebCrypto is available in Node).

## Options

**A. Per-feature opt-in (recommended).** Start with Notes (incl. journal), then Check-in and Finances, then Todos and Clipboard text. Calendar and Contacts only with DAV excluded. Each one is a toggle that shows what stops working. These features already work client-side, so they lose little.

**B. Full encryption.** Everything in A, plus calendar (content only, no sharing or external sync), time tracking (stats moved client-side), clipboard files, contacts photos. Feeds, library enrichment and recommendations, rich notifications and widgets are switched off for that account; quick add, import and export keep working through the app. Calendar sharing needs user key pairs, which is a project of its own.

## Rough frontend effort (A, notes first)

1. Crypto helper + key store (setup, unlock, lock, recovery key, wrap/unwrap): new `CryptoService` + `Encryption` store, unit-tested.
2. Settings UI: enable, passphrase, show recovery key, unlock prompt after login.
3. Notes store: encrypt on write, decrypt on load; client-side import/export.
4. Migration flow (encrypt existing notes) with progress.
5. CSP hardening.

Backend needs (for gwendolyn): store the wrapped DEK, salt and KDF params per user (and per scope later), accept opaque strings in the encrypted fields (no length or format validation on them), a per-module, ownership-checked batch update endpoint carrying `updated_at` for conflict detection (so a migration running in parallel with a second device doesn't lose edits), column migrations to text, DAV exclusion for encrypted calendars and address books, and a per-feature "encrypted" flag in `user_settings` so server jobs (reminders, export, enrichment) skip or degrade.

## Open questions for the human

1. Is "forgot passphrase + lost recovery key = data gone" acceptable?
2. Argon2id (WASM dependency) or PBKDF2 (no dependency)?
3. Is calendar sharing in scope for encrypted calendars? (It decides whether we need user key pairs now.)

## Revision

Updated after gwendolyn's API review (`gwendolyn/encryption-feasibility-2026-11-18.md`): DAV conflict (calendar and contacts are now Hard), a separate passphrase is now required, column migrations, server-side todo parsing and tag lookup, server sorts, blocking server-written content, and a conflict-safe batch endpoint.

Second revision: quick add, import and export no longer count as lost. Their save step moves into the app.

## Final list (after 5 rounds with gwendolyn, API side)

Downside → fix → what's left.

1. **Unlocking** → remember this device by default (non-extractable key in IndexedDB, stored per API URL + user id and wiped on logout), passkey PRF / fingerprint unlock, optional auto-lock via `SessionMonitor`'s visibilitychange → the passphrase once per new device; on mobile sometimes again after the OS kills the webview.
2. **Permanent loss** → recovery code confirmed at setup, several unlock methods, any remembered device can re-wrap the DEK with a new passphrase → lost only if the passphrase, the code and every device are gone.
3. **Calendar/contact sync** → encrypt per calendar or address book; DAV hides encrypted ones (pgsql/DAV change, needs approval) → that calendar exists only in solyto.
4. **Calendar sharing** → v1: share or encrypt, enforced server-side in `CalendarService` (sabre sharing reaches friends over DAV too); v2: per-calendar key wrapped with the friend's P-256 public key, and revoking a share rotates the key.
5. **Reminders** → mail, Telegram and ntfy send counts only; web push carries the stored ciphertext titles (capped to fit the ~4KB limit, then "+X more") and the service worker decrypts them with the IndexedDB key. The SW can't fetch, because the auth token is in localStorage.
6. **Telegram bot** → write-only: the server seals new entries with the user's P-256 public key (ECDH + HKDF + AES-GCM, no new dependency) → it can't read anything, and Telegram sees what you type.
7. **Metadata** → whole-row `payload` blobs for check-in, budget and wealth values (so NULL patterns don't leak which trackers someone uses), tags and folders encrypted once any module is on, tag dedup via blind index (HMAC) → dates stay visible: when, not what. Journal titles stay plaintext dates, can't be renamed, and `journalMarks` queries by title.
8. **Turning it on** → resumable per-row migration (`enc:v1:<kid>:` envelope, batches with an `updated_at` precondition, the server flips to "encrypted" once no plaintext rows are left), a 422 `encryption_required` write guard (the 426 version gate can't do it: it runs before auth and lets header-less clients through), progress and pause, and notes listed without content → a one-time wait.
9. **Old copies** → on switch-on, purge the user's Redis caches, export zips, notification rows and Telescope entries → backups and the binlog keep plaintext until they expire.
10. **Web trust** → CSP (there is none today), recommend the desktop and mobile apps → the web version still trusts the server's JS. XSS can't copy a non-extractable key, but it can use it.
11. **No rescue** → a failed decrypt shows a read-only placeholder and saving is blocked (so TipTap autosave can't overwrite the note with garbage); an artisan diagnostic shows flags and kid counts → a corrupt row stays lost.
12. **Ongoing developer cost** → every future server-side feature (VTODO sync, search, AI on notes, new reminders) has to run client-side or skip encrypted modules.

**No longer downsides:** search, filters, sorting, stats, dashboard, quick add (detection is plain keyword matching that can run in the app), import (file parsing moves to the app), export (with in-app decrypt), recurring todos (the server copies the ciphertext as-is), widgets (once the shell keychain stores the key).

**Do now, with or without encryption:** prune Telescope and hide request bodies on content routes; store ids/counts in notifications instead of titles; send `Cache-Control: no-store` on `/api/v1`; add a CSP; list notes without content.

**Open questions for the human:** does Redis persist to disk (RDB/AOF), and how long are backups kept?

**Human's answers (17:39):** data loss, no DAV sync for encrypted calendars/contacts, no sharing in v1, counts-only reminders and the bot's limits are accepted as user trade-offs. Telescope is off in prod (`debug=false`), so it's not a prod leak path; drop it from "do now".

## User-facing model (17:43)

One switch, "Encrypt my data", instead of per-feature toggles. It covers every supported area; areas supported later migrate automatically on the next unlock. Settings show what is covered. Exceptions: feeds and libraries stay plaintext; calendars and address books are encrypted only when the user picks them (default: none). Phases are build order only:
0. For everyone: CSP, `Cache-Control: no-store`, notifications store ids/counts instead of titles, notes list without content (opt-in on the API).
1. Key setup (passphrase, recovery code, unlock, passkey PRF) + Notes/journal.
2. Check-in, Finances (row blobs), tags and folders.
3. Todos, Clipboard text; quick add and import move into the app.
Later: push titles, single calendars and address books, Telegram write-only, calendar sharing, widgets.
