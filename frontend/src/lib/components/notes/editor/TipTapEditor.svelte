<script lang="ts">
	import { Editor } from '@tiptap/core'
	import StarterKit from '@tiptap/starter-kit'
	import Placeholder from '@tiptap/extension-placeholder'
	import Typography from '@tiptap/extension-typography'
	import Link from '@tiptap/extension-link'
	import Image from '@tiptap/extension-image'
	import { Table } from '@tiptap/extension-table'
	import { TableRow } from '@tiptap/extension-table-row'
	import { TableCell } from '@tiptap/extension-table-cell'
	import { TableHeader } from '@tiptap/extension-table-header'
	import BubbleMenu from '@tiptap/extension-bubble-menu'
	import { marked } from 'marked'
	import { onDestroy, onMount } from 'svelte'
	import { getNotes } from '$lib/state/Notes.svelte'
	import EditorToolbar from './EditorToolbar.svelte'
	import TableBubbleMenu from './TableBubbleMenu.svelte'
	import type { ActiveStates } from './EditorToolbar.svelte'

	const notes = getNotes()

	let editorDiv = $state<HTMLDivElement | null>(null)
	let tableBubbleRoot = $state<HTMLDivElement | null>(null)
	let editor = $state<Editor | null>(null)
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
	})

	function syncActiveStates() {
		if (!editor) return
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
		}
	}

	function handlePaste(event: ClipboardEvent) {
		const items = event.clipboardData?.items
		if (!items || !editor) return
		const instance = editor
		for (const item of items) {
			if (item.type.startsWith('image/')) {
				event.preventDefault()
				const file = item.getAsFile()
				if (!file) return
				const reader = new FileReader()
				reader.onload = (e) => {
					const base64 = e.target?.result as string
					if (base64) instance.chain().focus().setImage({ src: base64 }).run()
				}
				reader.readAsDataURL(file)
				return
			}
		}
	}

	onMount(async () => {
		if (!editorDiv || !tableBubbleRoot) return

		const raw = notes.activeNote?.content ?? ''
		const content = raw.trimStart().startsWith('<') ? raw : await marked(raw)

		const instance = new Editor({
			element: editorDiv,
			extensions: [
				StarterKit,
				Typography,
				Placeholder.configure({ placeholder: '...' }),
				Link.configure({ openOnClick: false }),
				Image,
				Table.configure({ resizable: true }),
				TableRow,
				TableHeader,
				TableCell,
				BubbleMenu.configure({
					element: tableBubbleRoot,
					shouldShow: ({ editor: e }) => e.isActive('table')
				})
			],
			content,
			onUpdate({ editor: e }) {
				syncActiveStates()
				if (notes.activeNote) {
					notes.activeNote.content = e.getHTML()
				}
			},
			onSelectionUpdate() {
				syncActiveStates()
			},
			editorProps: {
				attributes: { class: 'tiptap-editor' }
			}
		})

		editor = instance
	})

	onDestroy(() => {
		editor?.destroy()
		editor = null
	})
</script>

<TableBubbleMenu {editor} bind:root={tableBubbleRoot} />

<div class="flex flex-1 flex-col overflow-y-auto">
	{#if editor}
		<EditorToolbar {editor} {activeStates} />
	{/if}
	<div bind:this={editorDiv} onpaste={handlePaste} class="tiptap-wrapper max-md:pr-8"></div>
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

	@media (prefers-color-scheme: dark) {
		:global(.tiptap-editor code) {
			background-color: var(--color-s-dark-3, #2f3741);
			color: #e5e7eb;
		}

		:global(.tiptap-editor hr) {
			border-top-color: var(--color-s-dark, #121212);
		}

		:global(.tiptap-editor a) {
			color: #b1b1b1;
		}

		:global(.tiptap-editor h1),
		:global(.tiptap-editor h2),
		:global(.tiptap-editor h3) {
			color: var(--color-s-teal, #1dbda5);
		}

		:global(.tiptap-editor blockquote) {
			background-color: var(--color-s-dark-3, #2f3741);
			color: var(--color-c-neutral-4, #9ca3af);
		}

		:global(.tiptap-editor th) {
			background-color: var(--color-s-dark-3, #2f3741);
		}

		:global(.tiptap-editor th),
		:global(.tiptap-editor td) {
			border-color: var(--color-s-dark, #121212);
		}
	}
</style>
