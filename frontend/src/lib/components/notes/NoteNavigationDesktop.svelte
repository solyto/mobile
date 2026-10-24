<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getNotes } from '$lib/state/Notes.svelte';
	import NoteNavigationCategoryRenderer from '$lib/components/notes/NoteNavigationCategoryRenderer.svelte';
	import NoteNavigationNoteRenderer from '$lib/components/notes/NoteNavigationNoteRenderer.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import AddNoteButton from '$lib/components/notes/AddNoteButton.svelte';
	import AddFolderButton from '$lib/components/notes/AddFolderButton.svelte';
	import NoteNavigationFavoriteNoteRenderer from '$lib/components/notes/NoteNavigationFavoriteNoteRenderer.svelte';
	import JournalArchivePicker from '$lib/components/notes/journal/JournalArchivePicker.svelte';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getDateMinusDays, getUrlFormat } from '$lib/helpers/DateHelper';
	import { getAuth } from '$lib/state/Auth.svelte';
	import NavHeading from '$lib/components/ui/NavHeading.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	const ts = getTranslation();
	const notes = getNotes();
	const auth = getAuth();

	let favorites = $derived(notes.getFavorites());
	let otherOpen = $state(false);

	const todayKey = getUrlFormat(new Date());
	const yesterdayKey = getUrlFormat(getDateMinusDays(new Date(), 1));

	let activeKey = $derived.by(() => {
		const date = page.params.date;
		return date && notes.journalService.isEntryTitle(date) ? date : null;
	});

	function isOtherActive(): boolean {
		return otherOpen || (activeKey !== null && activeKey !== todayKey && activeKey !== yesterdayKey);
	}

	function openOtherDate(date: Date): void {
		otherOpen = false;
		goto(resolve(urls.journalDate, { date: getUrlFormat(date) }));
	}

	function handleNavigation(): void {}
</script>

<div
	in:fade
	class="hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg p-2 text-sm drop-shadow-xl sm:relative sm:flex sm:min-w-72 max-w-72 sm:p-4 dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
>
	<div class="absolute top-4 right-4 flex gap-1">
		<AddNoteButton onClick={() => notes.openModal('note')} />
		<AddFolderButton onClick={() => notes.openModal('category')} />
	</div>
	{#if auth.user?.settings?.journal_enabled}
		<div class="mb-4 flex flex-col gap-1">
			<NavHeading title={ts.get.notes.journal} class="mb-1" />
			<a
				href={resolve(urls.journalDate, { date: todayKey })}
				onclick={handleNavigation}
				class="flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3 {activeKey === todayKey ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
			>
				<span>{ts.get.notes.today}</span>
			</a>
			<a
				href={resolve(urls.journalDate, { date: yesterdayKey })}
				onclick={handleNavigation}
				class="flex cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 hover:bg-c-neutral dark:hover:bg-s-dark-3 {activeKey === yesterdayKey ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
			>
				<span>{ts.get.notes.yesterday}</span>
			</a>
			<div class="relative">
				<button
					type="button"
					class="flex w-full cursor-pointer items-center space-x-2 rounded-lg px-2 py-1 text-left hover:bg-c-neutral dark:hover:bg-s-dark-3 {isOtherActive() ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
					onclick={() => (otherOpen = !otherOpen)}
				>
					<span>{ts.get.notes.other}</span>
				</button>
				{#if otherOpen}
					<div class="absolute top-full left-0 z-30 mt-1 rounded-lg bg-c-bg shadow-lg">
						<JournalArchivePicker
							selectedDate={notes.journalService.parseEntryTitle(page.params.date ?? '') ?? new Date()}
							markedDates={notes.getJournalEntryDates()}
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
			<NoteNavigationFavoriteNoteRenderer {favorites} {handleNavigation} />
		</div>
	{/if}
	{#each notes.categories as category (category.id)}
		<NoteNavigationCategoryRenderer {category} depth={0} {handleNavigation} />
	{/each}
	{#if notes.getNotesForCategory(null).length > 0}
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
	{#if notes.categories.length === 0 && notes.getVisibleNotes().length === 0}
		<EmptyState title={ts.get.notes.no_folders} description={ts.get.notes.no_folders_desc} py={2} leftAlign={true} />
	{/if}
</div>
