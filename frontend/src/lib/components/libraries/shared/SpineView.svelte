<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Library } from '$lib/types/library';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import type { Music } from '$lib/types/library_music';
	import type { Book } from '$lib/types/library_book';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';

	interface SpineEntry {
		id: string;
		cover: string | null;
		title: string;
		artist?: string;
		author?: string;
		pages?: number | null;
	}

	const auth = getAuth();
	let { library } = $props<{ library: Library }>();

	let entries = $derived(library.filteredEntries as SpineEntry[]);
	const isSquare = $derived(library.config.type === 'music');

	const GAP = 2;
	const BOOK_SPINE_H = 220;
	const BOOK_COVER_W = 160;
	const VINYL_SPINE_W = 20;
	const VINYL_SPINE_H = 180;
	const VINYL_COVER_SIZE = 220;

	const SPINE_H = $derived(isSquare ? VINYL_SPINE_H : BOOK_SPINE_H);
	const BOOK_COVER_W_MIN = 120;
	const BOOK_COVER_W_MAX = 220;

	let containerWidth = $state(0);
	let hoveredId = $state<string | null>(null);
	let coverWidths = $state<Record<string, number>>({});

	function getSpineWidth(entry: SpineEntry): number {
		if (isSquare) return VINYL_SPINE_W;
		if (!entry.pages) return 34;
		const clamped = Math.max(50, Math.min(1200, entry.pages));
		return Math.round(18 + ((clamped - 50) / (1200 - 50)) * 50);
	}

	function getCoverW(entryId?: string): number {
		if (isSquare) return VINYL_COVER_SIZE;
		return coverWidths[entryId ?? ''] ?? BOOK_COVER_W;
	}

	function getCoverH(): number {
		return isSquare ? VINYL_COVER_SIZE : BOOK_SPINE_H;
	}

	// Rows carry xOffset per entry so we can flip cover direction near left edge
	let rows = $derived.by(() => {
		if (containerWidth === 0) return [];
		const result: { entry: SpineEntry; xOffset: number }[][] = [];
		let currentRow: { entry: SpineEntry; xOffset: number }[] = [];
		let currentWidth = 0;

		for (const entry of entries) {
			const w = getSpineWidth(entry) + GAP;
			if (currentWidth + w > containerWidth && currentRow.length > 0) {
				result.push(currentRow);
				currentRow = [{ entry, xOffset: 0 }];
				currentWidth = w;
			} else {
				currentRow.push({ entry, xOffset: currentWidth });
				currentWidth += w;
			}
		}
		if (currentRow.length > 0) result.push(currentRow);
		return result;
	});

	function spineColor(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash |= 0;
		}
		return `hsl(${Math.abs(hash) % 360}, 28%, 38%)`;
	}

	function spineTextColor(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash |= 0;
		}
		return `hsl(${Math.abs(hash) % 360}, 20%, 85%)`;
	}

	function coverUrl(entry: SpineEntry): string {
		return `${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${entry.cover}`;
	}

	function onCoverLoad(e: Event, entryId: string) {
		if (isSquare) return;
		const img = e.currentTarget as HTMLImageElement;
		const ratio = img.naturalWidth / img.naturalHeight;
		coverWidths[entryId] = Math.round(
			Math.max(BOOK_COVER_W_MIN, Math.min(BOOK_COVER_W_MAX, BOOK_SPINE_H * ratio))
		);
	}

	function handleClick(entry: SpineEntry) {
		const index = (library.filteredEntries as SpineEntry[]).findIndex((e) => e.id === entry.id);
		if (index === -1) return;
		if (library.config.type === 'music') {
			(library as MusicLibrary).openDetailModal(library.filteredEntries[index] as unknown as Music);
		} else if (library.config.type === 'books') {
			(library as BookLibrary).openDetailModal(library.filteredEntries[index] as unknown as Book);
		}
	}
</script>

<div class="w-full pb-10 pl-3" bind:clientWidth={containerWidth} in:fade>
	{#each rows as row, rowIndex}
		<div
			class="relative flex items-end"
			style="
				padding-bottom: 5px;
				margin-top: {rowIndex === 0 ? 20 : 28}px;
				perspective: 600px;
				perspective-origin: 50% 100%;
			"
		>
			{#each row as { entry, xOffset }}
				{@const spineW = getSpineWidth(entry)}
				{@const coverW = getCoverW(entry.id)}
				{@const coverH = getCoverH()}
				{@const bg = spineColor(entry.title)}
				{@const textCol = spineTextColor(entry.title)}
				{@const isHovered = hoveredId === entry.id}
				{@const flipRight = xOffset < coverW + 16}

				<button
					class="relative flex-shrink-0 cursor-pointer"
					style="
						width: {spineW}px;
						height: {SPINE_H}px;
						margin-right: {GAP}px;
						z-index: {isHovered ? 20 : 1};
						overflow: visible;
						perspective: 700px;
						perspective-origin: {flipRight ? 'left' : 'right'} center;
					"
					onmouseenter={() => (hoveredId = entry.id)}
					onmouseleave={() => (hoveredId = null)}
					onclick={() => handleClick(entry)}
					aria-label={entry.title}
				>
					<!-- Spine -->
					<div
						style="
							position: absolute;
							inset: 0;
							border-radius: 2px;
							overflow: hidden;
							background: {bg};
							transform: {isHovered ? 'translateZ(30px) translateY(-10px)' : 'translateZ(0) translateY(0)'};
							transition: transform 0.35s ease;
							box-shadow: {isHovered ? '0 15px 35px rgba(0,0,0,0.35)' : '2px 0 4px rgba(0,0,0,0.2)'};
						"
					>
						{#if entry.cover}
							<img
								src={coverUrl(entry)}
								alt=""
								aria-hidden="true"
								class="pointer-events-none absolute inset-0 h-full w-full object-cover"
								style="filter: blur(2px) brightness(0.55); transform: scale(1.1);"
								loading="lazy"
								decoding="async"
							/>
						{/if}
						<span
							style="
								position: absolute;
								bottom: 8px;
								left: 0; right: 0;
								text-align: center;
								writing-mode: vertical-rl;
								transform: rotate(180deg);
								font-size: {isSquare ? 9 : 11}px;
								font-weight: 600;
								letter-spacing: 0.02em;
								color: rgba(255,255,255,0.92);
								overflow: hidden;
								white-space: nowrap;
								text-overflow: ellipsis;
								max-height: 90%;
								pointer-events: none;
								text-shadow: 0 1px 4px rgba(0,0,0,0.6);
							"
						>
							{entry.title}
						</span>
					</div>

					<!-- Cover: flips direction near left edge to avoid nav overlap -->
					<div
						style="
							position: absolute;
							top: 0;
							{flipRight ? 'left' : 'right'}: 0;
							width: {coverW}px;
							height: {coverH}px;
							border-radius: 2px;
							overflow: hidden;
							background: {bg};
							transform-origin: {flipRight ? 'left' : 'right'} center;
							opacity: {isHovered ? 1 : 0};
							transform: {isHovered
								? `translateZ(50px) translateY(-14px) rotateY(0deg)`
								: `translateZ(0) translateY(0) rotateY(${flipRight ? -35 : 35}deg)`};
							transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
							box-shadow: 0 20px 50px rgba(0,0,0,0.45);
							pointer-events: none;
						"
					>
						{#if entry.cover}
							<img
								src={coverUrl(entry)}
								alt={entry.title}
								class="h-full w-full object-cover"
								loading="lazy"
								decoding="async"
								onload={(e) => onCoverLoad(e, entry.id)}
							/>
						{:else}
							<div class="flex h-full w-full items-end p-2">
								<span class="text-xs font-semibold leading-tight" style="color: {textCol};">
									{entry.title}
								</span>
							</div>
						{/if}
					</div>
				</button>
			{/each}

			<!-- Shelf plank -->
			<div
				class="pointer-events-none absolute right-0 bottom-0 left-0"
				style="height: 5px; background: url('/wood-shelf.jpg') center/cover; box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.4);"
			></div>
		</div>
	{/each}
</div>
