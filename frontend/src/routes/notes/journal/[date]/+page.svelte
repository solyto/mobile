<script lang="ts">
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import NoteHeader from '$lib/components/notes/NoteHeader.svelte';
	import TipTapEditor from '$lib/components/notes/editor/TipTapEditor.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';
	import { getUrlFormat, isDateToday } from '$lib/helpers/DateHelper';

	const notes = getNotes();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let openedKey: string | null = null;

	let date = $derived(notes.journalService.parseEntryTitle(page.params.date ?? ''));
	let isToday = $derived(date !== null && isDateToday(date));

	async function openDay(day: Date): Promise<void> {
		loadingIndicator.start();
		await notes.openJournalEntry(day);
		loadingIndicator.stop();
	}

	$effect(() => {
		// Wait for the notes and categories to load before resolving the day, so
		// the journal folder is known and no stale note is shown.
		if (!notes.loaded || notes.journalCategory === null) return;

		const key = page.params.date ?? '';
		if (openedKey === key) return;

		const day = notes.journalService.parseEntryTitle(key);
		// Only today and earlier are reachable; anything else falls back to today.
		if (day === null || !notes.journalService.isReachable(day)) {
			goto(resolve(urls.journalDate, { date: getUrlFormat(new Date()) }), {
				replaceState: true
			});
			return;
		}

		openedKey = key;
		openDay(day);
	});
</script>

<div class="relative flex h-full w-full flex-col gap-4 p-4 lg:px-8">
	{#if notes.activeNote !== null && notes.isJournalNote(notes.activeNote)}
		<NoteHeader isJournal={true} />
		{#key `${notes.activeNote.id}-${notes.activeNote.title}`}
			<TipTapEditor autofocus={isToday} />
		{/key}
	{:else if notes.loaded}
		<p class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.journal_empty}</p>
	{/if}
</div>
