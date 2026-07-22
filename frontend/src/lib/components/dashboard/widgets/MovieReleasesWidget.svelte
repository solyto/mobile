<script lang="ts">
	import { blur } from 'svelte/transition';
	import IconFilm from '@lucide/svelte/icons/film';
	import IconTv from '@lucide/svelte/icons/tv';
	import IconExternalLink from '@lucide/svelte/icons/external-link';
	import type { MovieRelease } from '$lib/types/library_movie';
	import type { Translation } from '$lib/state/Translation.svelte';
	import { formatDate } from '$lib/helpers/DateHelper';

	let { movieReleases, ts } = $props<{
		movieReleases: MovieRelease[];
		ts: Translation;
	}>();
</script>

<div in:blur>
	<div class="mb-3 flex items-center gap-2">
		<IconFilm size={15} class="text-c-heading dark:text-c-primary" />
		<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
			Upcoming Movies & Series
		</span>
	</div>
	<div class="flex flex-col gap-2.5">
		{#each movieReleases as release (release.id)}
			<a
				href={release.url}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex items-center gap-3 transition-colors"
			>
				{#if release.poster}
					<img
						src={release.poster}
						alt={release.title}
						class="h-9 w-9 shrink-0 rounded object-cover"
					/>
				{:else}
					<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-c-neutral-1 dark:bg-s-dark-3">
						{#if release.type === 'tv'}
							<IconTv size={14} class="text-c-neutral-4" />
						{:else}
							<IconFilm size={14} class="text-c-neutral-4" />
						{/if}
					</div>
				{/if}
				<div class="flex min-w-0 flex-col">
					<span class="truncate text-sm font-medium text-c-neutral-8 transition-colors group-hover:text-c-primary dark:text-white dark:group-hover:text-c-primary">
						{release.title}
					</span>
					<span class="truncate text-xs text-c-neutral-5 dark:text-c-neutral-4">
						{release.type === 'tv' ? 'Series' : 'Movie'} &middot; {formatDate(release.release_date)}
					</span>
				</div>
				<IconExternalLink
					size={13}
					class="ml-auto shrink-0 text-c-neutral-4 opacity-0 transition-opacity group-hover:opacity-100"
				/>
			</a>
		{/each}
	</div>
</div>
