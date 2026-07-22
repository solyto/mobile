<script lang="ts">
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import HardcoverButton from '$lib/components/ui/buttons/HardcoverButton.svelte';
	import type { BookRelease } from '$lib/types/library_book';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const notifications = getUiNotifications();

	let { release, library } = $props<{
		release: BookRelease;
		library: BookLibrary;
	}>();

	let adding = $state<boolean>(false);
	let added = $state<boolean>(false);

	async function addToWishlist() {
		adding = true;
		const year = release.release_date ? new Date(release.release_date).getFullYear() : null;
		const ok = await library.create({
			title: release.title,
			author: release.author,
			cover_path: release.cover || null,
			publication_year: year,
			link: release.url,
			pages: release.page_count || null,
			summary: release.description || undefined,
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
	class="flex w-full flex-col gap-4 rounded-lg border-1 border-c-neutral-1 bg-c-bg-surface p-4 shadow-sm md:flex-row dark:border-s-dark-2"
>
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
