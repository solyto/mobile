<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getNotes } from '$lib/state/Notes.svelte';
	import NoteNavigationCategoryRenderer from '$lib/components/notes/NoteNavigationCategoryRenderer.svelte';
	import NoteNavigationNoteRenderer from '$lib/components/notes/NoteNavigationNoteRenderer.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import AddNoteButton from '$lib/components/notes/AddNoteButton.svelte';
	import AddFolderButton from '$lib/components/notes/AddFolderButton.svelte';
	import NoteNavigationFavoriteNoteRenderer from '$lib/components/notes/NoteNavigationFavoriteNoteRenderer.svelte';

	const ts = getTranslation();
	const notes = getNotes();

	let favorites = $derived(notes.getFavorites());

	function handleNavigation(): void {}
</script>

<div
	in:fade
	class="hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg p-2 text-sm drop-shadow-xl sm:relative sm:flex sm:min-w-72 max-w-72 sm:p-4 dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
>
	<div class="absolute top-2 right-2 flex gap-1">
		<AddNoteButton onClick={() => notes.openModal('note')} />
		<AddFolderButton onClick={() => notes.openModal('category')} />
	</div>
	<div class="mb-4 text-2xl font-bold 2xl:font-normal">{ts.get.notes.notebook}</div>
	{#if favorites && favorites.length > 0}
		<div class="mb-4 flex flex-col gap-1">
			<div class="mb-1 text-xl">{ts.get.notes.favorites}</div>
			<NoteNavigationFavoriteNoteRenderer {favorites} {handleNavigation} />
		</div>
	{/if}
	{#each notes.categories as category (category.id)}
		<NoteNavigationCategoryRenderer {category} depth={0} {handleNavigation} />
	{/each}
	{#if notes.notes.length > 0}
		<div
			class="min-h-8 rounded-lg transition-all"
			ondragover={(e: DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				notes.dragTarget = null;
			}}
			ondragenter={() => (notes.dragTarget = null)}
			ondragleave={() => (notes.dragTarget = null)}
			ondrop={(e: DragEvent) => {
				e.preventDefault();
				notes.dragToCategory();
			}}
			class:bg-d-lightblue={notes.draggedNote !== null && notes.dragTarget === null}
			class:animate-pulse={notes.draggedNote !== null && notes.dragTarget === null}
			role="region"
			aria-label="No Category"
		>
			<NoteNavigationNoteRenderer categoryId={null} depth={0} {handleNavigation} />
		</div>
	{/if}
	{#if notes.categories.length === 0 && notes.notes.length === 0}
		<span class="text-md font-bold">{ts.get.notes.no_entries}</span>
	{/if}
</div>
