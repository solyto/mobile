<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import TableRowInsertBefore from '@lucide/svelte/icons/between-vertical-start'
	import TableRowInsertAfter from '@lucide/svelte/icons/between-vertical-end'
	import TableColInsertBefore from '@lucide/svelte/icons/between-horizontal-start'
	import TableColInsertAfter from '@lucide/svelte/icons/between-horizontal-end'
	import TableIcon from '@lucide/svelte/icons/table'
	import Trash from '@lucide/svelte/icons/trash-2'

	let {
		editor,
		root = $bindable<HTMLDivElement | null>(null)
	}: { editor: Editor | null; root: HTMLDivElement | null } = $props()
</script>

<div bind:this={root} style="position:fixed;top:-9999px;left:-9999px">
	<div
		class="flex items-center gap-0.5 rounded-lg border border-c-neutral-2 bg-white px-1.5 py-1 shadow-md dark:border-s-dark dark:bg-s-dark-2"
	>
		<button
			onclick={() => editor?.chain().focus().addRowBefore().run()}
			class="toolbar-btn"
			title="Add row above"
		>
			<TableRowInsertBefore size={14} />
		</button>
		<button
			onclick={() => editor?.chain().focus().addRowAfter().run()}
			class="toolbar-btn"
			title="Add row below"
		>
			<TableRowInsertAfter size={14} />
		</button>
		<button
			onclick={() => editor?.chain().focus().deleteRow().run()}
			class="toolbar-btn text-s-delete hover:bg-red-50 dark:hover:bg-red-950/30"
			title="Delete row"
		>
			<Trash size={14} />
		</button>

		<div class="toolbar-divider"></div>

		<button
			onclick={() => editor?.chain().focus().addColumnBefore().run()}
			class="toolbar-btn"
			title="Add column left"
		>
			<TableColInsertBefore size={14} />
		</button>
		<button
			onclick={() => editor?.chain().focus().addColumnAfter().run()}
			class="toolbar-btn"
			title="Add column right"
		>
			<TableColInsertAfter size={14} />
		</button>
		<button
			onclick={() => editor?.chain().focus().deleteColumn().run()}
			class="toolbar-btn text-s-delete hover:bg-red-50 dark:hover:bg-red-950/30"
			title="Delete column"
		>
			<Trash size={14} />
		</button>

		<div class="toolbar-divider"></div>

		<button
			onclick={() => editor?.chain().focus().deleteTable().run()}
			class="toolbar-btn text-s-delete hover:bg-red-50 dark:hover:bg-red-950/30"
			title="Delete table"
		>
			<TableIcon size={14} />
		</button>
	</div>
</div>
