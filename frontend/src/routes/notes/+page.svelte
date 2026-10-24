<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getNotes } from '$lib/state/Notes.svelte';
	import OverviewEntries from '$lib/components/notes/OverviewEntries.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	const ts = getTranslation();
	const notes = getNotes();

	let favorites = $derived(notes.favoriteNotes);
	let newest = $derived(notes.newestNotes);
	let lastUpdated = $derived(notes.lastUpdatedNotes);
</script>

<div class="flex h-full w-full flex-col gap-4 px-4 max-md:mt-16 md:px-8">
	<div class="absolute top-4 right-4 z-40 md:hidden">
		<TextButton title={ts.get.notes.new_note} onclick={() => notes.openModal('note')} />
	</div>
	{#if notes.loaded}
		{#if favorites.length > 0}
			<OverviewEntries entries={favorites} title={ts.get.notes.favorites} />
		{/if}
		{#if newest.length > 0}
			<OverviewEntries entries={newest} title={ts.get.notes.new_notes} />
		{/if}
		{#if lastUpdated.length > 0}
			<OverviewEntries entries={lastUpdated} title={ts.get.notes.last_updated} />
		{/if}
		{#if notes.getVisibleNotes().length === 0}
			<EmptyState title={ts.get.notes.no_notes} description={ts.get.notes.no_notes_desc} py={6} />
		{/if}
	{/if}
</div>
