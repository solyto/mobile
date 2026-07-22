<script lang="ts">
	import LibrarySearchModal, { type SearchSource } from '$lib/components/libraries/shared/LibrarySearchModal.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import type { BookRelease, BookSearchResult } from '$lib/types/library_book';
	import IconHardcover from '$lib/components/ui/icons/IconHardcover.svelte';

	let { library, ts, onSelect } = $props<{
		library: BookLibrary;
		ts: Translation;
		onSelect: (entry: BookRelease) => void;
	}>();

	const searchSources: SearchSource[] = [
		{
			label: 'Hardcover',
			icon: IconHardcover,
			search: async (query) => {
				const results = await library.searchAt('hardcover', query);
				return results?.map((r: BookSearchResult) => ({
					id: r.id,
					title: r.title,
					subtitle: [r.author, r.release_year?.toString()].filter(Boolean).join(' · '),
					image: r.cover,
					data: r
				})) ?? null;
			},
			onSelect: async (result) => {
				const r = result.data as BookSearchResult;
				const book = await library.importFrom('hardcover', r.url);
				if (book) onSelect(book);
			}
		}
	];
</script>

<LibrarySearchModal
	sources={searchSources}
	onClose={() => library.closeExternalSearchModal()}
	placeholder={ts.get.libraries.books.search_placeholder}
/>
