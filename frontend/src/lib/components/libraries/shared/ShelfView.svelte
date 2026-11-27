<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import ChevronLeft from '$lib/icons/lucide/chevron-left.svelte';
	import ChevronRight from '$lib/icons/lucide/chevron-right.svelte';
	import { libraryCoverUrl } from '$lib/helpers/LibraryCoverHelper';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { DetailLibrary } from '$lib/types/library';
	import { getTranslation } from '$lib/state/Translation.svelte';

	interface ShelfEntry {
		id: string;
		cover: string | null;
		title: string;
		artist?: string;
		author?: string;
		publication_year?: number | null;
		genres?: { id: number; title: string }[];
	}

	const keyManager = getKeyManager();
	const ts = getTranslation();

	const STAGE_RADIUS = 3;
	const SWIPE_THRESHOLD_PX = 50;
	const FIRST_OFFSET_PX = 230;
	const NEXT_OFFSET_PX = 155;
	const FIRST_ROTATION_DEG = 52;
	const NEXT_ROTATION_DEG = 9;
	const OPACITY_BY_DISTANCE = [1, 0.82, 0.5];
	const FAR_OPACITY = 0.22;
	const ACTIVE_SHADOW = 'box-shadow: 0 25px 60px rgba(0,0,0,0.45), 0 10px 20px rgba(0,0,0,0.3)';
	const SHADOW = 'box-shadow: 0 8px 24px rgba(0,0,0,0.25)';

	let { library }: { library: MusicLibrary | BookLibrary } = $props();

	let entries = $derived(library.filteredEntries as ShelfEntry[]);
	let activeEntry = $derived(entries[library.shelfIndex] ?? null);
	let subtitle = $derived(activeEntry?.artist ?? activeEntry?.author ?? '');
	let touchStartX = $state(0);

	const isSquare = $derived(library.config.type === 'music');

	function navigate(dir: -1 | 1) {
		const next = library.shelfIndex + dir;
		if (next >= 0 && next < entries.length) library.shelfIndex = next;
	}

	function handleClick(index: number) {
		if (index === library.shelfIndex) {
			const detailLibrary: DetailLibrary = library;
			detailLibrary.openDetailModal(library.filteredEntries[index]);
		} else {
			library.shelfIndex = index;
		}
	}

	function openActiveEntry(): void {
		handleClick(library.shelfIndex);
	}

	function showPrevious(): void {
		navigate(-1);
	}

	function showNext(): void {
		navigate(1);
	}

	function onTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function onTouchEnd(e: TouchEvent) {
		const diff = touchStartX - e.changedTouches[0].clientX;
		if (Math.abs(diff) > SWIPE_THRESHOLD_PX) navigate(diff > 0 ? 1 : -1);
	}

	let keyHandlers: { [key: string]: string | null } = {
		ArrowLeft: keyManager.registerKeyDown('ArrowLeft', showPrevious, { preventDefault: false }),
		ArrowRight: keyManager.registerKeyDown('ArrowRight', showNext, { preventDefault: false })
	};

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function itemStyle(index: number): string {
		const offset = index - library.shelfIndex;
		const abs = Math.abs(offset);
		const sign = Math.sign(offset);

		const xPx = offset === 0 ? 0 : sign * (FIRST_OFFSET_PX + (abs - 1) * NEXT_OFFSET_PX);
		const rotateY = offset === 0 ? 0 : -sign * (FIRST_ROTATION_DEG + (abs - 1) * NEXT_ROTATION_DEG);
		const opacity = OPACITY_BY_DISTANCE[abs] ?? FAR_OPACITY;
		const zIndex = 10 - abs;

		return [
			`transform: perspective(1000px) translateX(calc(-50% + ${xPx}px)) rotateY(${rotateY}deg)`,
			`opacity: ${opacity}`,
			`z-index: ${zIndex}`,
			`transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease`
		].join('; ');
	}

	function isOnStage(index: number): boolean {
		return Math.abs(index - library.shelfIndex) <= STAGE_RADIUS;
	}

	function coverShadow(index: number): string {
		return index === library.shelfIndex ? ACTIVE_SHADOW : SHADOW;
	}

	function coverUrl(cover: string): string {
		return libraryCoverUrl(library, cover);
	}
</script>

<div class="flex w-full select-none flex-col items-center gap-10 py-10" in:fade>
	<div
		class="relative w-full overflow-x-hidden"
		style="height: 420px;"
		ontouchstart={onTouchStart}
		ontouchend={onTouchEnd}
	>
		{#each entries as entry, index (entry.id)}
			{#if isOnStage(index)}
				<button
					class="absolute top-1/2 left-1/2 -translate-y-1/2 cursor-pointer"
					style={itemStyle(index)}
					onclick={() => handleClick(index)}
					tabindex={index === library.shelfIndex ? 0 : -1}
					aria-label={entry.title}
				>
					<div
						class="relative overflow-hidden rounded-sm bg-c-bg-surface"
						class:w-56={isSquare}
						class:h-56={isSquare}
						class:w-44={!isSquare}
						class:h-64={!isSquare}
						style={coverShadow(index)}
					>
						<MissingCover {library} />
						{#if entry.cover}
							<img
								src={coverUrl(entry.cover)}
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

	<div class="flex items-center gap-6">
		<button
			onclick={showPrevious}
			disabled={library.shelfIndex === 0}
			class="rounded-full p-2 transition-all hover:bg-c-neutral-1 disabled:opacity-25 dark:hover:bg-s-dark-3"
			aria-label={ts.get.libraries.previous}
		>
			<ChevronLeft size={22} />
		</button>
		<span class="w-20 text-center text-sm tabular-nums text-c-neutral-5 dark:text-c-neutral-4">
			{library.shelfIndex + 1} / {entries.length}
		</span>
		<button
			onclick={showNext}
			disabled={library.shelfIndex === entries.length - 1}
			class="rounded-full p-2 transition-all hover:bg-c-neutral-1 disabled:opacity-25 dark:hover:bg-s-dark-3"
			aria-label={ts.get.libraries.next}
		>
			<ChevronRight size={22} />
		</button>
	</div>

	{#if activeEntry}
		{#key library.shelfIndex}
			<button
				class="flex max-w-sm flex-col items-center gap-1 text-center"
				onclick={openActiveEntry}
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
						{#each activeEntry.genres as genre (genre.id)}
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
</div>
