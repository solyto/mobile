<script lang="ts">
	import LibrarySearchModal, { type SearchSource } from '$lib/components/libraries/shared/LibrarySearchModal.svelte';
	import type { GameLibrary } from '$lib/state/GameLibrary.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import type { GameRelease, GameSearchResult } from '$lib/types/library_game';
	import SteamIcon from '$lib/assets/services/steam_icon.svg';
	import Dices from '@lucide/svelte/icons/dices';

	let { library, ts, onSelect } = $props<{
		library: GameLibrary;
		ts: Translation;
		onSelect: (entry: GameRelease) => void;
	}>();

	const searchSources: SearchSource[] = [
		{
			label: 'Steam',
			icon: SteamIcon,
			search: async (query) => {
				const results = await library.searchAt('steam', query);
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
				const game = await library.importFrom('steam', r.url);
				if (game) onSelect(game);
			}
		},
		{
			label: 'BGG',
			icon: Dices,
			search: async (query) => {
				const results = await library.searchAt('bgg', query);
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
				const game = await library.importFrom('bgg', r.url);
				if (game) onSelect(game);
			}
		}
	];
</script>

<LibrarySearchModal
	sources={searchSources}
	onClose={() => library.closeExternalSearchModal()}
	placeholder={ts.get.libraries.games.search_placeholder}
/>
