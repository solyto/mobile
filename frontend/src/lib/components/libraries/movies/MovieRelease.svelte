<script lang="ts">
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import type { MovieRelease } from '$lib/types/library_movie';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import type { MovieLibrary } from '$lib/state/MovieLibrary.svelte';

	let { release, library } = $props<{ release: MovieRelease; library: MovieLibrary }>();
</script>

<div
	class="flex w-full flex-col items-start gap-4 rounded-lg border-1 border-c-neutral-1 bg-c-bg-surface p-4 shadow-sm dark:border-s-dark-2"
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
			<img src={release.cover} loading="lazy" alt="Poster" class="rounded-lg md:size-48 object-cover" />
			{/if}
		</div>
		<div class="flex flex-col items-start justify-between gap-2 md:max-w-96 md:min-w-60">
			<div class="flex flex-col items-start gap-1">
				<h2 class="text-left text-lg font-bold">{release.title}</h2>
				<span
					class="rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
					class:bg-c-primary={release.type === 'movie'}
					class:text-white={release.type === 'movie'}
					class:bg-c-neutral-2={release.type === 'tv'}
					class:dark:bg-s-dark-3={release.type === 'tv'}
				>
					{release.type === 'tv' ? 'Series' : 'Movie'}
				</span>
			{#if release.description}
				<p class="mt-1 text-left line-clamp-3 text-sm text-c-neutral-6 dark:text-c-neutral-4">
					{release.description}
				</p>
			{/if}
			{#if release.release_year}
				<div class="mt-2 text-sm">
					<span class="font-bold">Release year:</span>
					{release.release_year}
				</div>
			{/if}
			</div>
		</div>
	</div>
</div>
