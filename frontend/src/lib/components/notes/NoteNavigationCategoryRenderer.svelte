<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { NoteCategory } from '$lib/types/note';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { contextMenu } from '$lib/helpers/ContextMenuHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import NoteNavigationCategoryRenderer from '$lib/components/notes/NoteNavigationCategoryRenderer.svelte';
	import NoteNavigationNoteRenderer from '$lib/components/notes/NoteNavigationNoteRenderer.svelte';
	import IconChevronRight from '$lib/icons/lucide/chevron-right.svelte';

	const notes = getNotes();
	const ts = getTranslation();

	let { category, depth }: {
		category: NoteCategory;
		depth: number;
	} = $props();

	function isDropTarget(): boolean {
		return notes.draggedNote !== null && notes.dragTarget === category;
	}

	function onDragOver(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		notes.dragTarget = category;
	}

	function onDragEnter(): void {
		notes.dragTarget = category;
	}

	function onDragLeave(): void {
		notes.dragTarget = null;
	}

	function onDrop(event: DragEvent): void {
		event.preventDefault();
		if (notes.draggedNote) notes.moveToCategory(notes.draggedNote.id, category.id);
	}

	function toggleCollapse(): void {
		notes.toggleCollapseCategory(category.id);
	}
</script>

<div
	ondragover={onDragOver}
	ondragenter={onDragEnter}
	ondragleave={onDragLeave}
	ondrop={onDrop}
	transition:fade
	role="region"
	aria-label={ts.get.notes.folder_label.replace('%s', category.title)}
>
	<div
		role="button"
		tabindex="0"
		onclick={toggleCollapse}
		use:contextMenu={(x, y) => notes.openRightClickMenu(x, y, 'category', category.id)}
	>
		<div
			class="flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
			style="padding-left: {depth * 16}px;"
			class:bg-d-lighterblue={isDropTarget()}
			class:animate-pulse={isDropTarget()}
		>
			<IconChevronRight
				size={18}
				class="text-surface-300 transition-all {notes.isCategoryCollapsed(category.id) ? 'rotate-90' : ''}"
			/>
			<span class="text-base">{category.title}</span>
		</div>
	</div>
	{#if notes.isCategoryCollapsed(category.id)}
		<div class="relative" transition:slide={{ duration: 100 }}>
			<div
				class="absolute top-0 z-20 h-full w-[1px] bg-c-neutral-2 dark:bg-s-dark-3"
				style="left: {8 + depth * 16}px;"
			></div>
			{#if category.children.length > 0}
				{#each category.children as child (child.id)}
					<NoteNavigationCategoryRenderer category={child} depth={depth + 1} />
				{/each}
			{/if}
			<NoteNavigationNoteRenderer categoryId={category.id} depth={depth + 1} />
		</div>
	{/if}
</div>
