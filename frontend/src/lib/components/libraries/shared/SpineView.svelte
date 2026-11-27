<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { DetailLibrary } from '$lib/types/library';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import { libraryCoverUrl } from '$lib/helpers/LibraryCoverHelper';
	import Spine from '$lib/components/libraries/shared/Spine.svelte';
	import woodShelf from '$lib/assets/wood-shelf.jpg';

	interface SpineEntry {
		id: string;
		cover: string | null;
		title: string;
		artist?: string;
		author?: string;
		pages?: number | null;
	}

	let { library }: { library: MusicLibrary | BookLibrary } = $props();

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
	const UNKNOWN_PAGES_SPINE_W = 34;
	const THINNEST_SPINE_W = 18;
	const SPINE_W_RANGE = 50;
	const FEWEST_PAGES = 50;
	const MOST_PAGES = 1200;

	let containerWidth = $state(0);
	let hoveredId = $state<string | null>(null);
	let coverWidths = $state<Record<string, number>>({});

	function getSpineWidth(entry: SpineEntry): number {
		if (isSquare) return VINYL_SPINE_W;
		if (!entry.pages) return UNKNOWN_PAGES_SPINE_W;
		const clamped = Math.max(FEWEST_PAGES, Math.min(MOST_PAGES, entry.pages));
		return Math.round(THINNEST_SPINE_W + ((clamped - FEWEST_PAGES) / (MOST_PAGES - FEWEST_PAGES)) * SPINE_W_RANGE);
	}

	function getCoverW(entryId?: string): number {
		if (isSquare) return VINYL_COVER_SIZE;
		return coverWidths[entryId ?? ''] ?? BOOK_COVER_W;
	}

	function getCoverH(): number {
		return isSquare ? VINYL_COVER_SIZE : BOOK_SPINE_H;
	}

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

	function coverUrl(entry: SpineEntry): string | null {
		if (!entry.cover) return null;
		return libraryCoverUrl(library, entry.cover);
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
		const detailLibrary: DetailLibrary = library;
		detailLibrary.openDetailModal(library.filteredEntries[index]);
	}
</script>

<div class="w-full pb-10 pl-3" bind:clientWidth={containerWidth} in:fade>
	{#each rows as row, rowIndex (rowIndex)}
		<div
			class="relative flex items-end"
			style="
				padding-bottom: 5px;
				margin-top: {rowIndex === 0 ? 20 : 28}px;
				perspective: 600px;
				perspective-origin: 50% 100%;
			"
		>
			{#each row as { entry, xOffset } (entry.id)}
				<Spine
					title={entry.title}
					coverUrl={coverUrl(entry)}
					{xOffset}
					spineWidth={getSpineWidth(entry)}
					spineHeight={SPINE_H}
					coverWidth={getCoverW(entry.id)}
					coverHeight={getCoverH()}
					gap={GAP}
					{isSquare}
					hovered={hoveredId === entry.id}
					onHover={(hovered) => (hoveredId = hovered ? entry.id : null)}
					onCoverLoad={(e) => onCoverLoad(e, entry.id)}
					onClick={() => handleClick(entry)}
				/>
			{/each}

			<div
				class="pointer-events-none absolute right-0 bottom-0 left-0"
				style="height: 5px; background: url('{woodShelf}') center/cover; box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.4);"
			></div>
		</div>
	{/each}
</div>
