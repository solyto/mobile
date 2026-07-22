<script lang="ts">
	import type { Music } from '$lib/types/library_music';
	import { getMusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DetailModal from '$lib/components/libraries/shared/DetailModal.svelte';

	const library = getMusicLibrary();
	const entry = library.activeEntry as Music;

	const ts = getTranslation();

	function getTypeLabel(type: string | null): string {
		switch (type) {
			case 'cd':
				return ts.get.libraries.music.type_cd;
			case 'vinyl':
				return ts.get.libraries.music.type_vinyl;
			case 'digital':
				return ts.get.libraries.music.type_digital;
			default:
				return ts.get.libraries.music.type_none;
		}
	}

	function getFormatLabel(format: string | null): string {
		switch (format) {
			case 'album':
				return ts.get.libraries.music.format_album;
			case 'single':
				return ts.get.libraries.music.format_single;
			case 'compilation':
				return ts.get.libraries.music.format_compilation;
			default:
				return ts.get.libraries.music.format_none;
		}
	}

	function getConditionLabel(condition: string | null): string {
		switch (condition) {
			case 'mint':
				return ts.get.libraries.music.condition_mint;
			case 'very-good':
				return ts.get.libraries.music.condition_verygood;
			case 'good':
				return ts.get.libraries.music.condition_good;
			case 'medium':
				return ts.get.libraries.music.condition_medium;
			case 'poor':
				return ts.get.libraries.music.condition_poor;
			case 'very-poor':
				return ts.get.libraries.music.condition_verypoor;
			default:
				return ts.get.libraries.music.condition_none;
		}
	}
</script>

<DetailModal {entry} {library}>
	<h2 class="text-xl font-bold">{entry.title}</h2>
	<h3 class="text-lg">{entry.artist}</h3>
	<div class="text-sm text-c-neutral-6">
		{entry.genres.map((g) => g.title).join(', ')}
	</div>
	<div class="text-sm" class:hidden={entry.publication_year === null}>
		{entry.publication_year}
	</div>
	<div class="mt-2" class:hidden={entry.type === null}>
		{getTypeLabel(entry.type)}
	</div>
	<div class:hidden={entry.format === null}>
		{getFormatLabel(entry.format)}
	</div>
	<div class:hidden={entry.condition === null}>
		{getConditionLabel(entry.condition)}
	</div>
	<div class:hidden={entry.acquired_where === null}>
		<span>{ts.get.libraries.music.acquired_at}</span>
		{entry.acquired_where}
	</div>
	<div class:mt-2={entry.additional_info !== null} class:hidden={entry.additional_info === null}>
		<span class="font-semibold">{ts.get.libraries.music.additional_info}</span>
		<p class="mt-1 text-sm">{entry.additional_info}</p>
	</div>
</DetailModal>
