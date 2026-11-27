<script lang="ts">
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import DeezerButton from '$lib/components/ui/buttons/DeezerButton.svelte';
	import type { MusicRelease } from '$lib/types/library_music';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import DeezerSneakPreview from '$lib/components/libraries/music/DeezerSneakPreview.svelte';
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import AddToWishlistButton from '$lib/components/libraries/shared/AddToWishlistButton.svelte';

	const ts = getTranslation();

	let { release, library }: {
		release: MusicRelease;
		library: MusicLibrary;
	} = $props();

	let sneakPreview = $state<boolean>(false);

	function toggleSneakPreview(): void {
		sneakPreview = !sneakPreview;
	}

	function createWishlistEntry(): Promise<boolean> {
		const year = release.release_date ? new Date(release.release_date).getFullYear() : null;
		return library.create({
			title: release.title,
			artist: release.artist,
			cover_path: release.cover || null,
			publication_year: year,
			link: release.url,
			wishlist: true
		});
	}
</script>

<div
	class="flex w-full flex-col items-start gap-4"
>
	<div class="flex flex-col gap-4 md:flex-row">
		<div class="flex justify-center">
			{#if !release.cover}
				<div
					class="relative flex size-48 items-center justify-center rounded-lg bg-c-neutral text-xs text-c-neutral-5"
				>
					<MissingCover {library} />
				</div>
			{:else}
				<img src={release.cover} loading="lazy" alt={ts.get.libraries.cover} class="rounded-lg md:size-48" />
			{/if}
		</div>
		<div class="flex flex-col items-start justify-between gap-2 md:min-w-60">
			<div class="flex flex-col items-start">
				<h2 class="text-left text-lg font-bold">{release.title}</h2>
				<p class="text-md text-left">{release.artist}</p>
				<div class="mt-2 text-sm">
					<span class="font-bold">{ts.get.libraries.release_date}:</span>
					{release.release_date ? formatDate(release.release_date) : '—'}
				</div>
			</div>
			<div class="flex flex-row flex-wrap items-start gap-2">
				<DeezerButton link={release.url} />
				<button
					class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:text-[#a238ff] dark:border-s-dark-2"
					onclick={toggleSneakPreview}
				>
					<img src={DeezerIcon} alt={ts.get.libraries.service_icon.replace('%s', 'Deezer')} class="size-6 group-hover:animate-pulse" />
					{ts.get.libraries.music.deezer_preview}
				</button>
				<AddToWishlistButton add={createWishlistEntry} />
			</div>
		</div>
	</div>
	{#if sneakPreview}
		<DeezerSneakPreview {release} />
	{/if}
</div>
