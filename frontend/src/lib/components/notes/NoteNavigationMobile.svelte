<script lang="ts">
	import { fly, type FlyParams } from 'svelte/transition';
	import { getNotes } from '$lib/state/Notes.svelte';
	import type { Note, NoteCategory } from '$lib/types/note';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getUrlFormat } from '$lib/helpers/DateHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import IconChevronRight from '$lib/icons/lucide/chevron-right.svelte';
	import IconArrowLeft from '$lib/icons/lucide/arrow-left.svelte';
	import AddNoteButton from '$lib/components/notes/AddNoteButton.svelte';
	import AddFolderButton from '$lib/components/notes/AddFolderButton.svelte';
	import SearchNoteButton from '$lib/components/notes/SearchNoteButton.svelte';
	import JournalArchivePicker from '$lib/components/notes/journal/JournalArchivePicker.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import HamburgerButton from '$lib/components/ui/buttons/HamburgerButton.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { contextMenu } from '$lib/helpers/ContextMenuHelper';

	const notes = getNotes();
	const ts = getTranslation();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();
	const recentKeys = notes.journalService.recentEntryKeys();

	let open = $state<boolean>(false);
	let stack = $state<(NoteCategory | 'journal' | 'favorites')[]>([]);
	let direction = $state<'forward' | 'back'>('forward');
	let otherOpen = $state<boolean>(false);
	let deleteModalOpen = $state<boolean>(false);
	let favorites = $derived(notes.getFavorites());
	let activeKey = $derived(notes.journalService.entryKeyFromParam(page.params.date));
	let current = $derived(stack.length > 0 ? stack[stack.length - 1] : null);

	function isOtherActive(): boolean {
		return otherOpen || notes.journalService.isOlderEntryKey(activeKey, recentKeys);
	}

	function toggleOther(): void {
		otherOpen = !otherOpen;
	}

	function isDashboardActive(): boolean {
		return page.url.pathname === urls.notes;
	}

	function isActive(note: Note): boolean {
		return notes.activeNote?.id === note.id;
	}

	function openOtherDate(date: Date): void {
		otherOpen = false;
		close();
		goto(resolve(urls.journalDate, { date: getUrlFormat(date) }));
	}

	function close(): void {
		open = false;
	}

	afterNavigate(close);

	function openSearch(): void {
		close();
		notes.openSearch();
	}

	function selectCategory(category: NoteCategory): void {
		direction = 'forward';
		stack = [...stack, category];
	}

	function selectSection(section: 'journal' | 'favorites'): void {
		direction = 'forward';
		stack = [...stack, section];
	}

	function goBack(): void {
		direction = 'back';
		stack = stack.slice(0, -1);
	}

	function flyDistance(movingForward: boolean): number {
		return movingForward ? window.innerWidth : -window.innerWidth;
	}

	function flyIn(): FlyParams {
		return { x: flyDistance(direction === 'forward'), duration: 250, opacity: 1 };
	}

	function flyOut(): FlyParams {
		return { x: flyDistance(direction !== 'forward'), duration: 250, opacity: 1 };
	}

	function askDeleteFolder(): void {
		deleteModalOpen = true;
	}

	function cancelDeleteFolder(): void {
		deleteModalOpen = false;
	}

	async function deleteCurrentFolder(): Promise<void> {
		if (current === null || typeof current === 'string') return;
		deleteModalOpen = false;
		loadingIndicator.start();
		const ok = await notes.deleteCategory(current.id).finally(() => loadingIndicator.stop());
		// The stack holds pre-reload folder objects, so a parent level would
		// still list the deleted folder. Return to the (live) root instead.
		if (ok) {
			direction = 'back';
			stack = [];
		}
	}
</script>

{#snippet folderRow(category: NoteCategory)}
	<button
		class="flex w-full cursor-pointer items-center justify-between border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
		onclick={() => selectCategory(category)}
		use:contextMenu={(x, y) => notes.openRightClickMenu(x, y, 'category', category.id)}
	>
		<span class="text-base">{category.title}</span>
		<IconChevronRight size={18} class="shrink-0 text-c-neutral-4" />
	</button>
{/snippet}

{#snippet noteRow(note: Note)}
	<a
		href={resolve(urls.note, { id: note.id })}
		use:contextMenu={(x, y) => notes.openRightClickMenu(x, y, 'note', note.id)}
		class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={isActive(note)}
		class:dark:bg-s-dark-3={isActive(note)}
	>
		<span class="text-base">{note.title}</span>
	</a>
{/snippet}

{#snippet sectionRow(section: 'journal' | 'favorites', label: string)}
	<button
		class="flex w-full cursor-pointer items-center justify-between border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
		onclick={() => selectSection(section)}
	>
		<span class="text-base">{label}</span>
		<IconChevronRight size={18} class="shrink-0 text-c-neutral-4" />
	</button>
{/snippet}

{#snippet journalRow(key: string, label: string)}
	<a
		href={resolve(urls.journalDate, { date: key })}
		class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={activeKey === key}
		class:dark:bg-s-dark-3={activeKey === key}
	>
		<span class="text-base">{label}</span>
	</a>
{/snippet}

{#snippet levelTitle(title: string)}
	<div class="flex items-center gap-3">
		<button
			class="cursor-pointer text-c-neutral-5 hover:text-c-neutral-7 dark:text-c-neutral-4 dark:hover:text-c-neutral-2"
			onclick={goBack}
		>
			<IconArrowLeft size={22} />
		</button>
		<span class="text-xl font-semibold">{title}</span>
	</div>
{/snippet}

<HamburgerButton onclick={() => (open = true)} />

{#if open}
	<div
		class="secondary-nav-mobile-container-sm fixed inset-x-0 top-0 bottom-16 z-50 flex flex-col bg-c-bg sm:hidden dark:bg-s-dark-1"
		transition:fly={{ x: -400, duration: 200 }}
	>
		<div class="relative flex-1 overflow-hidden">
			{#key current ?? 'root'}
				<div
					class="absolute inset-0 flex flex-col"
					in:fly={flyIn()}
					out:fly={flyOut()}
				>
					{#if current === null}
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							<span class="text-2xl font-bold">{ts.get.notes.notebook}</span>
							<div class="flex gap-1">
								<SearchNoteButton onClick={openSearch} />
								<AddNoteButton onClick={() => notes.openCreateNoteModal(null)} />
								<AddFolderButton onClick={() => notes.openModal('category')} />
								<CloseButton onClick={close} inModal={false} />
							</div>
						</div>
						<div class="flex-1 overflow-y-auto">
							<a
								href={resolve(urls.notes)}
								class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
								class:bg-c-neutral-1={isDashboardActive()}
								class:dark:bg-s-dark-3={isDashboardActive()}
							>
								<span class="text-base">{ts.get.notes.dashboard}</span>
							</a>
							{#if notes.journalEnabled}
								{@render sectionRow('journal', ts.get.notes.journal)}
							{/if}
							{#if favorites.length > 0}
								{@render sectionRow('favorites', ts.get.notes.favorites)}
							{/if}
							{#each notes.categories as category (category.id)}
								{@render folderRow(category)}
							{/each}
							{#each notes.getNotesForCategory(null) as note (note.id)}
								{@render noteRow(note)}
							{/each}
							{#if notes.categories.length === 0 && notes.getVisibleNotes().length === 0}
								<div class="px-4 py-8 text-center text-c-neutral-4">{ts.get.notes.no_entries}</div>
							{/if}
						</div>
					{:else if current === 'journal'}
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							{@render levelTitle(ts.get.notes.journal)}
							<CloseButton onClick={close} inModal={false} />
						</div>
						<div class="flex-1 overflow-y-auto">
							{@render journalRow(recentKeys.today, ts.get.notes.today)}
							{@render journalRow(recentKeys.yesterday, ts.get.notes.yesterday)}
							<div class="relative">
								<button
									type="button"
									class="flex w-full cursor-pointer items-center border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
									class:bg-c-neutral-1={isOtherActive()}
									class:dark:bg-s-dark-3={isOtherActive()}
									onclick={toggleOther}
								>
									<span class="text-base">{ts.get.notes.other}</span>
								</button>
								{#if otherOpen}
									<div class="absolute top-full left-0 z-30 rounded-lg bg-c-bg shadow-lg">
										<JournalArchivePicker
											selectedDate={notes.journalService.dateFromParam(page.params.date)}
											markedDates={notes.getJournalEntryDates()}
											weekStart={auth.getWeekStart()}
											onSelect={openOtherDate}
										/>
									</div>
								{/if}
							</div>
						</div>
					{:else if current === 'favorites'}
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							{@render levelTitle(ts.get.notes.favorites)}
							<CloseButton onClick={close} inModal={false} />
						</div>
						<div class="flex-1 overflow-y-auto">
							{#each favorites as note (note.id)}
								{@render noteRow(note)}
							{/each}
						</div>
					{:else}
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							{@render levelTitle(current.title)}
							<div class="flex gap-1">
								<DeleteButton onClick={askDeleteFolder} inModal={false} title={ts.get.notes.delete_folder} />
								<AddNoteButton onClick={() => notes.openCreateNoteModal(current.id)} />
								<CloseButton onClick={close} inModal={false} />
							</div>
						</div>
						<div class="flex-1 overflow-y-auto">
							{#each current.children as child (child.id)}
								{@render folderRow(child)}
							{/each}
							{#each notes.getNotesForCategory(current.id) as note (note.id)}
								{@render noteRow(note)}
							{/each}
							{#if current.children.length === 0 && notes.getNotesForCategory(current.id).length === 0}
								<div class="px-4 py-8 text-center text-c-neutral-4">{ts.get.notes.no_entries}</div>
							{/if}
						</div>
					{/if}
				</div>
			{/key}
		</div>
	</div>
{/if}

{#if deleteModalOpen}
	<ConfirmationModal
		title={ts.get.notes.delete_folder}
		description={ts.get.notes.folder_deletion_description}
		type="confirm-delete"
		onConfirm={deleteCurrentFolder}
		onCancel={cancelDeleteFolder}
	/>
{/if}
