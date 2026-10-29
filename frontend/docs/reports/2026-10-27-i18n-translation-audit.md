# Translation audit: all locales against `en.ts`

Date: 2026-10-27
Scope: every key in `src/lib/i18n/{de,es,fr,it}.ts` (1,220 leaf keys each, at
`4be9bf6`), checked against `src/lib/i18n/en.ts` and the rules in `docs/I18N.md`.
Method: the five files were compiled with esbuild and flattened to JSON. Scripts
checked key parity, placeholders, strings identical to English, formal address,
glossary terms, French and Spanish punctuation, and label length. Then all keys
were read side by side in all five languages. Wherever the meaning depends on
where a string is shown, the component was read (noted as "verified").
No locale file was changed.

**Overall: structurally sound, needs a voice and glossary pass.** Every key exists
in every locale, and every placeholder (`%s`, `%d`, `%1`/`%2`, `%server`/`%app`,
`{n}`) is present. Italian is the cleanest. French and Spanish still mix formal and
informal address. A dozen strings have the wrong meaning or are ungrammatical
(section 1). Fix those first.

---

## 1. Wrong meaning or broken grammar

| Key | Locale | Problem | What the user reads now |
|---|---|---|---|
| `libraries.music.acquired_at` | es, fr, it | The label sits in front of the *place* the album was bought (`MusicDetail.svelte:77` shows `entry.acquired_where`). They translated it as a date. (verified) | "Fecha de adquisición / Date d'acquisition / Acquistato il: Record Store XY" = "Acquisition date: Record Store XY" |
| `dav.synchronize_password_value` | es, fr | Shown as "Password: …" in `SyncModal.svelte:20`. (verified) | "Contraseña guardada / Mot de passe enregistré" = "Saved password" instead of "your solyto password". Users won't know which password to use. |
| `dav.synchronize_headline` | es, fr | Only a title, not the sentence. | "Sincronización / Synchronisation CalDAV / CardDAV" = "CalDAV / CardDAV sync". The "with all your devices" part is lost. |
| `quick_add.destinations.*` with `commit_success` | it | `QuickAdd.svelte.ts:120` puts the destination into "Aggiunto a %s". "a" + "la tua…" needs the contraction "alla", and likewise "ai" and "alle". (verified) | "Aggiunto a la tua libreria musicale", "Aggiunto a i tuoi link", "Aggiunto a le tue attività" (ungrammatical) |
| `checkInSummary.*` (sleep, dreams, water, food, work, alcohol, smoking, social, sports) | es | `CheckInSummaryHelper.ts` capitalizes the fragments and joins them into sentences. Spanish past participles can't stand alone. (verified) | "Dormido bien y tenido buenos sueños. Generalmente comido mal." Should use "Has dormido bien…" or "Dormiste bien…". |
| `calendar.attach_todo`, `calendar.search_todo`, `calendar.attachment_todo` | es | "todo" means "everything" in Spanish. | "Adjuntar todo / Buscar todo" = "Attach everything / Search everything" |
| `todos.status_backlog` / `todos.status_pending` | es | "Pendientes" / "Pendiente". These are two Kanban columns next to each other. | Two columns that both say "Pending" |
| `settings.check_in_calendar_mark` | fr | "Indicateur de test quotidien" | "Daily test mark in calendar" |
| `calendar.no_friends_to_share` | fr | "Aucun ami à partager" | "No friend to be shared". Should be "Aucun ami avec qui partager". |
| `welcome_tour.localization_subtitle` | de | "Mach es zu deins" is ungrammatical. | Should be "Mach es zu deinem" |
| `calendar.unsubscribe`, `calendar.unsubscribed` | de | "Abmelden" is also the glossary word for Log out. | Leaving a shared calendar reads like logging out ("Kalender abbestellen" / "Abo beenden") |
| `calendar.import_events`, `contacts.import_contacts_running` | all 4 | The components (`calendars/ImportModal.svelte:169`, `contacts/ImportModal.svelte:167`) put "N " (with a trailing space) in place of `%d`, or `''` when the count is 0. That's why English writes `%devents`. All translations write `%d Termine` etc. (verified) | Double space: "Importiere 5  Termine", or "Importiere  Termine" when the count is 0. Fix: `%dTermine`, `%deventos`, … |

Smaller meaning shifts:

- fr `todos.status_waiting` "En pause" means "Paused", not "Waiting".
- de `dev.requests.status_cancelled` "Abgewiesen" means "Rejected". Might be intended, the owner should confirm.
- fr cover labels are swapped: `libraries.music.cover` uses "couverture" (a book word; albums have a "pochette"), and `libraries.games.cover` uses "pochette" (games have a "jaquette").
- es, fr `notes.no_entries` say "Sin entradas / Aucune entrée" = "No entries", not "There seem to be no notes yet".

## 2. Formal address (the guide requires informal)

- **fr: about 40 strings use vous.** Examples: `nav.notifications_empty`,
  `auth.session_expired`, `auth.password_compromised`, `auth.passkey_error`,
  `settings.navigation_order_hint`, `settings.export_rate_limited`,
  `settings.current_password_required`, `settings.password_changed`,
  `settings.no_tags`, `settings.ai_plugin_*`, `todos.no_categories`,
  `todos.no_workspaces`, `todos.workspaces_help`, `notes.delete_confirm_message`,
  all `*_import_validation_error` ("Veuillez…"), `dev.requests.validation_error`,
  `layout.modal_explanation`, `layout.double_click_to_edit`,
  `libraries.recommendations.*`, the "Voulez-vous…" confirms in finances,
  calendar and time tracking, `calendar.sync_still_running`,
  `calendar.entry_*_error`, `notifications.*_message`, `cookie_consent.body`,
  `widgets.search_city_hint`, all 12 `quick_add.destinations.*` ("votre/vos"),
  `quick_add.placeholder`, `quick_add.commit_error`, `setup.api_url_label`,
  `setup.url_error`.
- **es: about 35 strings use usted.** Examples: `layout.modal_explanation`,
  `home.slogan`, `auth.name_placeholder`, `auth.name_error`,
  `auth.email_placeholder`, `auth.email_error`, `auth.password_confirmation_error`,
  `auth.forgot_password`, `auth.logout_success`, `auth.register_success`,
  `auth.verify_*`, `auth.already_verified`, `settings.telegram_bot_register`,
  `settings.telegram_bot_not_connected`, `settings.export_rate_limited`,
  `todos.enter_todo`, `todos.delete_confirm_message`, `widgets.your_day`,
  `widgets.your_day_no_entries`, `widgets.search_city_hint`,
  `widgets.select_city_prompt`, `notes.enter_note_title`,
  `notes.enter_folder_title`, all `*_import_validation_error` ("Por favor
  ingrese"), `libraries.recommendations.welcome_slogan`,
  `libraries.recommendations.loading_text_local`,
  `libraries.recommendations.not_satisfied`, `dev.requests.validation_error`,
  `calendar.sync_still_running`, `calendar.entry_*_error`,
  `calendar.delete_description`, `calendar.recurring_*_question`,
  `notifications.*_release_message`, `notifications.daily_day_reminder`,
  `notifications.export_ready_message`.
- **de and it:** clean. The one "Sie" in de (`calendar.recurrence_not_editable`)
  means "it".

## 3. Glossary violations (`docs/I18N.md`)

- **Passkey (keep):** es "clave(s) de acceso" and fr "clé(s) d'accès" in all
  about 15 passkey strings (`auth.passkey_*`, `settings.passkey*`).
- **Check-in (keep):** fr uses "Suivi (quotidien)" in `widgets.check_in_daily`,
  `widgets.check_in_statistics`, `calendar.life_check_in`,
  `notifications.daily_check_in_*` and `welcome_tour.feature_check_in`. es uses
  "seguimiento" in `widgets.check_in_daily`, `widgets.check_in_statistics`
  and `notifications.daily_check_in_*`.
- **Todo:**
  - de uses "Aufgabe(n)" throughout `welcome_tour.*`,
    `quick_add.content_types.todo`, `quick_add.destinations.todo` and
    `notifications.daily_day_reminder_message`, while `nav.todos` says "Todos".
  - fr has "un todo" in `calendar.attach_todo` and `calendar.search_todo`, and
    "Todo" in `calendar.attachment_todo`.
  - it has "compiti" in `welcome_tour.feature_todos_desc`,
    `welcome_tour.steps.todos.description` and
    `welcome_tour.steps.todos.subtask_tip`.
- **Release:** de `libraries.releases` "Releases" and
  `notifications.movie_release_title` "Neuer Screen-Release" should be
  "Neuerscheinung(en)". `libraries.releases_loading` already says
  "Neuveröffentlichungen", a third variant.
- **Dev Requests:**
  - de `welcome_tour.steps.dev_requests.title` "Entwickleranfragen" (nav
    keeps "Dev Requests").
  - es `welcome_tour.steps.dev_requests.title` "Solicitudes dev" (glossary:
    "solicitudes de desarrollo").
  - fr writes "demandes dev" in `welcome_tour.steps.dev_requests.title` and
    `notifications.dev_request_comment_title` (glossary: "demandes de dev").
- **Account:** de still has "Account" in `auth.verify_success`,
  `auth.verify_general_error` and `settings.telegram_bot_not_connected`.
- **Settings:** es "Configuración" in `nav.settings`, `checkIn.settings`,
  `welcome_tour.steps.settings.title` and four other welcome-tour strings
  (already in the backlog).
- **Tag:** fr uses "étiquette(s)" in `welcome_tour.steps.libraries.description`
  and `welcome_tour.steps.libraries.filter_tip`, everywhere else "tag".
- **"Versteck Das":** de `todos.workspace_hide_it` and `todos.workspaces_help`
  (already in the backlog).

## 4. Punctuation and style (low priority)

- **fr: missing space before `? !` in about 20 strings**, e.g.
  `auth.forgot_password`, `auth.verify_success`, `auth.already_verified`,
  `todos.delete_confirm_message`, `libraries.recommendations.*`,
  `calendar.delete_title`, `calendar.delete_description`,
  `calendar.recurring_*_question`, `notifications.daily_*`,
  `welcome_tour.welcome_title`, `welcome_tour.features_subtitle`,
  `welcome_tour.ready_title`, `welcome_tour.ready_description`,
  `welcome_tour.tour_outro_title`, `timeTracking.deletion_description`.
- **de: missing hyphens in compounds:**
  - "Push Benachrichtigungen", "E-Mail Benachrichtigungen", "E-Mail Adresse",
    "Telegram Bot Benachrichtigungen"
  - "Cover URL", "Bild URL", "Feed Vorschau", "Check-in Statistik"
  - "Deezer Link" and the other `*_import_validation_error` strings,
    "dein solyto Passwort"
  - also "z.B." should be "z. B.", and `notifications.calendar_share_message`
    and `welcome_tour.pwa_ios_instruction` close „ with a straight `"`
    instead of “.
- **de:**
  - "Vorkommnis" (means "incident") in `calendar.recurring_move_question`
  - `notes.output` is still English "Output" (it uses "Anteprima" = "Preview")
- **es:**
  - mixes "Agregar" and "Añadir" about evenly
  - "ocurrencia" in `calendar.recurring_move_question` reads as "witty
    remark"; the neighbouring questions use "evento"
- **fr:** mixes "token" (auth) and "jeton" (settings).
- **Ellipsis:** es and fr mostly use "…", de and it keep "..", as English does.
- **Length:** no label is clearly too long beyond what the glossary forces.
  The longest nav items are the glossary terms themselves: es "Solicitudes de
  desarrollo" and it "Richieste di sviluppo" / "Monitoraggio del tempo". If
  they don't fit the navbar, the owner should decide on a shorter glossary
  term.

## 5. Other things I noticed

- **`en.ts`:** the `%devents` / `%dcontacts` convention (the code puts the
  number *and* its trailing space in place of `%d`) is a trap for
  translators. A one-line note in `docs/I18N.md`, or putting the space in
  the string and not in the code, would stop it recurring.
- **Backlog:** `docs/backlog/i18n-consistent-voice-and-terms.md` covers only
  part of this. It is missing:
  - Passkey and Check-in in fr/es
  - the de Todo/Aufgabe split
  - the section 1 meaning bugs
  - Italian, which is newer than the backlog file (only small items here,
    plus the `quick_add` grammar bug)

## 6. Suggested order

1. Section 1. Small edits, and they affect what users actually understand.
2. fr voice and glossary, then es voice and glossary, one locale per commit.
   Use the `translator` agent with back-translations, as the backlog
   describes.
3. de glossary and hyphenation. The owner can review this one directly.
4. Section 4 leftovers.

## 7. Status after the fix pass (same day)

Done, uncommitted, `npm run check` and `npm test` green:

- **German**: the owner decided Todo(s) everywhere, "Releases", "Entfernen" for
  leaving a shared calendar, "Abgewiesen" stays (only admins set it, so it
  means rejected), "Dev Requests" and "Hide It" everywhere, and "Termin" instead of
  "Vorkommnis". The orthography fixes from section 4 and the section 1 bugs are
  done too. Time tracking keeps "Aufgaben", because the English means work in
  general there.
- **es, fr, it**: everything in section 1, plus the "rejected" meaning for
  `dev.requests.status_cancelled`. French and Spanish now use informal
  address throughout. The glossary is applied (Passkey, Check-in, Todo, tag,
  Dev Requests, "Ajustes"). French punctuation is fixed, "jeton" is used
  consistently, and Spanish uses "Añadir" throughout. The Spanish check-in
  summary now uses second-person past tense ("Dormiste bien y tuviste buenos
  sueños."). This was checked by running `CheckInSummaryHelper` on sample data.
- **Glossary**: Release is "Release(s)" for German. A "Hide It" row was added.

Not changed: English (owner decision), and the ellipsis style ("…" vs "..").

**Found while testing, not a translation issue:** the helper treats a high
`alcohol`/`smoking` value as bad (`INVERTED_TRACKERS`), but the phrases treat
5 as "no alcohol" / "didn't smoke". So the summary pairs them the wrong way
round, e.g. "Smoked heavily, but no alcohol" with smoking counted as the good
part. **Fixed:** the check-in form (red at 1, green at 5) and the score
(`CheckInHelper.getMeanValue`) both treat 5 as the good end, so the helper's
inversion was wrong. It was removed, and a unit test covers the case.
