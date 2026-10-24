<script lang="ts">
	import Header from '$lib/components/libraries/shared/Header.svelte';
	import BookCreate from '$lib/components/libraries/books/BookCreate.svelte';
	import Entries from '$lib/components/libraries/shared/Entries.svelte';
	import GenreModal from '$lib/components/libraries/shared/GenreModal.svelte';
	import BookDetail from '$lib/components/libraries/books/BookDetail.svelte';
	import { getBookLibrary } from '$lib/state/BookLibrary.svelte';

	const library = getBookLibrary();
</script>

<div class="h-full max-h-full w-full overflow-y-auto p-4">
	<Header {library} />
	{#if library.createModalVisible}
		<BookCreate />
	{/if}
	{#if library.detailModalVisible}
		<BookDetail />
	{/if}
	{#if library.genreModalVisible}
		<GenreModal {library} />
	{/if}
	<Entries {library} />
</div>
