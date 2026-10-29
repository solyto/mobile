# Backlog: notebook: cross-references

created: 2026-10-14

## What

Obsidian-style links between notes, with backlinks (user request, see Discord).

- Typing `[[` in the note editor opens an autocomplete popup that searches note titles. Picking a note inserts an inline link to it.
- The link is stored by note **id**, not by title (e.g. `<a data-note-id="…">`). It always shows the target note's current title, so renaming a note does not break links to it.
- Clicking a link opens the target note inside the app (`goto`). The editor's `Link` extension uses `openOnClick: false`, so the link node needs its own click handling.
- A link to a deleted note renders as broken (e.g. struck through or greyed out) instead of disappearing.
- Each note shows a "Linked from" section that lists the notes linking to it.

## Why

Users want to connect related notes and navigate between them, the way they are used to from Obsidian. Linking by title, as Obsidian does, does not work here: titles are not unique, and there is no folder path to tell two notes with the same title apart.

## Out of scope

- Creating a note by clicking a link to a note that does not exist yet.
- Unlinked mentions and a graph view.

## Notes

Open decisions to settle before starting:

- **Where backlinks come from.** The preferred option is a backend index: on save, the API parses the note HTML into a `note_links` table and serves `GET /notes/{id}/backlinks`. That needs an API brief alongside the frontend brief. The alternative is scanning every loaded note's HTML in the client: no API change, but it gets slower as notes grow, may be stale, and depends on whether the notes list includes the content.
- **Dependency.** TipTap's `@tiptap/extension-mention` + `@tiptap/suggestion` (trigger `[[`) cover the popup and node. They would be new packages, so ask before adding them. The alternative is a hand-written input rule plus popup.
- **Export/import.** Markdown export should write links back out as `[[Title]]`. Importing an Obsidian vault would have to resolve `[[Title]]` to note ids, which is ambiguous when titles repeat.
- Journal entries should be able to link to and from regular notes.
- The autocomplete has to work on mobile, with the on-screen keyboard open.
- Where backlinks go: a collapsible section under the editor, or a side panel on desktop.

Content is stored as HTML (`TipTapEditor.svelte` saves `getHTML()`). All new strings in every i18n file.
