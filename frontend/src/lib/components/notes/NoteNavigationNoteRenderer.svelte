<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { contextMenu } from '$lib/helpers/ContextMenuHelper';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import type { Note } from '$lib/types/note';

	const notes = getNotes();

	let { categoryId, depth }: {
		categoryId: number | null;
		depth: number;
	} = $props();

	function isActive(note: Note): boolean {
		return note.id === notes.activeNote?.id;
	}

	function endDrag(): void {
		notes.draggedNote = null;
		notes.dragTarget = null;
	}
</script>

<div transition:fade>
	{#each notes.getNotesForCategory(categoryId) as note (note.id)}
		<a
			href={resolve(urls.note, { id: note.id })}
			use:contextMenu={(x, y) => notes.openRightClickMenu(x, y, 'note', note.id)}
			draggable="true"
			ondragstart={() => (notes.draggedNote = note)}
			ondragend={endDrag}
			animate:flip
			transition:fade
		>
			<div
				class="flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={isActive(note)}
				class:dark:bg-s-dark-3={isActive(note)}
				style="padding-left: {8 + depth * 16}px;"
			>
				<span>{note.title}</span>
			</div>
		</a>
	{/each}
</div>
