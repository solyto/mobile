<script lang="ts">
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import NoteHeader from '$lib/components/notes/NoteHeader.svelte';
	import TipTapEditor from '$lib/components/notes/editor/TipTapEditor.svelte';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';
	import { getUrlFormat, isDateToday } from '$lib/helpers/DateHelper';

	const notes = getNotes();
	const ts = getTranslation();

	let date = $derived(notes.journalService.parseEntryTitle(page.params.date ?? ''));
	let isToday = $derived(date !== null && isDateToday(date));

	afterNavigate(() => {
		if (date === null || !notes.journalService.isReachable(date)) {
			goto(resolve(urls.journalDate, { date: getUrlFormat(new Date()) }), { replaceState: true });
		}
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
