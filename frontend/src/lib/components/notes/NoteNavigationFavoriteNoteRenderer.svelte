<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import type { Note } from '$lib/types/note';

	const notes = getNotes();

	let { favorites, handleNavigation } = $props<{
		favorites: Note[];
		handleNavigation: () => void;
	}>();
</script>

<div transition:fade>
	{#each favorites as note (note.id)}
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
				class="flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3 {notes.activeNote !==
					null && note.id === notes.activeNote.id
					? 'bg-c-neutral-1 dark:bg-s-dark-3'
					: ''}"
			>
				<span>{note.title}</span>
			</div>
		</a>
	{/each}
</div>
