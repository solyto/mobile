<script lang="ts">
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import DeezerButton from '$lib/components/ui/buttons/DeezerButton.svelte';
	import type { MusicRelease } from '$lib/types/library_music';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import DeezerSneakPreview from '$lib/components/libraries/music/DeezerSneakPreview.svelte';
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const notifications = getUiNotifications();

	let { release, library } = $props<{
		release: MusicRelease;
		library: MusicLibrary;
	}>();

	let sneakPreview = $state<boolean>(false);
	let adding = $state<boolean>(false);
	let added = $state<boolean>(false);

	async function addToWishlist() {
		adding = true;
		const year = release.release_date ? new Date(release.release_date).getFullYear() : null;
		const ok = await library.create({
			title: release.title,
			artist: release.artist,
			cover_path: release.cover || null,
			publication_year: year,
			link: release.url,
			wishlist: true
		});
		adding = false;
		if (ok) {
			added = true;
		} else {
			notifications.error(ts.get.libraries.add_to_wishlist_error);
		}
	}
</script>

<div
	class="flex w-full flex-col items-start gap-4 rounded-lg border-1 border-c-neutral-1 bg-c-bg-surface p-4 shadow-sm dark:border-s-dark-2"
>
	<div class="flex flex-col gap-4 md:flex-row">
		<div class="flex justify-center">
			{#if release.cover === null || release.cover === undefined || release.cover === ''}
				<div
					class="relative flex size-48 items-center justify-center rounded-lg bg-c-neutral text-xs text-c-neutral-5"
				>
					<MissingCover {library} />
				</div>
			{:else}
				<img src={release.cover} loading="lazy" alt="Cover" class="rounded-lg md:size-48" />
			{/if}
		</div>
		<div class="flex flex-col items-start justify-between gap-2 md:min-w-60">
			<div class="flex flex-col items-start">
				<h2 class="text-left text-lg font-bold">{release.title}</h2>
				<p class="text-md text-left">{release.artist}</p>
				<div class="mt-2 text-sm">
					<span class="font-bold">{ts.get.libraries.release_date}:</span>
					{formatDate(release.release_date)}
				</div>
			</div>
			<div class="flex flex-row flex-wrap items-start gap-2">
				<DeezerButton link={release.url} />
				<button
					class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:text-[#a238ff] dark:border-s-dark-2"
					onclick={() => (sneakPreview = !sneakPreview)}
				>
					<img
						src={DeezerIcon}
						alt="Deezer icon"
						class="size-6 group-hover:animate-pulse"
					/>
					{ts.get.libraries.music.deezer_preview}
				</button>
				<button
					class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 p-2 text-sm font-bold shadow-sm transition-all disabled:cursor-not-allowed dark:border-s-dark-3 {added ? 'border-c-primary text-c-primary' : 'border-c-neutral hover:text-c-btn'}"
					onclick={addToWishlist}
					disabled={adding || added}
				>
					{#if added}
						<svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
					{:else if adding}
						<svg xmlns="http://www.w3.org/2000/svg" class="size-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="size-6 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
					{/if}
					{added ? ts.get.libraries.added_to_wishlist : ts.get.libraries.add_to_wishlist}
				</button>
			</div>
		</div>
	</div>
	{#if sneakPreview}
		<DeezerSneakPreview {release} />
	{/if}
</div>
