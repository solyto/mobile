<script lang="ts">
	import { getNotes, setNotes } from '$lib/state/Notes.svelte';
	import NoteNavigationDesktop from '$lib/components/notes/NoteNavigationDesktop.svelte';
	import NoteNavigationMobile from '$lib/components/notes/NoteNavigationMobile.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import NoteSearch from '$lib/components/notes/NoteSearch.svelte';
	import MoveNoteModal from '$lib/components/notes/MoveNoteModal.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
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
		try {
			await Promise.all([notes.loadCategories(), notes.load(), tags.load()]);
		} finally {
			loadingIndicator.stop();
		}
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	afterNavigate(() => notes.syncActiveNoteWithUrl());

	function openSearch(event: KeyboardEvent): void {
		if (notes.modalOpen || notes.deleteNoteModalOpen || pendingDelete !== null) return;

		notes.openSearch();
	}

	async function whileLoading(action: () => Promise<unknown>): Promise<void> {
		loadingIndicator.start();
		try {
			await action();
		} finally {
			loadingIndicator.stop();
		}
	}

	async function createNote(): Promise<void> {
		await whileLoading(() => notes.create());
	}

	async function createCategory(): Promise<void> {
		await whileLoading(() => notes.createCategory(edit));
	}

	async function deletePending(type: 'note' | 'category' | null): Promise<void> {
		if (type === 'note') {
			await notes.delete();
		} else if (type === 'category' && typeof notes.rightClickId === 'number') {
			await notes.deleteCategory(notes.rightClickId);
		}
	}

	async function confirmDelete(): Promise<void> {
		const type = pendingDelete;
		pendingDelete = null;
		await whileLoading(() => deletePending(type));
	}

	function cancelDelete(): void {
		pendingDelete = null;
	}
</script>

{#snippet titleModal(onConfirm: () => Promise<void>, title: string, placeholder: string)}
	<ConfirmationModal {onConfirm} onCancel={() => notes.closeModal()} {title}>
		<TextInput bind:input={notes.input} bind:value={notes.inputValue} {placeholder} onblur={() => {}} />
	</ConfirmationModal>
{/snippet}

{#snippet rightClickMenu(entries: RightClickMenuEntry[])}
	<RightClickMenu
		x={notes.rightClickMenuX}
		y={notes.rightClickMenuY}
		close={() => notes.closeRightClickMenu()}
		{entries}
	/>
{/snippet}

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
		{@render titleModal(createNote, ts.get.notes.new_note, ts.get.notes.enter_note_title)}
	{:else}
		{@render titleModal(createCategory, ts.get.notes.new_folder, ts.get.notes.enter_folder_title)}
	{/if}
{/if}

{#if notes.rightClickMenuOpen}
	{#if notes.rightClickType === 'note'}
		{@render rightClickMenu(rightClickMenuNoteEntries)}
	{:else}
		{@render rightClickMenu(rightClickMenuCategoryEntries)}
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
		onCancel={cancelDelete}
	/>
{/if}
