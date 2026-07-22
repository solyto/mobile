<script lang="ts">
	import { getNotes } from '$lib/state/Notes.svelte';
	import NoteHeader from '$lib/components/notes/NoteHeader.svelte';
	import TipTapEditor from '$lib/components/notes/editor/TipTapEditor.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const notes = getNotes();
	const ts = getTranslation();
</script>

<div class="relative flex h-full w-full flex-col gap-4 p-4 lg:px-8">
	{#if notes.activeNote !== null}
		<NoteHeader />
		{#key notes.activeNote.id}
			<TipTapEditor />
		{/key}
	{:else if notes.loaded}
		<p class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.note_not_found}</p>
	{/if}
</div>
