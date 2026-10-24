<script lang="ts">
	import { getMusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import Header from '$lib/components/libraries/shared/Header.svelte';
	import MusicCreate from '$lib/components/libraries/music/MusicCreate.svelte';
	import GenreModal from '$lib/components/libraries/shared/GenreModal.svelte';
	import MusicDetail from '$lib/components/libraries/music/MusicDetail.svelte';
	import Entries from '$lib/components/libraries/shared/Entries.svelte';

	const library = getMusicLibrary();
</script>

<div class="h-full max-h-full w-full overflow-y-auto p-4">
	<Header {library} />
	{#if library.createModalVisible}
		<MusicCreate />
	{/if}
	{#if library.detailModalVisible}
		<MusicDetail />
	{/if}
	{#if library.genreModalVisible}
		<GenreModal {library} />
	{/if}
	<Entries {library} />
</div>
