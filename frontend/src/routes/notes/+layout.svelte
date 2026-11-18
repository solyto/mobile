<script lang="ts">
	import { getNotes, setNotes } from '$lib/state/Notes.svelte';
	import NoteNavigationDesktop from '$lib/components/notes/NoteNavigationDesktop.svelte';
	import NoteNavigationMobile from '$lib/components/notes/NoteNavigationMobile.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import NoteSearch from '$lib/components/notes/NoteSearch.svelte';
	import MoveNoteModal from '$lib/components/notes/MoveNoteModal.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTags, setTags } from '$lib/state/Tags.svelte';
	import RightClickMenu from '$lib/components/ui/menus/RightClickMenu.svelte';
	import type { RightClickMenuEntry } from '$lib/types/menu';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';

	setNotes();
	setTags();

	const ts = getTranslation();
	const notes = getNotes();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();

	let { children } = $props();

	let edit = $state<boolean>(false);
	// Set from the right-click menu; the store keeps the right-clicked id.
	let pendingDelete = $state<'note' | 'category' | null>(null);

	const rightClickMenuCategoryEntries: RightClickMenuEntry[] = [
		{
			icon: 'new-file',
			label: ts.get.notes.new_note,
			action: () => {
				notes.openModal('note');
				edit = false;
			}
		},
		{
			icon: 'new-folder',
			label: ts.get.notes.new_folder,
			action: () => {
				notes.openModal('category');
				edit = false;
			}
		},
		{
			icon: 'edit',
			label: ts.get.notes.edit_folder,
			action: () => {
				notes.openModal('category', true);
				edit = true;
			}
		},
		{
			icon: 'delete',
			label: ts.get.notes.delete_folder,
			action: () => {
				pendingDelete = 'category';
				edit = false;
			}
		}
	];

	const rightClickMenuNoteEntries: RightClickMenuEntry[] = [
		{
			icon: 'move',
			label: ts.get.notes.move_note,
			action: () => notes.openMoveNoteModal(notes.rightClickId as string)
		},
		{
			icon: 'delete',
			label: ts.get.notes.delete_note,
			action: () => {
				pendingDelete = 'note';
			}
		}
	];

	let keyHandlers: { [key: string]: string | null } = { k: null };

	onMount(async () => {
		// Ctrl+K, not Ctrl+F: Ctrl+F stays with the browser's find in page, to search inside the open note.
		keyHandlers.k = keyManager.registerKeyDown('k', openSearch, { withHelperKey: 'Control' });
		loadingIndicator.start();
		await Promise.all([notes.loadCategories(), notes.load(), tags.load()]);
		loadingIndicator.stop();
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function openSearch(event: KeyboardEvent): void {
		if (notes.modalOpen || notes.deleteNoteModalOpen || pendingDelete !== null) return;

		notes.openSearch();
	}

	// The store closes the modal on success only; on failure it stays open
	// (with the user's input) and reports the error via a notification.
	async function createNote(): Promise<void> {
		loadingIndicator.start();
		await notes.create();
		loadingIndicator.stop();
	}

	async function confirmDelete(): Promise<void> {
		const type = pendingDelete;
		pendingDelete = null;
		loadingIndicator.start();
		if (type === 'note') await notes.delete();
		else if (type === 'category') await notes.deleteCategory();
		loadingIndicator.stop();
	}

	async function createCategory(): Promise<void> {
		loadingIndicator.start();
		await notes.createCategory(edit);
		loadingIndicator.stop();
	}
</script>

<div class="relative flex h-full w-full flex-row">
	{#if notes.searchVisible}
		<NoteSearch />
	{/if}
	<NoteNavigationMobile />
	<NoteNavigationDesktop />
	{@render children?.()}
</div>

{#if notes.modalOpen}
	{#if notes.createType === 'note'}
		<ConfirmationModal
			onConfirm={createNote}
			onCancel={() => notes.closeModal()}
			title={ts.get.notes.new_note}
		>
			<TextInput
				bind:input={notes.input}
				bind:value={notes.inputValue}
				placeholder={ts.get.notes.enter_note_title}
				onblur={() => {}}
			/>
		</ConfirmationModal>
	{:else}
		<ConfirmationModal
			onConfirm={createCategory}
			onCancel={() => notes.closeModal()}
			title={ts.get.notes.new_folder}
		>
			<TextInput
				bind:input={notes.input}
				bind:value={notes.inputValue}
				placeholder={ts.get.notes.enter_folder_title}
				onblur={() => {}}
			/>
		</ConfirmationModal>
	{/if}
{/if}

{#if notes.rightClickMenuOpen}
	{#if notes.rightClickType === 'note'}
		<RightClickMenu
			x={notes.rightClickMenuX}
			y={notes.rightClickMenuY}
			close={() => notes.closeRightClickMenu()}
			entries={rightClickMenuNoteEntries}
		/>
	{:else}
		<RightClickMenu
			x={notes.rightClickMenuX}
			y={notes.rightClickMenuY}
			close={() => notes.closeRightClickMenu()}
			entries={rightClickMenuCategoryEntries}
		/>
	{/if}
{/if}

{#if notes.noteToMove}
	<MoveNoteModal note={notes.noteToMove} />
{/if}

{#if pendingDelete}
	<ConfirmationModal
		title={pendingDelete === 'note' ? ts.get.notes.delete_confirm_label : ts.get.notes.delete_folder}
		description={pendingDelete === 'note' ? ts.get.notes.delete_confirm_message : ts.get.notes.folder_deletion_description}
		type="confirm-delete"
		onConfirm={confirmDelete}
		onCancel={() => (pendingDelete = null)}
	/>
{/if}
