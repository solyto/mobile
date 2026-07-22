<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import type { Library } from '$lib/types/library';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { Music } from '$lib/types/library_music';
	import type { Book } from '$lib/types/library_book';

	interface ShelfEntry {
		id: string;
		cover: string | null;
		title: string;
		artist?: string;
		author?: string;
		publication_year?: number | null;
		genres?: { id: number; title: string }[];
	}

	const auth = getAuth();
	let { library } = $props<{ library: Library }>();

	let entries = $derived(library.filteredEntries as ShelfEntry[]);
	let activeIndex = $state(0);
	let activeEntry = $derived(entries[activeIndex] ?? null);
	let subtitle = $derived(activeEntry?.artist ?? activeEntry?.author ?? '');
	let touchStartX = $state(0);

	const isSquare = $derived(library.config.type === 'music');

	$effect(() => {
		void entries.length;
		activeIndex = 0;
	});

	function navigate(dir: -1 | 1) {
		const next = activeIndex + dir;
		if (next >= 0 && next < entries.length) activeIndex = next;
	}

	function handleClick(index: number) {
		if (index === activeIndex) {
			if (library.config.type === 'music') {
				(library as MusicLibrary).openDetailModal(
					library.filteredEntries[index] as unknown as Music
				);
			} else if (library.config.type === 'books') {
				(library as BookLibrary).openDetailModal(
					library.filteredEntries[index] as unknown as Book
				);
			}
		} else {
			activeIndex = index;
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') navigate(-1);
		else if (e.key === 'ArrowRight') navigate(1);
	}

	function onTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function onTouchEnd(e: TouchEvent) {
		const diff = touchStartX - e.changedTouches[0].clientX;
		if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
	}

	onMount(() => window.addEventListener('keydown', onKeydown));
	onDestroy(() => window.removeEventListener('keydown', onKeydown));

	function itemStyle(index: number): string {
		const offset = index - activeIndex;
		const abs = Math.abs(offset);
		const sign = Math.sign(offset);

		const xPx = offset === 0 ? 0 : sign * (230 + (abs - 1) * 155);
		const rotateY = offset === 0 ? 0 : -sign * (52 + (abs - 1) * 9);
		const opacity = abs === 0 ? 1 : abs === 1 ? 0.82 : abs === 2 ? 0.5 : 0.22;
		const zIndex = 10 - abs;

		return [
			`transform: perspective(1000px) translateX(calc(-50% + ${xPx}px)) rotateY(${rotateY}deg)`,
			`opacity: ${opacity}`,
			`z-index: ${zIndex}`,
			`transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease`
		].join('; ');
	}

	function coverUrl(entry: ShelfEntry): string {
		return `${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${entry.cover}`;
	}
</script>

<div class="flex w-full select-none flex-col items-center gap-10 py-10" in:fade>
	<!-- Stage -->
	<div
		class="relative w-full overflow-x-hidden"
		style="height: 420px;"
		ontouchstart={onTouchStart}
		ontouchend={onTouchEnd}
	>
		{#each entries as entry, index}
			{@const offset = index - activeIndex}
			{@const abs = Math.abs(offset)}
			{#if abs <= 3}
				<button
					class="absolute top-1/2 left-1/2 -translate-y-1/2 cursor-pointer"
					style={itemStyle(index)}
					onclick={() => handleClick(index)}
					tabindex={offset === 0 ? 0 : -1}
					aria-label={entry.title}
				>
					<div
						class="relative overflow-hidden rounded-sm bg-c-bg-surface"
						class:w-56={isSquare}
						class:h-56={isSquare}
						class:w-44={!isSquare}
						class:h-64={!isSquare}
						style={offset === 0
							? 'box-shadow: 0 25px 60px rgba(0,0,0,0.45), 0 10px 20px rgba(0,0,0,0.3)'
							: 'box-shadow: 0 8px 24px rgba(0,0,0,0.25)'}
					>
						<MissingCover {library} />
						{#if entry.cover}
							<img
								src={coverUrl(entry)}
								alt={entry.title}
								class="absolute inset-0 h-full w-full object-cover"
								loading="lazy"
								decoding="async"
							/>
						{/if}
					</div>
				</button>
			{/if}
		{/each}
	</div>

	<!-- Navigation -->
	<div class="flex items-center gap-6">
		<button
			onclick={() => navigate(-1)}
			disabled={activeIndex === 0}
			class="rounded-full p-2 transition-all hover:bg-c-neutral-1 disabled:opacity-25 dark:hover:bg-s-dark-3"
			aria-label="Previous"
		>
			<ChevronLeft size={22} />
		</button>
		<span class="w-20 text-center text-sm tabular-nums text-c-neutral-5 dark:text-c-neutral-4">
			{activeIndex + 1} / {entries.length}
		</span>
		<button
			onclick={() => navigate(1)}
			disabled={activeIndex === entries.length - 1}
			class="rounded-full p-2 transition-all hover:bg-c-neutral-1 disabled:opacity-25 dark:hover:bg-s-dark-3"
			aria-label="Next"
		>
			<ChevronRight size={22} />
		</button>
	</div>

	<!-- Info panel -->
	{#if activeEntry}
		{#key activeIndex}
			<button
				class="flex max-w-sm flex-col items-center gap-1 text-center"
				onclick={() => handleClick(activeIndex)}
				in:fade={{ duration: 180 }}
			>
				<div class="text-xl font-bold">{activeEntry.title}</div>
				{#if subtitle}
					<div class="text-c-neutral-5 dark:text-c-neutral-4">{subtitle}</div>
				{/if}
				{#if activeEntry.publication_year}
					<div class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
						{activeEntry.publication_year}
					</div>
				{/if}
				{#if activeEntry.genres?.length}
					<div class="mt-1 flex flex-wrap justify-center gap-1">
						{#each activeEntry.genres as genre}
							<span
								class="rounded-full bg-c-neutral-1 px-2 py-0.5 text-xs dark:bg-s-dark-3"
							>
								{genre.title}
							</span>
						{/each}
					</div>
				{/if}
			</button>
		{/key}
	{/if}

	{#if entries.length === 0}
		<p class="text-c-neutral-5 dark:text-c-neutral-4" in:fade>Nothing here yet.</p>
	{/if}
</div>
