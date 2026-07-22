<script lang="ts">
	import ImdbIcon from '$lib/assets/services/imdb_icon.svg';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { onClick, loading } = $props<{
		onClick: () => void;
		loading: boolean;
	}>();
</script>

<button
	class="group mt-1 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:ring-2 hover:ring-[#f6c700] dark:border-s-dark-3"
	class:animate-pulse={loading}
	onclick={onClick}
>
	<img src={ImdbIcon} alt="IMDb icon" class="size-6" />
	<span class="max-md:hidden">{ts.get.libraries.movies.imdb_import}</span>
</button>
