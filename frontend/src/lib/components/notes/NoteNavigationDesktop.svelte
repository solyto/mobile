<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getNotes } from '$lib/state/Notes.svelte';
	import NoteNavigationCategoryRenderer from '$lib/components/notes/NoteNavigationCategoryRenderer.svelte';
	import NoteNavigationNoteRenderer from '$lib/components/notes/NoteNavigationNoteRenderer.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import AddNoteButton from '$lib/components/notes/AddNoteButton.svelte';
	import AddFolderButton from '$lib/components/notes/AddFolderButton.svelte';
	import SearchNoteButton from '$lib/components/notes/SearchNoteButton.svelte';
	import NoteNavigationFavoriteNoteRenderer from '$lib/components/notes/NoteNavigationFavoriteNoteRenderer.svelte';
	import JournalArchivePicker from '$lib/components/notes/journal/JournalArchivePicker.svelte';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getUrlFormat } from '$lib/helpers/DateHelper';
	import { getAuth } from '$lib/state/Auth.svelte';
	import NavHeading from '$lib/components/ui/NavHeading.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	const ts = getTranslation();
	const notes = getNotes();
	const auth = getAuth();

	const recentKeys = notes.journalService.recentEntryKeys();

	let favorites = $derived(notes.getFavorites());
	let otherOpen = $state(false);
	let activeKey = $derived(notes.journalService.entryKeyFromParam(page.params.date));

	function isOtherActive(): boolean {
		return otherOpen || notes.journalService.isOlderEntryKey(activeKey, recentKeys);
	}

	function toggleOther(): void {
		otherOpen = !otherOpen;
	}

	function openOtherDate(date: Date): void {
		otherOpen = false;
		goto(resolve(urls.journalDate, { date: getUrlFormat(date) }));
	}

	function isDashboardActive(): boolean {
		return page.url.pathname === urls.notes;
	}

	function isUncategorisedDropTarget(): boolean {
		return notes.draggedNote !== null && notes.dragTarget === null;
	}

	function onUncategorisedDragOver(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		notes.dragTarget = null;
	}

	function clearDragTarget(): void {
		notes.dragTarget = null;
	}

	function onUncategorisedDrop(event: DragEvent): void {
		event.preventDefault();
		if (notes.draggedNote) notes.moveToCategory(notes.draggedNote.id, null);
	}
</script>

{#snippet journalLink(key: string, label: string)}
	<a
		href={resolve(urls.journalDate, { date: key })}
		class="flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={activeKey === key}
		class:dark:bg-s-dark-3={activeKey === key}
	>
		<span>{label}</span>
	</a>
{/snippet}

<div
	in:fade
	class="hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg p-2 text-sm drop-shadow-xl sm:relative sm:flex sm:min-w-72 max-w-72 sm:p-4 dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
>
	<div class="absolute top-4 right-4 flex gap-1">
		<SearchNoteButton onClick={() => notes.openSearch()} />
		<AddNoteButton onClick={() => notes.openModal('note')} />
		<AddFolderButton onClick={() => notes.openModal('category')} />
	</div>
	<a
		href={resolve(urls.notes)}
		class="mt-[3px] mb-4 flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={isDashboardActive()}
		class:dark:bg-s-dark-3={isDashboardActive()}
	>
		<span>{ts.get.notes.dashboard}</span>
	</a>
	{#if notes.journalEnabled}
		<div class="mb-4 flex flex-col gap-1">
			<NavHeading title={ts.get.notes.journal} class="mb-1" />
			{@render journalLink(recentKeys.today, ts.get.notes.today)}
			{@render journalLink(recentKeys.yesterday, ts.get.notes.yesterday)}
			<div class="relative">
				<button
					type="button"
					class="flex w-full cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 text-left hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:bg-c-neutral-1={isOtherActive()}
					class:dark:bg-s-dark-3={isOtherActive()}
					onclick={toggleOther}
				>
					<span>{ts.get.notes.other}</span>
				</button>
				{#if otherOpen}
					<div class="absolute top-full left-0 z-30 mt-1 rounded-lg bg-c-bg shadow-lg">
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
	{/if}
	{#if favorites && favorites.length > 0}
		<div class="mb-4 flex flex-col gap-1">
			<NavHeading title={ts.get.notes.favorites} class="mb-1" />
			<NoteNavigationFavoriteNoteRenderer {favorites} />
		</div>
	{/if}
	{#each notes.categories as category (category.id)}
		<NoteNavigationCategoryRenderer {category} depth={0} />
	{/each}
	{#if notes.getNotesForCategory(null).length > 0}
		<div
			class="min-h-8 rounded-lg transition-all"
			ondragover={onUncategorisedDragOver}
			ondragenter={clearDragTarget}
			ondragleave={clearDragTarget}
			ondrop={onUncategorisedDrop}
			class:bg-d-lightblue={isUncategorisedDropTarget()}
			class:animate-pulse={isUncategorisedDropTarget()}
			role="region"
			aria-label={ts.get.notes.no_folder}
		>
			<NoteNavigationNoteRenderer categoryId={null} depth={0} />
		</div>
	{/if}
	{#if notes.categories.length === 0 && notes.getVisibleNotes().length === 0}
		<EmptyState title={ts.get.notes.no_folders} description={ts.get.notes.no_folders_desc} py={2} align="left" />
	{/if}
</div>
