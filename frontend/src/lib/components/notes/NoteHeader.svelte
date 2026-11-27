<script lang="ts">
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import NoteTags from '$lib/components/notes/NoteTags.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import IconStar from '$lib/icons/lucide/star.svelte';
	import IconFolderInput from '$lib/icons/lucide/folder-input.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import GhostIconButton from '$lib/components/ui/buttons/GhostIconButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import IconTrash from '$lib/icons/lucide/trash.svelte';
	import IconPencil from '$lib/icons/lucide/pencil.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';

	const ts = getTranslation();
	const auth = getAuth();
	const notes = getNotes();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const keyManager = getKeyManager();
	const saving = new SaveAction(() => ts.get.notes.save_error);

	let { isJournal = false }: {
		isJournal?: boolean;
	} = $props();

	let changeTitle = $state<boolean>(false);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>(notes.activeNote!.title);
	let lastSaved = $state<Date | null>(null);
	let keyHandlers: { [key: string]: string | null } = {
		CtrlS: null,
		Enter: null,
		Escape: null
	};

	let isDraft = $derived(notes.isJournalDraft(notes.activeNote));

	function journalTitle(): string {
		const date = notes.journalService.parseEntryTitle(notes.activeNote!.title);
		if (date === null) return notes.activeNote!.title;

		return `${ts.get.notes.journal}: ${auth.getDateInUserPreferredFormat(date)}`;
	}

	function favoriteLabel(): string {
		return notes.activeNote!.is_favorite ? ts.get.notes.remove_from_favorites : ts.get.notes.add_to_favorites;
	}

	function favoriteColor(): string {
		return notes.activeNote!.is_favorite ? 'text-c-action' : 'text-c-neutral-4';
	}

	async function saveNote() {
		if (isDraft && !notes.journalService.hasContent(notes.activeNote!.content)) return;

		const ok = await saving.run(() => notes.saveContent());
		if (ok) {
			notifications.success(ts.get.notes.save_success);
			lastSaved = new Date();
		}
	}

	async function toggleFavorite(): Promise<void> {
		const note = notes.activeNote!;
		loadingIndicator.start();
		try {
			await notes.updateFavoriteStatus(note, !note.is_favorite);
		} finally {
			loadingIndicator.stop();
		}
	}

	function openMoveNoteModal(): void {
		notes.openMoveNoteModal(notes.activeNote!.id);
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
		keyManager.unregisterKeyDown(keyHandlers.Enter);
		const noteTitle = titleValue.trim();
		if (noteTitle === '') return;

		loadingIndicator.start();
		try {
			await notes.changeTitle(noteTitle);
		} finally {
			loadingIndicator.stop();
		}
	}

	function formatSavedTime(date: Date): string {
		return auth.getTimeInUserPreferredFormat(date);
	}

	function openDeleteModal(): void {
		notes.deleteNoteModalOpen = true;
	}

	function closeDeleteModal(): void {
		notes.deleteNoteModalOpen = false;
	}

	async function onDeleteConfirm(): Promise<void> {
		loadingIndicator.start();
		try {
			const ok = await notes.deleteActiveNote();
			if (ok) notifications.success(ts.get.notes.delete_success);
		} finally {
			loadingIndicator.stop();
		}
		closeDeleteModal();
	}

	onMount(() => {
		keyHandlers.CtrlS = keyManager.registerKeyDown('s', saveNote, {
			withHelperKey: 'Control'
		});
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));
</script>

{#if notes.activeNote !== null}
	<div class="relative flex flex-col gap-1 max-md:pt-18">
		<div class="flex flex-row items-start gap-4">
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				{#if isJournal}
					<h1 class="text-left text-3xl leading-tight">{journalTitle()}</h1>
				{:else if changeTitle}
					<TextInput bind:input={titleInput} bind:value={titleValue} {onblur} class="text-xl font-bold dark:bg-s-dark-3" />
				{:else}
					<div class="flex min-w-0 items-center gap-3">
						<button type="button" class="min-w-0 text-left text-3xl leading-tight" ondblclick={toggleChangeTitle}>
							{notes.activeNote.title}
						</button>
						<GhostIconButton label={ts.get.layout.rename} onclick={toggleChangeTitle} class="shrink-0">
							<IconPencil size={16} />
						</GhostIconButton>
					</div>
				{/if}
				{#if lastSaved}
					<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4">
						{ts.get.layout.saved} · {formatSavedTime(lastSaved)}
					</span>
				{/if}
			</div>
			<div
				class="flex shrink-0 items-center gap-3 pt-1 max-md:absolute max-md:top-0 max-md:right-0"
			>
				<div class="flex items-center gap-1">
					{#if !isJournal}
						<GhostIconButton label={ts.get.notes.move_note} onclick={openMoveNoteModal}>
							<IconFolderInput size={16} />
						</GhostIconButton>
						<GhostIconButton label={favoriteLabel()} onclick={toggleFavorite} color={favoriteColor()}>
							<IconStar size={16} fill={notes.activeNote.is_favorite ? 'currentColor' : 'none'} />
						</GhostIconButton>
					{/if}
					{#if !isDraft}
						<GhostIconButton label={ts.get.notes.delete_note} onclick={openDeleteModal} danger>
							<IconTrash size={16} />
						</GhostIconButton>
					{/if}
				</div>
				<TextButton title={ts.get.layout.save} onclick={saveNote} />
			</div>
		</div>
		{#if !isDraft}
			<NoteTags />
		{/if}
	</div>
{/if}

{#if notes.deleteNoteModalOpen}
	<ConfirmationModal
		title={ts.get.notes.delete_confirm_label}
		description={ts.get.notes.delete_confirm_message}
		type="confirm-delete"
		onConfirm={onDeleteConfirm}
		onCancel={closeDeleteModal}
	/>
{/if}
