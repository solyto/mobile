<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import InsertImageModal from './InsertImageModal.svelte'
	import InsertLinkModal from './InsertLinkModal.svelte'
	import ToolbarDivider from '$lib/components/notes/editor/ToolbarDivider.svelte'
	import { getTranslation } from '$lib/state/Translation.svelte'
	import { fly } from 'svelte/transition';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import Bold from '@lucide/svelte/icons/bold'
	import Italic from '@lucide/svelte/icons/italic'
	import Strikethrough from '@lucide/svelte/icons/strikethrough'
	import Code from '@lucide/svelte/icons/code'
	import CodeXml from '@lucide/svelte/icons/code-xml'
	import Heading1 from '@lucide/svelte/icons/heading-1'
	import Heading2 from '@lucide/svelte/icons/heading-2'
	import Heading3 from '@lucide/svelte/icons/heading-3'
	import List from '@lucide/svelte/icons/list'
	import ListOrdered from '@lucide/svelte/icons/list-ordered'
	import Quote from '@lucide/svelte/icons/quote'
	import Minus from '@lucide/svelte/icons/minus'
	import Link2 from '@lucide/svelte/icons/link-2'
	import TableIcon from '@lucide/svelte/icons/table'
	import ImageIcon from '@lucide/svelte/icons/image'
	import Undo from '@lucide/svelte/icons/undo'
	import Redo from '@lucide/svelte/icons/redo'
	import PenLine from '@lucide/svelte/icons/pen-line'

	export type ActiveStates = {
		bold: boolean
		italic: boolean
		strike: boolean
		code: boolean
		codeBlock: boolean
		h1: boolean
		h2: boolean
		h3: boolean
		bulletList: boolean
		orderedList: boolean
		blockquote: boolean
		link: boolean
	}

	let { editor, activeStates }: { editor: Editor; activeStates: ActiveStates } = $props()

	const ts = getTranslation()

	let imageModalOpen = $state(false)
	let linkModalOpen = $state(false)
	let linkInitialName = $state('')
	let open = $state(false)

	function openLinkModal() {
		const { from, to } = editor.state.selection
		linkInitialName = from !== to ? editor.state.doc.textBetween(from, to) : ''
		linkModalOpen = true
	}

	function confirmInsertLink(url: string, name: string) {
		editor
			.chain()
			.focus()
			.insertContent({
				type: 'text',
				text: name || url,
				marks: [{ type: 'link', attrs: { href: url } }]
			})
			.run()
		linkModalOpen = false
	}

	function insertTable() {
		editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
	}

	function confirmInsertImage(src: string) {
		editor.chain().focus().setImage({ src }).run()
		imageModalOpen = false
	}
</script>

{#snippet toolbarContent()}
	<button onclick={() => editor.chain().focus().undo().run()} class="toolbar-btn cursor-pointer" title="Undo">
		<Undo size={15} />
	</button>
	<button onclick={() => editor.chain().focus().redo().run()} class="toolbar-btn cursor-pointer" title="Redo">
		<Redo size={15} />
	</button>

	<ToolbarDivider />

	<button
		onclick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.h1}
		title="Heading 1"
	>
		<Heading1 size={15} />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.h2}
		title="Heading 2"
	>
		<Heading2 size={15} />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.h3}
		title="Heading 3"
	>
		<Heading3 size={15} />
	</button>

	<ToolbarDivider />

	<button
		onclick={() => editor.chain().focus().toggleBold().run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.bold}
		title="Bold"
	>
		<Bold size={15} />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleItalic().run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.italic}
		title="Italic"
	>
		<Italic size={15} />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleStrike().run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.strike}
		title="Strikethrough"
	>
		<Strikethrough size={15} />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleCode().run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.code}
		title="Inline code"
	>
		<Code size={15} />
	</button>

	<ToolbarDivider />

	<button
		onclick={() => editor.chain().focus().toggleBulletList().run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.bulletList}
		title="Bullet list"
	>
		<List size={15} />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleOrderedList().run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.orderedList}
		title="Ordered list"
	>
		<ListOrdered size={15} />
	</button>

	<ToolbarDivider />

	<button
		onclick={() => editor.chain().focus().toggleBlockquote().run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.blockquote}
		title="Blockquote"
	>
		<Quote size={15} />
	</button>
	<button
		onclick={() => editor.chain().focus().toggleCodeBlock().run()}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.codeBlock}
		title="Code block"
	>
		<CodeXml size={15} />
	</button>
	<button
		onclick={() => editor.chain().focus().setHorizontalRule().run()}
		class="toolbar-btn cursor-pointer"
		title="Horizontal rule"
	>
		<Minus size={15} />
	</button>

	<ToolbarDivider />

	<button
		onclick={openLinkModal}
		class="toolbar-btn cursor-pointer"
		class:toolbar-btn-active={activeStates.link}
		title="Insert link"
	>
		<Link2 size={15} />
	</button>
	<button onclick={insertTable} class="toolbar-btn cursor-pointer" title="Insert table">
		<TableIcon size={15} />
	</button>
	<button onclick={() => (imageModalOpen = true)} class="toolbar-btn cursor-pointer" title="Insert image">
		<ImageIcon size={15} />
	</button>
{/snippet}

<!-- Desktop: sticky horizontal toolbar -->
<div class="sticky top-0 z-10 mb-1 hidden flex-wrap items-center gap-0.5 rounded-lg border border-c-neutral-2 bg-white px-3 py-1.5 shadow-sm md:flex dark:border-s-dark dark:bg-s-dark-2">
	{@render toolbarContent()}
</div>

<!-- Mobile: floating toggle button -->
<button
	class="fixed bottom-20 right-3 z-30 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-c-neutral-2 bg-white shadow-lg transition-colors hover:bg-c-neutral md:hidden dark:border-s-dark dark:bg-s-dark-2 dark:hover:bg-s-dark-3"
	class:text-s-teal={open}
	class:text-c-neutral-6={!open}
	onclick={() => (open = true)}
	title="Formatting"
>
	<PenLine size={18} />
</button>

<!-- Mobile: backdrop -->
{#if open}
	<div
		class="fixed right-3 top-20 z-30 flex flex-col items-center gap-0.5 rounded-lg border border-c-neutral-2 bg-white px-1.5 py-2 shadow-xl md:hidden dark:border-s-dark dark:bg-s-dark-2"
		transition:fly={{ y: 20 }}
		use:clickOutside={() => (open = false)}
	>
		{@render toolbarContent()}
	</div>
{/if}

{#if imageModalOpen}
	<InsertImageModal onConfirm={confirmInsertImage} onCancel={() => (imageModalOpen = false)} />
{/if}

{#if linkModalOpen}
	<InsertLinkModal
		onConfirm={confirmInsertLink}
		onCancel={() => (linkModalOpen = false)}
		initialName={linkInitialName}
	/>
{/if}

<style>
	:global(.toolbar-btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.25rem;
		color: var(--color-c-neutral-5, #6b7280);
		transition: background-color 0.1s, color 0.1s;
	}

	:global(.toolbar-btn:hover) {
		background-color: var(--color-c-neutral-1, #f3f4f6);
		color: var(--color-c-text);
	}

	:global(.toolbar-btn-active) {
		background-color: rgba(29, 189, 165, 0.15);
		color: var(--color-s-teal, #1dbda5);
	}

	@media (prefers-color-scheme: dark) {
		:global(.toolbar-btn:hover) {
			background-color: var(--color-s-dark-3, #2f3741);
		}
	}
</style>
