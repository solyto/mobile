<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';

	const notes = getNotes();

	let { categoryId, depth, handleNavigation } = $props<{
		categoryId: number | null;
		depth: number;
		handleNavigation: () => void;
	}>();
</script>

<div transition:fade>
	{#each notes.getNotesForCategory(categoryId) as note (note.id)}
		<a
			href={resolve(urls.note, { id: note.id })}
			onclick={() => {
				notes.selectNote(note.id);
				handleNavigation();
			}}
			oncontextmenu={(event: MouseEvent) => notes.openRightClickMenu(event, 'note', note.id)}
			draggable="true"
			ondragstart={() => (notes.draggedNote = note)}
			ondragend={() => {
				notes.draggedNote = null;
				notes.dragTarget = null;
			}}
			animate:flip
			transition:fade
		>
			<div
				class="flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3
					{notes.activeNote !== null && note.id === notes.activeNote.id ? 'bg-c-neutral-1 dark:bg-s-dark-3': ''}"
				style="padding-left: {8 + depth * 16}px;"
			>
				<span>{note.title}</span>
			</div>
		</a>
	{/each}
</div>
