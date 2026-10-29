# Backlog: Align existing translations with the translation guide

created: 2026-10-27

## What

Bring `src/lib/i18n/{de,fr,es}.ts` in line with `docs/I18N.md`, mainly the
voice and the glossary. Known cases:

- `fr.ts` mixes `tu` (~88 hits) and `vous` (~46), e.g. `notifications_empty`
  "Vous êtes à jour", `session_expired`, `navigation_order_hint`. Switch to `tu`.
- `es.ts` mixes `tú` (~84) and `usted` (~40), e.g. `name_placeholder`
  "Ingrese su nombre", `forgot_password`. Switch to `tú`.
- `es.ts` uses both "Configuración" and "ajustes" for settings; use "ajustes".
- `es.ts` uses both "tag(s)" and "etiqueta(s)"; use "etiqueta(s)".
- `de.ts` uses both "Account" and "Konto"; use "Konto". `workspace_hide_it`
  reads "Versteck Das".
- Edit titles: `en.ts` uses both "Update …" (`edit_album`, `edit_book`,
  `edit_movie`, `edit_game`, `edit_quote`, `edit_recipe`, `edit_plant`,
  `calendar.edit_entry`) and "Edit …" (`timeTracking.edit_entry`, the new
  `dev.requests.edit`), so `it.ts` mixes "Aggiorna" and "Modifica" too.
  `notes.edit_folder` is "Change Folder Name" in `en`/`es`/`fr`/`it` but
  "Ordner bearbeiten" in `de`. Needs the owner to pick the English wording
  first (outside this entry's scope), then align every locale and add an
  "Edit" row to the glossary.

Hand the work to the `translator` agent, one locale per commit.

## Why

Each agent translated on the fly, so tone and terms drifted. A mixed formal
and informal voice reads as machine-made, and new locales (Italian) should not
copy the inconsistency.

## Out of scope

Changing English strings or keys.

## Notes

Safety: `check`. The owner can review `de`; for `fr` and `es`, the translator's
back-translation report is the review.
