# Design: note links and backlinks (carmine)

Status: final. Implement as written.

## 1. "Linked from" list: under the editor

- **Placement:** in `src/routes/notes/[id]/+page.svelte`, as the next element after the `{#key}` editor block, inside the existing `gap-4` column.
- **Why not the header:** the header already holds the title, save time, tags and four actions. Backlinks are secondary and belong at the end of the note.
- **When it shows:** only when there is at least one backlink. No empty state and no loading skeleton.
- **Markup:**

```svelte
<section class="flex flex-col gap-1 border-t border-c-neutral-2 pt-3 dark:border-s-dark">
	<h2 class="text-xs text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.linked_from}</h2>
	<ul class="flex flex-wrap gap-x-4 gap-y-1">
		{#each backlinks as link (link.id)}
			<li>
				<a
					href="/notes/{link.id}"
					class="text-sm text-c-neutral-6 hover:text-c-text hover:underline dark:text-c-neutral-3"
				>
					{link.title}
				</a>
			</li>
		{/each}
	</ul>
</section>
```

- **Styling:** the label reuses the "Saved · time" metadata style. Titles are plain text links: no icons, no cards, no counts.
- **Long lists:** if a render shows too many links taking up height, add `max-h-24 overflow-y-auto` to the `<ul>`. Keep the list outside the editor's scroll container.

## 2. Link popup (bubble menu)

- **Base:** copy `TableBubbleMenu.svelte` exactly: the same root and container classes, `.toolbar-btn`, and `.toolbar-divider`.
- **When it shows:** `shouldShow` is `isActive('link') && !isActive('table')`, so it never stacks on top of the table menu.
- **Layout:** `[target] | Open  Edit  Remove`
  - **Target label:** `max-w-48 truncate px-1.5 text-xs text-c-neutral-5 dark:text-c-neutral-4`.
    - Internal link: the target's title from `notes.notes`.
    - External link: the hostname.
    - Note no longer exists: the same label in `italic` (no new string).
  - **Open:** `arrow-up-right` icon for internal links (client-side navigation), `external-link` for external ones (the app's existing external-link behaviour).
  - **Edit:** `pencil` icon. Opens the existing `InsertLinkModal`, pre-filled.
  - **Remove:** `unlink` icon, `unsetLink`. Use the neutral colour, not the delete red, because removing a link is reversible.
- **Touch:** when `viewPoint.isMobile`, buttons are `h-9 w-9` with 18px icons. On desktop keep the 28px `.toolbar-btn` with 14px icons, matching the table menu.
- **Accessibility:** every icon button gets `title` + `aria-label` from the labels below.

## 3. Note picker (one list component, two ways to open it)

- **Result rows:** reuse the `NoteSearch.svelte` row exactly.
  - Title `truncate` on the left.
  - Category in `text-sm text-c-neutral-5 dark:text-c-neutral-4` on the right; nothing when the note has no category.
  - Active row: `bg-c-neutral-1` / `dark:bg-s-dark-3`.
  - Keyboard: ArrowUp/ArrowDown move the highlight, Enter picks, Escape closes.
- **No results:** reuse `notes.no_search_results`.
- **Excluded notes:** notes in hidden categories and the current note.

### Toolbar entry

- A new button directly after the existing link button in `EditorToolbar.svelte`, using the `file-symlink` icon, with `link_to_note` as its title.
- It opens a `ConfirmationModal` (`width="w-112"`) titled `link_to_note`.
- The modal holds a single `TextInput` (placeholder: the existing `notes.search_placeholder`), autofocused, with results below in `max-h-72 overflow-y-auto`. No field labels.
- Link text is the selected text if there is a selection, otherwise the note title.

### `[[` entry

- The same list in a floating box at the caret: `w-72`, with the bubble-menu container classes plus `p-1`.
- At most 8 results. No input field: the typed `[[query` is the query.
- Escape closes it and leaves the text as typed.

## 4. Telling internal links apart in the editor

Add this next to the existing `.tiptap-editor a` rule in `TipTapEditor.svelte`:

```css
:global(.tiptap-editor a[href^="/notes/"]) {
	text-decoration-style: dotted;
	text-underline-offset: 3px;
}
```

Internal links keep the same colour but get a dotted underline.

## Final English labels (`notes.` namespace)

| key | en |
|---|---|
| `linked_from` | Linked from |
| `link_to_note` | Link to note |
| `link_open` | Open |
| `link_edit` | Edit link |
| `link_remove` | Remove link |

`link_to_note` is both the toolbar button title and the modal title. Everything else reuses existing strings: `search_placeholder`, `no_search_results` and `note_not_found`.
