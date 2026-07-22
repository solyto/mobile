<script lang="ts">
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import NoteTags from '$lib/components/notes/NoteTags.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import IconStar from '@lucide/svelte/icons/star';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import type { Note } from '$lib/types/note';

	const ts = getTranslation();
	const auth = getAuth();
	const notes = getNotes();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const keyManager = getKeyManager();

	let changeTitle = $state<boolean>(false);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>(notes.activeNote!.title);
	let lastSaved = $state<Date | null>(null);
	let keyHandlers = $state<{ [key: string]: string | null }>({
		CtrlS: null,
		Enter: null,
		Escape: null
	});

	async function saveNote() {
		loadingIndicator.start();
		const res = await notes.saveContent();
		if (res) {
			notifications.success(ts.get.notes.save_success);
			lastSaved = new Date();
		}
		loadingIndicator.stop();
	}

	async function changeFavoriteStatus(note: Note) {
		loadingIndicator.start();
		await notes.updateFavoriteStatus(note, !note.is_favorite);
		loadingIndicator.stop();
	}

	async function toggleChangeTitle(): Promise<void> {
		changeTitle = !changeTitle;

		if (changeTitle) {
			titleValue = notes.activeNote!.title;
			await tick();
			titleInput?.focus();

			keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
			keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
		}
	}

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
		await toggleChangeTitle();
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	function onblur(): void {
		changeTitle = false;
		keyManager.unregisterKeyDowns([keyHandlers.Enter, keyHandlers.Escape]);
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		let noteTitle = titleValue.trim();

		if (noteTitle === '') {
			return;
		}

		await notes.changeTitle(noteTitle);
		loadingIndicator.stop();
	}

	function formatSavedTime(date: Date): string {
		return auth.getTimeInUserPreferredFormat(date);
	}

	let deleteModalOpen = $state<boolean>(false);

	async function onDeleteConfirm(): Promise<void> {
		loadingIndicator.start();
		const ok = await notes.deleteActiveNote();
		if (ok) notifications.success(ts.get.notes.delete_success);
		loadingIndicator.stop();
		deleteModalOpen = false;
	}

	onMount(
		() =>
			(keyHandlers.CtrlS = keyManager.registerKeyDown('s', saveNote, {
				withHelperKey: 'Control'
			}))
	);
	onDestroy(() => keyManager.unregisterAll(keyHandlers));
</script>

{#if notes.activeNote !== null}
	<div class="relative flex flex-col gap-1 max-md:pt-18">
		<div class="flex flex-row items-start gap-4">
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				{#if changeTitle}
					<input
						type="text"
						class="text-xl font-bold dark:bg-s-dark-3 dark:text-white"
						{onblur}
						bind:this={titleInput}
						bind:value={titleValue}
					/>
				{:else}
					<button type="button" class="text-3xl font-bold leading-tight text-left" ondblclick={toggleChangeTitle}>
						{notes.activeNote.title}
					</button>
				{/if}
				{#if lastSaved}
					<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4">
						{ts.get.layout.saved} · {formatSavedTime(lastSaved)}
					</span>
				{/if}
			</div>
			<div class="flex shrink-0 items-center gap-3 pt-1 max-md:absolute max-md:top-0 max-md:right-0">
				<button
					class="flex cursor-pointer items-center justify-center rounded-sm p-1.5 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:text-c-action={notes.activeNote.is_favorite}
					class:text-c-neutral-4={!notes.activeNote.is_favorite}
					title={notes.activeNote.is_favorite
						? ts.get.notes.remove_from_favorites
						: ts.get.notes.add_to_favorites}
					onclick={async () => {
						changeFavoriteStatus(notes.activeNote!);
					}}
				>
					<IconStar
						size={16}
						fill={notes.activeNote.is_favorite ? 'currentColor' : 'none'}
					/>
				</button>
				<DeleteButton onClick={() => { deleteModalOpen = true; }} inModal={false} buttonStyle="plain" />
				<TextButton title={ts.get.layout.save} onclick={saveNote} />
			</div>
		</div>
		<NoteTags />
	</div>
{/if}

{#if deleteModalOpen}
	<Modal
		title={ts.get.notes.delete_confirm_label}
		description={ts.get.notes.delete_confirm_message}
		type="confirm-delete"
		onConfirm={onDeleteConfirm}
		onCancel={() => { deleteModalOpen = false; }}
	/>
{/if}
