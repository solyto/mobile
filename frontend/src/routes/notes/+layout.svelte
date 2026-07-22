<script lang="ts">
	import { getNotes, setNotes } from '$lib/state/Notes.svelte';
	import NoteNavigationDesktop from '$lib/components/notes/NoteNavigationDesktop.svelte';
	import NoteNavigationMobile from '$lib/components/notes/NoteNavigationMobile.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTags, setTags } from '$lib/state/Tags.svelte';
	import RightClickMenu from '$lib/components/ui/menus/RightClickMenu.svelte';
	import type { RightClickMenuEntry } from '$lib/types/menu';
	import { getTranslation } from '$lib/state/Translation.svelte';

	setNotes();
	setTags();

	const ts = getTranslation();
	const notes = getNotes();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();

	let { children } = $props();

	let edit = $state<boolean>(false);

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
				notes.deleteCategory();
				edit = false;
			}
		}
	];

	const rightClickMenuNoteEntries: RightClickMenuEntry[] = [
		{
			icon: 'delete',
			label: ts.get.notes.delete_note,
			action: () => {
				notes.delete();
			}
		}
	];

	onMount(async () => {
		loadingIndicator.start();
		await Promise.all([notes.loadCategories(), notes.load(), tags.load()]);
		loadingIndicator.stop();
	});

	async function createNote(): Promise<void> {
		notes.closeModal();
		loadingIndicator.start();
		await notes.create();
		loadingIndicator.stop();
	}

	async function createCategory(): Promise<void> {
		notes.closeModal();
		loadingIndicator.start();
		await notes.createCategory(edit);
		loadingIndicator.stop();
	}
</script>

<div class="flex h-full w-full flex-row">
	<NoteNavigationMobile />
	<NoteNavigationDesktop />
	{@render children?.()}
</div>

{#if notes.modalOpen}
	{#if notes.createType === 'note'}
		<Modal
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
		</Modal>
	{:else}
		<Modal
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
		</Modal>
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
