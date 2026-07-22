<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { NoteCategory } from '$lib/types/note';
	import { getNotes } from '$lib/state/Notes.svelte';
	import NoteNavigationCategoryRenderer from '$lib/components/notes/NoteNavigationCategoryRenderer.svelte';
	import NoteNavigationNoteRenderer from '$lib/components/notes/NoteNavigationNoteRenderer.svelte';
	import IconChevronRight from '@lucide/svelte/icons/chevron-right';

	const notes = getNotes();

	let { category, depth, handleNavigation } = $props<{
		category: NoteCategory;
		depth: number;
		handleNavigation: () => void;
	}>();
</script>

<div
	ondragover={(e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		notes.dragTarget = category;
	}}
	ondragenter={() => (notes.dragTarget = category)}
	ondragleave={() => (notes.dragTarget = null)}
	ondrop={(e: DragEvent) => {
		e.preventDefault();
		notes.dragToCategory();
	}}
	transition:fade
	role="region"
	aria-label="Category {category.title}"
>
	<div
		role="button"
		tabindex="0"
		onclick={() => {notes.toggleCollapseCategory(category.id);}}
		oncontextmenu={(event: MouseEvent) => notes.openRightClickMenu(event, 'category', category.id)}
	>
		<div
			class="flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
			style="padding-left: {depth * 16}px;"
			class:bg-d-lighterblue={notes.draggedNote !== null && notes.dragTarget === category}
			class:animate-pulse={notes.draggedNote !== null && notes.dragTarget === category}
		>
			<IconChevronRight
				size={18}
				class="text-surface-300 transition-all {notes.isCategoryCollapsed(category.id)
					? 'rotate-90'
					: ''}"
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
					<NoteNavigationCategoryRenderer
						category={child}
						depth={depth + 1}
						{handleNavigation}
					/>
				{/each}
			{/if}
			<NoteNavigationNoteRenderer
				categoryId={category.id}
				depth={depth + 1}
				{handleNavigation}
			/>
		</div>
	{/if}
</div>
