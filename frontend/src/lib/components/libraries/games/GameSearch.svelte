<script lang="ts">
	import LibrarySearchModal from '$lib/components/libraries/shared/LibrarySearchModal.svelte';
	import type { SearchSource } from '$lib/types/library';
	import type { GameLibrary } from '$lib/state/GameLibrary.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import type { GameRelease, GameSearchResult } from '$lib/types/library_game';
	import SteamIcon from '$lib/assets/services/steam_icon.svg';
	import Dices from '$lib/icons/lucide/dices.svelte';

	let { library, ts, showBgg, onSelect }: {
		library: GameLibrary;
		ts: Translation;
		showBgg: boolean;
		onSelect: (entry: GameRelease) => void;
	} = $props();

	const steamSource = searchSource('steam', 'Steam', SteamIcon);
	const bggSource = searchSource('bgg', 'BGG', Dices);

	function searchSource(provider: string, label: string, icon: SearchSource['icon']): SearchSource {
		return {
			label,
			icon,
			search: async (query) => {
				const results = await library.searchAt(provider, query);
				return results?.map((r: GameSearchResult) => ({
					id: r.id,
					title: r.title,
					subtitle: r.release_year?.toString(),
					image: r.cover,
					data: r
				})) ?? null;
			},
			onSelect: async (result) => {
				const r = result.data as GameSearchResult;
				const game = await library.importFrom(provider, r.url);
				if (game) onSelect(game);
			}
		};
	}

	const searchSources = showBgg ? [steamSource, bggSource] : [steamSource];

	function close(): void {
		library.closeExternalSearchModal();
	}
</script>

<LibrarySearchModal
	sources={searchSources}
	onClose={close}
	placeholder={ts.get.libraries.games.search_placeholder}
/>
