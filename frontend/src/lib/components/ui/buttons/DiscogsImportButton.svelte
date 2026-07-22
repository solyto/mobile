<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DiscogsIcon from '$lib/assets/services/discogs_icon.png';

	const ts = getTranslation();

	let { onClick, loading } = $props<{
		onClick: () => void;
		loading: boolean;
	}>();
</script>

<button
	class="group mt-1 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:ring-2 hover:ring-[#1c1c1c] dark:border-s-dark-3"
	class:animate-pulse={loading}
	onclick={onClick}
>
	<img src={DiscogsIcon} alt="Discogs icon" class="size-6" />
	<span class="max-md:hidden">{ts.get.libraries.music.discogs_import}</span>
</button>
