<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import Rating from '$lib/components/libraries/shared/Rating.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type { Book } from '$lib/types/library_book';
	import type { Music } from '$lib/types/library_music';
	import type { Movie } from '$lib/types/library_movie';
	import type { Recipe } from '$lib/types/library_recipe';
	import type { Quote } from '$lib/types/library_quote';
	import type { Game } from '$lib/types/library_game';
	import type { Plant } from '$lib/types/library_plant';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { RecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import type { GameLibrary } from '$lib/state/GameLibrary.svelte';
	import type { PlantLibrary } from '$lib/state/PlantLibrary.svelte';
	import type { QuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import ExternalLink from '$lib/components/libraries/shared/ExternalLink.svelte';
	import Cover from '$lib/components/libraries/shared/Cover.svelte';

	const loadingIndicator = getLoadingIndicator();
	let { entry, library, children } = $props<{
		entry: Book | Music | Recipe | Movie | Quote | Game | Plant;
		library:
			| BookLibrary
			| MusicLibrary
			| RecipeLibrary
			| MovieLibrary
			| GameLibrary
			| PlantLibrary
			| QuoteLibrary;
		children: any;
	}>();

	async function changeRating(rating: number): Promise<void> {
		loadingIndicator.start();
		await library.updateRating(entry!, rating);
		loadingIndicator.stop();
	}
</script>

<ContentModal
	rounded="2xl"
	p="4"
	onClose={() => library.closeDetailModal()}
	onEdit={() => {
		library.closeDetailModal();
		library.openCreateModal(entry);
	}}
	onDelete={async () => {
		await library.delete(entry);
		library.closeDetailModal();
	}}
>
	{#if entry}
		<div class="mr-4 flex flex-col gap-4 max-md:min-w-72 md:min-h-32 md:min-w-128 md:max-w-3xl md:flex-row">
			{#if library.config.hasCovers || library.config.hasRatings || library.config.hasExternalLinks}
				<div class="flex flex-col items-center gap-2">
					{#if library.config.hasCovers}
						<Cover {entry} {library} />
					{/if}
					{#if library.config.hasRatings}
						<div class="flex w-full justify-center">
							<Rating startRating={entry?.rating ?? 0} onchange={changeRating} />
						</div>
					{/if}
					{#if library.config.hasExternalLinks}
						<ExternalLink {entry} />
					{/if}
				</div>
			{/if}
			<div class="flex flex-col gap-1">
				{@render children()}
			</div>
		</div>
	{/if}
</ContentModal>
