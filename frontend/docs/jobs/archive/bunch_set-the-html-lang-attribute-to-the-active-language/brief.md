# Brief: Set the html lang attribute to the active language

type: feature
id: bunch
branch: feature/bunch_set-the-html-lang-attribute-to-the-active-language
date: 2026-10-29
author: Leander Muskalla

## What

`src/app.html` hardcodes `<html lang="en">`, whatever language the user picked. Set `document.documentElement.lang` to the active locale whenever it changes, in `Translation.changeLanguage` (`src/lib/state/Translation.svelte.ts`), so it covers the stored language, the user setting and the switchers in settings and onboarding.

## Why

Screen readers pick their pronunciation from `lang`, so a German or Italian UI is read out with English rules. Browsers also use it for auto-translate offers (an Italian UI tagged `en` gets offered a translation) and for hyphenation and spell-check.

## Out of scope

Translating the PWA manifest (`static/site.webmanifest`) or per-language page titles.

## Notes

`app.html` keeps `lang="en"` as the default before the app boots. Safety: `check`, plus a manual run: switch the language in settings and confirm `<html lang>` changes in the dev tools, also after a reload.
