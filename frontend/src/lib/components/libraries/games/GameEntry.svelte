<script lang="ts">
	import type { Game } from '$lib/types/library_game';
	import { GameLibrary } from '$lib/state/GameLibrary.svelte';
	import Rating from '$lib/components/libraries/shared/Rating.svelte';
	import GenreFlexList from '$lib/components/libraries/shared/GenreFlexList.svelte';
	import TagFlexList from '$lib/components/tags/TagFlexList.svelte';
	import Flag from '$lib/components/ui/Flag.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { entry, library } = $props<{
		entry: Game;
		library: GameLibrary;
	}>();

	const platformLabels: Record<string, string> = {
		pc: ts.get.libraries.games.platform_pc,
		playstation: ts.get.libraries.games.platform_playstation,
		xbox: ts.get.libraries.games.platform_xbox,
		nintendo: ts.get.libraries.games.platform_nintendo,
		mobile: ts.get.libraries.games.platform_mobile,
		boardgame: ts.get.libraries.games.platform_boardgame,
		other: ts.get.libraries.games.platform_other
	};
</script>

{#if entry.wishlist}
	<Flag title={ts.get.libraries.wishlist} />
{/if}
<div class="text-left">
	<div class="font-bold">{entry.title}</div>
	<div class="text-sm">{platformLabels[entry.platform] || entry.platform}</div>
</div>
{#if library.view === 'list'}
	<div class="ml-auto flex flex-row items-center gap-4">
		<TagFlexList tags={entry.tags} />
		<GenreFlexList genres={entry.genres} />
		{#if entry.rating}
			<Rating startRating={entry.rating} />
		{/if}
	</div>
{/if}
