<script lang="ts">
	import LibrarySearchModal, { type SearchSource } from '$lib/components/libraries/shared/LibrarySearchModal.svelte';
	import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import type { MovieRelease, MovieSearchResult } from '$lib/types/library_movie';
	import TmdbIcon from '$lib/assets/services/tmdb_icon.svg';

	let { library, ts, onSelect } = $props<{
		library: MovieLibrary;
		ts: Translation;
		onSelect: (entry: MovieRelease) => void;
	}>();

	const searchSources: SearchSource[] = [
		{
			label: 'TMDB',
			icon: TmdbIcon,
			search: async (query) => {
				const results = await library.searchAt('tmdb', query);
				return results?.map((r: MovieSearchResult) => ({
					id: r.id,
					title: r.title,
					subtitle: r.release_year?.toString(),
					image: r.cover,
					data: r
				})) ?? null;
			},
			onSelect: async (result) => {
				const r = result.data as MovieSearchResult;
				const movie = await library.importFrom('tmdb', r.url);
				if (movie) onSelect(movie);
			}
		}
	];
</script>

<LibrarySearchModal
	sources={searchSources}
	onClose={() => library.closeExternalSearchModal()}
	placeholder={ts.get.libraries.movies.search_placeholder}
/>
