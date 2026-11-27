# Brief: contacts-vcf-and-phone-import

type: feature
id: steal
branch: feature/steal_contacts-vcf-and-phone-import
date: 2026-11-24
author: Leander Muskalla

## What

Users can import contacts from a `.vcf` file into a new address book (name prefilled from
the filename, optional colour) or into one of their existing address books. The contacts
import modal gets a choice between "CardDAV account" (current flow) and ".vcf file". The
CardDAV flow moves into a new `ContactImport` store and the same modal shell, like the
calendar import (`956fae7`). API contract: room decision `01M8776XF7D9RKG0605X0EP302`
(`POST /address-books/import/file`, progress via `GET /address-books/import/state`, new
stage `failed`, `source`, `contacts_skipped`).

## Why

Users can't bring contacts from other apps or phones into solyto unless they have a
CardDAV account. `.vcf` is what Google, Apple, Android, Thunderbird and Nextcloud export.

## Out of scope

- Importing directly from the phone's contacts (Android): `docs/backlog/contacts-phone-import.md`.
- Opening `.vcf` files from outside the app: `docs/backlog/contacts-open-vcf-with-solyto.md`.
- CSV import, de-duplication, any mobile/native shell work.
- The shared colour picker component (`docs/backlog/shared-color-picker-component.md`);
  the human cleans that up later.

## Notes

- Human's answers: room message `01M8777WX5XQ1GJDAFMMNMWZ82`; scope decision `01M8778C47SFGVYHR7R648NF3A`.
- Source report: api repo `docs/backlog/contacts-vcf-and-phone-import.md`.
- New strings in `en`; the other locales go to the translator the human provides.
