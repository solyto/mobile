<script lang="ts">
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import HardcoverButton from '$lib/components/ui/buttons/HardcoverButton.svelte';
	import type { BookRelease } from '$lib/types/library_book';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import AddToWishlistButton from '$lib/components/libraries/shared/AddToWishlistButton.svelte';

	const ts = getTranslation();

	let { release, library }: {
		release: BookRelease;
		library: BookLibrary;
	} = $props();

	function createWishlistEntry(): Promise<boolean> {
		const year = release.release_date ? new Date(release.release_date).getFullYear() : null;
		return library.create({
			title: release.title,
			author: release.author,
			cover_path: release.cover || null,
			publication_year: year,
			link: release.url,
			pages: release.page_count || null,
			summary: release.description || undefined,
			wishlist: true
		});
	}
</script>

<div
	class="flex w-full flex-col gap-4 md:flex-row"
>
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
	<div class="flex flex-col items-start justify-between gap-2 md:max-w-96 md:min-w-60">
		<div class="flex flex-col items-start">
			<h2 class="text-left text-lg font-bold">{release.title}</h2>
			<p class="text-md text-left">{release.author}</p>
			{#if release.description}
				<p class="mt-2 text-left text-sm">{release.description}</p>
			{/if}
			<div class="mt-2 text-sm">
				<span class="font-bold">{ts.get.libraries.release_date}:</span>
				{release.release_date ? formatDate(release.release_date) : '—'}
			</div>
		</div>
		<div class="flex flex-row flex-wrap items-start gap-2">
			<HardcoverButton link={release.url} />
			<AddToWishlistButton add={createWishlistEntry} />
		</div>
	</div>
</div>
