<script lang="ts">
	import LibrarySearchModal, { type SearchSource } from '$lib/components/libraries/shared/LibrarySearchModal.svelte';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import type { MusicRelease, MusicSearchResult } from '$lib/types/library_music';
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import DiscogsIcon from '$lib/assets/services/discogs_icon.png';

	let { library, ts, onSelect } = $props<{
		library: MusicLibrary;
		ts: Translation;
		onSelect: (entry: MusicRelease) => void;
	}>();

	const searchSources: SearchSource[] = [
		{
			label: 'Deezer',
			icon: DeezerIcon,
			search: async (query) => {
				const results = await library.searchAt('deezer', query);
				return results?.map((r: MusicSearchResult) => ({
					id: r.id,
					title: r.title,
					subtitle: [r.artist, r.release_year?.toString()].filter(Boolean).join(' · '),
					image: r.cover,
					data: r
				})) ?? null;
			},
			onSelect: async (result) => {
				const r = result.data as MusicSearchResult;
				const album = await library.importFrom('deezer', r.url);
				if (album) onSelect(album);
			}
		},
		{
			label: 'Discogs',
			icon: DiscogsIcon,
			search: async (query) => {
				const results = await library.searchAt('discogs', query);
				return results?.map((r: MusicSearchResult) => ({
					id: r.id,
					title: r.title,
					subtitle: r.release_year?.toString(),
					image: r.cover,
					data: r
				})) ?? null;
			},
			onSelect: async (result) => {
				const r = result.data as MusicSearchResult;
				const album = await library.importFrom('discogs', r.url);
				if (album) onSelect(album);
			}
		}
	];
</script>

<LibrarySearchModal
	sources={searchSources}
	onClose={() => library.closeExternalSearchModal()}
	placeholder={ts.get.libraries.music.search_placeholder}
/>
