<script lang="ts">
	import type { Note, NoteCategory } from '$lib/types/note';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import IconFolder from '$lib/icons/lucide/folder.svelte';

	const notes = getNotes();
	const ts = getTranslation();
	const saving = new SaveAction(() => ts.get.notes.move_error);

	let { note }: { note: Note } = $props();

	let selectedCategoryId = $state<number | null>(note.category_id);

	async function move(): Promise<void> {
		if (selectedCategoryId === note.category_id) {
			notes.closeMoveNoteModal();
			return;
		}

		const ok = await saving.run(() => notes.moveToCategory(note.id, selectedCategoryId));
		if (ok) notes.closeMoveNoteModal();
	}
</script>

{#snippet folderOption(categoryId: number | null, title: string, depth: number)}
	<button
		type="button"
		class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={selectedCategoryId === categoryId}
		class:dark:bg-s-dark-3={selectedCategoryId === categoryId}
		style="padding-left: {8 + depth * 16}px;"
		onclick={() => (selectedCategoryId = categoryId)}
	>
		<IconFolder size={16} class="shrink-0 text-c-neutral-4" />
		<span>{title}</span>
	</button>
{/snippet}

{#snippet folderTree(categories: NoteCategory[], depth: number)}
	{#each categories as category (category.id)}
		{@render folderOption(category.id, category.title, depth)}
		{@render folderTree(category.children, depth + 1)}
	{/each}
{/snippet}

<ConfirmationModal title={ts.get.notes.move_note} onConfirm={move} onCancel={() => notes.closeMoveNoteModal()}>
	<div class="flex max-h-80 flex-col overflow-y-auto">
		{@render folderOption(null, ts.get.notes.no_folder, 0)}
		{@render folderTree(notes.categories, 0)}
	</div>
</ConfirmationModal>
