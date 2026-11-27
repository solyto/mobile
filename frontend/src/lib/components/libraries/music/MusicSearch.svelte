<script lang="ts">
	import LibrarySearchModal from '$lib/components/libraries/shared/LibrarySearchModal.svelte';
	import type { SearchSource } from '$lib/types/library';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import type { MusicRelease, MusicSearchResult } from '$lib/types/library_music';
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import DiscogsIcon from '$lib/assets/services/discogs_icon.svg';
	import SpotifyIcon from '$lib/assets/services/spotify_icon.svg';

	let { library, ts, onSelect }: {
		library: MusicLibrary;
		ts: Translation;
		onSelect: (entry: MusicRelease) => void;
	} = $props();

	const sourceDefs: Record<string, Omit<SearchSource, 'label' | 'icon'>> = {
		deezer: searchSource('deezer', artistAndYear),
		discogs: searchSource('discogs', year),
		spotify: searchSource('spotify', artistAndYear)
	};

	function artistAndYear(result: MusicSearchResult): string {
		return [result.artist, result.release_year?.toString()].filter(Boolean).join(' · ');
	}

	function year(result: MusicSearchResult): string | undefined {
		return result.release_year?.toString();
	}

	function searchSource(provider: string, subtitle: (result: MusicSearchResult) => string | undefined): Omit<SearchSource, 'label' | 'icon'> {
		return {
			search: async (query) => {
				const results = await library.searchAt(provider, query);
				return results?.map((r: MusicSearchResult) => ({
					id: r.id,
					title: r.title,
					subtitle: subtitle(r),
					image: r.cover,
					data: r
				})) ?? null;
			},
			onSelect: async (result) => {
				const r = result.data as MusicSearchResult;
				const album = await library.importFrom(provider, r.url);
				if (album) onSelect(album);
			}
		};
	}

	const icons: Record<string, string> = {
		deezer: DeezerIcon,
		discogs: DiscogsIcon,
		spotify: SpotifyIcon
	};

	const searchSources: SearchSource[] = $derived(
		library.integrations
			.map((provider: string): SearchSource | null => {
				const def = sourceDefs[provider];
				if (!def) return null;
				return {
					label: provider.charAt(0).toUpperCase() + provider.slice(1),
					icon: icons[provider],
					...def
				};
			})
			.filter((source: SearchSource | null): source is SearchSource => source !== null)
	);

	function close(): void {
		library.closeExternalSearchModal();
	}
</script>

<LibrarySearchModal
	sources={searchSources}
	onClose={close}
	placeholder={ts.get.libraries.music.search_placeholder}
/>