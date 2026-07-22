<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { Library, LibraryRecommendation } from '$lib/types/library.js';
	import DeezerButton from '$lib/components/ui/buttons/DeezerButton.svelte';
	import HardcoverButton from '$lib/components/ui/buttons/HardcoverButton.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';

	const auth = getAuth();

	let { library, item } = $props<{
		library: Library;
		item: LibraryRecommendation;
	}>();
</script>

<div
	class="flex w-full flex-col items-start gap-4 rounded-lg border-1 border-c-neutral-1 bg-c-bg-surface p-4 text-left shadow-sm md:flex-row dark:border-s-dark-2"
	in:scale
>
	<div class="flex flex-col gap-4 md:flex-row">
		<div class="flex justify-center">
			{#if item.cover === null || item.cover === undefined || item.cover === ''}
				<div
					class="relative flex size-48 items-center justify-center rounded-lg bg-c-neutral text-xs text-c-neutral-5"
				>
					<MissingCover {library} />
				</div>
			{:else if item.id}
				<img
					src={`${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${item.cover}`}
					loading="lazy"
					alt="Cover"
					class="rounded-lg md:size-48"
				/>
			{:else}
				<img src={item.cover} loading="lazy" alt="Cover" class="rounded-lg md:size-48" />
			{/if}
		</div>
		<div class="flex flex-col items-start justify-between gap-2 md:min-w-60">
			<div class="flex flex-col items-start">
				<h1 class="text-xl font-bold">{item.title}</h1>
				<h2 class="text-lg">{item.creator}</h2>
			</div>
			<div class="flex flex-row items-start gap-2">
				{#if library.config.type === 'music'}
					<DeezerButton
						link={item.link ? item.link : null}
						title={item.title}
						artist={item.creator}
					/>
				{/if}
				{#if library.config.type === 'books'}
					<HardcoverButton
						link={item.link ? item.link : null}
						title={item.title}
						author={item.creator}
					/>
				{/if}
			</div>
		</div>
	</div>
</div>
