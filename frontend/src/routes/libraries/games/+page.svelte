<script lang="ts">
	import Header from '$lib/components/libraries/shared/Header.svelte';
	import GenreModal from '$lib/components/libraries/shared/GenreModal.svelte';
	import GameCreate from '$lib/components/libraries/games/GameCreate.svelte';
	import GameDetail from '$lib/components/libraries/games/GameDetail.svelte';
	import Entries from '$lib/components/libraries/shared/Entries.svelte';
	import { getGameLibrary } from '$lib/state/GameLibrary.svelte';

	const library = getGameLibrary();
</script>

<div class="h-full max-h-full w-full overflow-y-auto p-4">
	<Header {library} />
	{#if library.createModalVisible}
		<GameCreate />
	{/if}
	{#if library.detailModalVisible}
		<GameDetail />
	{/if}
	{#if library.genreModalVisible}
		<GenreModal {library} />
	{/if}
	<Entries {library} />
</div>
