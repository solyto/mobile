<script lang="ts">
	import { Editor, getMarkRange } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import Typography from '@tiptap/extension-typography';
	import Link from '@tiptap/extension-link';
	import Image from '@tiptap/extension-image';
	import { Table } from '@tiptap/extension-table';
	import { TableRow } from '@tiptap/extension-table-row';
	import { TableCell } from '@tiptap/extension-table-cell';
	import { TableHeader } from '@tiptap/extension-table-header';
	import BubbleMenu from '@tiptap/extension-bubble-menu';
	import { marked } from 'marked';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { getNotes, NotesSvelte } from '$lib/state/Notes.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import EditorToolbar from './EditorToolbar.svelte';
	import TableBubbleMenu from './TableBubbleMenu.svelte';
	import LinkBubbleMenu, { type ActiveLink } from './LinkBubbleMenu.svelte';
	import NoteLinkSuggestionList from './NoteLinkSuggestionList.svelte';
	import { createNoteLinkSuggestion, type NoteLinkSuggestionProps } from './NoteLinkSuggestion';
	import { NotePicker } from '$lib/helpers/NotePicker.svelte';
	import type { ActiveStates } from './EditorToolbar.svelte';
	import type { Note } from '$lib/types/note';
	import { safeHref } from '$lib/helpers/UrlHelper';
	import { looksLikeMarkdown, pastedMarkdownToHtml } from '$lib/helpers/MarkdownHelper';

	const notes = getNotes();
	const viewPoint = getViewPoint();
	const linkPicker = new NotePicker((term) => notes.searchLinkableNotes(term, NotesSvelte.LINK_SUGGESTION_LIMIT));
	const SUGGESTION_KEYS = ['ArrowUp', 'ArrowDown', 'Enter'];

	let { autofocus = false, footer }: { autofocus?: boolean; footer?: Snippet } = $props();

	let editorDiv = $state<HTMLDivElement | null>(null);
	let tableBubbleRoot = $state<HTMLDivElement | null>(null);
	let linkBubbleRoot = $state<HTMLDivElement | null>(null);
	let activeLink = $state<ActiveLink | null>(null);
	let editor = $state<Editor | null>(null);
	let linkSuggestion = $state.raw<NoteLinkSuggestionProps | null>(null);
	let activeStates = $state<ActiveStates>({
		bold: false,
		italic: false,
		strike: false,
		code: false,
		codeBlock: false,
		h1: false,
		h2: false,
		h3: false,
		bulletList: false,
		orderedList: false,
		blockquote: false,
		link: false
	});

	function keyboardPadding() {
		return viewPoint.isMobile && viewPoint.keyboardHeight ? `${viewPoint.keyboardHeight}px` : '';
	}

	function syncActiveStates() {
		if (!editor) return;
		activeStates = {
			bold: editor.isActive('bold'),
			italic: editor.isActive('italic'),
			strike: editor.isActive('strike'),
			code: editor.isActive('code'),
			codeBlock: editor.isActive('codeBlock'),
			h1: editor.isActive('heading', { level: 1 }),
			h2: editor.isActive('heading', { level: 2 }),
			h3: editor.isActive('heading', { level: 3 }),
			bulletList: editor.isActive('bulletList'),
			orderedList: editor.isActive('orderedList'),
			blockquote: editor.isActive('blockquote'),
			link: editor.isActive('link')
		};
		activeLink = readActiveLink(editor);
	}

	function readActiveLink(e: Editor): ActiveLink | null {
		if (!e.isActive('link')) return null;

		const range = getMarkRange(e.state.selection.$from, e.schema.marks.link);
		const text = range ? e.state.doc.textBetween(range.from, range.to) : '';
		return { href: e.getAttributes('link').href ?? '', text };
	}

	function linkedNoteId(): string | null {
		return activeLink ? notes.linkService.noteIdFromHref(activeLink.href) : null;
	}

	function linkedNoteTitle(): string | null {
		const id = linkedNoteId();
		return id !== null ? (notes.findNote(id)?.title ?? null) : null;
	}

	function openLinkedNote(noteId: string): void {
		notes.openNote(noteId);
	}

	// Same as the link popup's Open: notes in the app, everything else in a new tab.
	function openLink(href: string): void {
		const noteId = notes.linkService.noteIdFromHref(href);
		if (noteId !== null) {
			openLinkedNote(noteId);
			return;
		}

		const url = safeHref(href);
		if (!url) return;
		const anchor = Object.assign(document.createElement('a'), { href: url, target: '_blank', rel: 'external' });
		anchor.click();
	}

	// A click only places the cursor, which shows the link popup; Ctrl/Cmd+click opens the link.
	function onLinkClick(root: HTMLElement, event: MouseEvent): boolean {
		const link = (event.target as HTMLElement | null)?.closest('a');
		if (!link || !root.contains(link) || event.button !== 0) return false;

		event.preventDefault();
		if (event.ctrlKey || event.metaKey) openLink(link.getAttribute('href') ?? '');
		return false;
	}

	function linkMenuIconSize(): number {
		return viewPoint.isMobile ? 18 : 14;
	}

	function linkMenuButtonClass(): string {
		return viewPoint.isMobile ? '!h-9 !w-9' : '';
	}

	function openLinkSuggestion(props: NoteLinkSuggestionProps): void {
		linkSuggestion = props;
		linkPicker.search(props.query);
	}

	function closeLinkSuggestion(): void {
		linkSuggestion = null;
	}

	function isLinkSuggestionVisible(): boolean {
		return linkSuggestion !== null && (linkPicker.term !== '' || linkPicker.results.length > 0);
	}

	// The list's KeyManager handlers do the work; returning true only stops the editor from also moving the caret or splitting the line.
	function handleLinkSuggestionKey(event: KeyboardEvent): boolean {
		return isLinkSuggestionVisible() && linkPicker.results.length > 0 && SUGGESTION_KEYS.includes(event.key);
	}

	function pickLinkSuggestion(note: Note): void {
		linkSuggestion?.command(note);
	}

	let pastingPlainText = false;

	function rememberPlainTextPaste(event: KeyboardEvent): boolean {
		pastingPlainText = event.shiftKey && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v';
		return false;
	}

	// Typing "# " formats through input rules; a paste does not, so pasted plain-text Markdown is converted here.
	function pasteMarkdown(instance: Editor, event: ClipboardEvent): boolean {
		const plainText = pastingPlainText;
		pastingPlainText = false;

		const text = event.clipboardData?.getData('text/plain') ?? '';
		const hasHtml = (event.clipboardData?.getData('text/html') ?? '') !== '';
		if (plainText || hasHtml || !looksLikeMarkdown(text) || instance.isActive('codeBlock')) return false;

		instance.chain().focus().insertContent(pastedMarkdownToHtml(text)).run();
		return true;
	}

	function handlePaste(event: ClipboardEvent) {
		const items = event.clipboardData?.items;
		if (!items || !editor) return;
		const instance = editor;
		for (const item of items) {
			if (item.type.startsWith('image/')) {
				event.preventDefault();
				const file = item.getAsFile();
				if (!file) return;
				const reader = new FileReader();
				reader.onload = (e) => {
					const base64 = e.target?.result as string;
					if (base64) instance.chain().focus().setImage({ src: base64 }).run();
				};
				reader.readAsDataURL(file);
				return;
			}
		}
	}

	onMount(async () => {
		if (!editorDiv || !tableBubbleRoot || !linkBubbleRoot) return;

		const raw = notes.activeNote?.content ?? '';
		const content = raw.trimStart().startsWith('<') ? raw : await marked(raw);

		const instance: Editor = new Editor({
			element: editorDiv,
			extensions: [
				StarterKit.configure({ link: false }),
				Typography,
				Placeholder.configure({ placeholder: '...' }),
				Link.extend({
					// Links to other notes open in the app, never in a new tab.
					renderHTML(props) {
						const [tag, attributes, hole] = this.parent!(props) as [string, Record<string, unknown>, 0];
						if (notes.linkService.noteIdFromHref(String(attributes.href ?? '')) === null) return [tag, attributes, hole];
						const { target, ...withoutTarget } = attributes;
						return [tag, withoutTarget, hole];
					}
				}).configure({ openOnClick: false }),
				Image,
				Table.configure({ resizable: true }),
				TableRow,
				TableHeader,
				TableCell,
				BubbleMenu.configure({
					element: tableBubbleRoot,
					shouldShow: ({ editor: e }) => e.isActive('table')
				}),
				BubbleMenu.extend({ name: 'linkBubbleMenu' }).configure({
					pluginKey: 'linkBubbleMenu',
					element: linkBubbleRoot,
					shouldShow: ({ editor: e }) => e.isActive('link') && !e.isActive('table')
				}),
				createNoteLinkSuggestion({
					hrefForNote: (note) => notes.linkService.hrefForNote(note),
					onOpen: openLinkSuggestion,
					onClose: closeLinkSuggestion,
					onKeyDown: handleLinkSuggestionKey
				})
			],
			content,
			onUpdate({ editor: e }) {
				syncActiveStates();
				if (notes.activeNote) {
					notes.activeNote.content = e.getHTML();
				}
			},
			onSelectionUpdate() {
				syncActiveStates();
			},
			editorProps: {
				attributes: { class: 'tiptap-editor' },
				handleKeyDown: (_view, event) => rememberPlainTextPaste(event),
				handlePaste: (_view, event): boolean => pasteMarkdown(instance, event),
				handleDOMEvents: {
					click: (view, event) => onLinkClick(view.dom, event)
				}
			}
		});

		editor = instance;

		if (autofocus) instance.commands.focus();
	});

	onDestroy(() => {
		editor?.destroy();
		editor = null;
	});
</script>

<TableBubbleMenu {editor} bind:root={tableBubbleRoot} />
<LinkBubbleMenu
	{editor}
	link={activeLink}
	noteId={linkedNoteId()}
	noteTitle={linkedNoteTitle()}
	iconSize={linkMenuIconSize()}
	buttonClass={linkMenuButtonClass()}
	bind:root={linkBubbleRoot}
	onopennote={openLinkedNote}
/>

{#if linkSuggestion && isLinkSuggestionVisible()}
	<NoteLinkSuggestionList picker={linkPicker} mount={linkSuggestion.mount} onpick={pickLinkSuggestion} />
{/if}

<div class="flex flex-1 flex-col overflow-y-auto" style:padding-bottom={keyboardPadding()}>
	{#if editor}
		<EditorToolbar {editor} {activeStates} />
	{/if}
	<div bind:this={editorDiv} onpaste={handlePaste} class="tiptap-wrapper max-md:pr-8"></div>
	{@render footer?.()}
</div>

<style>
	:global(.tiptap-wrapper) {
		padding: 0.2rem;
		background-color: var(--color-c-bg);
	}


	:global(.tiptap-editor) {
		background-color: var(--color-c-bg);
		color: var(--color-c-text);
		font-family: var(--t-font-body);
		font-size: 1.0625rem;
		line-height: 1.8;
		outline: none;
		min-height: 400px;
	}

	:global(.tiptap-editor p.is-editor-empty:first-child::before) {
		color: var(--color-c-neutral-4, #9ca3af);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	:global(.tiptap-editor h1) {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.2;
		margin: 1.5rem 0 0.75rem;
		color: var(--color-c-heading);
	}

	:global(.tiptap-editor h2) {
		font-size: 1.625rem;
		font-weight: 600;
		line-height: 1.3;
		margin: 1.25rem 0 0.5rem;
		color: var(--color-c-heading);
	}

	:global(.tiptap-editor h3) {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.4;
		margin: 1rem 0 0.375rem;
		color: var(--color-c-heading);
	}

	:global(.tiptap-editor p) {
		margin: 0 0 0.875rem;
		line-height: 1.8;
	}

	:global(.tiptap-editor li p) {
		margin-bottom: 0;
	}

	:global(.tiptap-editor strong) {
		font-weight: 700;
	}

	:global(.tiptap-editor em) {
		font-style: italic;
	}

	:global(.tiptap-editor s) {
		text-decoration: line-through;
	}

	:global(.tiptap-editor ul),
	:global(.tiptap-editor ol) {
		padding-left: 2rem;
		margin: 0.5rem 0 0.875rem;
	}

	:global(.tiptap-editor ul) {
		list-style-type: disc;
	}

	:global(.tiptap-editor ol) {
		list-style-type: decimal;
	}

	:global(.tiptap-editor li) {
		margin: 0.2rem 0;
		line-height: 1.6;
	}

	:global(.tiptap-editor blockquote) {
		border-left: 3px solid var(--color-s-teal, #1dbda5);
		background-color: var(--color-c-neutral-1, #f3f4f6);
		border-radius: 0 0.25rem 0.25rem 0;
		margin: 1rem 0;
		padding: 0.75rem 1rem;
		color: var(--color-c-neutral-6, #4b5563);
	}

	:global(.tiptap-editor code) {
		background-color: var(--color-c-neutral-1, #f3f4f6);
		border-radius: 0.25rem;
		font-family: monospace;
		font-size: 0.875em;
		padding: 0.1em 0.3em;
	}

	:global(.tiptap-editor pre) {
		background-color: var(--color-s-dark-3, #2f3741);
		border-radius: 0.5rem;
		color: #e5e7eb;
		font-family: monospace;
		margin: 0.75rem 0;
		overflow-x: auto;
		padding: 0.75rem 1rem;
	}

	:global(.tiptap-editor pre code) {
		background: none;
		color: inherit;
		font-size: 0.875rem;
		padding: 0;
	}

	:global(.tiptap-editor hr) {
		border: none;
		border-top: 1px solid var(--color-c-neutral-2, #e5e7eb);
		margin: 1rem 0;
	}

	:global(.tiptap-editor a) {
		color: var(--color-s-teal, #1dbda5);
		text-decoration: underline;
	}

	:global(.tiptap-editor img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.375rem;
		margin: 0.5rem 0;
	}

	:global(.tiptap-editor img.ProseMirror-selectednode) {
		outline: 2px solid var(--color-s-teal, #1dbda5);
	}

	:global(.tiptap-editor table) {
		border-collapse: collapse;
		margin: 0.75rem 0;
		width: 100%;
	}

	:global(.tiptap-editor th),
	:global(.tiptap-editor td) {
		border: 1px solid var(--color-c-neutral-2, #e5e7eb);
		padding: 0.4rem 0.75rem;
		text-align: left;
		position: relative;
		min-width: 2rem;
	}

	:global(.tiptap-editor th) {
		background-color: var(--color-c-neutral-1, #f3f4f6);
		font-weight: 600;
	}

	:global(.tiptap-editor th p),
	:global(.tiptap-editor td p) {
		margin: 0;
		line-height: 1.5;
	}

	:global(.tiptap-editor .selectedCell::after) {
		background: rgba(29, 189, 165, 0.15);
		content: '';
		inset: 0;
		pointer-events: none;
		position: absolute;
	}

	:global(.tiptap-editor .selectedCell) {
		position: relative;
	}

	:global(.tiptap-editor .column-resize-handle) {
		background-color: var(--color-s-teal, #1dbda5);
		bottom: -2px;
		pointer-events: none;
		position: absolute;
		right: -2px;
		top: 0;
		width: 3px;
	}

	:global(.tiptap-editor .resize-cursor) {
		cursor: col-resize;
	}

	:global(html:is(.dark, .theme-dark) .tiptap-editor code) {
		background-color: var(--color-s-dark-3, #2f3741);
		color: #e5e7eb;
	}

	:global(html:is(.dark, .theme-dark) .tiptap-editor hr) {
		border-top-color: var(--color-s-dark-3, #2f3741);
	}

	:global(.tiptap-editor a[href^="/notes/"]) {
		text-decoration-style: dotted;
		text-underline-offset: 3px;
	}

	:global(html:is(.dark, .theme-dark) .tiptap-editor a) {
		color: #b1b1b1;
	}

	:global(html:is(.dark, .theme-dark) .tiptap-editor h1),
	:global(html:is(.dark, .theme-dark) .tiptap-editor h2),
	:global(html:is(.dark, .theme-dark) .tiptap-editor h3) {
		color: var(--color-s-teal, #1dbda5);
	}

	:global(html:is(.dark, .theme-dark) .tiptap-editor blockquote) {
		background-color: var(--color-s-dark-3, #2f3741);
		color: var(--color-c-neutral-4, #9ca3af);
	}

	:global(html:is(.dark, .theme-dark) .tiptap-editor th) {
		background-color: var(--color-s-dark-3, #2f3741);
	}

	:global(html:is(.dark, .theme-dark) .tiptap-editor th),
	:global(html:is(.dark, .theme-dark) .tiptap-editor td) {
		border-color: var(--color-s-dark, #121212);
	}
</style>
