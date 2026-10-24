<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatDate } from '$lib/helpers/DateHelper.js';
	import DetailModal from '$lib/components/libraries/shared/DetailModal.svelte';
	import { getGameLibrary } from '$lib/state/GameLibrary.svelte';
	import type { Game } from '$lib/types/library_game';

	const library = getGameLibrary();
	const entry = library.activeEntry as Game;

	const ts = getTranslation();

	const platformLabels: Record<string, string> = {
		pc: ts.get.libraries.games.platform_pc,
		playstation: ts.get.libraries.games.platform_playstation,
		xbox: ts.get.libraries.games.platform_xbox,
		nintendo: ts.get.libraries.games.platform_nintendo,
		mobile: ts.get.libraries.games.platform_mobile,
		boardgame: ts.get.libraries.games.platform_boardgame,
		other: ts.get.libraries.games.platform_other
	};
</script>

<DetailModal {entry} {library}>
	<h2 class="text-xl font-bold">{entry.title}</h2>
	<div class="text-sm text-c-neutral-6">
		{platformLabels[entry.platform] || entry.platform}
	</div>
	<div class:hidden={!entry.developer} class="text-sm text-c-neutral-6">
		{ts.get.libraries.games.creator}: {entry.developer}
	</div>
	<div class:hidden={!entry.publisher} class="text-sm text-c-neutral-6">
		{ts.get.libraries.games.publisher}: {entry.publisher}
	</div>
	<div class="text-sm text-c-neutral-6">
		{entry.genres.map((g) => g.title).join(', ')}
	</div>
	<div class:hidden={entry.tags.length === 0} class="text-sm text-c-neutral-6">
		{entry.tags.map((t) => t.name).join(', ')}
	</div>
	<div class="text-sm" class:hidden={entry.publication_year === null}>
		{entry.publication_year}
	</div>
	<div class:hidden={entry.playtime_hours === null}>
		{ts.get.libraries.games.playtime_hours}: {entry.playtime_hours}h
	</div>
	<div class:hidden={!entry.completed}>
		{ts.get.libraries.games.completed}
	</div>
	<div class:hidden={entry.started_at === null}>
		{ts.get.libraries.games.started_at}: {entry.started_at ? formatDate(entry.started_at) : ''}
	</div>
	<div class:hidden={entry.finished_at === null}>
		{ts.get.libraries.games.finished_at}: {entry.finished_at ? formatDate(entry.finished_at) : ''}
	</div>
</DetailModal>
