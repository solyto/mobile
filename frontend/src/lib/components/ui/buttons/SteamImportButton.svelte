<script lang="ts">
	import SteamIcon from '$lib/assets/services/steam_icon.svg';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { onClick, loading } = $props<{
		onClick: () => void;
		loading: boolean;
	}>();
</script>

<button
	class="group mt-1 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:ring-2 hover:ring-[#1b2838] dark:border-s-dark-3"
	class:animate-pulse={loading}
	onclick={onClick}
>
	<img src={SteamIcon} alt="Steam icon" class="size-6" />
	<span class="max-md:hidden">{ts.get.libraries.games.steam_import}</span>
</button>
